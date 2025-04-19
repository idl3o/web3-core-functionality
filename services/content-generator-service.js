/**
 * @license
 * Web3 Crypto Streaming Service
 * Copyright (c) 2023-2025 idl3o-redx
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Content Generator Service
 * Generates and preloads demo content for the platform
 */

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs').promises;
const ContentModel = require('../models/content-model');
const AssetGeneratorService = require('./asset-generator-service');
const IPFSService = require('./ipfs-service');
const { CONTENT_TYPES, CONTENT_STATUSES, ACCESS_TYPES } = ContentModel;

// Sample creator addresses (for demo content)
const DEMO_CREATORS = [
  '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Demo Creator 1
  '0x1a5b9A4A5C1ce40eF3Be30caEaa46022DB0D6263', // Demo Creator 2
  '0x3F311F21B7F7f7677E8b5Ee1E89909cB5211D34C'  // Demo Creator 3
];

// Sample content categories with descriptions
const CONTENT_CATEGORIES = {
  'web3-basics': {
    title: 'Web3 Basics',
    description: 'Fundamental concepts and technologies behind Web3',
    topics: ['Blockchain', 'Decentralization', 'Cryptography', 'Wallets', 'Consensus']
  },
  'smart-contracts': {
    title: 'Smart Contract Development',
    description: 'Learn to build and deploy smart contracts on blockchain networks',
    topics: ['Solidity', 'Security', 'Testing', 'Deployment', 'Best Practices']
  },
  'defi': {
    title: 'DeFi Applications',
    description: 'Explore decentralized finance protocols and applications',
    topics: ['AMMs', 'Lending', 'Yield Farming', 'Stablecoins', 'DEXs']
  },
  'nfts': {
    title: 'NFTs & Digital Assets',
    description: 'Understanding non-fungible tokens and digital ownership',
    topics: ['NFT Standards', 'Marketplaces', 'Digital Art', 'Gaming', 'Collectibles']
  }
};

/**
 * Content Generator Service class
 */
class ContentGeneratorService extends EventEmitter {
  constructor() {
    super();
    this.contentModel = ContentModel;
    this.assetGenerator = new AssetGeneratorService();
    this.ipfsService = IPFSService;
  }

  /**
   * Initialize the service
   */
  async init() {
    console.log('ContentGeneratorService initialized');
    return this;
  }

  /**
   * Generate and preload sample content
   * @param {Object} options Configuration options
   * @returns {Promise<Array>} Generated content IDs
   */
  async generateContent(options = {}) {
    const count = options.count || 10;
    const contentType = options.contentType || CONTENT_TYPES.VIDEO;
    const category = options.category || Object.keys(CONTENT_CATEGORIES)[0];
    const creatorAddress = options.creatorAddress || DEMO_CREATORS[0];
    
    console.log(`Generating ${count} ${contentType} content items in ${category} category...`);
    
    const generatedContent = [];
    
    try {
      for (let i = 0; i < count; i++) {
        // Generate a content item
        const content = await this._generateContentItem({
          contentType,
          category,
          creatorAddress: options.randomCreator ? 
                          DEMO_CREATORS[Math.floor(Math.random() * DEMO_CREATORS.length)] : 
                          creatorAddress,
          index: i
        });
        
        generatedContent.push(content);
        
        // Emit progress event
        this.emit('content:generated', {
          current: i + 1,
          total: count,
          contentId: content.id
        });
      }
      
      console.log(`Successfully generated ${generatedContent.length} content items`);
      return generatedContent;
      
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }
  
  /**
   * Generate a single content item
   * @param {Object} params Generation parameters
   * @returns {Promise<Object>} Generated content item
   * @private
   */
  async _generateContentItem(params) {
    const { contentType, category, creatorAddress, index } = params;
    
    // Get category info
    const categoryInfo = CONTENT_CATEGORIES[category] || CONTENT_CATEGORIES['web3-basics'];
    
    // Generate random content properties
    const title = this._generateTitle(categoryInfo, index);
    const description = this._generateDescription(categoryInfo);
    const tags = this._generateTags(categoryInfo, 3);
    
    // Generate mock content data (would be actual media files in production)
    const { mockCid, mockSize } = await this._generateMockContent(contentType, title);
    
    // Create content in the model
    const contentData = {
      title,
      description,
      contentType,
      category,
      tags,
      status: Math.random() > 0.2 ? CONTENT_STATUSES.PUBLISHED : CONTENT_STATUSES.DRAFT,
      accessType: Math.random() > 0.3 ? ACCESS_TYPES.PUBLIC : ACCESS_TYPES.TOKEN_GATED,
      duration: this._generateDuration(contentType),
      ipfsCid: mockCid,
      size: mockSize,
      thumbnailCid: await this._generateThumbnail(title, category),
      metadata: {
        generatedAt: new Date().toISOString(),
        isDemo: true,
        difficulty: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
        keywords: tags.join(', ')
      }
    };
    
    // Create the content item
    const content = await this.contentModel.createOrUpdate(contentData, creatorAddress);
    
    console.log(`Generated content: ${title} (${content.id})`);
    return content;
  }
  
  /**
   * Generate a title based on category
   * @param {Object} categoryInfo Category information
   * @param {number} index Index for unique titles
   * @returns {string} Generated title
   * @private
   */
  _generateTitle(categoryInfo, index) {
    const prefixes = [
      'Introduction to', 
      'Advanced', 
      'Understanding', 
      'Exploring', 
      'Deep Dive into', 
      'Mastering', 
      'Practical'
    ];
    
    const topics = categoryInfo.topics || ['Blockchain', 'Web3', 'Crypto'];
    const topic = topics[index % topics.length];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    return `${prefix} ${topic}`;
  }
  
  /**
   * Generate a description based on category
   * @param {Object} categoryInfo Category information
   * @returns {string} Generated description
   * @private
   */
  _generateDescription(categoryInfo) {
    const templates = [
      `Learn everything you need to know about ${categoryInfo.title.toLowerCase()}, from basic concepts to advanced techniques.`,
      `A comprehensive guide to ${categoryInfo.title.toLowerCase()}, designed for all skill levels.`,
      `Explore the world of ${categoryInfo.title.toLowerCase()} with hands-on examples and practical demonstrations.`,
      `This content covers essential aspects of ${categoryInfo.title.toLowerCase()}, with real-world applications.`,
      `Deep dive into ${categoryInfo.title.toLowerCase()} with expert insights and detailed explanations.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  /**
   * Generate tags based on category
   * @param {Object} categoryInfo Category information
   * @param {number} count Number of tags to generate
   * @returns {Array} Generated tags
   * @private
   */
  _generateTags(categoryInfo, count = 3) {
    const commonTags = ['web3', 'blockchain', 'crypto', 'educational'];
    const categoryTags = categoryInfo.topics || [];
    
    const allTags = [...commonTags, ...categoryTags];
    const selectedTags = [];
    
    // Select random unique tags
    while (selectedTags.length < count && allTags.length > 0) {
      const randomIndex = Math.floor(Math.random() * allTags.length);
      const tag = allTags.splice(randomIndex, 1)[0];
      selectedTags.push(tag.toLowerCase());
    }
    
    return selectedTags;
  }
  
  /**
   * Generate mock content data
   * @param {string} contentType Content type
   * @param {string} title Content title
   * @returns {Promise<Object>} Mock content data
   * @private
   */
  async _generateMockContent(contentType, title) {
    // In a real implementation, this would create actual content files
    // For now, we'll simulate IPFS CIDs
    const mockCid = `Qm${this._generateRandomHex(44)}`;
    
    // Generate reasonable mock sizes based on content type
    const mockSizes = {
      [CONTENT_TYPES.VIDEO]: 1024 * 1024 * (10 + Math.floor(Math.random() * 90)), // 10-100 MB
      [CONTENT_TYPES.AUDIO]: 1024 * 1024 * (2 + Math.floor(Math.random() * 8)),   // 2-10 MB
      [CONTENT_TYPES.DOCUMENT]: 1024 * (100 + Math.floor(Math.random() * 900)),   // 100-1000 KB
      [CONTENT_TYPES.IMAGE]: 1024 * (200 + Math.floor(Math.random() * 800))       // 200-1000 KB
    };
    
    return {
      mockCid,
      mockSize: mockSizes[contentType] || 1024 * 1024
    };
  }
  
  /**
   * Generate a thumbnail for content
   * @param {string} title Content title
   * @param {string} category Content category
   * @returns {Promise<string>} Thumbnail CID
   * @private
   */
  async _generateThumbnail(title, category) {
    // In a real implementation, this would generate actual thumbnail images
    // For now, we'll simulate IPFS CIDs for thumbnails
    return `Qm${this._generateRandomHex(44)}`;
  }
  
  /**
   * Generate random duration string for content
   * @param {string} contentType Content type
   * @returns {string} Duration string (e.g., "12:34")
   * @private
   */
  _generateDuration(contentType) {
    let minutes, seconds;
    
    switch (contentType) {
      case CONTENT_TYPES.VIDEO:
        minutes = 3 + Math.floor(Math.random() * 27); // 3-30 minutes
        break;
      case CONTENT_TYPES.AUDIO:
        minutes = 2 + Math.floor(Math.random() * 58); // 2-60 minutes
        break;
      default:
        minutes = 5 + Math.floor(Math.random() * 15); // 5-20 minutes (read time)
    }
    
    seconds = Math.floor(Math.random() * 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Generate JSON content files for education section
   * @param {Object} options Options for generation
   * @returns {Promise<Array>} Generated file paths
   */
  async generateEducationContent(options = {}) {
    console.log('Generating educational content JSON files...');
    
    const categories = options.categories || Object.keys(CONTENT_CATEGORIES);
    const generatedFiles = [];
    
    try {
      for (const category of categories) {
        const categoryInfo = CONTENT_CATEGORIES[category];
        if (!categoryInfo) continue;
        
        // Ensure the content directory exists
        const contentDir = path.join(process.cwd(), 'assets', 'content', category);
        await fs.mkdir(contentDir, { recursive: true });
        
        // Generate content files for each topic in the category
        for (const topic of categoryInfo.topics) {
          const fileName = this._generateFileName(topic);
          const filePath = path.join(contentDir, fileName);
          
          // Generate content structure
          const content = {
            id: `${category}-${topic.toLowerCase().replace(/\s+/g, '-')}`,
            title: topic,
            category: category,
            description: this._generateTopicDescription(topic, categoryInfo),
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            content: await this._generateEducationalContent(topic, categoryInfo),
            metadata: {
              difficulty: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
              estimatedReadTime: Math.floor(Math.random() * 15) + 5, // 5-20 minutes
              keywords: this._generateKeywords(topic, categoryInfo),
              isDemo: true
            }
          };
          
          // Save to file
          await fs.writeFile(filePath, JSON.stringify(content, null, 2));
          generatedFiles.push(filePath);
          
          this.emit('education:generated', {
            file: filePath,
            category: category,
            topic: topic
          });
        }
      }
      
      console.log(`Generated ${generatedFiles.length} educational content files`);
      return generatedFiles;
      
    } catch (error) {
      console.error('Error generating educational content:', error);
      throw error;
    }
  }
  
  /**
   * Generate a file name for an educational content topic
   * @param {string} topic Topic name
   * @returns {string} File name
   * @private
   */
  _generateFileName(topic) {
    return `${topic.toLowerCase().replace(/\s+/g, '-')}.json`;
  }
  
  /**
   * Generate a description for a topic
   * @param {string} topic Topic name
   * @param {Object} categoryInfo Category information
   * @returns {string} Topic description
   * @private
   */
  _generateTopicDescription(topic, categoryInfo) {
    const descriptions = {
      'Blockchain': 'Understanding the fundamental technology behind cryptocurrencies and Web3.',
      'Decentralization': 'Explore how decentralized systems are changing the internet landscape.',
      'Cryptography': 'Learn about the encryption techniques that secure blockchain networks.',
      'Wallets': 'Discover how digital wallets work to store and manage crypto assets.',
      'Consensus': 'Understand the various consensus mechanisms that power blockchains.',
      'Solidity': 'Learn the primary programming language for Ethereum smart contracts.',
      'Security': 'Best practices for securing your smart contracts and applications.',
      'Testing': 'Methodologies for testing smart contracts before deployment.',
      'Deployment': 'Step-by-step guide to deploying contracts to blockchain networks.',
      'Best Practices': 'Industry-standard approaches to Web3 development.',
      'AMMs': 'How Automated Market Makers revolutionized decentralized exchanges.',
      'Lending': 'Understanding peer-to-peer lending protocols in DeFi.',
      'Yield Farming': 'Strategies for earning passive income with your crypto assets.',
      'Stablecoins': 'Exploring price-stable cryptocurrencies and their mechanisms.',
      'DEXs': 'How decentralized exchanges work and their advantages over CEXs.',
      'NFT Standards': 'Understanding the technical standards behind NFTs.',
      'Marketplaces': 'How NFT marketplaces function and their business models.',
      'Digital Art': 'The intersection of blockchain technology and digital creativity.',
      'Gaming': 'How blockchain is transforming the gaming industry.',
      'Collectibles': 'The economics and psychology behind digital collectibles.'
    };
    
    return descriptions[topic] || `Comprehensive guide to ${topic} in the context of ${categoryInfo.title}.`;
  }
  
  /**
   * Generate educational content for a topic
   * @param {string} topic Topic name
   * @param {Object} categoryInfo Category information
   * @returns {Promise<Array>} Content sections
   * @private
   */
  async _generateEducationalContent(topic, categoryInfo) {
    // Generate between 3-6 sections
    const sectionCount = Math.floor(Math.random() * 4) + 3;
    const sections = [];
    
    for (let i = 0; i < sectionCount; i++) {
      const section = {
        title: this._generateSectionTitle(topic, i),
        type: 'text',
        content: this._generateSectionContent(topic, i)
      };
      
      // Add code example for technical topics
      if (['Solidity', 'Testing', 'Deployment', 'AMMs', 'DEXs', 'NFT Standards'].includes(topic) && i > 0 && Math.random() > 0.5) {
        section.codeExample = this._generateCodeExample(topic);
      }
      
      // Add an interactive element occasionally
      if (Math.random() > 0.7) {
        section.interactive = {
          type: ['quiz', 'challenge', 'visualization'][Math.floor(Math.random() * 3)],
          data: this._generateInteractiveElement(topic)
        };
      }
      
      sections.push(section);
    }
    
    // Always add a summary section
    sections.push({
      title: 'Summary',
      type: 'text',
      content: `In this guide, we've explored ${topic} in the context of ${categoryInfo.title}. Understanding these concepts is crucial for anyone looking to build or participate in the Web3 ecosystem.`
    });
    
    return sections;
  }
  
  /**
   * Generate a section title based on topic and section index
   * @param {string} topic Topic name
   * @param {number} index Section index
   * @returns {string} Section title
   * @private
   */
  _generateSectionTitle(topic, index) {
    const introTitles = ['Introduction to', 'Understanding', 'Getting Started with', 'Fundamentals of', 'Basics of'];
    const midTitles = ['Deep Dive into', 'Advanced Concepts in', 'Key Components of', 'Working with', 'Exploring'];
    const endTitles = ['Best Practices for', 'Future of', 'Real-world Applications of', 'Challenges in', 'Case Studies of'];
    
    if (index === 0) {
      return `${introTitles[Math.floor(Math.random() * introTitles.length)]} ${topic}`;
    } else if (index === 1) {
      return `How ${topic} Works`;
    } else if (index < 4) {
      return `${midTitles[Math.floor(Math.random() * midTitles.length)]} ${topic}`;
    } else {
      return `${endTitles[Math.floor(Math.random() * endTitles.length)]} ${topic}`;
    }
  }
  
  /**
   * Generate placeholder content for a section
   * @param {string} topic Topic name
   * @param {number} index Section index
   * @returns {string} Section content
   * @private
   */
  _generateSectionContent(topic, index) {
    const paragraphCount = Math.floor(Math.random() * 3) + 2; // 2-4 paragraphs
    let content = '';
    
    for (let i = 0; i < paragraphCount; i++) {
      switch (index) {
        case 0:
          content += `${topic} is a fundamental concept in Web3 technology. It represents a significant shift from traditional approaches and offers new possibilities for decentralized applications. `;
          content += `As we explore this topic, you'll gain insights into how it's changing the digital landscape and creating new opportunities for innovation.\n\n`;
          break;
        case 1:
          content += `The mechanics behind ${topic} involve several key components working together. Understanding these interactions is crucial for developers and users alike. `;
          content += `When implemented correctly, ${topic} provides robust solutions to common challenges in the Web3 space.\n\n`;
          break;
        default:
          content += `As ${topic} continues to evolve, we're seeing new patterns and best practices emerge. Leading projects in this space are constantly refining their approaches `;
          content += `and discovering more efficient implementations. Staying updated with these developments will help you build more resilient and future-proof solutions.\n\n`;
      }
    }
    
    return content.trim();
  }
  
  /**
   * Generate code examples for technical topics
   * @param {string} topic Topic name
   * @returns {Object} Code example with language and source
   * @private
   */
  _generateCodeExample(topic) {
    const examples = {
      'Solidity': {
        language: 'solidity',
        source: `// Simple ERC20 Token Example
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SimpleToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("SimpleToken", "STK") {
        _mint(msg.sender, initialSupply);
    }
}`
      },
      'Testing': {
        language: 'javascript',
        source: `// Hardhat test example
const { expect } = require("chai");

describe("Token contract", function() {
  it("Deployment should assign the total supply of tokens to the owner", async function() {
    const [owner] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const hardhatToken = await Token.deploy();
    
    const ownerBalance = await hardhatToken.balanceOf(owner.address);
    expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
  });
});`
      },
      'Deployment': {
        language: 'javascript',
        source: `// Hardhat deployment script
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();

  console.log("Token address:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });`
      },
      'NFT Standards': {
        language: 'solidity',
        source: `// Basic ERC721 implementation
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SimpleNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("SimpleNFT", "SNFT") {}

    function mintNFT(address recipient, string memory tokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
}`
      }
    };
    
    return examples[topic] || {
      language: 'javascript',
      source: `// Example code for ${topic}
function example() {
  console.log("This is a placeholder for ${topic} code");
  return "Implementation would depend on specific use case";
}`
    };
  }
  
  /**
   * Generate an interactive element for a topic
   * @param {string} topic Topic name
   * @returns {Object} Interactive element data
   * @private
   */
  _generateInteractiveElement(topic) {
    // Generate a simple quiz as a default interactive element
    return {
      title: `Test Your Knowledge: ${topic}`,
      questions: [
        {
          question: `What is the primary purpose of ${topic}?`,
          options: [
            `To enhance security in blockchain networks`,
            `To improve scalability of Web3 applications`,
            `To enable decentralized governance`,
            `To facilitate peer-to-peer transactions`
          ],
          correctIndex: Math.floor(Math.random() * 4)
        },
        {
          question: `Which of these is NOT associated with ${topic}?`,
          options: [
            `Ethereum`,
            `Bitcoin`,
            `Traditional banking systems`,
            `Smart contracts`
          ],
          correctIndex: 2
        }
      ]
    };
  }
  
  /**
   * Generate keywords for a topic
   * @param {string} topic Topic name
   * @param {Object} categoryInfo Category information
   * @returns {Array} Array of keywords
   * @private
   */
  _generateKeywords(topic, categoryInfo) {
    const baseKeywords = [topic.toLowerCase(), categoryInfo.title.toLowerCase(), 'web3', 'blockchain', 'crypto'];
    const additionalKeywords = [
      'ethereum', 'decentralized', 'defi', 'cryptocurrency', 'tokens', 'nft', 'digital assets',
      'smart contracts', 'wallets', 'dapps', 'consensus', 'mining', 'staking'
    ];
    
    // Select 3-5 random additional keywords
    const keywordCount = Math.floor(Math.random() * 3) + 3;
    const selectedKeywords = [];
    
    for (let i = 0; i < keywordCount; i++) {
      const randomIndex = Math.floor(Math.random() * additionalKeywords.length);
      const keyword = additionalKeywords.splice(randomIndex, 1)[0];
      if (keyword) selectedKeywords.push(keyword);
    }
    
    return [...baseKeywords, ...selectedKeywords];
  }
  
  /**
   * Generate random hexadecimal string
   * @param {number} length Length of string to generate
   * @returns {string} Random hex string
   * @private
   */
  _generateRandomHex(length) {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
}

module.exports = new ContentGeneratorService();