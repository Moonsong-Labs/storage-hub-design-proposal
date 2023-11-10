# BNB Greenfield

# Key takeaways:

1. They need a relayer network to pass messages between BSC and BNB Greenfield, we don’t, as we have Polkadot for that.
2. They let every Storage Provider define their read and write prices.
3. They have Data Availability Challenges but they are not periodic, just when someone triggers them.
4. They have a protocol for allowing Storage Providers to enter in Maintenance Mode.
5. They have a protocol for allowing Storage Providers to exit gracefully from the network.
6. Clear and interesting approach with Primary and Secondary SPs, where SPs do the separation in chunks of data with Erasure Coding of 4+2. It uses Reed-Solomon.
7. Their SPs provide access to APIs similar to an S3 Bucket.
8. I cannot find hardware specifications for running a Storage Provider, like the ones Filecoin provides. Is this because SPs in Greenfield are much more lightweight or because they are not as mature as a solution?
9. They use hashing for verifying Data Availability Challenges. While significantly more simple, probably also much more time/compute demanding than verifying a ZK proof.