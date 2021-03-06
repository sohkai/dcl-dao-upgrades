const ethers = require('ethers')
const abi = require('web3-eth-abi')

const { abis, roles, utils } = require('../src')

const {
  chainEnv,
  debug,
  encoding: { encodeCallsScript, encodeForward },
} = utils

/**********************
 * CHAIN CONFIGURATION *
 **********************/

const additionalChainConfig = {
  mainnet: {
    committeeToken: '0x5852f3d6307aeae101324a78c7e95eabaf4e20cc',
    initialCommittee: [
      '0x3323B7264F7D5e8f98e6aFCcec73b6bA1116AE19',
      '0xfe91C0c482E09600f2d1DBCA10FD705BC6de60bc',
      '0xBef99f5f55CF7cDb3a70998C57061B7e1386a9b0',
    ],
  },
  rinkeby: {
    committeeToken: '0x47ce1be72731812a60974c855c34618f9a167e7f',
    initialCommittee: [
      '0x3323B7264F7D5e8f98e6aFCcec73b6bA1116AE19',
      '0xfe91C0c482E09600f2d1DBCA10FD705BC6de60bc',
      '0xBef99f5f55CF7cDb3a70998C57061B7e1386a9b0',
      '0x3A73fe61a50491EC7AF76c32835f3E9dCB32702B', // Nacho
    ],
  },
}

const {
  orgUrl,
  kernel,
  acl,
  sabVoting,
  sabTokenManager,
  communityVoting,
  agent,
  finance,
  catalyst,
  poiList,
  nameList,
  committeeToken,
  initialCommittee,
} = chainEnv.buildConfig(additionalChainConfig)
const provider = chainEnv.getProvider()

/*******************
 * BUILD EVMSCRIPT *
 *******************/

async function main() {
  const kernelNonce = await provider.getTransactionCount(kernel)
  const committeeTokenManager = ethers.utils.getContractAddress({ from: kernel, nonce: kernelNonce })
  const committeeDelay = ethers.utils.getContractAddress({ from: kernel, nonce: kernelNonce + 1 })

  console.log()
  console.log('============================================================')
  console.log()
  console.log(`Planning modifications to the Decentraland DAO on network ${chainEnv.getName()}:`)
  console.log('  Install DAO committee and associated delay mechanism')
  console.log()
  console.log('This organization will be targetted:')
  console.log(`  - Url:                   ${orgUrl}`)
  console.log(`  - Kernel:                ${kernel}`)
  console.log(`    - Nonce:               ${kernelNonce}`)
  console.log(`  - ACL:                   ${acl}`)
  console.log(`  - SAB Voting:            ${sabVoting}`)
  console.log(`  - SAB Token Manager:     ${sabTokenManager}`)
  console.log(`  - Community Voting:      ${communityVoting}`)
  console.log(`  - Agent                  ${agent}`)
  console.log(`  - Catalyst               ${catalyst}`)
  console.log(`  - POI List               ${poiList}`)
  console.log(`  - Name List              ${nameList}`)
  console.log()
  console.log('And planning these changes as steps:')
  console.log(`  1. New token`)
  console.log(`    - Install new Token Manager (at ${committeeTokenManager}) controlling token at ${committeeToken}`)
  console.log(`    - With initial membership of:`)
  for (const member of initialCommittee) {
    console.log(`      - ${member}`)
  }
  console.log(`    - Setting permissions:`)
  console.log(`      + CommitteeTokenManager:MINT_ROLE    => Community Voting <> SAB Voting`)
  console.log(`      + CommitteeTokenManager:BURN_ROLE    => Community Voting <> SAB Voting`)
  console.log(`  2. Delay mechanism`)
  console.log(`    - Install new Delay (at ${committeeDelay}) with 24hr period`)
  console.log(`    - Setting permissions:`)
  console.log(`      + CommitteeDelay:SET_DELAY_ROLE        => SAB Voting <> SAB Voting`)
  console.log(`      + CommitteeDelay:DELAY_EXECUTION_ROLE  => CommitteeTokenManager <> SAB Voting`)
  console.log(`      + CommitteeDelay:PAUSE_EXECUTION_ROLE  => [SAB Voting, CommitteeTokenManager] <> SAB Voting`)
  console.log(`      + CommitteeDelay:RESUME_EXECUTION_ROLE => SAB Voting <> SAB Voting`)
  console.log(`      + CommitteeDelay:CANCEL_EXECUTION_ROLE => SAB Voting <> SAB Voting`)
  console.log(`    - And being granted permissions:`)
  console.log(`      + Agent:EXECUTE_ACTIONS`)
  console.log(`      + Agent:RUN_SCRIPT_ROLE`)
  console.log(`      + Finance:CREATE_PAYMENTS_ROLE`)
  console.log(`      + Catalyst:MODIFY_ROLE`)
  console.log(`      + PoiList:ADD_ROLE`)
  console.log(`      + PoiList:REMOVE_ROLE`)
  console.log(`      + NameList:ADD_ROLE`)
  console.log(`      + NameList:REMOVE_ROLE`)
  console.log()
  console.log('============================================================')
  console.log()

  const installCommitteeTokenManagerScriptSteps = [
    // Install new Token Manager
    // Should deploy to the computed committeeTokenManager address
    // Requires the committeeToken to have already set its controller to committeeTokenManager
    {
      to: kernel,
      data: abi.encodeFunctionCall(abis.KERNEL_NEW_APP_INSTANCE, [
        chainEnv.apps.tokenManager.appId,
        chainEnv.apps.tokenManager.getBaseAddress(),
        // Initialize payload, configure as a "membership" token
        abi.encodeFunctionCall(abis.TOKEN_MANAGER_INITIALIZE, [
          committeeToken,
          false, // non-transferrable
          '1', // only allowed one token
        ]),
        false, // not default
      ]),
    },
    // Create mint permission; initially grant to SAB Voting to set initial committee
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_CREATE_PERMISSION, [
        sabVoting, // Who
        committeeTokenManager, // Where
        roles.TOKEN_MANAGER_MINT_ROLE, // What
        sabVoting, // Manager
      ]),
    },
    // Set initial committee
    ...initialCommittee.map((member) => ({
      to: committeeTokenManager,
      data: abi.encodeFunctionCall(abis.TOKEN_MANAGER_MINT, [member, '1']),
    })),
    // Revoke mint permission from SAB Voting
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_REVOKE_PERMISSION, [
        sabVoting, // Who
        committeeTokenManager, // Where
        roles.TOKEN_MANAGER_MINT_ROLE, // What
      ]),
    },
    // Grant mint permission to Community Voting
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_GRANT_PERMISSION, [
        communityVoting, // Who
        committeeTokenManager, // Where
        roles.TOKEN_MANAGER_MINT_ROLE, // What
      ]),
    },
    // Create burn permission
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_CREATE_PERMISSION, [
        communityVoting, // Who
        committeeTokenManager, // Where
        roles.TOKEN_MANAGER_BURN_ROLE, // What
        sabVoting, // Manager
      ]),
    },
  ]
  const installCommitteeTokenManagerCallsScript = encodeCallsScript(installCommitteeTokenManagerScriptSteps)
  const sabVoteForwardDataForTokenManager = encodeForward(installCommitteeTokenManagerCallsScript)
  const sabVoteForwardCallScriptForTokenManager = encodeCallsScript([
    { to: sabVoting, data: sabVoteForwardDataForTokenManager },
  ])
  const sabForwardDataForTokenManager = encodeForward(sabVoteForwardCallScriptForTokenManager)

  console.log('Deploy and configure Committee Token Manager')
  console.log('  Raw data to create a vote through SAB Token Manager:')
  console.log(`    ${sabForwardDataForTokenManager}`)
  console.log()
  console.log('  Send as raw transaction with:')
  console.log(`    { "to": "${sabTokenManager}", "data": "${sabForwardDataForTokenManager}" }`)
  console.log()

  debug(
    `Calls script steps for installing Committee Token Manager (length: ${installCommitteeTokenManagerScriptSteps.length}):`
  )
  debug(installCommitteeTokenManagerScriptSteps)
  debug()

  const installCommitteeDelayScriptSteps = [
    // Install new Delay
    // Should deploy to the computed committeeDelay address
    {
      to: kernel,
      data: abi.encodeFunctionCall(abis.KERNEL_NEW_APP_INSTANCE, [
        chainEnv.apps.delay.appId,
        chainEnv.apps.delay.getBaseAddress(),
        // Initialize payload
        abi.encodeFunctionCall(abis.DELAY_INITIALIZE, [
          '86400', // 24hrs
        ]),
        false, // not default
      ]),
    },
    // Create set delay permission
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_CREATE_PERMISSION, [
        sabVoting, // Who
        committeeDelay, // Where
        roles.DELAY_SET_DELAY_ROLE, // What
        sabVoting, // Manager
      ]),
    },
    // Create execution permission
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_CREATE_PERMISSION, [
        committeeTokenManager, // Who
        committeeDelay, // Where
        roles.DELAY_EXECUTION_ROLE, // What
        sabVoting, // Manager
      ]),
    },
    // Create pause execution permission
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_CREATE_PERMISSION, [
        sabVoting, // Who
        committeeDelay, // Where
        roles.DELAY_PAUSE_EXECUTION_ROLE, // What
        sabVoting, // Manager
      ]),
    },
    // Grant pause execution permission to committee
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_GRANT_PERMISSION, [
        committeeTokenManager, // Who
        committeeDelay, // Where
        roles.DELAY_PAUSE_EXECUTION_ROLE, // What
      ]),
    },
    // Create resume execution permission
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_CREATE_PERMISSION, [
        sabVoting, // Who
        committeeDelay, // Where
        roles.DELAY_RESUME_EXECUTION_ROLE, // What
        sabVoting, // Manager
      ]),
    },
    // Create cancel execution permission
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_CREATE_PERMISSION, [
        sabVoting, // Who
        committeeDelay, // Where
        roles.DELAY_CANCEL_EXECUTION_ROLE, // What
        sabVoting, // Manager
      ]),
    },

    // Grant Agent's execute permission
    {
      to: acl,
      data:
        agent &&
        abi.encodeFunctionCall(abis.ACL_GRANT_PERMISSION, [
          committeeDelay, // Who
          agent, // Where
          roles.AGENT_EXECUTE_ROLE, // What
        ]),
    },
    // Grant Agent's run script permission
    {
      to: acl,
      data:
        agent &&
        abi.encodeFunctionCall(abis.ACL_GRANT_PERMISSION, [
          committeeDelay, // Who
          agent, // Where
          roles.AGENT_RUN_SCRIPT_ROLE, // What
        ]),
    },
    // Grant Finance's create payments permission
    {
      to: acl,
      data:
        finance &&
        abi.encodeFunctionCall(abis.ACL_GRANT_PERMISSION, [
          committeeDelay, // Who
          finance, // Where
          roles.FINANCE_CREATE_PAYMENTS_ROLE, // What
        ]),
    },
    // Grant Catalyst's modify permission
    {
      to: acl,
      data:
        catalyst &&
        abi.encodeFunctionCall(abis.ACL_GRANT_PERMISSION, [
          committeeDelay, // Who
          catalyst, // Where
          roles.CATALYST_MODIFY_ROLE, // What
        ]),
    },
    // Grant POI List's add permission
    {
      to: acl,
      data:
        poiList &&
        abi.encodeFunctionCall(abis.ACL_GRANT_PERMISSION, [
          committeeDelay, // Who
          poiList, // Where
          roles.LIST_ADD_ROLE, // What
        ]),
    },
    // Grant POI List's remove permission
    {
      to: acl,
      data:
        poiList &&
        abi.encodeFunctionCall(abis.ACL_GRANT_PERMISSION, [
          committeeDelay, // Who
          poiList, // Where
          roles.LIST_REMOVE_ROLE, // What
        ]),
    },
    // Grant Name List's add permission
    {
      to: acl,
      data:
        poiList &&
        abi.encodeFunctionCall(abis.ACL_GRANT_PERMISSION, [
          committeeDelay, // Who
          nameList, // Where
          roles.LIST_ADD_ROLE, // What
        ]),
    },
    // Grant Name List's remove permission
    {
      to: acl,
      data:
        poiList &&
        abi.encodeFunctionCall(abis.ACL_GRANT_PERMISSION, [
          committeeDelay, // Who
          nameList, // Where
          roles.LIST_REMOVE_ROLE, // What
        ]),
    },
  ].filter((step) => !!step.data)
  const installCommitteeDelayCallsScript = encodeCallsScript(installCommitteeDelayScriptSteps)
  const sabVoteForwardDataForDelay = encodeForward(installCommitteeDelayCallsScript)
  const sabVoteForwardCallScriptForDelay = encodeCallsScript([{ to: sabVoting, data: sabVoteForwardDataForDelay }])
  const sabForwardDataForDelay = encodeForward(sabVoteForwardCallScriptForDelay)

  console.log('Deploy and configure Committee Delay')
  console.log('  Raw data to create a vote through SAB Token Manager:')
  console.log(`    ${sabForwardDataForDelay}`)
  console.log()
  console.log('  Send as raw transaction with:')
  console.log(`    { "to": "${sabTokenManager}", "data": "${sabForwardDataForDelay}" }`)

  debug()
  debug(`Calls script steps for installing Committee Delay (length: ${installCommitteeDelayScriptSteps.length}):`)
  debug(installCommitteeDelayScriptSteps)
  debug()
}

/*******
 * RUN *
 *******/

main()
