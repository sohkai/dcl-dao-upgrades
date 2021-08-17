const ethers = require('ethers')
const abi = require('web3-eth-abi')

const { abis, roles, utils } = require('../src')

const {
  chainEnv,
  debug,
  encoding: { encodeCallsScript, encodeForward },
} = utils

const { orgUrl, kernel, acl, sabVoting, sabTokenManager, communityVoting, councilDelay } = chainEnv.buildConfig()
const provider = chainEnv.getProvider()

/*******************
 * BUILD EVMSCRIPT *
 *******************/

async function main() {
  const kernelNonce = await provider.getTransactionCount(kernel)
  const addressDenyList = ethers.utils.getContractAddress({ from: kernel, nonce: kernelNonce })
  const denyListInitializationParams = {
    name: 'denylist:address',
    symbol: 'DENYLIST_ADDRESSES',
    type: 'ADDRESS',
  }

  console.log()
  console.log('============================================================')
  console.log()
  console.log(`Planning modifications to the Decentraland DAO on network ${chainEnv.getName()}:`)
  console.log('  Install address deny list')
  console.log()
  console.log('This organization will be targetted:')
  console.log(`  - Url:                   ${orgUrl}`)
  console.log(`  - Kernel:                ${kernel}`)
  console.log(`    - Nonce:               ${kernelNonce}`)
  console.log(`  - ACL:                   ${acl}`)
  console.log(`  - SAB Voting:            ${sabVoting}`)
  console.log(`  - SAB Token Manager:     ${sabTokenManager}`)
  console.log(`  - Community Voting:      ${communityVoting}`)
  console.log(`  - Council delay:         ${councilDelay}`)
  console.log()
  console.log('And planning these changes as steps:')
  console.log(`  1. Deny list`)
  console.log(`    - Install new List (at ${addressDenyList})`)
  console.log(`    - Initialized as:`)
  console.log(`      - name: ${denyListInitializationParams.name}`)
  console.log(`      - symbol: ${denyListInitializationParams.symbol}`)
  console.log(`      - type: ${denyListInitializationParams.type}`)
  console.log(`    - Setting permissions:`)
  console.log(`      + AddressDenyList:ADD_ROLE     => [Community Voting, Council Delay] <> SAB Voting`)
  console.log(`      + AddressDenyList:REMOVE_ROLE  => [Community Voting, Council Delay] <> SAB Voting`)
  console.log()
  console.log('============================================================')
  console.log()

  const installAddressDenyListScriptSteps = [
    // Install new List
    // Should deploy to the computed addressDenyList address
    {
      to: kernel,
      data: abi.encodeFunctionCall(abis.KERNEL_NEW_APP_INSTANCE, [
        chainEnv.apps.list.appId,
        chainEnv.apps.list.getBaseAddress(),
        // Initialize payload, configure as a "membership" token
        abi.encodeFunctionCall(abis.LIST_INITIALIZE, [
          denyListInitializationParams.name,
          denyListInitializationParams.symbol,
          denyListInitializationParams.type,
        ]),
        false, // not default
      ]),
    },
    // Create add permission
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_CREATE_PERMISSION, [
        communityVoting, // Who
        addressDenyList, // Where
        roles.LIST_ADD_ROLE, // What
        sabVoting, // Manager
      ]),
    },
    // Grant add permission to Council Delay
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_GRANT_PERMISSION, [
        councilDelay, // Who
        addressDenyList, // Where
        roles.LIST_ADD_ROLE, // What
      ]),
    },
    // Create remove permission
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_CREATE_PERMISSION, [
        communityVoting, // Who
        addressDenyList, // Where
        roles.LIST_REMOVE_ROLE, // What
        sabVoting, // Manager
      ]),
    },
    // Grant remove permission to Council Delay
    {
      to: acl,
      data: abi.encodeFunctionCall(abis.ACL_GRANT_PERMISSION, [
        councilDelay, // Who
        addressDenyList, // Where
        roles.LIST_REMOVE_ROLE, // What
      ]),
    },
  ]
  const installAddressDenyListCallsScript = encodeCallsScript(installAddressDenyListScriptSteps)
  const sabVoteForwardDataForTokenManager = encodeForward(installAddressDenyListCallsScript)
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

  debug(`Calls script steps for installing address deny list (length: ${installAddressDenyListScriptSteps.length}):`)
  debug(installAddressDenyListScriptSteps)
  debug()
}

/*******
 * RUN *
 *******/

main()
