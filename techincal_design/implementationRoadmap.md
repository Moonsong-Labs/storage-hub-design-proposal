# StorageHub Implementation Roadmap

## Phase 1: Development (8 months)

### Overview:
- **Duration:** 8 months
- **Description:** Establish foundational elements of StorageHub, including runtime implementation, p2p transfer libraries/SP tasks, and essential clients.

### Tasks:
1. [**StorageHub Runtime**](https://github.com/Moonsong-Labs/storage-hub-design-proposal/blob/add-technical-design/techincal_design/runtimeBreakdown.md):
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
	2. [File System Pallet](https://github.com/Moonsong-Labs/storage-hub-design-proposal/blob/add-technical-design/techincal_design/runtimeBreakdown.md#file-system-pallet)
        - Potentially initiating an RFC to include additional functionality needed in XCM for storage requests and permissions based on XCM MultiLocations
	4. [Storage Providers Pallet](https://github.com/Moonsong-Labs/storage-hub-design-proposal/blob/add-technical-design/techincal_design/runtimeBreakdown.md#storage-providers-pallet)
	5. [Storage Proofs Pallet](https://github.com/Moonsong-Labs/storage-hub-design-proposal/blob/add-technical-design/techincal_design/storageProofs.md): Merklised Files storage proofs with verification funcions implemented in the runtime.
        - Potentially initiating an RFC to include a dedicated host function for optimized verification.
	6. [Reading Access NFT Pallet](https://github.com/Moonsong-Labs/storage-hub-design-proposal/blob/add-technical-design/techincal_design/runtimeBreakdown.md#reading-access-control-nfts-pallet)
	7.  [Governance - Referenda Pallet](https://github.com/Moonsong-Labs/storage-hub-design-proposal/blob/add-technical-design/techincal_design/runtimeBreakdown.md#referenda-pallet)

2. [**BSP Client**](https://github.com/Moonsong-Labs/storage-hub-design-proposal/blob/add-technical-design/techincal_design/modulesBreakdown.md#file-transfer-module-p2p):
	1. Receiving a file from task.
	2. Submit proofs task.
	3. Charging fees task.
	4. Monitor deleted files task.
	5. Monitor BSPs signing off to volunteer for their files and receive them task.
	6. Maintaining Merkle Patricia Forest.
	7. Sending file to MSP task.

3. [**MSP Client**](https://github.com/Moonsong-Labs/storage-hub-design-proposal/blob/add-technical-design/techincal_design/modulesBreakdown.md#file-transfer-module-p2p):
    1. Receive a file from user task.
    2. Submit proofs task.
    3. Charging fees task.
    4. Monitor deleted files task.
    5. Receive a file from BSPs when assigned as new MSP task.
    6. File System indexing for accepting selection as new MSP

4. **File Uploader Client**:
    - Task to monitor StorageHub's on-chain events and connect to MSP (when it accepts the request) and BSPs (when they volunteer). This task should be packed as a cargo package with asynchrnous tasks to launch from an async rust runtime like Tokio Runtime.

5. [StorageHub XCM Pallet](https://github.com/Moonsong-Labs/storage-hub-design-proposal/blob/add-technical-design/techincal_design/runtimeBreakdown.md#xcm-pallet):
    - A pallet to be used by external parachains wanting to use StorageHub's services. This pallet would abstract the construction of XCM messages to request storage.

6. MVP Example implementation of an MSP focusing on value proposition to be determined. Some alternatives include supplying CoreJam, NFTs cheap storage or general object storage.


## Phase 2: Testing, Audit and Optimizations (4 months)

### Overview:
- **Duration:** 4 months
- **Description:** Focus on testing, integrating, and auditing the components developed in Milestone 1. Continuation of MSP example

### Tasks:

1. **StorageHub Runtime**:
    1. Audit and optimisations.
    2. Final documentation: deliverable protocol, hardware specifications, how-tos.
2. **BSP Client**:
    1. Final documentation: deliverable protocol, hardware specifications, how-tos.
3. **MSP Client**:
    1. Continuation of development of example MSP.
    2. Setup infrastructure to run example MSP.
    3. Final documentation: deliverable executable to run an MSP, indications on how to expand functionality, hardware specifications, how-tos.

### Notes: 
- The division of tasks and milestones is designed to accommodate the development, testing, and iterative improvements necessary for a successful implementation of StorageHub. Adjustments may be made based on the evolving nature of the project.
- Although we are counting the 8 months of total development, we will be deploying intermediate versions of StorageHub so that they can be tested and receive feedback from the community.
