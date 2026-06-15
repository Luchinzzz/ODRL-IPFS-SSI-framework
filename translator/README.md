# :arrows_clockwise: ODRL-Solidity-translator
ODRL-Solidity-Translator is a preliminary TypeScript-based tool that converts ODRL (Open Digital Rights Language) policies into executable Solidity smart contracts. This repository enables automated translation of permissions, prohibitions, and obligations defined in ODRL into on-chain logic enforceable on Ethereum-compatible blockchains.

##  :pencil: Table of contents
* [Description](#description)
* [Setup](#setup)
* [How to use](#how-to-use)
* [Technologies](#technologies)
* [Bibliography](#bibliography)
* [License](#license)



## :books: Description <a name="description"/>
The goal of this project is to automatically translate ODRL policies into Solidity smart contracts. The tool parses ODRL JSON policies and generates Solidity code that enforces the rules on-chain.

Key features:

* Translate ODRL operators (e.g., eq, lt, gteq) into Solidity expressions.

* Handle Permission, Prohibition and Obligation rules.

* Supports logical constraints and combinations of multiple rules.

* Generates validation functions for multiple constraints.

* Includes a Solidity modifier to restrict access to authorized functions.

This allows organizations and developers to implement digital rights management and enforce usage policies for digital assets on blockchain platforms.

## :gear: Setup <a name="setup"/>
To run this project, ensure you have Node.js installed. Then install dependencies:
```
npm install
```


## :man_technologist: How to use <a name="how-to-use"/>
1. Place your ODRL JSON policy file in the project folder (example: example-policy.json).
2. Run the translator using Node.js / ts-node:
    ```
    npm start --name=filePath
    ```
    Replace filePath with the path to your JSON policy file.

3. The generated Solidity contract will be saved in the ./contracts folder with the same base name as the JSON file.


## :computer: Technologies <a name="technologies"/>
Project is created with:
* [TypeScript](https://www.typescriptlang.org/)
* [Node.js](https://nodejs.org/en)
* [Solidity](https://docs.soliditylang.org/en/v0.8.33/)

## :black_nib: Bibliography <a name="bibliography"/>

This work was presented at the BRAIN 2025 Workshop, in conjunction with PERCOM 2025.

If you want to cite it, you can use the following BibTex reference:
```
@inproceedings{DBLP:conf/percom/BistarelliLS25,
  author       = {Stefano Bistarelli and
                  Chiara Luchini and
                  Francesco Santini},
  title        = {A Preliminary Approach for Translating {ODRL} to Smart Policies},
  booktitle    = {{IEEE} International Conference on Pervasive Computing and Communications
                  Workshops and other Affiliated Events, PerCom 2025 - Workshops, Washington
                  DC, USA, March 17-21, 2025},
  pages        = {44--49},
  publisher    = {{IEEE}},
  year         = {2025},
  url          = {https://doi.org/10.1109/PerComWorkshops65533.2025.00039},
  doi          = {10.1109/PERCOMWORKSHOPS65533.2025.00039},
  timestamp    = {Tue, 01 Jul 2025 06:48:58 +0200},
  biburl       = {https://dblp.org/rec/conf/percom/BistarelliLS25.bib},
  bibsource    = {dblp computer science bibliography, https://dblp.org}
}
```
## :balance_scale: License <a name="license"/>
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details


