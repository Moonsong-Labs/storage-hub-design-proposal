# StorageHub implementation plan

The idea of this document is divide all the work we need to implement Storage Hub, into smaller Milestons. 
This way we can show our work to the community, receive feedback and iterate faster.

## Project implementation structure:

This project can be divided into 2 different parts that can be parallelizable:
- The Runtime implementation:
    - Pallets also can be parallelizable
- The p2p transfer libraries/SP tasks

These two need to be integrated time to time to check that everything works fine together. Thats the main reason of the Milestones.

Each Milesotne has a duration of 2 months, consisting in 6 weeks for development and 2 weeks for integrations and tests.

## Milestones breakdown

## Milestone 1:
1. StorageHub Runtime v0.1:
	1. Cumulus Template Node:
		1. System Pallet
		2. Parachain System Pallet
		3. Timestamp Pallet
		4. Parachain Info Pallet
		5. Balances Pallet
		6. Transaction Payment Pallet
		7. Sudo Pallet
		8. Authorship Pallet
		9. Collator Selection Pallet
		10. Session Pallet
		11. Aura Pallet
		12. Aura Ext Pallet
		13. XCMP Queue Pallet
		14. Polkadot XCM Pallet
		15. Cumulus XCM Pallet
		16. Message Queue Pallet
	2. File System Pallet v0.1: all features except MSPs and writing permissions.
	3. Storage Providers Pallet: all features.
	4. Storage Proofs Pallet v0.1: TODO (probably Merkle proof based proofs).
	5. Reading Access NFT Pallet: all features.
2. BSP Client v0.1:
	1. Receiving a file from task.
	2. Submit proofs task.
	3. Charging fees task.
	4. Monitor deleted files task.
	5. Monitor BSPs signing off to volunteer for their files and receive them task.
	6. Maintaining Merkle Patricia Forest.
3. File Upload Utility: rust task to listen to BSPs volunteering for a given file, connecting to them and sending file.
4. Setup infrastructure for running StorageHub nodes and BSPs.

## Milestone 2:

1. StorageHub Runtime v0.2:
    1. File System Pallet v0.2: take MSPs into consideration and implement writing permissions based on XCM MultiLocations.
    2. Storage Providers Pallet iterative improvements
    3. Reading Access NFT Pallet iterative improvements
    4. Storage Proofs Pallet v0.2:  TODO (probably more sophisticated proving method).
    5. XCM Integration for calls to File System Pallet
2. MSP Client v0.1:
    1. Receive a file from user task.
    2. Submit proofs task.
    3. Charging fees task.
    4. Monitor deleted files task.
    5. Receive a file from BSPs when assigned as new MSP task.
3. BSP Client iterative improvements.

## Milestone 3:

1. StorageHub Runtime v0.3:
    1. Governance - Referenda Pallet.
    2. File System Pallet v0.2 iterative improvements.
    2. Storage Providers Pallet iterative improvements
    3. Reading Access NFT Pallet iterative improvements
    4. Storage Proofs Pallet iterative improvements.
    5. XCM Integration iterative improvements.
2. BSP Client v0.2:
    1. Sending file to MSP task.
3. MSP Client v0.2:
	1. File System indexing for accepting selection as new MSP.
	2. Iterative improvements.

## Milestone 4:

1. StorageHub Runtime v0.4:
    1. Benchmarking on all runtime extrinsics.
    2. Initiate audits.
2. BSP Client v0.2:
    1. 
3. MSP Client v0.2:
    1. 
4. File Uploader Client:
    1. 
5. StorageHub XCM Pallet:
    1. 

## Milestone 5:

1. StorageHub Runtime v0.4:
    1. Audit and optimisations.
2. BSP Client v0.2:
    1. 
3. MSP Client v0.2:
    1. 
4. File Uploader Client:
    1. 
5. File Uploader Client:
    1. 

## Milestone 6:

1. StorageHub Runtime v0.4:
    1. Audit and optimisations.
    2. Final documentation: deliverable protocol, hardware specifications, how-tos.
2. BSP Client v0.2:
    1. 
3. MSP Client v0.2:
    1. 
4. File Uploader Client:
    1. 
5. File Uploader Client:
    1. 