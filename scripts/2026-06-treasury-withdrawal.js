const ethers = require('ethers')
const abi = require('web3-eth-abi')

const { abis, utils } = require('../src')

const {
  chainEnv,
  debug,
  encoding: { encodeCallsScript, encodeForward },
} = utils

const SNAPSHOT_PROPOSAL_ID = '0x866e65525317e6dda4913533e279989dee28e8c033acf705b54a843d813a545a'

const TOKENS = {
  DAI: {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
  },
  USDC: {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
  },
  MANA: {
    address: '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
    decimals: 18,
  },
  ETH: {
    // Aragon Finance and Vault use address(0) as the native ETH sentinel.
    address: ethers.constants.AddressZero,
    decimals: 18,
    native: true,
  },
}

const RECIPIENTS = {
  councilOpsMultisig: {
    label: 'Council Ops multisig',
    address: '0x184e4D9A26Add0aF1eAfC145550E890a421f16d7',
  },
  avantgardeDclMultisig: {
    label: 'Avantgarde+DCL multisig',
    address: '0x96e2F6099860731CFdc0AF700dE862cf6EbA4407',
  },
}

const payments = [
  {
    amount: '16940',
    displayAmount: '16,940',
    ticker: 'DAI',
    recipient: RECIPIENTS.councilOpsMultisig,
  },
  {
    amount: '4444',
    displayAmount: '4,444',
    ticker: 'USDC',
    recipient: RECIPIENTS.councilOpsMultisig,
  },
  {
    amount: '3331245',
    displayAmount: '3,331,245',
    ticker: 'MANA',
    recipient: RECIPIENTS.councilOpsMultisig,
  },
  {
    amount: '20000000',
    displayAmount: '20,000,000',
    ticker: 'MANA',
    recipient: RECIPIENTS.avantgardeDclMultisig,
  },
  {
    amount: '339',
    displayAmount: '339',
    ticker: 'ETH',
    recipient: RECIPIENTS.avantgardeDclMultisig,
  },
]

const { orgUrl, kernel, acl, agent, finance, sabVoting, sabTokenManager } = chainEnv.buildConfig()

function getToken(ticker) {
  return TOKENS[ticker]
}

function getPaymentAmount(payment) {
  const token = getToken(payment.ticker)
  return ethers.utils.parseUnits(payment.amount, token.decimals).toString()
}

function getPaymentReference(payment) {
  return `DCL DAO treasury withdrawal approved by Snapshot ${SNAPSHOT_PROPOSAL_ID}: ${payment.ticker} to ${payment.recipient.label}`
}

function getPaymentAction(payment) {
  const token = getToken(payment.ticker)

  if (token.native) {
    return {
      to: agent,
      data: abi.encodeFunctionCall(abis.AGENT_EXECUTE, [payment.recipient.address, getPaymentAmount(payment), '0x']),
    }
  }

  return {
    to: finance,
    data: abi.encodeFunctionCall(abis.FINANCE_NEW_IMMEDIATE_PAYMENT, [
      token.address,
      payment.recipient.address,
      getPaymentAmount(payment),
      getPaymentReference(payment),
    ]),
  }
}

function getAssetAddressLabel(payment) {
  const token = getToken(payment.ticker)

  if (token.native) {
    return `${token.address} (native ETH sentinel)`
  }

  return token.address
}

/*******************
 * BUILD EVMSCRIPT *
 *******************/

async function main() {
  if (chainEnv.getName() !== 'mainnet') {
    throw new Error('This treasury withdrawal proposal is only intended for mainnet')
  }

  console.log()
  console.log('============================================================')
  console.log()
  console.log(`Planning modifications to the Decentraland DAO on network ${chainEnv.getName()}:`)
  console.log('  Withdraw treasury assets to Council Ops and Avantgarde+DCL multisigs')
  console.log()
  console.log('This organization will be targetted:')
  console.log(`  - Url:                     ${orgUrl}`)
  console.log(`  - Kernel:                  ${kernel}`)
  console.log(`  - ACL:                     ${acl}`)
  console.log(`  - Treasury Agent:          ${agent}`)
  console.log(`  - Finance:                 ${finance}`)
  console.log(`  - SAB Voting:              ${sabVoting}`)
  console.log(`  - SAB Token Manager:       ${sabTokenManager}`)
  console.log()
  console.log('Proposal:')
  console.log(`  - Snapshot:                ${SNAPSHOT_PROPOSAL_ID}`)
  console.log()
  console.log('And planning these payments as steps:')

  for (const [index, payment] of payments.entries()) {
    const paymentLabel = `${payment.displayAmount} ${payment.ticker} to ${payment.recipient.label}`
    const mechanism = getToken(payment.ticker).native
      ? 'Agent.execute native ETH transfer'
      : 'Finance.newImmediatePayment'

    console.log(`  ${index + 1}. ${paymentLabel} (${payment.recipient.address})`)
    console.log(`      - Mechanism:           ${mechanism}`)
    console.log(`      - Asset address:       ${getAssetAddressLabel(payment)}`)
    console.log(`      - Amount base units:   ${getPaymentAmount(payment)}`)
  }

  console.log()
  console.log('============================================================')
  console.log()

  const treasuryWithdrawalScriptSteps = payments.map((payment) => getPaymentAction(payment))
  const treasuryWithdrawalCallsScript = encodeCallsScript(treasuryWithdrawalScriptSteps)
  const sabVoteForwardDataForTokenManager = encodeForward(treasuryWithdrawalCallsScript)
  const sabVoteForwardCallScriptForTokenManager = encodeCallsScript([
    { to: sabVoting, data: sabVoteForwardDataForTokenManager },
  ])
  const sabForwardDataForTokenManager = encodeForward(sabVoteForwardCallScriptForTokenManager)

  console.log('Withdraw treasury assets')
  console.log('  Raw data to create a vote through SAB Token Manager:')
  console.log(`    ${sabForwardDataForTokenManager}`)
  console.log()
  console.log('  Send as raw transaction with:')
  console.log(`    { "to": "${sabTokenManager}", "data": "${sabForwardDataForTokenManager}" }`)
  console.log()

  debug(`Calls script steps for treasury withdrawal (length: ${treasuryWithdrawalScriptSteps.length}):`)
  debug(treasuryWithdrawalScriptSteps)
  debug()
}

/*******
 * RUN *
 *******/

main()
