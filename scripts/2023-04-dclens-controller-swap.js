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
  console.log('  Rotate DCL ENS subdomain controller')
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
        '0x2A187453064356c898cAe034EAed119E1663ACb8', // dcl.eth subdomain registrar
        0,
        abi.encodeFunctionCall(abis.REMOVE_CONTROLLER, [
          '0x6843291BD86857D97F0D269e698939fb10D60772', // old controller
        ]),
      ]),
    },
    {
      to: agent,
      data: abi.encodeFunctionCall(abis.AGENT_EXECUTE, [
        '0x2A187453064356c898cAe034EAed119E1663ACb8', // dcl.eth subdomain registrar
        0,
        abi.encodeFunctionCall(abis.ADD_CONTROLLER, [
          '0xBe92B49aEE993ADea3a002AdCDA189A2b7deC56c', // new controller
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

  console.log('Rotate DCL ENS subdomain controller')
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
