# Decentraland DAO Upgrades

Historical documentation and scripts to enact upgrades to Decentraland's DAO (an Aragon v1 DAO).

Each script generates one or more transactions, usually creating votes through the SAB for the desired change(s).

## History

Decentraland's DAO was constructed by a DAO template in early 2020 and has seen successive upgrades over time. In 2021 the process of enacting changes was formalized into this repo.

The earlier history is documented in [`/history`](history/).

## Scripts

- [`2021-05-committee`](scripts/2021-05-committee.js): create the DCL DAO committee through two votes
- [`2021-08-address-denylist`](scripts/2021-08-denylist.js): install a [`List` app](https://github.com/decentraland/dao-apps/tree/master/list) to act as an address deny/ban list
- [`2022-11-committee-remove`](scripts/2022-11-committee-remove.js): remove a committee member
- [`2023-04-committee-change`](scripts/2023-04-committee-change.js): rotate a committee member
- [`2023-04-vesting-release`](scripts/2023-04-vesting-release.js): release MANA vesting to Decentraland DAO
- [`2024-03-estate-upgrade`](scripts/2024-03-estate-upgrade.js): upgrade implementation of Estate Registry contract
- [`2024-03-committee-change`](scripts/2024-03-committee-change.js): rotate a committee member
- [`2026-06-treasury-withdrawal`](scripts/2026-06-treasury-withdrawal.js): withdraw treasury assets to Council Ops and Avantgarde+DCL multisigs

## Run

```
node scripts/<file>
```

Environment variables:

- `NETWORK`: one of `mainnet` or `rinkeby`, defaults to `mainnet`
- `DEBUG`: if truthy, logs additional information about the script (i.e. calls script, etc).
