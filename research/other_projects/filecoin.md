# Key takeaways:

1. Different node roles: chain verifier nodes, client nodes, storage provider nodes, and retrieval provider nodes.
2. Likelihood of selection for generating a block given by provable storage provided to the network.
3. There are two proofs: proof of replication (proof that the file has been stored) and proof of spacetime (proof that the file has been stored and continues to be store for the length of the agreed time).
4. They have Storage Providers (store data and provide cryptographic proof of that) and Retrieval Providers (retrieve the data fast). Something similar could be thought of using light clients.
5. Proofs of Storage are performed for “Sectors” of storage (32 and 64 GB).
6. Data is not stored in multiple nodes, there is ONE storage provider who stores ONE peace of information and provides proofs for it.
7. They have this CDN called [Saturn](https://saturn.tech/) for fast delivery of data. Centralisation vector?
8. They have this value proposition of “compute-over-data” that takes advantage of the fact that the stored data by the Storage Providers is colocated with the CPU and GPU computational resources to compute transformations over that data.
9. They have the concept of “Tipsets” which is basically that multiple nodes are able to produce a block, and then all those blocks are aggregated into a tipset. This has good advantages, so long as the operations in the parallel blocks do not collide (double spending), which is reasonable to think in a storage chain.
10. They have a 5x redundancy.
11. Proofs of spacetime are compressed into zk-SNARKS and posted on-chain.
12. Proofs of spacetime are published in two occasions, every 24 hours _always_, or to mine a block.
13. In their Lotus node implementation, there is this `lotus-miner` component that used to be the only one with access to storage, but they later gave direct access also to the workers, to re move bottlenecks. Low-latency storage access is critical because of the impact on storage-proving processes.
14. They provide a `lotus-miner backup` tool to regularly back up its state.
15. They have a whole separate component they call `Boost` to handle communication and networking.

# Proofs

In order to explain the different proofs Filecoin produces for its data, we need to first understand the preprocessing of the data done by the protocol. This step is called _Sealing_. But before, some definitions necessary to understand the process:

- **Piece:** A piece is a piece of data that a client wants to store on the Filecoin network. It is the smallest unit of data that can be stored on the network. A piece is uniquely identified by its CID. It is not of a specific size, but is upper-bounded by the size of the sector.

- **Sector:** A [sector](https://spec.filecoin.io/#section-systems.filecoin_mining.sector "Sector") is the default unit of storage that miners put in the network (currently 32GBs or 64GBs). A sector is a contiguous array of bytes that a [storage miner](https://spec.filecoin.io/#section-glossary.storage-miner-actor "Glossary") puts together, seals, and performs Proofs of Spacetime on.

## Sealing

Sealing is one of the fundamental building blocks of the Filecoin protocol. It is a computation-intensive process performed over a Sector that results in a unique representation of the sector. The properties of this new representation are essential to the Proof of Replication and the Proof of Spacetime procedures.

### Purpose

We want a proof that the storage provider is dedicating unique resources to storing N replicas of a file.

Sealing also achieves the following goals:

- **Scalability**
  - Maintains security and performance for arbitrarily large files
- **Low communication**
  - Compact proofs
  - Infrequent polling
- **Fast verification**
  - Low complexity verification
- **Fast retrieval**
  - Extracting the data is fast

### Theory - DRG

Filecoin utilizes a particular encoding called Depth Robust DAG.

Depth robustness states that:

- Any sufficiently large subgraph of nodes contains a long path
  - Subgraph $\delta$ fraction of nodes contains path length $\epsilon N$
  - In fact, many nodes in the subgraph have depth $>\epsilon N$

**Why do we need this property?**

If we're querying random data from the graph, there's a high probability we select a node of high depth $\epsilon N$.

If the SP wants to cheat, deleting nodes of the graph, answering the query will require recomputing $\epsilon N$ encodings sequentially.

In order to prevent, this we must then set the polling time to be less than the time it takes to do all the encodings:

$$
T_\text{poll} < \epsilon N t_\text{enc}
$$

Encoding time will depend on the hashing function we utilize, where we can select the delay expected.

**Issues**

As it is, Depth-Robust Graphs present a few issues:

- Large spacegap = 0.8
  - Prover can delete 80% of data and still regenerate before $t_\text{max}$
- DRG generation vs regeneration is 5x

**Solution**

Stacked DRG introduces layering, in which a node is now generated from a combination of nodes from the previous and current layers.

### Steps

1. Data is encoded into a Stacked-DRG, generating a unique replica from:
   - Miner ID
   - Time when the specific data has been sealed by the specific miner
2. Merkle proof and tree generation is performed over the encoded data

This way, we have a unique representation of the data. The merkle proof is then uploaded to the blockchain as a commitment to the data.

## Proof of Replication

PoRep is a cryptographic proof that a miner has stored a unique copy of a piece of data. This ensures that miners actually allocate and dedicate storage space rather than pretending to do so.

It's a direct result of the sealing process, and it's generated by the miner.

This proof demonstrates that the sealing process has completed successfully and the Stacked DRG together with the merkle tree have been correctly generated. This proof is compressed using SNARK and submitted to the blockchain.

(Details of this proof can be seen [here](https://spec.filecoin.io/#section-algorithms.sdr.proving))

## Proof of Spacetime

A proof that the data is still stored over a period of time. Miners periodically submit these proofs to show they are continuously storing the client's data.

- Fundamentally, a WindowPoSt is a collection of merkle proofs over the underlying data in a Miner’s Sectors.
- WindowPoSts bundle proofs of various leaves across groups of Sectors (called Partitions).
- These proofs are submitted as a single SNARK.

Besides WindowPoSt, there's also WinningPoSt which is used to prove that an SP selected via election has a replica of the data at the specific time that they were asked and is specifically used in Filecoin to determine which SPs may add blocks to the Filecoin blockchain.

- For WinningPoSt, the miner only needs to prove a single randomly selected sector. When they "win" the block, they are challenged to prove that they still have access to that specific sector.
- The challenge will specify certain leaves (data parts) from the sector, and the miner must generate and submit the Merkle proof for the specified leaves from the challenged sector.

## References

- https://spec.filecoin.io/
- https://docs.filecoin.io/
- https://filecoin.io/blog/posts/what-sets-us-apart-filecoin-s-proof-system
- https://www.youtube.com/watch?v=KTqRmrsyxiE
- https://www.youtube.com/watch?v=8_9ONpyRZEI
