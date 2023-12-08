# Storage Proofs
The term _storage proofs_, in the context of this document, refers to the actual cryptographic result that is the response to the _challenge_ sent by the runtime. The aim of this document is to analyse 3 alternatives found in the market, state of the art research, and our own proposal. To compare them, and arrive to a conclusion of the most suitable cryptographic algorithm for storage proofs.

### Terminology
- MSP: Main Storage Provider.
- BSP: Backup Storage Provider.
- SP: Storage Provider (refers to both Main and Backup).
- Merklise a file: to break down a file into small chunks of data, and use them as leafs for a Merkle tree.

### Goals for a Storage Proof Algorithm
1. Generating the proof has to be a relatively cheap process, in computational terms, provided that the SP has stored the entire file in hot storage and constructed the needed cryptographic structures when first received.
2. Generally speaking, since BSPs would be running this proving process frequently, it would be ideal if no dedicated or expensive hardware is required for it. BSP's implementation should be as lightweight and cheap as possible.
3. Proofs should be verifiable on-chain, without the need of having access to the full data of the file. In other words, Relay Chain Validators should be able to verify proofs, and that should provide sufficient certainties for other parachains that the data is safely stored in StorageHub.
4. Proofs should fit in a regular Substrate extrinsic.
5. Storage Providers shouldn't be able to speculate on partially storing a file.

### Assumptions
1. Files are identified by the location they are stored in. In other words, a file path.
2. The runtime challenges Storage Providers periodically to provide storage proofs for randomly selected files, among the set of files that each Storage Provider is storing. The way in which the runtime generates those challenges is not part of the scope of this document, so it will be assumed that those challenges arrive at a sufficiently high frequency.
3. The runtime has means to verify the proof against a _fingerprint_ of the file, which can be a hash, Merkle root of the file, or similar.

## Storage Proofs Compared
This section discusses the alternatives considered for implementing storage proofs that would satisfy the criteria above. Those alternatives are:

1. **ePoSt**: Practical and Client-Friendly Proof of Storage-Time, paper by Chengru Zhang, Xinyu Li, and Man Ho Au, Member, IEEE. A very state-of-the-art mechanism for storage proofs that also aims to prove continuous storage of some data over time. It is a proposal at the edge of today's research, without a known commercial use implementation, at least to the knowledge of this document.
2. **Filecoin's Proof of Replication (PoRep) and Proof of Spacetime (PoSt)**: a market-tested approach taken by one of the current industry leaders in the space. It relies on a computationally heavy process that should be executed once by the Storage Providers, to store a file, called sealing. It is a highly complex protocol, with advanced cryptographic components, and one which requires dedicated hardware to be computed, as per [Filecoin's docs](https://lotus.filecoin.io/storage-providers/get-started/hardware-requirements/#specific-operation-requirements).
3. **Merklised Files**: an approach proposed specifically for this design, focusing on simplicity of the proof. Each file to store in StorageHub would be separated into very small chunks of data, and used as the leafs of a Merkle Patricia Trie. The hash of the chunk is what determines the position of that chunk in the trie. The challenge would consist in the runtime requesting a random leaf of the trie, and the Storage Provider having to provide a valid Merkle proof for it.

### ePoSt
For the full details, check the (paid) paper [here](https://research.polyu.edu.hk/en/publications/epost-practical-and-client-friendly-proof-of-storage-time).

The protocol aims to offer an optimised and efficient way for a Storage Provider to prove that some data is being stored continuously over time, with publicly verifiable proofs. It relies on a series of challenges that the prover (Storage Provider) has to provide the correct answer for, and each challenge can be thought as:

$$
v_i = hash(c_i, F)
$$

Where $F$ is the content of the file, $c_i$ is the random component used for the challenge, and $v_i$ is the result. The prover (Storage Provider) would compute it's own

$$
v_i' = hash(c_i,F)
$$

And if $v_i' == v_i$, then the challenge is passed and the Storage Provider proved to have been storing the file.

For this challenges to be effective, the challenger would have to continuously supply new $c_i$ challenges, and compute the corresponding $v$ results to verify the response of the prover. The value that ePoSt brings to the table is that it provides a way to avoid that, trustlessly. The challenger (most likely the user interested in its file being proven), provides the first random challenge $c_0$, and the successive $c_i$ values are derived from that first challenge. To obtain $c_1$, the Storage Provider has to compute first

$$
v_0 = hash(c_0, F)
$$

and then

$$
c_1 = VDF(v_0)
$$

Where $VDF$ stands for Verifiable Delay Function. Essentially a function that can be proved that takes a certain time $T$ to compute, regardless of the hardware used.

Both the $hash(c_i, F)$ and $VDF(v_i)$ functions are computed using zero-knowledge circuits. So if after some long time of having iteratively computed $c_i$ and $v_i$ a number $N$ of times, the challenger receives the zk proofs of those executions, it not only knows that the $c_i$ values were correctly computed, but also that they were computed in periods of time separated by a time $T$, which is what it takes to compute the $VDF$. Now the challenger only needs to verify the correct result of

$$
v_N = hash(c_N, F)
$$

to know that the Storage Provider had to have $F$ for the entire time given by $N \cdot T$, and it takes a significantly shorter time to verify the zk proofs of execution, than to iteratively calculate the $c_i$ values until $c_N$.

The ePoSt protocol also provides a way to aggregate all the zk proofs of execution, along with other optimisations all around the process.

In short, it is a brilliant, elegant and thought out protocol for Proofs of Spacetime, but with no previous commercial applications yet, and an abundance of field specific knowledge required for implementing it. These last few reasons make the choice of using ePoSt, a risky one. Furthermore, it requires the challenger (user) to have access to the file $F$ at the end of the process, to verify that the Storage Provider stored it for the entirety of $N \cdot T$ time.

### PoRep and PoSt
For the full details, check Filecoin's docs for [PoRep](https://spec.filecoin.io/algorithms/pos/porep/) and [PoSt](https://spec.filecoin.io/algorithms/pos/post/).

Proofs of storage in Filecoin actually relay on a pair of proofs. Proof of Replication is the first one, which is a computationally heavy process that, given the data of the file to store, some information from the Storage Provider, and some randomness, it generates a cryptographically unique representation of that file being stored by that Storage Provider. Later, over the course of the period in which the SP is supposed to be storing the file, it receives challenges from Filecoin's blockchain, to which it has to respond in a relatively short window of time. The window of time is sufficient for the Storage Provider to submit the proof for its unique replication of that file, but not long enough for it to fetch the file from somewhere else and generate the proof on the fly. The concept of the PoRep is important because it provides the certainties to the users that there are in fact as many replicas of the file, as are registered on-chain. However, this is achieved at the cost of a computationally heavy process initially, and imposing special and high hardware requirements on the Storage Providers.

For the proof itself, Filecoin uses Merkle trees and Merkle proofs, and those proofs are compressed using zk-SNARKs.

Filecoin's approach to storage proofs comes with the extensive research done by their team, and a protocol that has already been battle tested, which is a strong argument to follow in their footsteps. However, there is conflict between the way this protocol achieves its goals, and what the implementation of a BSP is supposed to be in StorageHub. Filecoin's reliance in heavy computation and expensive hardware stands as a problem for using their protocol as is, in BSPs. A BSP is supposed to require relatively cheap infrastructure to run, as they are charged with making the system unstoppable, and therefore a low barrier of entry is needed for decentralisation.

### Merklised Files
It consists in previously splitting the file into very small chunks of data, and using them as leafs for building a Merkle Patricia Trie. The position of each leaf in the Merkle Patricia Trie is determined by the `hash(file_chunk)`, and the size of the chunk has to be small enough to fit into a regular extrinsic, considering that many of this proving extrinsics should fit in one block. Appropriate benchmarking would be run to calculate the ideal size of a chunk.

The root of the Merkle Patricia Trie is what gets stored on-chain (or rather is part of the overarching Merkle Patricia Forest, if [reducedOnChainStorage](reducedOnChainStorage.md) is used), and used later for challenges. The runtime has the responsibility of sending out challenges for storage proofs, and it does so by requesting a proof for a random chunk within the trie. Since the runtime is not aware of all the leafs' hashes, it requests a random hash within all the hash space, and in most cases, that exact random hash will not be present in the Merkle Patricia Trie of the file, so the SP is required to provide the nearest existing hash in the trie. A definition of what is considered the "nearest existing hash" is therefore needed, and that definition should leave no ambiguity, so that the runtime can prove that, if it is not given the exact random hash, what it receives is actually the nearest. On such definition could be:
1. The one with the longest common prefix.
2. If there are more than one with the longest common prefix, it is the closest numerically speaking.
	For example, assuming 4 bit hashes, if the random hash requested is `0b0110`, and the node only has chunks with hashes `0b0100`, `0b0101` and `0b0111`, the closest is `0b0111` as it shares the prefix `0b011`. If instead it only has `0b0100` and `0b0101`, both with a shared prefix of `0b01`, the closest is `0b0101`, as it is at a numerical distance of 1, whereas `0b0100` is at a numerical distance of 2.

	![fileMerklePatriciaTrie](diagrams/fileMerklePatriciaTrie.png)

Frequent challenges of randomly requested hashes within the merklised file is what provides the certainty that the Storage Provider is actually storing the file. If the challenges are frequent enough, it would be more costly for the Storage Provider to misbehave and retrieve the file from somewhere else every time it has to provide a proof, than truthfully having it in hot storage. Moreover, if the randomness of the challenges is appropriate, the best strategy for the Storage Provider is to store the entirety of the file. To further strengthen this certainties, the window of response to a challenge for a Storage Provider, should be long enough for a good SP that stores the entire file, but too short for one that misbehaves by fetching the file when challenged, or only storing the file partially.

From the previous description of the proof, it can be derived that this proving protocol relies heavily on high frequency of challenges, and this in turn, results in high traffic of transactions on-chain for storage proofs. This is naturally one of the drawbacks of this approach.

The main advantage is simplicity, both for understanding it and implementing it. This can lead to a significantly reduced surface of error, as it relies on heavily tested cryptographic structures like Merkle Patricia Tries, and therefore a more secure system.

## Conclusion
The first conclusion drawn from this analysis is that the Merklised Patricia Tries approach is the most suitable for StorageHub's implementation. Mainly due to its simplicity and alignment with the overall values of the design. Filecoin's approach, while having many strong advantages, it is incompatible with the design principle of a cheap implementation for BSPs. As for ePoSt, its optimisations and novel approach are remarkable, but so is its complexity and lack of real world testing, making it risky to go for it for a first implementation of StorageHub. Fortunately though, it is compatible with the Merklised Files protocol, and can be thought as an optimisation of it. Down the line, if the amount of proofs submitted on-chain becomes a bottleneck due to high transactions traffic, ePoSt can be introduced as an upgrade to dramatically reduce the frequency of the challenges, while maintaining relatively the same level of certainties about files being stored over time. 