# Decentraland DAO Upgrades

Scripts to enact upgrades to Decentraland's DAO (an Aragon v1 DAO).

Each script generate one or more transactions, usually creating votes through the SAB for the desired change(s).

## Scripts

- [`2021-05-committee`](scripts/2021-05-committee.js): create the DCL DAO committee through two votes
- [`2021-08-address-denylist`](scripts/2021-08-denylist.js): install a [`List` app](https://github.com/decentraland/dao-apps/tree/master/list) to act as an address deny/ban list

## Run

```
node script/<file>
```

Environment variables:

- `NETWORK`: one of `mainnet` or `rinkeby`, defaults to `mainnet`
- `DEBUG`: if truthy, logs additional information about the script (i.e. calls script, etc).
