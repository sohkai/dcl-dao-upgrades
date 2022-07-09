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
  console.log('  Install address deny list')
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
    // Example agent action execution to upgrade proxy
    {
      to: agent,
      data: abi.encodeFunctionCall(abis.AGENT_EXECUTE, [
        '0xf87e31492faf9a91b02ee0deaad50d51d56d5d4d', // current LAND registry
        0,
        abi.encodeFunctionCall(abis.UPGRADE, [
          '0x554bb6488ba955377359bed16b84ed0822679cdc', // new LAND registry
          '0x',
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

  console.log('Deploy and configure Committee Token Manager')
  console.log('  Raw data to create a vote through SAB Token Manager:')
  console.log(`    ${sabForwardDataForTokenManager}`)
  console.log()
  console.log('  Send as raw transaction with:')
  console.log(`    { "to": "${sabTokenManager}", "data": "${sabForwardDataForTokenManager}" }`)
  console.log()

  debug(`Calls script steps for installing address deny list (length: ${agentExecuteCallsScript.length}):`)
  debug(agentExecuteCallsScript)
  debug()
}

/*******
 * RUN *
 *******/

main()
