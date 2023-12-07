# Runtime Breakdown
This document explores the different components that will make up Storage Hub's runtime. While there is a strong effort in planning beforehand with the outmost attention to detail, this is expected to be a one-year's work implementation. Therefore it is worth mentioning that the final deliverable may vary in the exact amount and description of components shown below.

The runtime is based on [Substrate](https://docs.substrate.io/) and [FRAME](https://docs.substrate.io/reference/frame-pallets/). The following are the set of pallets considered necessary for Storage Hub to provide its basic functionalities described in the design proposal. It should be clarified however, that this is not strictly the entire set of pallets, as there can be more later for miscellaneous operations of the parachain. Moreover, some of these pallets could be broken down into more than one for implementation purposes.

![runtimePallets](diagrams/runtimePallets.png)

### Terminology
- MSP: Main Storage Provider.
- BSP: Backup Storage Provider.
- SP: Storage Provider (refers to both Main and Backup).

## File System Pallet
The core of Storage Hub. This pallet holds the allocation of files in Storage Providers in the form of a mapping, whose keys are the file locations, and its values are all the metadata relevant to a file. It is consequently determined that Storage Hub is *location-addressed*, mainly to allow for updates of a given file. However, that does not mean that a content file identifier (hash of the file or Merkle root) will not be kept as well. In fact, it is part of the metadata associated to that file location.

When a storage request is received (i.e. the corresponding extrinsic is executed), an event is emitted: it notifies the Main Storage Provider and announces the file for potential Backup Storage Providers. If the MSP accepts the request, it should send a transaction confirming the commitment, as it is possible for an MSP to reject providing service. On the BSPs side, they have to monitor storage requests and volunteer as Backup Storage Providers for a given file. To prevent front-running attacks from BSPs who might have an advantage over others, and would always volunteer first, leading to centralisation of storage in BSPs, there are two mechanisms in place. Firstly, there is a cap on how much data a single BSP can store, and it is related to the amount of collateral it adds to the system. Secondly, and most important, there is a random subset of BSPs that can initially volunteer for storing a given file. To determine whether or not a BSP belongs to that subset, one must compute the XOR of the file ID -which in the end is a hash based on the file's content- and the BSP ID -also a hash. If the result falls below a set threshold, the BSP is elegible. To eventually allow for all BSPs to volunteer -in case there are no shows at the beginning-, this threshold increases over time.

![bspThresholdVsTime](diagrams/bspThresholdVsTime.png)

This minimum threshold should also be adjusted based on the number of BSPs signed up in Storage Hub. This is because at first, with just a handful of BSPs, the minimum threshold should be sufficiently high, to still allow for a reasonable number of BSPs to join. As more BSPs join the network, the minimum threshold should be more selective.

![bspThresholdVsNumberBsp](diagrams/bspThresholdVsNumberBsp.png)

When MSPs and BSPs send the transaction that sets them as Storage Providers for a file, that information is registered in the `FilesMapping`. There is an argument to be made agains this approach, and it is that since Storage Hub would be storing information (metadata) on a per-file basis, the state of the parachain grows with number of files. This could compromise scalability for potentially storing a significantly large amount of files. An alternative where the state grows with the number of Storage Providers instead of files is discussed [here](perProviderMerkleRoot.md). It consists of having a single Merkle root per Storage Provider, which is the root of a Merkle forest of all the files that provider is storing. The files, in turn, are the Merkle trees of the Merkle forest. The key takeaways of this approach, and the reasons why this is not the path chosen are:
1. There wouldn't be an accessible lookup table for finding where a file is supposed to be stored (either for MSPs or BSPs). In the case of BSPs, this could be mitigated by making them a peer-to-peer network with discovery algorithms like Kademlia, at the cost of increasing the hardware requirements for networking in BSPs. For MSPs, applications would end up relying on centralised indexing services that monitor the blockchain and register when they are assigned, naturally introducing a centralisation and censorship point in data retrieval.
2. Without having per-file accountability on-chain, Storage Providers cannot be punished for not providing proofs for a file they committed to store.
3. The Storage Provider Merkle Forest approach implies that the SPs are responsible of maintaining and updating a highly complicated Merkle tree structure. This would potentially increase the minimum hardware requirements for becoming a Storage Provider, which is a key factor for decentralisation in BSPs.

BSPs are independent actors in this design, meaning they do not act as a coordinated network, but rather as individuals with a lot of similarities, who interact with the runtime and provide their services to the network. This design choice naturally impacts the complexity of the runtime, which assumes the responsibility of data assignment and discovery. In the case of the former, it is mitigated by having BSPs volunteer for storing a file, eliminating any computational burden on the runtime. For the latter, it is needed to keep records on-chain of which BSPs are assigned to a file, which increases the state size of the parachain. It must be understood however, that decision is part of a larger design, and having the information of which BSP is storing a given file, impacts other aspects like incentives and storage proofs. Another approach where this is not the case is discussed [here](distributedP2PBspNodes.md), in which BSPs are not independent actors, but rather a collaborative peer-to-peer network of nodes. Consequently, the runtime is not aware of who is storing what, so it treats the whole network as one entity, and data discovery is handled through protocols like Kademlia and DHTs. The key takeaways of this approach, and the reasons why this is not the path chosen are:
1. Without having per-file accountability on-chain, the runtime cannot punish a single BSP for not proving that a file is being stored. The only option left is to punish the entire network of BSPs as one entity that failed to provide all the corresponding proofs, but the punishment cannot be as severe, because all of the network cannot be fully slashed for the failures of some of its actors. This has two consequences: 
	1. There is a higher risk of becoming a BSP, as you are now subject to punishment for other BSPs behaviour.
	2. Storage Hub provides less certainties to its users, because the punishment for loosing the users' data has to be less severe.
2. The implementation of a BSP increases in complexity and hardware costs (specially around networking) due to having to support data discovery and availability protocols like Kademlia. There is a significantly increased network traffic, which is something that this design was deliberately trying to avoid for BSPs.  
3. BSPs implementation becomes more complex due to having to support these protocols, potentially opening up to more attack vectors. Moreover, since the runtime treats the whole network as one entity, a successful attack on the BSPs peer-to-peer network, is a successful attack on all of Storage Hub. Considering that BSPs are what provides reliability and unstoppability to Storage Hub, then the system is only as secure as the peer-to-peer network.
4. Not being able to incentivise (positively and negatively) each BSP for storing a given file, and instead dealing with an entire network, would make the incentives design for storage proofs much more complicated.

### Extrinsics
1. `request_storage`: Creates a new entry in the `FilesMapping` with the new file to be stored. Performs basic checks like user having a minimum amount of funds, the MSP selected existing, etc. The extrinsic takes as arguments -at least- the MSP selected, and the price per data unit that the user will pay to the MSP, as it is possible that an MSP offers multiple value propositions and plans, depending on the cost. Emits a `NewFile` event that notifies the MSP of its selection, and announces the new file for BSPs to volunteer.
2. `msp_accept_file`: Expresses the consent of an MSP to store a file it was assigned to. Can only be successfully run by the assigned MSP. From there on, the MSP can be slashed if it does not provide the corresponding storage proofs when it should. Accepting the storage request implies that some of the collateral tokens of that MSP are frozen.
3. `bsp_volunteer`: Used by a BSP to volunteer for storing a file. The transaction will fail if the XOR between the file ID and the BSP ID is not below the threshold, so a BSP is strongly advised to check beforehand. Another reason for failure is if the maximum number of BSPs has been reached. A successful assignment as BSP means that some of the collateral tokens of that MSP are frozen.
4. `msp_resign`: Executed by an MSP to stop providing services for a file. A compensation should be provided for the user, to deter this behaviour.
5. `bsp_resign`: Executed by a BSP to stop storing a file. A compensation should be provided for the user, to deter this behaviour. In the case that this resignation means that the number of BSPs left for that file goes below `MinBspsPerFile`, then the compensation is equivalent to being slashed for that file.
6. `assign_writing_permissions`: Used by owner or manager of a file, to assign writing, modifying or managing permissions to an XCM MultiLocation (wildcard or specific). Manager permissions cannot be assigned as wildcards, only to specific accounts, which can also be sovereign accounts of an XCM MultiLocation. There is a maximum array of assigned permissions, that is why wildcards are available.
7. `overwrite_file`: Same as `request_storage`, except that the MSP is already assigned. Still, the MSP has to accept the change with its transaction, and for BSPs, the process is just like a new `request_storage`. Previously assigned BSPs are released of their duties effective immediately after this transaction. The transaction should also validate that the XCM MultiLocation requesting the change is allowed.
8. `delete_file`: Used by the owner of a file to terminate the storage agreement and stop paying for it, effective immediately after the transaction passes successfully. Emits an event for the corresponding BSPs and MSP to be notified that they should clear out their storage, and not provide anymore proofs. `FilesMapping` is cleared of this storage element.
9. `change_msp`: Used by the owner of a file to request a change to another MSP. Just like with `request_storage`, the new MSP has to accept the request, and the previous one is not required to provide anymore proofs, not charge for storing this file any longer. Emits an event for the new MSP to be notified of its selection, and the old MSP to delete the file from its storage.
10. There is also an extrinsic to set each of the **Config Values**, which must be executed with root origin.

### Storage
1. `FilesMapping`: a mapping from file location to the file's metadata.
	```rust
	pub type FileLocation = Vec<u8>; // A byte array representing the file path.
	pub struct FileMetadata {
		pub content_id: ContentId,
		pub msp: StorageProviderId,
		pub bsps: BoundedVec<StorageProviderId, MaxBsps>,
		pub is_public: Boolean,
		[...] // Other relevant metadata.
	}

	#[pallet::storage]
	pub type FilesMapping<T: Config> = StorageMap<
		FileLocation,
		FileMetadata,
	>;
	```
2. `TotalUsedBspStorage`: the total amount of storage being used from the BSPs capacity.
	```rust
	#[pallet::config]
	pub trait Config: frame_system::Config {
		type StorageCount: Parameter
			+ Member
			+ MaybeSerializeDeserialize
			+ Debug
			+ Default
			+ MaybeDisplay
			+ AtLeast32Bit
			+ Copy
			+ MaxEncodedLen
			+ HasCompact;
	}

	#[pallet::storage]
	#[pallet::getter(fn total_used_bsps_storage)]
		pub type TotalUsedBspStorage<T: Config> = StorageValue<_, <T as Config>::StorageCount>;
	```
3. `MinBspAssignmentThreshold`: the minimum threshold that the XOR operation between a file ID and a BSP ID should meet, to instantly be eligible as BSP for that file. This minimum threshold should decrease when more BSPs are added to the system, and increased if BSPs leave the system.
	```rust
	#[pallet::config]
	pub trait Config: frame_system::Config {
		type AssignmentThreshold: Parameter
			+ Member
			+ MaybeSerializeDeserialize
			+ Debug
			+ Default
			+ MaybeDisplay
			+ AtLeast32Bit
			+ Copy
			+ MaxEncodedLen
			+ HasCompact;
	}

	#[pallet::storage]
	#[pallet::getter(fn min_bsps_assignment_threshold)]
		pub type MinBspAssignmentThreshold<T: Config> = StorageValue<_, <T as Config>::AssignmentThreshold>;
	```
### Config Values
1. `MaxBspsPerFile`: maximum number of BSPs that can volunteer as providers for a given file.
2. `MinBspsPerFile`: the minimum number of BSPs that assure enough redundancy. Once this minimum number is reached, singing off as a BSP for that file is equivalent to being slashed.
3. `MaxMinBspThreshold`: the minimum BSP threshold for volunteering for a storing a file, when there are only `MaxBspsPerFile` BSPs signed up in Storage Hub.
4. `MinMinBspThreshold`: the maximum BSP threshold for volunteering for storing a file, when there is an infinite number of BSPs signed up in Storage Hub.

## Storage Providers Pallet
An accounts based pallet, with two kinds of accounts: Main and Backup Storage Providers. Both accounts have things in common, and things that are specific to each.

What differentiates the two kinds of Storage Providers is the information they sign up with. While BSPs should only sign up their [multiaddress](https://docs.rs/fluence-fork-libp2p/latest/libp2p/#multiaddr) for users and other MSPs to know where to connect with them, an MSP also provides the basic information of the value proposition it offers. We say basic because the value propositions can vary as much as use-cases can exist. It should be acknowledged though, that given the off-chain nature of the agreement between MSP and user, most of the information of the value proposition of the MSP will be exposed off-chain, and it is in the MSP's best interest to be truthful about it.

In order to sign up as a Storage Provider, the related account must hold an `SpMinDeposit` number of tokens in the [Balances Pallet](#Balances-Pallet), and this grants that Storage Provider a capacity of `SpMinCapacity` units of data. The reason for this held deposit is twofold: it serves as collateral in case the SP looses some users' data, and it prevents a single Backup Storage Provider from signing up with multiple accounts to have a higher chance of qualifying for storing a file faster (a sort of sybil attack). From there on, the Storage Provider can increase its storage capacity linearly by holding more funds, and the slope of that linear function is determined by how many tokens are slashed from the Storage Provider if it fails to provide storage proofs for a given amount of data.

![spCollateralVsCapacity](diagrams/spCollateralVsCapacity.png)

The image above shows how the storage capacity relates to the amount of tokens a Storage Provider holds. For illustrative purposes, in the diagram, `SpMinCapacity = 10TB`, which is the capacity a Storage Provider gets when it deposits `SpMinDeposit`. From there on, the capacity increases linearly with the number of tokens held, with a `DepositPerData` slope. It can also be visualised that the `SpMinDeposit =! DepositPerData * SpMinCapacity`, difference that is marked as "sign up offset". This offset is what discourages a single server running a Backup Storage Provider from increasing its storage capacity by adding more accounts as Storage Providers, and increasing the chances of being qualifying for storing a file as well (previous sybil attack).

A Storage Provider can reduce its held funds only if the remaining amount after the reduction is sufficient for its current `sp.data_stored`. In the case in which an SP would like to exit Storage Hub and withdraw its `SpMinDeposit`, it should be true that `sp.data_stored = 0`, i.e. it is not storing any file at the moment.

Whenever there is a sign up, sign off, or change in the storage capacity of a BSP, there is a variable in the parachain's state that keeps track of the total capacity of BSPs, for the storage base price adjustment. That variable is `TotalBspsCapacity`. Note that MSPs are not part of this accounting.
### Extrinsics
1. `msp_sign_up`: the account executing the transaction becomes an MSP. Besides providing the basic information of an MSP, it should also deposit at least `SpMinDeposit`.
2. `bsp_sign_up`: the account executing the transaction becomes a BSP. Besides providing the basic information of a BSP, it should also deposit at least `SpMinDeposit`. `MinBspAssignmentThreshold` should be decremented accordingly.
3. `msp_sign_off`: the account executing the transaction signs off as MSP. It should be true that `sp.data_stored = 0`, and in that case, all funds are released for that account.
4. `bsp_sign_off`: the account executing the transaction signs off as BSP. It should be true that `sp.data_stored = 0`, and in that case, all funds are released for that account. `MinBspAssignmentThreshold` should be incremented accordingly.

### Storage
1. `Msps`: mapping of signed up main storage providers.
	```rust
	pub struct ValueProposition {
		pub data_limit: StorageData, // A number type.
		pub protocols: BoundedVec<Protocols, MaxProtocols>,
		[...] // Other relevant data for the value proposition.
	}
	pub struct MainStorageProvider {
		pub data_stored: StorageData, // A number type.
		pub multiaddress,
		pub value_prop: ValueProposition,
	}

	#[pallet::storage]
	pub type Msps<T: Config> = StorageMap<
		T::AccountId,
		MainStorageProvider,
	>;
	```
2. `Bsps`: mapping of signed up main storage providers.
	```rust
	pub struct BackupStorageProvider {
		pub data_stored: StorageData, // A number type.
		pub multiaddress,
	}

	#[pallet::storage]
	pub type Bsps<T: Config> = StorageMap<
		T::AccountId,
		BackupStorageProvider,
	>;
	```
3. `TotalBspsCapacity`: the sum of all the BSPs storage capacity. It is updated every time a BSP signs up, signs off, or holds more funds to increase its storage capacity.
	```rust
	#[pallet::storage]
	#[pallet::getter(fn proposal_count)]
		pub type TotalBspsCapacity<T: Config> = StorageValue<_, StorageData>;
	```
### Config values
1. `SpMinDeposit`: the minimum deposit for an account to become a Storage Provider.
2. `SpMinCapacity`: the storage capacity that is given to a Storage Provider when depositing `SpMinDeposit`.
3. `DepositPerData`: the slope of the collateral vs storage capacity curve. In other terms, how many tokens a Storage Provider should add as collateral to increase its storage capacity in one unit of data.

## Storage Proofs Pallet
> [] Extrinsic to submit a storage proof by a Storage Provider. It should have a short window of time when it can be executed. If executed successfully, it should be free.
> [] Extrinsic for a Storage Provider to charge all the pending money for the service for storing a file, since it last charged, provided that it submitted the corresponding storage proofs.
> [] Inherent to draw at random a hash range that needs to provide a storage proof within the next window of time.
> [] Extrinsic to liquidate a BSP if it didn't provide storage proofs for a given period of time. The liquidator gets part of the stake of the BSP, and the owner of the file gets another part.
> [] Extrinsic with root access to modify window of time length.
> [] Extrinsic with root access to modify storage proof period of probing.
> [] Extrinsic with root access to modify base price for data.
> [] Should adjust payment distribution of funds going to BSPs and treasury.
> [] Config value for the minimum rate for a file, no matter the size.

## Balances Pallet
Strongly based on [FRAME's Balances Pallet](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/balances/README.md#L1) with appropriate configurations. This is where users load up their accounts to continuously pay for storage, and where storage providers add their collateral funds. To fulfil both tasks, the pallet provides transferring, [holding and freezing](https://polkadot-blockchain-academy.github.io/pba-book/frame/traits/page.html?highlight=hold#held-vs-frozen-balance) capabilities to the [Storage Proofs Pallet](runtimeBreakdown.md#Storage-Proofs-Pallet).

## XCM Pallet
Strongly based on [XCM Pallet](https://github.com/paritytech/polkadot-sdk/blob/master/polkadot/xcm/pallet-xcm/src/lib.rs#L1) with additional configurations to dispatch calls based on XCM messages. It is the gateway to:
1. Bridge DOT tokens to Storage Hub, to pay for storage or to provide as collateral for SPs.
2. Send storage requests.
3. Send overwrite requests.
4. Set permissions for files (both reading and writing).
5. Change MSP.

At the moment of writing, the best approach to root these messages to the corresponding extrinsics in Storage Hub is through the [Transact](https://paritytech.github.io/xcm-docs/journey/transact.html?highlight=transact#transact) XCM instruction. However, the [current implementation of the Dispatcher for Transact](https://github.com/paritytech/polkadot-sdk/blob/c29b74dc36fc20a76cee4a029a70e7ad42fa0b6e/polkadot/xcm/xcm-executor/src/lib.rs#L564) does not expose the underlying extrinsic to the XCM MultiLocation that originated the call, only the converted origin of that MultiLocation into a Storage Hub account. Even though this is sufficient for most of the extrinsics in Storage Hub, some require validating writing permissions through XCM MultiLocations, and the conversion means there is a loss of information that prevents Storage Hub from using wildcards in those permissions. One potential approach for an implementation would be to request un update to XCM, so that the Dispatcher exposes the underlying extrinsic to the XCM MultiLocation origin.

Another addition to XCM that would benefit the implementation of Storage Hub is the use of the `Publish` instruction, outlined in [this RFC](https://github.com/paritytech/xcm-format/pull/48). Should the instruction allow the parachains to configure the interpreted behaviour for it, it could be used to express storage requests.

## Referenda Pallet
Used for governance, to pass proposals on Storage Hub. It would be strongly influenced by [FRAME's Referenda Pallet](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/referenda/README.md#L1).

## Reading Access Control NFTs Pallet
An NFTs pallet to mint NFTs as credentials for reading access to a file, in case the file is not public. The owner/manager of a file would be able to select if the permissions minted are transferrable or not (soulbound).  [FRAME's NFTs pallet](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/nfts/README.md#L1) or a slight variation of it would be used for this purpose.
