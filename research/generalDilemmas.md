# 🌎 General Dilemmas
Dilemas that are common to all types of storages use cases.

### What are the capabilities/limitations of XCM?
- We can transfer tokens using XCM, or manage tokens. This would potentially allow us to handle permissions as tokens.

### Where should permissions be?
- If permissions are tokens, the tokens should be stored in the Storage Hub, and for example, only XCM messages whose origin location is the owner of some file, is able to emit new permission tokens to other addresses registered in Storage Hub.

### How is the price of storage calculated? 
- Arweave defines it on the protocol level.
- Filecoin provides a marketplace.
- Greenfield leaves it up to each storage provider.
- This definition depends a lot on the Game Theory we propose.
