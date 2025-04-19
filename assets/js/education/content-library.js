/**
 * ContentLibrary class for managing educational content
 * @class
 */
class ContentLibrary {
  /**
   * Create a content library
   * @param {Object} options - Configuration options
   * @param {WalletConnector} options.walletConnector - Wallet connector instance
   * @param {ContractManager} options.contractManager - Contract manager instance
   * @param {HTMLElement} options.topicGrid - Topic grid element
   * @param {HTMLElement} options.contentViewer - Content viewer element
   * @param {HTMLElement} options.backButton - Back button element
   * @param {HTMLElement} options.notificationElement - Notification element
   */
  constructor(options = {}) {
    this.walletConnector = options.walletConnector;
    this.contractManager = options.contractManager;
    this.topicGrid = options.topicGrid;
    this.contentViewer = options.contentViewer;
    this.backButton = options.backButton;
    this.notificationElement = options.notificationElement;
    
    // Track user progress
    this.userProgress = this.loadUserProgress();
    
    // Content loading state
    this.isLoading = false;
  }

  /**
   * Load user progress from local storage
   * @private
   * @returns {Object} User progress object
   */
  loadUserProgress() {
    try {
      const progress = localStorage.getItem('web3_education_progress');
      return progress ? JSON.parse(progress) : { completedLessons: [] };
    } catch (error) {
      console.error('Error loading user progress:', error);
      return { completedLessons: [] };
    }
  }

  /**
   * Save user progress to local storage
   * @private
   */
  saveUserProgress() {
    try {
      localStorage.setItem('web3_education_progress', JSON.stringify(this.userProgress));
    } catch (error) {
      console.error('Error saving user progress:', error);
    }
  }

  /**
   * Mark a lesson as complete
   * @param {string} lessonId - Lesson ID
   */
  markLessonComplete(lessonId) {
    if (!this.userProgress.completedLessons.includes(lessonId)) {
      this.userProgress.completedLessons.push(lessonId);
      this.saveUserProgress();
    }
  }

  /**
   * Check if a lesson is complete
   * @param {string} lessonId - Lesson ID
   * @returns {boolean} True if lesson is complete, false otherwise
   */
  isLessonComplete(lessonId) {
    return this.userProgress.completedLessons.includes(lessonId);
  }

  /**
   * Load topics from data source
   */
  async loadTopics() {
    try {
      this.showLoading();
      
      // In a real application, this would fetch data from an API or blockchain
      // For this example, we'll use static data
      const topics = [
        {
          id: 'blockchain-basics',
          title: 'Blockchain Basics',
          description: 'Understand the fundamental concepts of blockchain technology.',
          image: 'assets/images/education/blockchain-basics.jpg',
          lessons: [
            { id: 'what-is-blockchain', title: 'What is Blockchain?', duration: '10 min' },
            { id: 'how-blockchain-works', title: 'How Blockchain Works', duration: '15 min' },
            { id: 'consensus-mechanisms', title: 'Consensus Mechanisms', duration: '12 min' },
            { id: 'blockchain-use-cases', title: 'Blockchain Use Cases', duration: '8 min' }
          ]
        },
        {
          id: 'web3-introduction',
          title: 'Web3 Introduction',
          description: 'Learn about Web3, the decentralized internet, and its core principles.',
          image: 'assets/images/education/web3-intro.jpg',
          lessons: [
            { id: 'web3-vs-web2', title: 'Web3 vs Web2', duration: '10 min' },
            { id: 'decentralization', title: 'Understanding Decentralization', duration: '12 min' },
            { id: 'web3-architecture', title: 'Web3 Architecture', duration: '15 min' },
            { id: 'web3-applications', title: 'Web3 Applications', duration: '10 min' }
          ]
        },
        {
          id: 'crypto-wallets',
          title: 'Crypto Wallets',
          description: 'Explore different types of cryptocurrency wallets and how to use them.',
          image: 'assets/images/education/crypto-wallets.jpg',
          lessons: [
            { id: 'wallet-types', title: 'Types of Wallets', duration: '10 min' },
            { id: 'wallet-security', title: 'Wallet Security Best Practices', duration: '15 min' },
            { id: 'using-metamask', title: 'Using MetaMask', duration: '20 min', interactive: true },
            { id: 'hardware-wallets', title: 'Hardware Wallets Explained', duration: '12 min' }
          ]
        },
        {
          id: 'smart-contracts',
          title: 'Smart Contracts',
          description: 'Dive into smart contracts, their development, and use cases.',
          image: 'assets/images/education/smart-contracts.jpg',
          lessons: [
            { id: 'what-are-smart-contracts', title: 'What Are Smart Contracts?', duration: '10 min' },
            { id: 'solidity-basics', title: 'Solidity Basics', duration: '25 min' },
            { id: 'contract-security', title: 'Smart Contract Security', duration: '20 min' },
            { id: 'build-simple-contract', title: 'Build Your First Smart Contract', duration: '30 min', interactive: true }
          ]
        },
        {
          id: 'defi-fundamentals',
          title: 'DeFi Fundamentals',
          description: 'Understand the key concepts of Decentralized Finance.',
          image: 'assets/images/education/defi-basics.jpg',
          lessons: [
            { id: 'defi-introduction', title: 'Introduction to DeFi', duration: '15 min' },
            { id: 'lending-borrowing', title: 'Lending and Borrowing', duration: '12 min' },
            { id: 'defi-protocols', title: 'Popular DeFi Protocols', duration: '20 min' },
            { id: 'yield-farming', title: 'Yield Farming Explained', duration: '18 min' }
          ]
        },
        {
          id: 'nfts',
          title: 'NFTs',
          description: 'Explore non-fungible tokens and their applications.',
          image: 'assets/images/education/nfts.jpg',
          lessons: [
            { id: 'nft-basics', title: 'NFT Basics', duration: '10 min' },
            { id: 'nft-marketplaces', title: 'NFT Marketplaces', duration: '15 min' },
            { id: 'nft-creation', title: 'Creating Your First NFT', duration: '25 min', interactive: true },
            { id: 'nft-use-cases', title: 'NFT Use Cases Beyond Art', duration: '12 min' }
          ]
        }
      ];
      
      this.renderTopics(topics);
    } catch (error) {
      console.error('Error loading topics:', error);
      this.showNotification('Failed to load educational topics.', 'error');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Render topics in the topic grid
   * @param {Array} topics - Array of topic objects
   * @private
   */
  renderTopics(topics) {
    this.topicGrid.innerHTML = '';
    
    topics.forEach(topic => {
      const completedLessons = topic.lessons.filter(lesson => 
        this.isLessonComplete(lesson.id)
      ).length;
      
      const progressPercentage = topic.lessons.length > 0 
        ? Math.round((completedLessons / topic.lessons.length) * 100) 
        : 0;
      
      const cardElement = document.createElement('div');
      cardElement.className = 'topic-card';
      cardElement.innerHTML = `
        <div class="topic-image" style="background-image: url('${topic.image || 'assets/images/education/default.jpg'}')"></div>
        <div class="topic-details">
          <h3>${topic.title}</h3>
          <p>${topic.description}</p>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
            <span class="progress-text">${progressPercentage}% Complete</span>
          </div>
          <ul class="lesson-list">
            ${topic.lessons.slice(0, 3).map(lesson => `
              <li class="lesson-item">
                <span class="lesson-title">${lesson.title}</span>
                <span class="lesson-duration">${lesson.duration}</span>
              </li>
            `).join('')}
            ${topic.lessons.length > 3 ? `<li class="lesson-item">
              <span class="lesson-title">And ${topic.lessons.length - 3} more lessons...</span>
            </li>` : ''}
          </ul>
          <button class="btn primary view-topic-btn" data-topic-id="${topic.id}">View Topic</button>
        </div>
      `;
      
      const viewButton = cardElement.querySelector('.view-topic-btn');
      viewButton.addEventListener('click', () => this.viewTopic(topic));
      
      this.topicGrid.appendChild(cardElement);
    });
  }

  /**
   * View a topic and its lessons
   * @param {Object} topic - Topic object
   */
  async viewTopic(topic) {
    try {
      this.showLoading();
      
      // Update UI
      this.topicGrid.style.display = 'none';
      this.backButton.style.display = 'flex';
      this.contentViewer.style.display = 'block';
      
      const completedLessons = topic.lessons.filter(lesson => 
        this.isLessonComplete(lesson.id)
      ).length;
      
      const progressPercentage = topic.lessons.length > 0 
        ? Math.round((completedLessons / topic.lessons.length) * 100) 
        : 0;
      
      // Render topic content
      this.contentViewer.innerHTML = `
        <div class="topic-header">
          <h2>${topic.title}</h2>
          <p>${topic.description}</p>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progressPercentage}%"></div>
              <span class="progress-text">${completedLessons} of ${topic.lessons.length} lessons completed</span>
            </div>
          </div>
        </div>
        
        <div class="lessons-container">
          <h3>Lessons</h3>
          <ul class="full-lesson-list">
            ${topic.lessons.map(lesson => `
              <li class="lesson-item ${this.isLessonComplete(lesson.id) ? 'completed' : ''}" 
                  data-lesson-id="${lesson.id}"
                  data-interactive="${lesson.interactive || false}">
                <div class="lesson-info">
                  <span class="lesson-status-icon">${this.isLessonComplete(lesson.id) ? 
                    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#28a745"/></svg>' : 
                    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8-8-3.59 8-8 8z" fill="#999"/></svg>'
                  }</span>
                  <span class="lesson-title">${lesson.title}</span>
                  ${lesson.interactive ? '<span class="interactive-badge">Interactive</span>' : ''}
                </div>
                <span class="lesson-duration">${lesson.duration}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
      
      // Add event listeners to lessons
      const lessonItems = this.contentViewer.querySelectorAll('.lesson-item');
      lessonItems.forEach(item => {
        item.addEventListener('click', () => {
          const lessonId = item.getAttribute('data-lesson-id');
          const isInteractive = item.getAttribute('data-interactive') === 'true';
          
          // Find the lesson object
          const lesson = topic.lessons.find(l => l.id === lessonId);
          if (lesson) {
            this.viewLesson(lesson, topic.id, isInteractive);
          }
        });
      });
    } catch (error) {
      console.error('Error viewing topic:', error);
      this.showNotification('Failed to load topic content.', 'error');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * View a lesson
   * @param {Object} lesson - Lesson object
   * @param {string} topicId - Parent topic ID
   * @param {boolean} isInteractive - Whether the lesson is interactive
   */
  async viewLesson(lesson, topicId, isInteractive) {
    try {
      this.showLoading();
      
      // In a real application, lesson content would be fetched from an API or blockchain
      // For this example, we'll use placeholder content
      let lessonContent = await this.fetchLessonContent(lesson.id, topicId);
      
      // Render lesson content
      this.contentViewer.innerHTML = `
        <div class="lesson-header">
          <h2>${lesson.title}</h2>
          <div class="lesson-meta">
            <span class="lesson-duration">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8-8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#999"/>
              </svg>
              ${lesson.duration}
            </span>
            ${isInteractive ? `
              <span class="interactive-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z" fill="#0066cc"/>
                </svg>
                Interactive Lesson
              </span>
            ` : ''}
          </div>
        </div>
        
        <div class="lesson-content">
          ${lessonContent}
        </div>
        
        <div class="lesson-actions">
          <button id="back-to-topic" class="btn secondary">Back to Topic</button>
          <button id="mark-complete" class="btn primary ${this.isLessonComplete(lesson.id) ? 'completed' : ''}">
            ${this.isLessonComplete(lesson.id) ? 'Completed' : 'Mark as Complete'}
          </button>
        </div>
      `;
      
      // Set up event listeners
      document.getElementById('back-to-topic').addEventListener('click', () => {
        this.viewTopicById(topicId);
      });
      
      document.getElementById('mark-complete').addEventListener('click', () => {
        this.markLessonComplete(lesson.id);
        document.getElementById('mark-complete').textContent = 'Completed';
        document.getElementById('mark-complete').classList.add('completed');
        this.showNotification('Lesson marked as complete!', 'success');
      });
      
      // Initialize interactive elements if needed
      if (isInteractive) {
        await this.initializeInteractiveLesson(lesson.id);
      }
      
      // Apply syntax highlighting if available
      if (window.hljs) {
        document.querySelectorAll('pre code').forEach((block) => {
          window.hljs.highlightBlock(block);
        });
      }
    } catch (error) {
      console.error('Error viewing lesson:', error);
      this.showNotification('Failed to load lesson content.', 'error');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Fetch lesson content
   * @param {string} lessonId - Lesson ID
   * @param {string} topicId - Topic ID
   * @returns {Promise<string>} Lesson content HTML
   * @private
   */
  async fetchLessonContent(lessonId, topicId) {
    // In a real application, this would fetch from an API or blockchain
    // For this example, we'll return placeholder content based on lesson ID
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const contentMap = {
      'what-is-blockchain': `
        <h3>What is Blockchain?</h3>
        <p>A blockchain is a distributed database or ledger shared among computer network nodes. They store information in digital format and are best known for their crucial role in cryptocurrency systems for maintaining a secure and decentralized record of transactions.</p>
        
        <p>The innovation of a blockchain is that it guarantees the fidelity and security of a record of data and generates trust without the need for a trusted third party.</p>
        
        <h4>Key Characteristics:</h4>
        <ul>
          <li><strong>Decentralized:</strong> No single entity controls the network</li>
          <li><strong>Distributed:</strong> Data is stored across multiple nodes</li>
          <li><strong>Immutable:</strong> Data cannot be changed once recorded</li>
          <li><strong>Transparent:</strong> Transactions are visible to all participants</li>
        </ul>
        
        <div class="image-container">
          <img src="assets/images/education/blockchain-structure.png" alt="Blockchain Structure Diagram" width="600">
          <p class="caption">The structure of a blockchain with blocks containing transactions</p>
        </div>
        
        <h4>How Information is Organized</h4>
        <p>Data on a blockchain is collected together in groups known as blocks. Each block has:</p>
        <ul>
          <li>A certain storage capacity</li>
          <li>A timestamp when it was added to the chain</li>
          <li>A cryptographic hash of the previous block (creating the "chain")</li>
          <li>The actual transaction data</li>
        </ul>
      `,
      'what-are-smart-contracts': `
        <h3>Understanding Smart Contracts</h3>
        <p>Smart contracts are self-executing contracts with the terms of the agreement directly written into code. They run on blockchain networks and automatically execute when predetermined conditions are met.</p>
        
        <p>Nick Szabo, a computer scientist and cryptographer, first proposed the concept of smart contracts in the 1990s, long before blockchain technology existed. However, it wasn't until the creation of Ethereum in 2015 that smart contracts gained widespread practical applications.</p>
        
        <h4>Key Features of Smart Contracts:</h4>
        <ul>
          <li><strong>Automation:</strong> Execute automatically when conditions are met</li>
          <li><strong>Trustless:</strong> Don't require intermediaries or trusted third parties</li>
          <li><strong>Immutable:</strong> Cannot be changed once deployed (without specific upgrade patterns)</li>
          <li><strong>Transparent:</strong> Code is visible and verifiable by all network participants</li>
        </ul>
        
        <div class="code-example">
          <h4>Simple Smart Contract Example (Solidity):</h4>
          <pre><code class="language-solidity">// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    // State variable to store a number
    uint public storedData;

    // Function to set the number
    function set(uint x) public {
        storedData = x;
    }

    // Function to get the number
    function get() public view returns (uint) {
        return storedData;
    }
}</code></pre>
        </div>
        
        <h4>Real-World Applications:</h4>
        <ul>
          <li>Decentralized Finance (DeFi) protocols</li>
          <li>Non-Fungible Token (NFT) marketplaces</li>
          <li>Decentralized Autonomous Organizations (DAOs)</li>
          <li>Supply chain tracking and verification</li>
          <li>Automated insurance claims processing</li>
          <li>Digital identity verification systems</li>
        </ul>
      `,
      'using-metamask': `
        <h3>Using MetaMask: A Step-by-Step Guide</h3>
        <p>MetaMask is a cryptocurrency wallet and gateway to blockchain applications. This guide will walk you through setting up and using MetaMask.</p>
        
        <div class="note-box">
          <strong>Note:</strong> This is an interactive lesson. You'll need to have MetaMask installed to complete some parts of this tutorial.
        </div>
        
        <h4>Installing MetaMask</h4>
        <ol>
          <li>Visit <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">metamask.io</a></li>
          <li>Click "Download" and select your browser (Chrome, Firefox, Brave, or Edge)</li>
          <li>Follow the browser extension installation prompts</li>
          <li>Once installed, click the MetaMask icon in your browser extensions</li>
        </ol>
        
        <h4>Creating a New Wallet</h4>
        <ol>
          <li>Click "Create a Wallet"</li>
          <li>Set a strong password</li>
          <li>MetaMask will show you a 12-word Secret Recovery Phrase</li>
          <li><strong>IMPORTANT:</strong> Write this phrase down and store it in a secure location. Never share it with anyone!</li>
          <li>Verify your Secret Recovery Phrase by selecting the words in the correct order</li>
        </ol>
        
        <div class="interactive-demo" id="metamask-connection-demo">
          <h4>Check Your MetaMask Connection</h4>
          <p>Click the button below to check if MetaMask is installed and connected:</p>
          <button id="check-metamask-btn" class="btn primary">Check MetaMask</button>
          <div id="metamask-status" class="status-message"></div>
        </div>
        
        <h4>Connecting to Different Networks</h4>
        <p>MetaMask supports multiple blockchain networks:</p>
        <ul>
          <li>Ethereum Mainnet</li>
          <li>Test networks (Goerli, Sepolia)</li>
          <li>Custom networks (BSC, Polygon, etc.)</li>
        </ul>
        
        <p>To add a custom network:</p>
        <ol>
          <li>Click the network dropdown at the top of MetaMask</li>
          <li>Select "Add Network"</li>
          <li>Enter the network details (Name, RPC URL, Chain ID, Symbol, Block Explorer URL)</li>
          <li>Click "Save"</li>
        </ol>
      `
      // Add more lessons as needed
    };
    
    return contentMap[lessonId] || `<p>Content for "${lessonId}" is not available yet. Please check back later.</p>`;
  }

  /**
   * Initialize interactive elements for interactive lessons
   * @param {string} lessonId - Lesson ID
   * @private
   */
  async initializeInteractiveLesson(lessonId) {
    // In a real application, this would initialize interactive demos based on the lesson
    // For this example, we'll handle a few specific cases
    
    if (lessonId === 'using-metamask') {
      const checkButton = document.getElementById('check-metamask-btn');
      const statusElement = document.getElementById('metamask-status');
      
      if (checkButton && statusElement) {
        checkButton.addEventListener('click', async () => {
          try {
            if (!window.ethereum) {
              statusElement.innerHTML = '<span class="error">MetaMask is not installed. Please <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">install MetaMask</a> to continue.</span>';
              return;
            }
            
            statusElement.innerHTML = '<span class="info">Checking MetaMask connection...</span>';
            
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
              const chainId = await window.ethereum.request({ method: 'eth_chainId' });
              const networkName = this.getNetworkName(parseInt(chainId, 16));
              
              statusElement.innerHTML = `
                <span class="success">MetaMask is connected!</span>
                <div class="details">
                  <p><strong>Account:</strong> ${accounts[0]}</p>
                  <p><strong>Network:</strong> ${networkName}</p>
                </div>
              `;
            } else {
              statusElement.innerHTML = '<span class="warning">MetaMask is installed but not connected. Please unlock your wallet and try again.</span>';
            }
          } catch (error) {
            console.error('Error checking MetaMask:', error);
            statusElement.innerHTML = `<span class="error">Error: ${error.message || 'Unknown error'}</span>`;
          }
        });
      }
    }
    
    // Add more interactive initializations as needed for other lessons
  }

  /**
   * Get network name from chain ID
   * @param {number} chainId - Chain ID
   * @returns {string} Network name
   * @private
   */
  getNetworkName(chainId) {
    const networks = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      56: 'Binance Smart Chain',
      97: 'BSC Testnet',
      137: 'Polygon Mainnet',
      80001: 'Mumbai Testnet',
      43114: 'Avalanche C-Chain',
      43113: 'Avalanche Fuji Testnet'
    };
    
    return networks[chainId] || `Chain ID ${chainId}`;
  }

  /**
   * View a topic by ID
   * @param {string} topicId - Topic ID
   */
  async viewTopicById(topicId) {
    try {
      this.showLoading();
      
      // In a real application, this would fetch the topic by ID from an API
      // For this example, we'll use static data
      const topics = [
        {
          id: 'blockchain-basics',
          title: 'Blockchain Basics',
          description: 'Understand the fundamental concepts of blockchain technology.',
          image: 'assets/images/education/blockchain-basics.jpg',
          lessons: [
            { id: 'what-is-blockchain', title: 'What is Blockchain?', duration: '10 min' },
            { id: 'how-blockchain-works', title: 'How Blockchain Works', duration: '15 min' },
            { id: 'consensus-mechanisms', title: 'Consensus Mechanisms', duration: '12 min' },
            { id: 'blockchain-use-cases', title: 'Blockchain Use Cases', duration: '8 min' }
          ]
        },
        // Add other topics as needed
      ];
      
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
        await this.viewTopic(topic);
      } else {
        throw new Error(`Topic ${topicId} not found`);
      }
    } catch (error) {
      console.error('Error viewing topic by ID:', error);
      this.showNotification('Failed to load topic.', 'error');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Show topics grid and hide content viewer
   */
  showTopics() {
    this.topicGrid.style.display = 'grid';
    this.contentViewer.style.display = 'none';
    this.backButton.style.display = 'none';
  }

  /**
   * Show loading indicator
   * @private
   */
  showLoading() {
    if (this.isLoading) return;
    this.isLoading = true;
    
    const loader = document.createElement('div');
    loader.className = 'content-loader';
    loader.innerHTML = `
      <div class="loader-spinner"></div>
      <p>Loading content...</p>
    `;
    
    document.body.appendChild(loader);
  }

  /**
   * Hide loading indicator
   * @private
   */
  hideLoading() {
    this.isLoading = false;
    const loader = document.querySelector('.content-loader');
    if (loader) {
      document.body.removeChild(loader);
    }
  }

  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (info, success, error, warning)
   */
  showNotification(message, type = 'info') {
    if (!this.notificationElement) return;
    
    this.notificationElement.textContent = message;
    this.notificationElement.className = `notification ${type}`;
    this.notificationElement.style.display = 'block';
    
    setTimeout(() => {
      this.notificationElement.style.display = 'none';
    }, 5000);
  }
}