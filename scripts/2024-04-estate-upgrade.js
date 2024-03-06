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
  console.log('  Upgrade Estate Registry')
  console.log()
  console.log('This organization will be targetted:')
  console.log(`  - Url:                     ${orgUrl}`)
  console.log(`  - Kernel:                  ${kernel}`)
  console.log(`  - ACL:                     ${acl}`)
  console.log(`  - Agent:                   ${agent}`)
  console.log(`  - SAB Voting:              ${sabVoting}`)
  console.log(`  - SAB Token Manager:       ${sabTokenManager}`)
  console.log()
  console.log('============================================================')
  console.log()

  const agentExecuteExternalAction = [
    {
      to: agent,
      data: abi.encodeFunctionCall(abis.AGENT_EXECUTE, [
        '0x959e104e1a4db6317fa58f8295f586e1a978c297', // Estate Registry proxy
        0,
        abi.encodeFunctionCall(abis.UPGRADE_TO, [
          '0x892a07905da18493feb4e9533900a32b01241964', // new Estate Registry implementation
        ]),
      ]),
    },
  ]
  const agentExecuteCallsScript = encodeCallsScript(agentExecuteExternalAction)
  const sabVoteForwardDataForTokenManager = encodeForward(agentExecuteCallsScript)
  const sabVoteForwardCallScriptForTokenManager = encodeCallsScript([
    { to: sabVoting, data: sabVoteForwardDataForTokenManager },
  ])
  const sabForwardDataForTokenManager = encodeForward(sabVoteForwardCallScriptForTokenManager)

  console.log('Upgrade Estate Registry')
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
