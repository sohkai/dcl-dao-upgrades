const abi = require('web3-eth-abi')

const { abis, roles, utils } = require('../src')

const {
  chainEnv,
  debug,
  encoding: { encodeCallsScript, encodeForward },
} = utils

const additionalChainConfig = {
  mainnet: {
    committeeRemove: {
      oldMember: '0x3323B7264F7D5e8f98e6aFCcec73b6bA1116AE19',
    },
  },
  rinkeby: {
    committeeRemove: {
      oldMember: '0x3323B7264F7D5e8f98e6aFCcec73b6bA1116AE19',
    },
  },
}

const { orgUrl, kernel, acl, sabVoting, sabTokenManager, committeeTokenManager, committeeRemove } =
  chainEnv.buildConfig(additionalChainConfig)

/*******************
 * BUILD EVMSCRIPT *
 *******************/

async function main() {
  console.log()
  console.log('============================================================')
  console.log()
  console.log(`Planning modifications to the Decentraland DAO on network ${chainEnv.getName()}:`)
  console.log('  Remove committee member')
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
  console.log(`      + CommitteeTokenManager:BURN_ROLE => SAB Voting`)
  console.log(`  1. Burning old committee membership token (removing ${committeeRemove.oldMember}):`)
  console.log(`  1. Removing permissions:`)
  console.log(`      + CommitteeTokenManager:BURN_ROLE => SAB Voting`)
  console.log()
  console.log('============================================================')
  console.log()

  const removeCommitteeMemberScriptSteps = [
    // Remove committee membership
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
      data: abi.encodeFunctionCall(abis.TOKEN_MANAGER_BURN, [committeeRemove.oldMember, '1']),
    },
    // Revoke burn permission from SAB
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_REVOKE_PERMISSION, [
        sabVoting, // Who
        committeeTokenManager, // Where
        roles.TOKEN_MANAGER_BURN_ROLE, // What
      ]),
    },
  ]
  const removeCommitteeMemberCallsScript = encodeCallsScript(removeCommitteeMemberScriptSteps)
  const sabVoteForwardDataForTokenManager = encodeForward(removeCommitteeMemberCallsScript)
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

  debug(`Calls script steps for installing address deny list (length: ${removeCommitteeMemberScriptSteps.length}):`)
  debug(removeCommitteeMemberScriptSteps)
  debug()
}

/*******
 * RUN *
 *******/

main()
