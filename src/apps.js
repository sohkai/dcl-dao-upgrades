const namehash = require('eth-ens-namehash').hash

module.exports = {
  delay: {
    appId: namehash('delay.aragonpm.eth'),
    getBaseAddress(network) {
      if (network === 'mainnet') {
        return '0x07759C39BbC1F88CA6b61B5EF500472Ca606DF89'
      } else if (network === 'rinkeby') {
        return '0x214044cc3fa7a3ECEF0bC9052Fe9B296585E3275'
      } else {
        throw new Error('Bad network:', network)
      }
    },
  },
  tokenManager: {
    appId: namehash('token-manager.aragonpm.eth'),
    getBaseAddress(network) {
      if (network === 'mainnet') {
        return '0xde3A93028F2283cc28756B3674BD657eaFB992f4'
      } else if (network === 'rinkeby') {
        return '0xE775468F3Ee275f740A22EB9DD7aDBa9b7933Aa0'
      } else {
        throw new Error('Bad network:', network)
      }
    },
  }
}
