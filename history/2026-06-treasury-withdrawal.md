# 2026-06 Treasury withdrawal

In June 2026, the DAO Council requested an SAB vote to withdraw assets from the Decentraland DAO treasury to fund day-to-day operations and begin capital deployment under the community-approved Treasury Mandate.

This followed the deprecation of the legacy DAO Committee, the removal of Kyllian (HPrivakos) from the SAB, and the revocation of legacy Committee Delay treasury access. With the SAB able to act again, the Council requested moving funds from the DAO treasury to two Safe multisigs:

- Council Ops multisig: `0x184e4D9A26Add0aF1eAfC145550E890a421f16d7`
- Avantgarde+DCL multisig: `0x96e2F6099860731CFdc0AF700dE862cf6EbA4407`

The withdrawal was approved in the DCL DAO Council Snapshot proposal [Treasury Withdrawal to Operational Multisig for DAO Operations and Capital Deployment to Avantgarde](https://snapshot.box/#/s:daocouncil.dcl.eth/proposal/0x866e65525317e6dda4913533e279989dee28e8c033acf705b54a843d813a545a).

The requested payment matrix was:

| Amount     | Asset | Recipient               |
| ---------- | ----- | ----------------------- |
| 16,940     | DAI   | Council Ops multisig    |
| 4,444      | USDC  | Council Ops multisig    |
| 3,331,245  | MANA  | Council Ops multisig    |
| 20,000,000 | MANA  | Avantgarde+DCL multisig |
| 339        | ETH   | Avantgarde+DCL multisig |

See [related script](/scripts/2026-06-treasury-withdrawal.js) on how this change was prepared for the DAO.

The ERC-20 payments are encoded as `Finance.newImmediatePayment(...)` calls. Native ETH is handled separately through `Agent.execute(...)` because Aragon's Finance app delegates transfers to the Vault, and the Vault uses Solidity `send()` for native ETH. That path can fail for Safe recipients, so the script sends native ETH from the Agent with a low-level value transfer instead.
