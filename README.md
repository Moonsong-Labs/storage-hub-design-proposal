# storage-hub
StorageHub is a decentralized storage system parachain optimized for file based storage and larger data sets that are not suitable to be stored directly in standard parachain storage. The proposed parachain will provide developers in the Polkadot ecosystem with an alternate decentralized and substrate-based storage solution and functionality.

### Purpose	
The goal of this project is to provide storage for web3 applications and protocols within the Polkadot & Kusama ecosystems. Unlike other storage protocols that focus on end user or enterprise storage scenarios, StorageHub’s feature set optimizes for web3 application storage use cases. StorageHub aims to provide a decentralized storage option that allows web3 applications to store large files and large data sets in a cost efficient way without sacrificing decentralization properties.

### Problem
Storage oriented chains, like Filecoin and Arweave, have emerged to provide more efficient and decentralized storage capabilities. However, these chains are standalone chains, and are not designed to interoperate with other chains. The problem is that web3 apps need smart contract logic and compute to be combined with storage to make a complete solution, but smart contracts and compute generally reside on different chains (e.g. Ethereum Mainnet, L2 rollups, Parachains) vs. on the storage optimized chains (Filecoin, Arweave). In response, these storage chains have tried to bolster their smart contract capabilities (e.g. Filecoin’s FVM, Arweave’s Smartweave), but they have and will continue to be hard pressed to convince all compute and smart contract activity to migrate to their chains.

The ideal scenario would be to combine smart contract execution from e.g. a Substrate based Polkadot parachain such as Moonbeam or Astar with storage from a storage optimized chain like Arweave.  If we look at NFT scenarios as an example, this is happening. The scenario is that you have an NFT contract on Mainnet, that has a pointer to a JPEG via an Arweave URL.  The problem is that this is a one-way pointer between 2 independent systems. It is up to the application to mediate interactions between the 2 chains in the client.  There is no awareness or connection between the contract and the JPEG other than the URL pointer in the contract. What if the contract could update access to and ownership of the actual data itself? What if the contract could read and act on the data stored? Simple functionality like this would open up a large number of new scenarios. End user UX could be substantially improved by removing the need for the user to understand and interact directly with both the contract and the storage blockchains, using potentially different accounts, keys, etc.

### Vision
StorageHub is a storage optimized parachain that is designed to work with other Polkadot & Kusama parachains. It focuses on storing data in an efficient and decentralized way, while allowing that storage to be accessed, used, and managed by other parachains. It will be possible for users to directly interact with the storage on the chain, but StorageHub also seeks to natively interoperate with existing parachains via XCM.

### References
- [Amazon S3](https://en.wikipedia.org/wiki/Amazon_S3)
- [Filecoin](https://filecoin.io/)
- [Arweave](https://www.arweave.org/)
- [Project Greenfield](https://github.com/bnb-chain/greenfield-whitepaper/blob/main/README.md)

