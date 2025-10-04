# 2020-01 Initial deployment

Decentraland's DAO was deployed and initialized through a contract template ([see repo](https://github.com/aragonone/decentraland-dao-template/tree/master), [address: `0xF4E8987AE1c7ae9561fC6d61496515c627dC4D7F`](https://etherscan.io/address/0xf4e8987ae1c7ae9561fc6d61496515c627dc4d7f#code)).

This initialized the DAO with:

- A wrapped version of MANA ([wMANA](https://etherscan.io/address/0xfd09cf7cfffa9932e33668311c4777cb9db3c9be#readProxyContract)) that could be used for voting
- A voting aggregator that could connect multiple sources of voting shares together, starting with wMANA but intended to include ERC-721 LAND and ESTATE NFTs in the future
- A community proposal flow to allow community-sourced actions to be enacted, using the voting aggregator to determine voting powers
- A security advisory board voting structured that controlled all roles and held important functions, intended for revoking, pausing, or vetoing community-sourced actions