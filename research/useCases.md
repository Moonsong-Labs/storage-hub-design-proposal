# Use cases/potential users
The most influential decision in the design of any system is that of the end user, specifically, which use cases the system must support. 

As a matter of fact we have applications running on Parachains / Smart Contracts in the Polkadot ecosystem that need storage, and interact through XCM.

To be more generic with different use cases, it is useful to group them in 4 dimensions:

- Size of the information to be stored.
- Capacity for modifying the information.
- Duration of storage permanence.
 
## Size of the information
It affects:
- Where the data needs to be stored (off-chain vs on-chain)
- How the data is transferred (if it less than 1KB XCM could handle it)

Use cases:
- Large size of data storage (e.g. data blobs):
    - Object oriented storage like Amazon S3. 
    - Store NFTs data.
    - Decentralised Social applications/protocols.
    - Personal and enterprise data storage.

- Supporting small size:
    - ...

## Capacity for modifying the information
By this we mean whether we will have only immutable hash/value type or support mutable references.
It affects:
- Addressing (content-addressed vs location-addressed)

Use cases:
- Content addressing:
    - When immutability is important (NFTs storage)

- Location addressing:
    - Store a web service or page
    - Dinamic NFTs

## Duration of storage permanence
It affects:
- StorageHub Game theory.
- Storage price.

Permanently store information (Arweave)
Contractually agreed storage time (Filecoin)

### Questions
- Is there a specific parachain / application in the Polkadot ecosystem that really needs to have a solution like ours? 
    - Options: Decentralised Social protocol, archive node, etc. 
- Should we “fabricate” that first use case leveraging Moonbeam?

### Dilemmas for the different use cases
- [general dilemas](./generalDilemmas.md)
- [big files dilemmas](./bigFilesDilemmas.md)