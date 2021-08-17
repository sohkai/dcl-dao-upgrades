const ethers = require('ethers')
const namehash = require('eth-ens-namehash').hash

const MAINNET_CONFIG = require('../../config/mainnet')
const RINKEBY_CONFIG = require('../../config/rinkeby')

const NETWORK = (process.env.NETWORK || 'mainnet').toLowerCase()

if (!['mainnet', 'rinkeby'].includes(NETWORK)) {
  throw new Error(`Selected network (${NETWORK}) unsupported. Available choices: [mainnet, rinkeby]`)
}

const apps = {
  delay: {
    appId: namehash('delay.aragonpm.eth'),
    getBaseAddress() {
      if (NETWORK === 'mainnet') {
        return '0x07759C39BbC1F88CA6b61B5EF500472Ca606DF89'
      } else if (NETWORK === 'rinkeby') {
        return '0x214044cc3fa7a3ECEF0bC9052Fe9B296585E3275'
      } else {
        throw new Error('App (Delay) not found on network:', NETWORK)
      }
    },
  },
  list: {
    appId: namehash('dcl-list.open.aragonpm.eth'),
    getBaseAddress() {
      if (NETWORK === 'mainnet') {
        return '0x21b6EFf834d7cc8c12A5Ec924939aa521F0FE83F'
      } else if (NETWORK === 'rinkeby') {
        return '0xEBfcA27852362676Ac9f263571dADa0e09C2Aa6F'
      } else {
        throw new Error('App (List) not found on network:', NETWORK)
      }
    },
  },
  tokenManager: {
    appId: namehash('token-manager.aragonpm.eth'),
    getBaseAddress() {
      if (NETWORK === 'mainnet') {
        return '0xde3A93028F2283cc28756B3674BD657eaFB992f4'
      } else if (NETWORK === 'rinkeby') {
        return '0xE775468F3Ee275f740A22EB9DD7aDBa9b7933Aa0'
      } else {
        throw new Error('App (Delay) not found on network:', NETWORK)
      }
    },
  },
}

function buildConfig(chainConfig = {}) {
  if (NETWORK === 'mainnet') {
    return {
      ...MAINNET_CONFIG,
      ...chainConfig.mainnet,
    }
  } else if (NETWORK === 'rinkeby') {
    return {
      ...RINKEBY_CONFIG,
      ...chainConfig.rinkeby,
    }
  }
}

function getChainId() {
  switch (NETWORK) {
    case 'mainnet':
      return 1
    case 'rinkeby':
      return 4
    default:
      // Bad chain id
      return 0
  }
}

function getName() {
  return NETWORK
}

function getProvider() {
  return ethers.getDefaultProvider(getChainId())
}

module.exports = {
  apps,
  buildConfig,
  getName,
  getChainId,
  getProvider,
}
