# CrossChainDApp-Frontend

This is the frontend interface for the CrossChain DApp, a decentralized application that allows users to interact with a custom ERC-721 NFT smart contract deployed on a local Ethereum-compatible network (e.g., Hardhat).

## ✨ Features

- 🔗 Wallet connection via MetaMask and RainbowKit
- 🖼️ Mint NFTs using the `safeMint` function
- 📊 Check total supply of minted NFTs
- 📡 Interacts with local smart contracts deployed via Hardhat
- 🌐 Built with React, Wagmi, RainbowKit, and ethers.js

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourname/CrossChainDApp-Frontend.git
cd CrossChainDApp-Frontend
```
### 2. Install dependencies
``` bash
npm install
```
### 3. Start your local Hardhat node (in a separate terminal)
``` bash
npx hardhat node
```
### 4. Deploy contracts
```js
const CONTRACT_ADDRESS = '0x...'; // your MyToken deployed address
```
### 5.Start the frontend
```bash
npm run dev
```
## 📁 File Structure
- src/components/MyTokenComponent.jsx – Main NFT interaction logic (mint, total supply)

- src/wallet.jsx – Wallet provider setup using Wagmi + RainbowKit

- src/abi/MyToken.json – ABI of the deployed MyToken contract

## ✅ Prerequisites
- Node.js ≥ 16.x

- MetaMask installed

- Hardhat (as backend dev environment)

## 📄 License
MIT License


