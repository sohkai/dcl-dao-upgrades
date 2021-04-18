# DCL Committee Installation

Generates transactions to deploy the new DCL DAO committee through two SAB votes.

## Run

```
node src/index.js
```

Environment variables:

- `NETWORK`: one of `mainnet` or `rinkeby`, defaults to `mainnet`
- `DEBUG`: if truthy, logs additional information about each calls script.

See [src/index.js](src/index.js) for the core logic.
