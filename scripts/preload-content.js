/**
 * @license
 * Web3 Crypto Streaming Service
 * Copyright (c) 2023-2025 idl3o-redx
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Content Preloader Script
 * 
 * Usage:
 * node scripts/preload-content.js --type=video --count=20 --category=web3-basics
 * 
 * Options:
 *  --type     Content type: video, audio, document, image (default: video)
 *  --count    Number of items to generate (default: 10)
 *  --category Category: web3-basics, smart-contracts, defi, nfts (default: web3-basics)
 *  --education Generate educational content JSON files (default: false)
 *  --demos    Generate interactive demos (default: false)
 *  --clean    Clean existing generated content before generating new content (default: false)
 *  --creator  Specific creator address to use (default: random creator)
 */

const ContentGeneratorService = require('../services/content-generator-service');
const { CONTENT_TYPES } = require('../models/content-model');
const path = require('path');
const fs = require('fs').promises;

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=');
    acc[key] = value === undefined ? true : value;
  }
  return acc;
}, {});

/**
 * Run the preload script
 */
async function run() {
  console.log('⚡ Web3 Content Preloader');
  console.log('========================');
  
  try {
    // Initialize the generator service
    const contentGenerator = new ContentGeneratorService();
    await contentGenerator.init();
    
    // Parse options
    const options = {
      contentType: mapContentType(args.type || 'video'),
      count: parseInt(args.count || 10, 10),
      category: args.category || 'web3-basics',
      randomCreator: !args.creator,
      creatorAddress: args.creator
    };
    
    console.log('Options:', JSON.stringify(options, null, 2));
    
    // Clean existing content if requested
    if (args.clean) {
      await cleanGeneratedContent(args.education);
    }
    
    // Register event listeners
    contentGenerator.on('content:generated', (progress) => {
      const percent = Math.round((progress.current / progress.total) * 100);
      process.stdout.write(`\rGenerating content... ${percent}% complete [${progress.current}/${progress.total}]`);
    });
    
    let results = {
      content: [],
      educationFiles: [],
      demoFiles: []
    };
    
    // Generate content based on options
    if (args.education) {
      console.log('\n📚 Generating educational content files...');
      const files = await contentGenerator.generateEducationContent();
      console.log(`\n✅ Generated ${files.length} education content files`);
      results.educationFiles = files;
    }
    
    if (args.demos) {
      console.log('\n🎮 Generating interactive demos...');
      const demoFiles = await generateInteractiveDemos(contentGenerator);
      console.log(`\n✅ Generated ${demoFiles.length} interactive demos`);
      results.demoFiles = demoFiles;
    }
    
    // Always generate some content unless specifically skipped
    if (!args['skip-content']) {
      console.log('\n🎬 Generating streaming content...');
      const content = await contentGenerator.generateContent(options);
      console.log(`\n✅ Generated ${content.length} content items`);
      results.content = content;
    }
    
    // Generate a report
    await generateReport(results);
    
    console.log('\n✨ Content preloading completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error preloading content:', error);
    process.exit(1);
  }
}

/**
 * Map content type from string to enum value
 * @param {string} type Content type string
 * @returns {string} Content type enum value
 */
function mapContentType(type) {
  const typeMap = {
    'video': CONTENT_TYPES.VIDEO,
    'audio': CONTENT_TYPES.AUDIO,
    'document': CONTENT_TYPES.DOCUMENT,
    'image': CONTENT_TYPES.IMAGE
  };
  
  return typeMap[type.toLowerCase()] || CONTENT_TYPES.VIDEO;
}

/**
 * Clean existing generated content
 * @param {boolean} includeEducation Whether to clean education content files
 */
async function cleanGeneratedContent(includeEducation) {
  console.log('🧹 Cleaning existing generated content...');
  
  // Clean DB content with demo flag
  try {
    const ContentModel = require('../models/content-model');
    const result = await ContentModel.deleteMany({ 'metadata.isDemo': true });
    console.log(`Removed ${result.deletedCount} demo content items from database`);
  } catch (error) {
    console.warn('Warning: Could not clean database content:', error.message);
  }
  
  // Clean education content files if requested
  if (includeEducation) {
    try {
      const contentDir = path.join(process.cwd(), 'assets', 'content');
      const categories = ['web3-basics', 'smart-contracts', 'defi', 'nfts'];
      
      for (const category of categories) {
        const categoryDir = path.join(contentDir, category);
        try {
          const files = await fs.readdir(categoryDir);
          for (const file of files) {
            if (file.endsWith('.json')) {
              await fs.unlink(path.join(categoryDir, file));
            }
          }
          console.log(`Cleaned education content in ${category}`);
        } catch (error) {
          if (error.code !== 'ENOENT') {
            console.warn(`Warning: Could not clean ${category} directory:`, error.message);
          }
        }
      }
    } catch (error) {
      console.warn('Warning: Could not clean education content files:', error.message);
    }
  }
}

/**
 * Generate interactive demos
 * @param {ContentGeneratorService} contentGenerator Content generator instance
 * @returns {Promise<Array>} Generated demo files
 */
async function generateInteractiveDemos(contentGenerator) {
  const demoDir = path.join(process.cwd(), 'assets', 'content', 'demos');
  
  // Ensure demo directory exists
  try {
    await fs.mkdir(demoDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
  
  const demoTypes = [
    'smart-contract-interaction',
    'token-swap',
    'nft-minting',
    'wallet-connection'
  ];
  
  const generatedFiles = [];
  
  for (const demoType of demoTypes) {
    const demoFile = path.join(demoDir, `${demoType}-demo.json`);
    
    // Generate demo content based on type
    const demo = generateDemoContent(demoType);
    
    // Write to file
    await fs.writeFile(demoFile, JSON.stringify(demo, null, 2));
    generatedFiles.push(demoFile);
    
    console.log(`Generated demo: ${demoFile}`);
  }
  
  return generatedFiles;
}

/**
 * Generate demo content
 * @param {string} demoType Type of demo
 * @returns {Object} Demo content
 */
function generateDemoContent(demoType) {
  const baseDemo = {
    id: `${demoType}-demo`,
    title: formatTitle(demoType),
    description: `Interactive demo for ${formatTitle(demoType).toLowerCase()}`,
    type: 'interactive-demo',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    version: '1.0.0',
    requires: {
      wallet: true,
      network: 'testnet'
    }
  };
  
  switch (demoType) {
    case 'smart-contract-interaction':
      return {
        ...baseDemo,
        description: 'Learn how to interact with smart contracts on the blockchain',
        contractAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        abi: [
          {
            "inputs": [],
            "name": "getValue",
            "outputs": [{"type": "uint256", "name": ""}],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [{"type": "uint256", "name": "newValue"}],
            "name": "setValue",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        demoSteps: [
          {
            title: 'Connect Wallet',
            instruction: 'Connect your wallet to interact with the smart contract'
          },
          {
            title: 'Read Current Value',
            instruction: 'Click the button to read the current value from the contract',
            action: 'getValue'
          },
          {
            title: 'Set New Value',
            instruction: 'Enter a new value and submit to update the contract state',
            action: 'setValue',
            params: ['uint256']
          },
          {
            title: 'Verify Transaction',
            instruction: 'Check that your transaction was successful and the value was updated',
            action: 'getValue'
          }
        ]
      };
      
    case 'token-swap':
      return {
        ...baseDemo,
        description: 'Experience how token swaps work on decentralized exchanges',
        tokens: [
          { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
          { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
          { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18, address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' }
        ],
        demoSteps: [
          {
            title: 'Connect Wallet',
            instruction: 'Connect your wallet to start swapping tokens'
          },
          {
            title: 'Select Tokens',
            instruction: 'Choose which token you want to swap from and to',
            action: 'selectTokens'
          },
          {
            title: 'Enter Amount',
            instruction: 'Enter the amount of tokens you want to swap',
            action: 'enterAmount'
          },
          {
            title: 'Review Swap',
            instruction: 'Check the exchange rate and confirm the swap',
            action: 'reviewSwap'
          },
          {
            title: 'Confirm Transaction',
            instruction: 'Approve the transaction in your wallet',
            action: 'confirmSwap'
          }
        ]
      };
      
    case 'nft-minting':
      return {
        ...baseDemo,
        description: 'Learn how to mint your own NFT on the blockchain',
        contractAddress: '0x1a5b9A4A5C1ce40eF3Be30caEaa46022DB0D6263',
        demoSteps: [
          {
            title: 'Connect Wallet',
            instruction: 'Connect your wallet to mint an NFT'
          },
          {
            title: 'Choose Artwork',
            instruction: 'Select or upload an image for your NFT',
            action: 'selectImage'
          },
          {
            title: 'Add Metadata',
            instruction: 'Enter a name and description for your NFT',
            action: 'enterMetadata'
          },
          {
            title: 'Mint NFT',
            instruction: 'Click to mint your NFT on the blockchain',
            action: 'mintNFT'
          },
          {
            title: 'View NFT',
            instruction: 'See your newly minted NFT in your wallet',
            action: 'viewNFT'
          }
        ]
      };
      
    case 'wallet-connection':
    default:
      return {
        ...baseDemo,
        description: 'Learn how to connect your wallet to Web3 applications',
        supportedWallets: ['MetaMask', 'WalletConnect', 'Coinbase Wallet', 'Trust Wallet'],
        demoSteps: [
          {
            title: 'Choose Wallet',
            instruction: 'Select which wallet you want to connect with'
          },
          {
            title: 'Connect Wallet',
            instruction: 'Click the connect button to initiate the connection',
            action: 'connectWallet'
          },
          {
            title: 'Approve Connection',
            instruction: 'Approve the connection request in your wallet',
            action: 'approveConnection'
          },
          {
            title: 'View Account',
            instruction: 'Once connected, you can view your account details',
            action: 'viewAccount'
          },
          {
            title: 'Sign Message',
            instruction: 'Try signing a message to verify your identity',
            action: 'signMessage',
            message: 'Hello Web3!'
          }
        ]
      };
  }
}

/**
 * Format title from key
 * @param {string} key Hyphenated key
 * @returns {string} Formatted title
 */
function formatTitle(key) {
  return key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * Generate a content report
 * @param {Object} results Generation results
 */
async function generateReport(results) {
  console.log('\n📊 Generating content report...');
  
  const reportDir = path.join(process.cwd(), 'reports');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = path.join(reportDir, `content-preload-${timestamp}.json`);
  
  // Ensure reports directory exists
  try {
    await fs.mkdir(reportDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
  
  // Generate the report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      contentItems: results.content.length,
      educationFiles: results.educationFiles.length,
      demoFiles: results.demoFiles.length,
      totalGenerated: results.content.length + results.educationFiles.length + results.demoFiles.length
    },
    details: {
      content: results.content.map(c => ({
        id: c.id,
        title: c.title,
        type: c.contentType,
        category: c.category
      })),
      educationFiles: results.educationFiles,
      demoFiles: results.demoFiles
    }
  };
  
  // Write report to file
  await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
  
  console.log(`Report saved to: ${reportFile}`);
}

// Run the script if invoked directly
if (require.main === module) {
  run();
}

module.exports = { run };