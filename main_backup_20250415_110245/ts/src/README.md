<div style="height: 100px; width: 100%;"></div>

# Web3 Crypto Streaming Service - TypeScript SDK

This SDK allows you to interact with the Web3 Crypto Streaming Service platform using TypeScript or JavaScript.

## Installation

```bash
npm install web3-streaming-client
```

## Quick Start

```typescript
import { createStreamClient } from 'web3-streaming-client';

// Create client instance
const client = createStreamClient({
  apiUrl: 'https://api.example.com',
  ipfsGateway: 'https://ipfs.example.com/ipfs/',
  chainId: 1 // Ethereum Mainnet
});

// Connect wallet and authenticate
async function connectAndAuthenticate() {
  try {
    const address = await client.connectWallet();
    console.log(`Connected wallet: ${address}`);
    
    // Get user profile
    const profile = await client.getProfile(address);
    
    if (profile) {
      console.log(`Welcome back, ${profile.name}!`);
    } else {
      console.log('No profile found. Please register as a creator.');
    }
    
    // Get token balance
    const tokenBalance = await client.getTokenBalance();
    console.log(`Token balance: ${tokenBalance.formattedBalance} ${tokenBalance.symbol}`);
    
  } catch (error) {
    console.error('Failed to connect wallet:', error);
  }
}

// Upload content to IPFS
async function uploadContent() {
  try {
    // File upload (in browser)
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      
      const ipfsResponse = await client.uploadToIPFS(file, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });
      
      console.log(`File uploaded to IPFS: ${ipfsResponse.cid}`);
      console.log(`URL: ${client.getIPFSUrl(ipfsResponse.cid)}`);
    }
  } catch (error) {
    console.error('Failed to upload content:', error);
  }
}

// Register as a creator
async function registerCreator() {
  try {
    const registered = await client.registerCreator({
      name: 'Creator Name',
      email: 'creator@example.com',
      bio: 'This is my creator bio',
      category: 'education',
      profileImageCid: 'QmXyZ123...' // CID of previously uploaded image
    });
    
    if (registered) {
      console.log('Successfully registered as a creator!');
    }
  } catch (error) {
    console.error('Failed to register:', error);
  }
}
```

## API Reference

### StreamClient

The main client class for interacting with the platform.

#### Constructor

```typescript
new StreamClient(config: StreamClientConfig)
```

#### Methods

- `connectProvider()`: Sets up connection to a Web3 provider
- `connectWallet()`: Connects a wallet and authenticates with the platform
- `authenticate(address: string)`: Authenticates with the platform using wallet signature
- `getProfile(address: string)`: Gets the profile for a creator by wallet address
- `uploadToIPFS(file: File | Blob, onProgress?: (progress: number) => void)`: Uploads content to IPFS
- `uploadMetadataToIPFS(metadata: Record<string, any>)`: Uploads metadata as JSON to IPFS
- `registerCreator(request: CreatorRegistrationRequest)`: Registers a new creator
- `publishContent(metadata: ContentMetadata)`: Publishes content with metadata to the platform
- `getTokenBalance()`: Gets token balance for the connected wallet
- `getIPFSUrl(cid: string)`: Gets a public URL for IPFS content
- `setAccessToken(token: string)`: Updates the access token manually

## Types

The SDK includes TypeScript definitions for all API interactions. Key types include:

- `StreamClientConfig`: Configuration for the client
- `CreatorProfile`: Creator profile data
- `CreatorRegistrationRequest`: Data for registering as a creator
- `ContentMetadata`: Metadata for published content
- `IPFSResponse`: Response from IPFS uploads
- `TokenDetails`: Token balance information
