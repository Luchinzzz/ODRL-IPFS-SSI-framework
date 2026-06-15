# :arrows_clockwise: ODRL-IPFS-SSI Framework

## :pencil: Table of contents

- [Description](#description)
- [Setup](#setup)
- [How to use](#how-to-use)
- [Technologies](#technologies)
- [License](#license)

## :books: Description <a name="description"/>
This repository implements a proof-of-concept framework that integrates ODRL policy management, decentralized storage, and blockchain-based enforcement within a Self-Sovereign Identity (SSI) ecosystem. ODRL policies defining the Terms of Use (ToU) of Verifiable Credentials (VCs) are stored as JSON-LD documents on IPFS and automatically translated into Solidity smart contracts (Smart Policies) deployable on any EVM-compatible blockchain.

## :gear: Setup <a name="setup"/>

To run this project, ensure you have Node.js installed. Then install dependencies:

```
npm install
```

This will install all the packages also in the subfolders (/hardhat, /translator).

## :man_technologist: How to use <a name="how-to-use"/>

To run the server:

```
  npm start
```

## :computer: Technologies <a name="technologies"/>
Project is created with:
* [TypeScript](https://www.typescriptlang.org/)
* [Node.js](https://nodejs.org/en)
* [Solidity](https://docs.soliditylang.org/en/v0.8.33/)
* [Helia IPFS](https://github.com/ipfs/helia)
* [Express](https://expressjs.com/en/)


## :balance_scale: License <a name="license"/>
This project is licensed under the Apache License - see the [LICENSE.md](LICENSE) file for details

