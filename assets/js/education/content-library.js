/**
 * Web3 Educational Content Library
 * 
 * This module manages the loading, display, and interaction with educational
 * content in the Web3 Education Library. It supports topics, lessons, and
 * token-gated premium content.
 */

class ContentLibrary {
  constructor(options = {}) {
    this.walletConnector = options.walletConnector;
    this.contractManager = options.contractManager;
    this.topicGridElement = options.topicGrid;
    this.contentViewerElement = options.contentViewer;
    this.backButtonElement = options.backButton;
    
    this.topics = [];
    this.currentContent = null;
    
    // Track user progress in localStorage
    this.userProgress = this._loadUserProgress();
    
    // Listen for wallet connection changes
    if (this.walletConnector) {
      this.walletConnector.addEventListener('connectionChanged', () => {
        this._updateContentAccess();
      });
    }
  }
  
  /**
   * Load all topics and render the topic grid
   */
  async loadTopics() {
    try {
      // In a real application, this would fetch from an API
      // For now, we'll use a local definition
      this.topics = [
        {
          id: 'web3-basics',
          title: 'Web3 Basics',
          description: 'Learn the fundamentals of Web3 and blockchain technology',
          image: 'assets/images/web3-basics-thumbnail.jpg',
          lessons: [
            {
              id: 'what-is-web3',
              title: 'What is Web3?',
              contentPath: 'assets/content/web3-basics/what-is-web3.json',
              duration: '10 min',
              isPremium: false
            },
            {
              id: 'blockchain-fundamentals',
              title: 'Blockchain Fundamentals',
              contentPath: 'assets/content/web3-basics/blockchain-fundamentals.json',
              duration: '15 min',
              isPremium: false
            },
            {
              id: 'wallets-and-keys',
              title: 'Wallets and Keys',
              contentPath: 'assets/content/web3-basics/wallets-and-keys.json',
              duration: '12 min',
              isPremium: false
            },
            {
              id: 'web3-architecture',
              title: 'Web3 Architecture Deep Dive',
              contentPath: 'assets/content/web3-basics/web3-architecture.json',
              duration: '20 min',
              isPremium: true
            }
          ]
        },
        {
          id: 'smart-contracts',
          title: 'Smart Contract Development',
          description: 'Build and deploy smart contracts on blockchain networks',
          image: 'assets/images/smart-contract-dev-thumbnail.jpg',
          lessons: [
            {
              id: 'solidity-intro',
              title: 'Introduction to Solidity',
              contentPath: 'assets/content/smart-contracts/solidity-intro.json',
              duration: '15 min',
              isPremium: false
            },
            {
              id: 'first-contract',
              title: 'Your First Smart Contract',
              contentPath: 'assets/content/smart-contracts/first-contract.json',
              duration: '20 min',
              isPremium: false
            },
            {
              id: 'testing-contracts',
              title: 'Testing Smart Contracts',
              contentPath: 'assets/content/smart-contracts/testing-contracts.json',
              duration: '18 min',
              isPremium: false
            },
            {
              id: 'security-best-practices',
              title: 'Security Best Practices',
              contentPath: 'assets/content/smart-contracts/security-best-practices.json',
              duration: '25 min',
              isPremium: true
            }
          ]
        },
        {
          id: 'defi',
          title: 'DeFi Applications',
          description: 'Learn about decentralized finance applications and protocols',
          image: 'assets/images/defi-thumbnail.jpg',
          lessons: [
            {
              id: 'defi-overview',
              title: 'DeFi Overview',
              contentPath: 'assets/content/defi/defi-overview.json',
              duration: '12 min',
              isPremium: false
            },
            {
              id: 'amm-mechanics',
              title: 'AMM Mechanics',
              contentPath: 'assets/content/defi/amm-mechanics.json',
              duration: '18 min',
              isPremium: false
            },
            {
              id: 'lending-protocols',
              title: 'Lending Protocols',
              contentPath: 'assets/content/defi/lending-protocols.json',
              duration: '15 min',
              isPremium: false
            },
            {
              id: 'building-defi-app',
              title: 'Building a DeFi App',
              contentPath: 'assets/content/defi/building-defi-app.json',
              duration: '30 min',
              isPremium: true
            }
          ]
        }
      ];
      
      this.renderTopicGrid();
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  }
  
  /**
   * Render the topic grid with topic cards
   */
  renderTopicGrid() {
    if (!this.topicGridElement) return;
    
    // Clear the topic grid
    this.topicGridElement.innerHTML = '';
    
    // Create a card for each topic
    this.topics.forEach(topic => {
      const topicCard = document.createElement('div');
      topicCard.className = 'topic-card';
      
      // Calculate progress for this topic
      const completedLessons = topic.lessons.filter(lesson => 
        this.userProgress.completedLessons.includes(lesson.id)
      ).length;
      
      const progressPercentage = topic.lessons.length > 0 
        ? Math.round((completedLessons / topic.lessons.length) * 100)
        : 0;
      
      topicCard.innerHTML = `
        <h3>${topic.title}</h3>
        <div class="description">${topic.description}</div>
        <ul class="lessons">
          ${topic.lessons.map(lesson => `
            <li>
              <a href="#" data-topic-id="${topic.id}" data-lesson-id="${lesson.id}" class="lesson-link ${lesson.isPremium ? 'premium-lesson' : ''}">
                ${lesson.title}
                ${lesson.isPremium ? '<span class="token-required">🔒 Token Required</span>' : ''}
                <span class="duration">(${lesson.duration})</span>
                ${this.userProgress.completedLessons.includes(lesson.id) ? '<span class="completed">✓</span>' : ''}
              </a>
            </li>
          `).join('')}
        </ul>
        <div class="progress-bar">
          <div class="progress" style="width: ${progressPercentage}%"></div>
        </div>
        <div class="progress-text">${progressPercentage}% complete</div>
      `;
      
      // Add event listeners for lesson links
      topicCard.querySelectorAll('.lesson-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const topicId = link.getAttribute('data-topic-id');
          const lessonId = link.getAttribute('data-lesson-id');
          this.loadLesson(topicId, lessonId);
        });
      });
      
      // Add the card to the grid
      this.topicGridElement.appendChild(topicCard);
    });
  }
  
  /**
   * Load and display a specific lesson
   */
  async loadLesson(topicId, lessonId) {
    try {
      // Find the topic and lesson
      const topic = this.topics.find(t => t.id === topicId);
      if (!topic) throw new Error(`Topic ${topicId} not found`);
      
      const lesson = topic.lessons.find(l => l.id === lessonId);
      if (!lesson) throw new Error(`Lesson ${lessonId} not found in topic ${topicId}`);
      
      // Check if the user has access to premium content
      if (lesson.isPremium) {
        const hasAccess = await this._checkPremiumAccess();
        if (!hasAccess) {
          this._showPremiumContentMessage(lesson);
          return;
        }
      }
      
      // In a real app, you would fetch the lesson content using the contentPath
      // For now, let's use a hardcoded example
      const lessonContent = await this._fetchLessonContent(lesson.contentPath);
      
      // Display the lesson content
      this.showContent(lessonContent, lesson, topic);
      
      // Mark the lesson as viewed if not already
      if (!this.userProgress.completedLessons.includes(lessonId)) {
        this.userProgress.completedLessons.push(lessonId);
        this._saveUserProgress();
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      alert('Failed to load lesson content. Please try again later.');
    }
  }
  
  /**
   * Show the content in the content viewer
   */
  showContent(content, lesson, topic) {
    if (!this.contentViewerElement) return;
    
    // Store the current content
    this.currentContent = { content, lesson, topic };
    
    // Show the back button
    if (this.backButtonElement) {
      this.backButtonElement.style.display = 'block';
    }
    
    // Hide the topic grid and show the content viewer
    if (this.topicGridElement) {
      this.topicGridElement.style.display = 'none';
    }
    this.contentViewerElement.style.display = 'block';
    
    // Set the content HTML
    this.contentViewerElement.innerHTML = `
      <h2>${content.title}</h2>
      <div class="lesson-meta">
        <span class="topic">${topic.title}</span> • <span class="duration">${lesson.duration}</span>
      </div>
      
      <div class="lesson-content">
        ${content.sections.map(section => `
          <section class="content-section">
            <h3>${section.title}</h3>
            <div class="section-content">${section.html}</div>
            
            ${section.videoUrl ? `
              <div class="video-container">
                <video controls>
                  <source src="${section.videoUrl}" type="video/mp4">
                  Your browser does not support the video tag.
                </video>
              </div>
            ` : ''}
            
            ${section.codeExample ? `
              <div class="code-example">
                <h4>Code Example</h4>
                <pre><code>${section.codeExample}</code></pre>
              </div>
            ` : ''}
          </section>
        `).join('')}
      </div>
      
      ${content.interactive ? `
        <div class="interactive-demo">
          <h3>Interactive Demo</h3>
          <div id="interactive-container" data-demo-id="${content.interactive.id}">
            Loading interactive demo...
          </div>
        </div>
      ` : ''}
      
      <div class="lesson-navigation">
        <button id="mark-complete-btn" class="mark-complete">Mark as Complete</button>
        <button id="next-lesson-btn" class="next-lesson">Next Lesson</button>
      </div>
    `;
    
    // Add event listeners for the lesson navigation
    const markCompleteBtn = document.getElementById('mark-complete-btn');
    if (markCompleteBtn) {
      markCompleteBtn.addEventListener('click', () => {
        if (!this.userProgress.completedLessons.includes(lesson.id)) {
          this.userProgress.completedLessons.push(lesson.id);
          this._saveUserProgress();
        }
        markCompleteBtn.textContent = 'Completed';
        markCompleteBtn.disabled = true;
      });
    }
    
    // Initialize interactive demo if present
    if (content.interactive) {
      this._initializeInteractiveDemo(content.interactive);
    }
    
    // Scroll to the top
    window.scrollTo(0, 0);
  }
  
  /**
   * Show the topic grid and hide the content viewer
   */
  showTopics() {
    // Update the topic grid with any progress changes
    this.renderTopicGrid();
    
    // Show the topic grid and hide the content viewer
    if (this.topicGridElement) {
      this.topicGridElement.style.display = 'grid';
    }
    if (this.contentViewerElement) {
      this.contentViewerElement.style.display = 'none';
    }
    if (this.backButtonElement) {
      this.backButtonElement.style.display = 'none';
    }
    
    // Reset the current content
    this.currentContent = null;
  }
  
  /**
   * Check if the user has access to premium content
   */
  async _checkPremiumAccess() {
    // Check if the user is connected to a wallet
    if (!this.walletConnector || !this.contractManager) {
      return false;
    }
    
    const connectionState = this.walletConnector.getConnectionState();
    if (!connectionState.isConnected) {
      return false;
    }
    
    try {
      // Check if the user has any streaming tokens
      const balance = await this.contractManager.getBalance();
      return balance > 0;
    } catch (error) {
      console.error('Error checking premium access:', error);
      return false;
    }
  }
  
  /**
   * Show a message about premium content access
   */
  _showPremiumContentMessage(lesson) {
    if (!this.contentViewerElement) return;
    
    // Hide the topic grid and show the content viewer
    if (this.topicGridElement) {
      this.topicGridElement.style.display = 'none';
    }
    this.contentViewerElement.style.display = 'block';
    
    // Show the back button
    if (this.backButtonElement) {
      this.backButtonElement.style.display = 'block';
    }
    
    // Set the content HTML
    this.contentViewerElement.innerHTML = `
      <h2>${lesson.title}</h2>
      <div class="premium-content-message">
        <h3>🔒 Premium Content</h3>
        <p>This lesson requires streaming tokens to access.</p>
        
        <div class="connect-wallet-section">
          ${!this.walletConnector || !this.walletConnector.getConnectionState().isConnected ? `
            <p>Please connect your wallet to access premium content.</p>
            <button id="connect-wallet-btn" class="primary-btn">Connect Wallet</button>
          ` : `
            <p>You need streaming tokens to access this content.</p>
            <button id="purchase-tokens-btn" class="primary-btn">Purchase Tokens</button>
          `}
        </div>
      </div>
    `;
    
    // Add event listeners
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    if (connectWalletBtn) {
      connectWalletBtn.addEventListener('click', () => {
        this.walletConnector.connectWallet();
      });
    }
    
    const purchaseTokensBtn = document.getElementById('purchase-tokens-btn');
    if (purchaseTokensBtn) {
      purchaseTokensBtn.addEventListener('click', () => {
        // Redirect to the token purchase page
        window.location.href = 'streaming.html?action=purchase';
      });
    }
    
    // Scroll to the top
    window.scrollTo(0, 0);
  }
  
  /**
   * Fetch lesson content - in a real app, this would make an API call
   * For now, we'll simulate fetching content
   */
  async _fetchLessonContent(contentPath) {
    // For this example, we'll return a hardcoded content structure
    // based on the lesson ID embedded in the contentPath
    
    const lessonId = contentPath.split('/').pop().replace('.json', '');
    
    // Simple content mapping - in a real app, this would fetch from API/files
    const contentMap = {
      'what-is-web3': {
        title: 'What is Web3?',
        sections: [
          {
            title: 'Introduction to Web3',
            html: `
              <p>Web3 represents the next evolution of the internet, built on decentralized blockchain technology.</p>
              <p>Unlike Web2 (the current internet), which is dominated by centralized platforms and services, Web3 aims to redistribute power to users through decentralized applications (dApps), smart contracts, and token-based economics.</p>
              <p>In this lesson, we'll explore the fundamental concepts behind Web3, its key technologies, and how it differs from previous iterations of the web.</p>
            `,
            videoUrl: null,
          },
          {
            title: 'Web1, Web2, and Web3',
            html: `
              <p><strong>Web1 (1990s-early 2000s)</strong>: The read-only web. Static websites with minimal interaction.</p>
              <p><strong>Web2 (mid-2000s-present)</strong>: The read-write web. Interactive platforms, social media, and cloud services controlled by centralized entities.</p>
              <p><strong>Web3 (emerging)</strong>: The read-write-own web. Users have ownership over their data and digital assets through blockchain and cryptography.</p>
              <p>The key difference is that Web3 enables true ownership and peer-to-peer interaction without intermediaries.</p>
            `,
            videoUrl: 'https://example.com/videos/web3-evolution.mp4',
            codeExample: null
          }
        ],
        interactive: null
      },
      
      'blockchain-fundamentals': {
        title: 'Blockchain Fundamentals',
        sections: [
          {
            title: 'What is a Blockchain?',
            html: `
              <p>At its core, a blockchain is a distributed ledger that records transactions across many computers.</p>
              <p>Each block contains a list of transactions, a timestamp, and a reference to the previous block, forming a chain of blocks—hence the name "blockchain."</p>
              <p>This structure makes the blockchain immutable, as changing any information would require altering all subsequent blocks.</p>
            `,
            videoUrl: null
          },
          {
            title: 'Consensus Mechanisms',
            html: `
              <p>Blockchain networks use consensus mechanisms to agree on the state of the ledger without central authority.</p>
              <p>The two most common consensus mechanisms are:</p>
              <ul>
                <li><strong>Proof of Work (PoW)</strong>: Miners solve complex mathematical puzzles to validate transactions and create new blocks. Used by Bitcoin and (formerly) Ethereum.</li>
                <li><strong>Proof of Stake (PoS)</strong>: Validators stake cryptocurrency to participate in block validation. More energy-efficient than PoW. Used by Ethereum 2.0, Cardano, and Solana.</li>
              </ul>
            `,
            videoUrl: 'https://example.com/videos/consensus-mechanisms.mp4',
            codeExample: null
          }
        ],
        interactive: {
          id: 'blockchain-demo',
          type: 'block-explorer'
        }
      },
      
      'solidity-intro': {
        title: 'Introduction to Solidity',
        sections: [
          {
            title: 'What is Solidity?',
            html: `
              <p>Solidity is an object-oriented, high-level programming language designed specifically for writing smart contracts on blockchain platforms like Ethereum.</p>
              <p>Created in 2014, Solidity allows developers to implement complex business logic, create tokens, and build decentralized applications (dApps).</p>
            `,
            videoUrl: null
          },
          {
            title: 'Basic Solidity Syntax',
            html: `
              <p>Here's a simple Solidity contract that demonstrates the basic structure and syntax:</p>
            `,
            videoUrl: null,
            codeExample: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    // State variable to store a number
    uint256 private storedData;
    
    // Event to notify clients about the change
    event DataChanged(uint256 newValue);
    
    // Store a new value
    function set(uint256 x) public {
        storedData = x;
        emit DataChanged(x);
    }
    
    // Return the stored value
    function get() public view returns (uint256) {
        return storedData;
    }
}`
          }
        ],
        interactive: {
          id: 'solidity-playground',
          type: 'code-editor'
        }
      }
    };
    
    // Return the appropriate content or a default
    return contentMap[lessonId] || {
      title: 'Lesson Content',
      sections: [
        {
          title: 'Content Coming Soon',
          html: '<p>This lesson content is being developed and will be available soon.</p>',
          videoUrl: null
        }
      ],
      interactive: null
    };
  }
  
  /**
   * Initialize interactive demos based on type
   */
  _initializeInteractiveDemo(interactive) {
    const container = document.getElementById('interactive-container');
    if (!container) return;
    
    switch (interactive.type) {
      case 'block-explorer':
        this._renderBlockExplorerDemo(container);
        break;
      case 'code-editor':
        this._renderCodeEditorDemo(container);
        break;
      default:
        container.innerHTML = 'Interactive demo not available';
    }
  }
  
  /**
   * Render a simple block explorer demo
   */
  _renderBlockExplorerDemo(container) {
    container.innerHTML = `
      <div class="block-explorer">
        <div class="block-chain">
          <div class="block">
            <div class="block-header">Block #1</div>
            <div class="block-content">
              <div>Prev Hash: 0000</div>
              <div>Hash: 8a721...</div>
              <div>TX: 1 transaction</div>
            </div>
          </div>
          <div class="block-connector">→</div>
          <div class="block">
            <div class="block-header">Block #2</div>
            <div class="block-content">
              <div>Prev Hash: 8a721...</div>
              <div>Hash: 3e519...</div>
              <div>TX: 2 transactions</div>
            </div>
          </div>
          <div class="block-connector">→</div>
          <div class="block">
            <div class="block-header">Block #3</div>
            <div class="block-content">
              <div>Prev Hash: 3e519...</div>
              <div>Hash: 7d2f1...</div>
              <div>TX: 3 transactions</div>
            </div>
          </div>
        </div>
        <div class="demo-controls">
          <button id="add-block-btn">Add Block</button>
          <button id="try-tamper-btn">Attempt Tamper</button>
        </div>
      </div>
    `;
    
    // Add event listeners for demo buttons
    document.getElementById('add-block-btn').addEventListener('click', () => {
      alert('In a real implementation, this would add a new block to the chain.');
    });
    
    document.getElementById('try-tamper-btn').addEventListener('click', () => {
      alert('In a real implementation, this would show how tampering breaks the chain integrity.');
    });
  }
  
  /**
   * Render a simple code editor demo
   */
  _renderCodeEditorDemo(container) {
    container.innerHTML = `
      <div class="code-editor">
        <textarea id="code-editor-textarea" rows="10" style="width: 100%">// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    string public name = "MyToken";
    string public symbol = "MTK";
    uint256 public totalSupply = 1000000;
    
    mapping(address => uint256) public balanceOf;
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Not enough tokens");
        
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}</textarea>
        <div class="editor-controls">
          <button id="compile-code-btn">Compile</button>
          <button id="deploy-code-btn">Deploy</button>
        </div>
        <div id="editor-output" class="editor-output">Console output will appear here</div>
      </div>
    `;
    
    // Add event listeners for editor buttons
    document.getElementById('compile-code-btn').addEventListener('click', () => {
      const output = document.getElementById('editor-output');
      output.innerHTML = 'Compiling...\nCompilation successful! No errors found.';
    });
    
    document.getElementById('deploy-code-btn').addEventListener('click', () => {
      const output = document.getElementById('editor-output');
      output.innerHTML = 'Deploying contract...\nContract deployed successfully!\nContract address: 0x123...';
    });
  }
  
  /**
   * Update content access based on wallet connection state
   */
  _updateContentAccess() {
    // Re-render the topic grid to reflect current access state
    this.renderTopicGrid();
    
    // If viewing premium content, check access again
    if (this.currentContent && this.currentContent.lesson.isPremium) {
      this._checkPremiumAccess().then(hasAccess => {
        if (!hasAccess) {
          this._showPremiumContentMessage(this.currentContent.lesson);
        }
      });
    }
  }
  
  /**
   * Load user progress from localStorage
   */
  _loadUserProgress() {
    const storedProgress = localStorage.getItem('web3EduProgress');
    if (storedProgress) {
      try {
        return JSON.parse(storedProgress);
      } catch (e) {
        console.error('Failed to parse stored progress', e);
      }
    }
    
    // Default progress object
    return {
      completedLessons: [],
      lastAccessed: Date.now()
    };
  }
  
  /**
   * Save user progress to localStorage
   */
  _saveUserProgress() {
    try {
      this.userProgress.lastAccessed = Date.now();
      localStorage.setItem('web3EduProgress', JSON.stringify(this.userProgress));
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  }
}

// For use in browser environment
if (typeof window !== 'undefined') {
  window.ContentLibrary = ContentLibrary;
}

// For use in Node.js environment
if (typeof module !== 'undefined') {
  module.exports = ContentLibrary;
}