# ⛓️ Parachain Limitations

1. Size of PoV (20MiB decompressed, 5MiB compressed, [see here](https://polkadot-blockchain-academy.github.io/pba-book/polkadot/cumulus/page.html?highlight=pov#example-of-witness-data-construction))
2. Size of state (how much?)
3. Size of block/extrinsic (how much?)
4. Execution time (PVF execution on Relay Chain validator node shouldn’t take longer than 2s)
5. Blocktime (12s, or 6s post async-backing)
6. For runtime upgrades: compilation time of new runtime needs to be small enough for Relay Chain validators to vote in favour ([see here](https://paritytech.github.io/polkadot/book/pvf-prechecking.html) and [here](https://github.com/paritytech-stg/polkadot-sdk/blob/9aa7526/cumulus/docs/overview.md#runtime-upgrade)).
7. Host functions (we’re limited to the ones implemented on a regular Substrate node, [see here](https://github.com/paritytech/polkadot-sdk/blob/1d9ec572764d1fc74c0f46832318c0ce4e99114a/substrate/primitives/io/src/lib.rs#L1785))

# XCM Limitations 
1. Is it possible to transfer data blobs? Which size?
	100KiB per channel per block. All the messages emitted at block `N` from chain `A` should have a total summed size lower than 100KiB.
