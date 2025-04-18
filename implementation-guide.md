# Web3 Streaming Player - Implementation Guide

This guide provides step-by-step instructions for setting up and running the Web3 streaming player project.

## Prerequisites

- Node.js (v16 or higher)
- NPM (v7 or higher)
- MetaMask browser extension
- Basic understanding of Ethereum, smart contracts, and Web3

## Step 1: Project Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web3-core-functionality
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file and add your:
   - Alchemy/Infura API keys for RPC URLs
   - Private key for contract deployment (use test accounts only!)
   - Etherscan/Polygonscan API keys for contract verification
   - Pinata API keys for IPFS pinning

## Step 2: Compile and Deploy Smart Contracts

1. **Compile smart contracts**
   ```bash
   npx hardhat compile
   ```

2. **Start local blockchain for development**
   ```bash
   npx hardhat node
   ```
   Keep this terminal running.

3. **Deploy contracts to local network** (in a new terminal)
   ```bash
   npm run deploy:local
   ```
   This will deploy the `StreamingToken` and `ContentRegistry` contracts, and save the addresses to `contract-addresses.json`.

4. **Run tests to verify contracts**
   ```bash
   npm test
   ```

## Step 3: Configure Frontend

1. **Update network configuration**
   
   Edit `assets/js/network-config.js` to include the contract addresses from `contract-addresses.json`:
   
   ```javascript
   this.CONTRACT_ADDRESSES = {
     // ...existing networks...
     '0x539': { // Local development
       streamingToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Replace with address from contract-addresses.json
       contentRegistry: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'  // Replace with address from contract-addresses.json
     }
   };
   ```

2. **Prepare IPFS content**
   
   To test with IPFS content:
   
   - Ensure you have sample video files (or use the fallback URLs)
   - If using Pinata:
     - Upload videos to Pinata
     - Copy the CIDs and update them in `assets/js/video-loader.js`
     
   ```javascript
   this.demoContent = {
     'content_001': {
       // ...
       ipfsCid: 'YOUR_IPFS_CID_HERE', // Replace with actual IPFS CID
       // ...
     },
     // ...other content entries
   };
   ```

3. **Create thumbnail images**
   ```bash
   mkdir -p assets/images
   ```
   Add thumbnail images for your content and update the paths in `video-loader.js`.

## Step 4: Start the Development Server

1. **Run the local server**
   ```bash
   npm start
   ```
   This will start a server at http://localhost:8000

2. **Access the streaming player**
   
   Open your browser and navigate to:
   - http://localhost:8000/streaming.html for the streaming player
   - http://localhost:8000/token-explorer.html for the token explorer

## Step 5: Configure MetaMask

1. **Add Hardhat local network to MetaMask**
   - Open MetaMask
   - Go to Networks > Add Network
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH
   
2. **Import test accounts**
   - Copy a private key from the Hardhat console output
   - In MetaMask, click on your account icon > Import Account
   - Paste the private key and import

## Step 6: Interact with the Streaming Player

1. **Connect wallet**
   - Click "Connect Wallet" button
   - Approve the MetaMask connection

2. **Purchase streaming credits**
   - Click "Purchase Credits" button
   - Confirm the transaction in MetaMask
   - Wait for transaction confirmation

3. **Select content**
   - Choose content from the dropdown
   - Click "Load Content Info"
   
4. **Start streaming**
   - Click "Start Streaming" button
   - Confirm the transaction in MetaMask
   - The video should start playing after confirmation

5. **Verify streaming access**
   - Note the time remaining display
   - You can check access using "Check Access" button

## Step 7: Testing Different Networks

1. **Deploy to testnets**
   
   For Sepolia testnet:
   ```bash
   npm run deploy:sepolia
   ```
   
   For Mumbai testnet:
   ```bash
   npm run deploy:mumbai
   ```

2. **Switch networks in the UI**
   - Select different networks from the dropdown
   - Click "Switch Network"
   - MetaMask should prompt to switch networks

3. **Test demo mode**
   - Try using the player without connecting MetaMask
   - Click "Connect Wallet" without MetaMask installed to activate demo mode

## Step 8: Content Creator Workflow

1. **Register as content creator**
   ```javascript
   // Using ethers.js in browser console
   const contractAddress = '0x...'; // ContentRegistry address
   const contentRegistryAbi = [...]; // ABI from artifacts
   const provider = new ethers.providers.Web3Provider(window.ethereum);
   const signer = provider.getSigner();
   const contentRegistry = new ethers.Contract(contractAddress, contentRegistryAbi, signer);
   
   await contentRegistry.registerContent(
     'my_content_001',
     'ipfs://QmYourCID',
     ethers.utils.parseEther('1'), // 1 STRM price
     '{"title":"My Content","description":"Description"}'
   );
   ```

2. **Test streaming to registered content**
   - Select the registered content
   - Purchase credits and start streaming
   - Verify creator rewards distribution

## Troubleshooting

### Common Issues:
- **MetaMask not detecting network change**: Refresh the page after switching networks
- **Transaction failing**: Check console for error messages, ensure sufficient gas
- **Video not playing**: Check IPFS gateway status, try the fallback options
- **Contract interaction errors**: Verify contract addresses match between frontend and deployed contracts

### Debug Tips:
- Open browser console (F12) to view detailed logs
- Use `localStorage.setItem('web3StreamingDebug', 'true')` to enable verbose logging
- Check `window.contractManager` in console to inspect contract state

## Next Steps

- Implement a complete creator dashboard
- Add token staking functionality
- Enhance UI with more detailed analytics
- Implement multi-chain bridging for tokens
- Add subscription-based access model

## Technical Documentation

For more detailed explanations of the code structure and architecture, see:
- [Smart Contract Documentation](./docs/smart-contracts.md)
- [Frontend Architecture](./docs/frontend.md)
- [IPFS Integration Guide](./docs/ipfs.md)

## Reference

- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [Ethers.js Documentation](https://docs.ethers.io/v5/)
- [IPFS HTTP Client](https://www.npmjs.com/package/ipfs-http-client)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/4.x/)
```
