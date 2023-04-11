const abi = require('web3-eth-abi')

const { abis, utils } = require('../src')

const {
  chainEnv,
  debug,
  encoding: { encodeCallsScript, encodeForward },
} = utils

const additionalChainConfig = {}

const { orgUrl, kernel, acl, agent, sabVoting, sabTokenManager } = chainEnv.buildConfig(additionalChainConfig)

/*******************
 * BUILD EVMSCRIPT *
 *******************/

async function main() {
  console.log()
  console.log('============================================================')
  console.log()
  console.log(`Planning modifications to the Decentraland DAO on network ${chainEnv.getName()}:`)
  console.log('  Release MANA vesting to DAO')
  console.log()
  console.log('This organization will be targetted:')
  console.log(`  - Url:                     ${orgUrl}`)
  console.log(`  - Kernel:                  ${kernel}`)
  console.log(`  - ACL:                     ${acl}`)
  console.log(`  - Agent:                   ${agent}`)
  console.log(`  - SAB Voting:              ${sabVoting}`)
  console.log()
  console.log('============================================================')
  console.log()

  const agentExecuteExternalAction = [
    {
      to: agent,
      data: abi.encodeFunctionCall(abis.AGENT_EXECUTE, [
        '0x7a3aBF8897f31b56F09C6f69D074a393A905C1Ac', // MANA vesting contract for DCL DAO
        0,
        abi.encodeFunctionCall(abis.RELEASE, []),
      ]),
    },
  ]
  const agentExecuteCallsScript = encodeCallsScript(agentExecuteExternalAction)
  const sabVoteForwardDataForTokenManager = encodeForward(agentExecuteCallsScript)
  const sabVoteForwardCallScriptForTokenManager = encodeCallsScript([
    { to: sabVoting, data: sabVoteForwardDataForTokenManager },
  ])
  const sabForwardDataForTokenManager = encodeForward(sabVoteForwardCallScriptForTokenManager)

  console.log('Release MANA vesting to DAO')
  console.log('  Raw data to create a vote through SAB Token Manager:')
  console.log(`    ${sabForwardDataForTokenManager}`)
  console.log()
  console.log('  Send as raw transaction with:')
  console.log(`    { "to": "${sabTokenManager}", "data": "${sabForwardDataForTokenManager}" }`)
  console.log()

  debug(`Calls script steps (length: ${agentExecuteCallsScript.length}):`)
  debug(agentExecuteCallsScript)
  debug()
}

/*******
 * RUN *
 *******/

main()
