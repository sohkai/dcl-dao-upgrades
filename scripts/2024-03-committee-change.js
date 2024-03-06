const abi = require('web3-eth-abi')

const { abis, roles, utils } = require('../src')

const {
  chainEnv,
  debug,
  encoding: { encodeCallsScript, encodeForward },
} = utils

const additionalChainConfig = {
  mainnet: {
    committeeSwap: {
      oldMember: '0xBef99f5f55CF7cDb3a70998C57061B7e1386a9b0',
      newMember: '0x69cf5c1358CA7Daad0Afcf4919FB102cf9300cfb',
    },
  },
  rinkeby: {
    committeeSwap: {
      oldMember: '',
      newMember: '',
    },
  },
}

const { orgUrl, kernel, acl, sabVoting, sabTokenManager, committeeTokenManager, committeeSwap } =
  chainEnv.buildConfig(additionalChainConfig)

/*******************
 * BUILD EVMSCRIPT *
 *******************/

async function main() {
  console.log()
  console.log('============================================================')
  console.log()
  console.log(`Planning modifications to the Decentraland DAO on network ${chainEnv.getName()}:`)
  console.log('  Rotate COMMITTEE member list')
  console.log()
  console.log('This organization will be targetted:')
  console.log(`  - Url:                     ${orgUrl}`)
  console.log(`  - Kernel:                  ${kernel}`)
  console.log(`  - ACL:                     ${acl}`)
  console.log(`  - SAB Voting:              ${sabVoting}`)
  console.log(`  - SAB Token Manager:       ${sabTokenManager}`)
  console.log(`  - Committee Token Manager: ${committeeTokenManager}`)
  console.log()
  console.log('And planning these changes as steps:')
  console.log(`  1. Granting permissions:`)
  console.log(`      + CommitteeTokenManager:MINT_ROLE => SAB Voting`)
  console.log(`      + CommitteeTokenManager:BURN_ROLE => SAB Voting`)
  console.log(`  1. Burning old committee membership token (removing ${committeeSwap.oldMember}):`)
  console.log(`  1. Minting new committee membership token (adding ${committeeSwap.newMember}):`)
  console.log(`  1. Removing permissions:`)
  console.log(`      + CommitteeTokenManager:MINT_ROLE => SAB Voting`)
  console.log(`      + CommitteeTokenManager:BURN_ROLE => SAB Voting`)
  console.log()
  console.log('============================================================')
  console.log()

  const swapCommitteeMemberScriptSteps = [
    // Swap committee membership
    // Grant mint permission to SAB
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_GRANT_PERMISSION, [
        sabVoting, // Who
        committeeTokenManager, // Where
        roles.TOKEN_MANAGER_MINT_ROLE, // What
      ]),
    },
    // Grant burn permission to SAB
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_GRANT_PERMISSION, [
        sabVoting, // Who
        committeeTokenManager, // Where
        roles.TOKEN_MANAGER_BURN_ROLE, // What
      ]),
    },
    // Burn old committee membership token
    {
      to: committeeTokenManager,
      data: abi.encodeFunctionCall(abis.TOKEN_MANAGER_BURN, [committeeSwap.oldMember, '1']),
    },
    // Mint new committee membership token
    {
      to: committeeTokenManager,
      data: abi.encodeFunctionCall(abis.TOKEN_MANAGER_MINT, [committeeSwap.newMember, '1']),
    },
    // Revoke mint permission from SAB Voting
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_REVOKE_PERMISSION, [
        sabVoting, // Who
        committeeTokenManager, // Where
        roles.TOKEN_MANAGER_MINT_ROLE, // What
      ]),
    },
    // Revoke burn permission from SAB Voting
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_REVOKE_PERMISSION, [
        sabVoting, // Who
        committeeTokenManager, // Where
        roles.TOKEN_MANAGER_BURN_ROLE, // What
      ]),
    },
  ]
  const swapCommitteeMemberCallsScript = encodeCallsScript(swapCommitteeMemberScriptSteps)
  const sabVoteForwardDataForTokenManager = encodeForward(swapCommitteeMemberCallsScript)
  const sabVoteForwardCallScriptForTokenManager = encodeCallsScript([
    { to: sabVoting, data: sabVoteForwardDataForTokenManager },
  ])
  const sabForwardDataForTokenManager = encodeForward(sabVoteForwardCallScriptForTokenManager)

  console.log('Rotate COMMITTEE member list')
  console.log('  Raw data to create a vote through SAB Token Manager:')
  console.log(`    ${sabForwardDataForTokenManager}`)
  console.log()
  console.log('  Send as raw transaction with:')
  console.log(`    { "to": "${sabTokenManager}", "data": "${sabForwardDataForTokenManager}" }`)
  console.log()

  debug(`Calls script steps (length: ${swapCommitteeMemberScriptSteps.length}):`)
  debug(swapCommitteeMemberScriptSteps)
  debug()
}

/*******
 * RUN *
 *******/

main()
