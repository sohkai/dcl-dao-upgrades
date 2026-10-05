const abi = require('web3-eth-abi')

const { abis, roles, utils } = require('../src')

const {
  chainEnv,
  debug,
  encoding: { encodeCallsScript, encodeForward },
} = utils

const additionalChainConfig = {
  mainnet: {
    sabAdd: {
      newMember: '0xe7f78d2c9a9375153476834D2dB32632384B01e1',
    },
  },
  rinkeby: {
    sabAdd: {
      newMember: '',
    },
  },
}

const { orgUrl, kernel, acl, sabVoting, sabTokenManager, sabAdd } = chainEnv.buildConfig(additionalChainConfig)

/*******************
 * BUILD EVMSCRIPT *
 *******************/

async function main() {
  console.log()
  console.log('============================================================')
  console.log()
  console.log(`Planning modifications to the Decentraland DAO on network ${chainEnv.getName()}:`)
  console.log('  Add SAB member')
  console.log()
  console.log('This organization will be targetted:')
  console.log(`  - Url:               ${orgUrl}`)
  console.log(`  - Kernel:            ${kernel}`)
  console.log(`  - ACL:               ${acl}`)
  console.log(`  - SAB Voting:        ${sabVoting}`)
  console.log(`  - SAB Token Manager: ${sabTokenManager}`)
  console.log()
  console.log('And planning these changes as steps:')
  console.log(`  1. Granting permissions:`)
  console.log(`      + SabTokenManager:MINT_ROLE => SAB Voting`)
  console.log(`  1. Minting new SAB membership token (adding ${sabAdd.newMember}):`)
  console.log(`  1. Removing permissions:`)
  console.log(`      + SabTokenManager:MINT_ROLE => SAB Voting`)
  console.log()
  console.log('============================================================')
  console.log()

  const addSabMemberScriptSteps = [
    // Add SAB membership
    // Grant mint permission to SAB Voting, which is already the role's manager
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_GRANT_PERMISSION, [
        sabVoting, // Who
        sabTokenManager, // Where
        roles.TOKEN_MANAGER_MINT_ROLE, // What
      ]),
    },
    // Mint new SAB membership token
    {
      to: sabTokenManager,
      data: abi.encodeFunctionCall(abis.TOKEN_MANAGER_MINT, [sabAdd.newMember, '1']),
    },
    // Revoke mint permission from SAB Voting
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_REVOKE_PERMISSION, [
        sabVoting, // Who
        sabTokenManager, // Where
        roles.TOKEN_MANAGER_MINT_ROLE, // What
      ]),
    },
  ]
  const addSabMemberCallsScript = encodeCallsScript(addSabMemberScriptSteps)
  const sabVoteForwardDataForTokenManager = encodeForward(addSabMemberCallsScript)
  const sabVoteForwardCallScriptForTokenManager = encodeCallsScript([
    { to: sabVoting, data: sabVoteForwardDataForTokenManager },
  ])
  const sabForwardDataForTokenManager = encodeForward(sabVoteForwardCallScriptForTokenManager)

  console.log('Add SAB member')
  console.log('  Raw data to create a vote through SAB Token Manager:')
  console.log(`    ${sabForwardDataForTokenManager}`)
  console.log()
  console.log('  Send as raw transaction with:')
  console.log(`    { "to": "${sabTokenManager}", "data": "${sabForwardDataForTokenManager}" }`)
  console.log()

  debug(`Calls script steps (length: ${addSabMemberScriptSteps.length}):`)
  debug(addSabMemberScriptSteps)
  debug()
}

/*******
 * RUN *
 *******/

main()
