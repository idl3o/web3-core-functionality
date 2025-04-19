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
          id: 'game-theory',
          title: 'Game Theory in Blockchain',
          description: 'Explore how game theory shapes blockchain consensus and security mechanisms.',
          image: 'assets/images/education/game-theory.jpg',
          lessons: [
            { id: 'game-theory-intro', title: 'What is Game Theory?', duration: '10 min' },
            { id: 'rational-human-actors', title: 'Rational vs. Human Actors', duration: '12 min' },
            { id: 'prisoners-dilemma', title: 'The Prisoner\'s Dilemma in Blockchain', duration: '15 min' },
            { id: 'nash-equilibrium', title: 'Nash Equilibrium in Consensus', duration: '15 min' },
            { id: 'coordination-games', title: 'Coordination Games and Fork Choice', duration: '18 min' },
            { id: 'economic-security', title: 'Economic Security and Attack Costs', duration: '12 min' },
            { id: 'interactive-game-theory', title: 'Interactive Game Theory Simulation', duration: '25 min', interactive: true }
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
                    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8-8-3.59 8-8 8z" fill="#999"/></svg>'
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
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8-8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="#999"/>
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
      'game-theory-intro': `
        <h3>What is Game Theory?</h3>
        <p>Game theory is the study of mathematical models of strategic interaction among rational decision-makers. In blockchain systems, it helps us understand how participants behave when their actions affect each other's outcomes.</p>
        
        <p>Blockchain protocols must be designed with game theory in mind to ensure that all participants are incentivized to follow the rules, creating a secure, functional system even when some actors may try to behave selfishly.</p>
        
        <h4>Key Game Theory Concepts in Blockchain:</h4>
        <ul>
          <li><strong>Nash Equilibrium:</strong> A state where no participant can gain by changing only their strategy</li>
          <li><strong>Dominant Strategy:</strong> The optimal choice regardless of what others do</li>
          <li><strong>Schelling Point:</strong> A focal solution that people tend to use in the absence of communication</li>
          <li><strong>Prisoner's Dilemma:</strong> A scenario showing why two rational individuals might not cooperate</li>
        </ul>
        
        <div class="image-container">
          <img src="assets/images/education/game-theory-matrix.png" alt="Game Theory Payoff Matrix" width="500">
          <p class="caption">A typical game theory payoff matrix showing outcomes for different strategic choices</p>
        </div>
        
        <h4>Why Game Theory Matters for Blockchain</h4>
        <p>Blockchain systems are fundamentally about coordinating behavior among potentially adversarial actors. Game theory provides the framework to:</p>
        <ul>
          <li>Design incentive mechanisms that keep the network secure</li>
          <li>Predict how rational actors will respond to protocol rules</li>
          <li>Identify potential attack vectors and vulnerabilities</li>
          <li>Balance competing interests of network participants</li>
        </ul>
        
        <p>Understanding these principles is essential for blockchain developers, users, and token holders to make informed decisions about protocol design and participation.</p>
      `,
      'rational-human-actors': `
        <h3>Rational vs. Human Actors in Blockchain Systems</h3>
        <p>Blockchain systems must account for two distinct types of participants:</p>
        
        <div class="comparison-table">
          <h4>Comparison of Actor Types</h4>
          <table>
            <tr>
              <th>Characteristic</th>
              <th>Rational Actors (Bots)</th>
              <th>Human Actors</th>
            </tr>
            <tr>
              <td>Decision Making</td>
              <td>Mathematically optimal choices</td>
              <td>Influenced by emotions, values, and biases</td>
            </tr>
            <tr>
              <td>Risk Assessment</td>
              <td>Pure expected value calculations</td>
              <td>Subject to risk aversion or risk-seeking behavior</td>
            </tr>
            <tr>
              <td>Time Preference</td>
              <td>Consistent discount rates</td>
              <td>May value present over future inconsistently</td>
            </tr>
            <tr>
              <td>Trust Dynamics</td>
              <td>Trust based on verifiable proofs only</td>
              <td>May develop trust through repeated interactions</td>
            </tr>
            <tr>
              <td>Response to Fear</td>
              <td>Not affected by fear</td>
              <td>May act irrationally due to fear</td>
            </tr>
          </table>
        </div>
        
        <h4>Protocol Design Implications</h4>
        <p>The most robust blockchain systems are designed to work effectively for both types of actors:</p>
        
        <ul>
          <li><strong>Mathematical Incentives:</strong> Clear rewards and penalties that make honest behavior the dominant strategy for rational actors</li>
          <li><strong>Psychological Incentives:</strong> Design patterns that align with human intuition and psychological tendencies</li>
          <li><strong>Hybrid Approaches:</strong> Combining both to create systems that are secure regardless of actor type</li>
        </ul>
        
        <div class="quote-box">
          <blockquote>
            "Design systems assuming actors are rational, but build in safeguards for when they're not."
          </blockquote>
          <p class="quote-attribution">— Vitalik Buterin</p>
        </div>
        
        <p>Understanding the differences between rational and human actors is crucial for predicting how blockchain protocols will perform in the real world, where both types of actors interact within the same system.</p>
      `,
      'prisoners-dilemma': `
        <h3>The Prisoner's Dilemma in Blockchain</h3>
        <p>The classic Prisoner's Dilemma illustrates a core challenge in blockchain consensus: When individually rational decisions lead to collectively suboptimal outcomes.</p>
        
        <h4>The Classic Scenario</h4>
        <p>In the traditional Prisoner's Dilemma:</p>
        <ul>
          <li>Two suspects are interrogated separately</li>
          <li>Each can either cooperate (stay silent) or defect (betray the other)</li>
          <li>The best collective outcome occurs when both cooperate</li>
          <li>Individually, each is tempted to defect regardless of the other's choice</li>
          <li>This leads to mutual defection as the Nash equilibrium, despite being worse for both</li>
        </ul>
        
        <div class="image-container">
          <img src="assets/images/education/prisoners-dilemma.png" alt="Prisoner's Dilemma Matrix" width="450">
          <p class="caption">Classical Prisoner's Dilemma payoff matrix</p>
        </div>
        
        <h4>Blockchain Application: Validation Dilemma</h4>
        <p>In blockchain validation, nodes face a similar dilemma:</p>
        
        <div class="scenario-box">
          <h5>Scenario: Block Validation</h5>
          <p>Validators must choose whether to follow protocol rules honestly or try to cheat for potential gain.</p>
          <ul>
            <li><strong>If all validate honestly:</strong> The network is secure and everyone benefits (mutual cooperation)</li>
            <li><strong>If one validator cheats:</strong> They might gain a short-term advantage at others' expense</li>
            <li><strong>If many validators cheat:</strong> The entire network becomes insecure and everyone loses (mutual defection)</li>
          </ul>
        </div>
        
        <h4>How Blockchain Solves the Dilemma</h4>
        <p>Blockchain protocols transform this game through several mechanisms:</p>
        <ol>
          <li><strong>Repeated Games:</strong> Validators interact repeatedly, enabling reputation-building and retaliation</li>
          <li><strong>Economic Stakes:</strong> Validators must stake valuable assets that can be slashed if they cheat</li>
          <li><strong>Transparency:</strong> Actions are publicly visible, making cheating detectable</li>
          <li><strong>Network Effects:</strong> The value of tokens depends on network health, aligning long-term interests</li>
        </ol>
        
        <p>These solutions shift the Nash equilibrium from mutual defection to mutual cooperation, explaining why blockchain networks can maintain security despite potential adversarial actors.</p>
      `,
      'nash-equilibrium': `
        <h3>Nash Equilibrium in Blockchain Consensus</h3>
        <p>A Nash Equilibrium occurs when no participant can gain by changing only their own strategy while others maintain theirs. This concept is central to understanding blockchain security and incentive mechanisms.</p>
        
        <h4>Nash Equilibrium in Different Consensus Mechanisms</h4>
        
        <div class="accordion">
          <div class="accordion-item">
            <h5 class="accordion-header">Proof of Work (PoW)</h5>
            <div class="accordion-content">
              <p>In PoW systems like Bitcoin:</p>
              <ul>
                <li>The Nash Equilibrium is for miners to mine on the longest valid chain</li>
                <li>Miners who attempt to mine on shorter chains will waste resources without reward</li>
                <li>Attempting to include invalid transactions leads to blocks being rejected</li>
              </ul>
              <p>This equilibrium ensures that rational miners will follow the protocol rules, maintaining network security.</p>
            </div>
          </div>
          
          <div class="accordion-item">
            <h5 class="accordion-header">Proof of Stake (PoS)</h5>
            <div class="accordion-content">
              <p>In PoS systems like Ethereum 2.0:</p>
              <ul>
                <li>Validators reach equilibrium by correctly validating transactions</li>
                <li>Attempting to validate incorrect transactions leads to slashing (losing staked funds)</li>
                <li>The Nash Equilibrium is to honestly validate according to protocol rules</li>
              </ul>
              <p>The threat of economic penalties creates strong disincentives against malicious behavior.</p>
            </div>
          </div>
          
          <div class="accordion-item">
            <h5 class="accordion-header">Delegated Proof of Stake (DPoS)</h5>
            <div class="accordion-content">
              <p>In DPoS systems like EOS:</p>
              <ul>
                <li>Block producers are elected by token holders</li>
                <li>The Nash Equilibrium is to maintain a good reputation to continue receiving votes</li>
                <li>Malicious behavior leads to loss of delegate status and future rewards</li>
              </ul>
              <p>This creates a reputation-based equilibrium where validators are incentivized to act honestly.</p>
            </div>
          </div>
        </div>
        
        <h4>Economic Security through Nash Equilibria</h4>
        <p>Well-designed blockchain protocols create Nash Equilibria where:</p>
        <ol>
          <li>Following the protocol rules is the most profitable strategy</li>
          <li>Attempting to attack the network is economically irrational</li>
          <li>Security is maintained without requiring trust between participants</li>
        </ol>
        
        <div class="note-box">
          <strong>Key Insight:</strong> The security of a blockchain doesn't depend on the majority of participants being honest. Instead, it depends on the majority being <em>rational</em> and following their economic self-interest.
        </div>
        
        <p>This explains why blockchains can maintain security in trustless environments where participants may be adversarial but are presumed to act in their economic self-interest.</p>
      `,
      'coordination-games': `
        <h3>Coordination Games and Fork Choice</h3>
        <p>Blockchain networks periodically face coordination problems where participants must choose between competing options. How these choices are resolved greatly impacts network security and stability.</p>
        
        <h4>The Fork Choice Problem</h4>
        <p>When the network temporarily splits (forks), validators must decide which chain to build upon:</p>
        <ul>
          <li>If validators coordinate on the same chain, the network remains cohesive</li>
          <li>If validators split their efforts across multiple chains, security suffers</li>
          <li>This creates a coordination game where aligning choices is more important than which specific choice is made</li>
        </ul>
        
        <div class="image-container">
          <img src="assets/images/education/blockchain-fork.png" alt="Blockchain Fork Diagram" width="550">
          <p class="caption">A blockchain fork where miners must choose which chain to extend</p>
        </div>
        
        <h4>Coordination Mechanisms</h4>
        <p>Different blockchain systems use various coordination mechanisms:</p>
        
        <div class="comparison-table">
          <h5>Solution Comparison from Analysis</h5>
          <table>
            <tr>
              <th></th>
              <th>Standard Numbering</th>
              <th>Pairing/Watcher Solution</th>
            </tr>
            <tr>
              <td>Effectiveness for Rational Bots</td>
              <td>High (P=0)</td>
              <td>High (dominant strategy)</td>
            </tr>
            <tr>
              <td>Effectiveness for Human Actors</td>
              <td>Medium (risk of mass escapes)</td>
              <td>Very High (P=0.001)</td>
            </tr>
            <tr>
              <td>Handles Mass Escapes</td>
              <td>Fails (99 survive)</td>
              <td>Prevents mass escapes</td>
            </tr>
            <tr>
              <td>Complexity</td>
              <td>Low</td>
              <td>Medium</td>
            </tr>
            <tr>
              <td>Relies on Bluffing</td>
              <td>No</td>
              <td>Yes</td>
            </tr>
          </table>
        </div>
        
        <h4>Schelling Points in Blockchain</h4>
        <p>Schelling points are focal solutions that participants naturally coordinate around without communication:</p>
        <ul>
          <li><strong>Longest Chain Rule:</strong> In Bitcoin, miners follow the chain with the most cumulative work</li>
          <li><strong>First-Seen Rule:</strong> Nodes prefer the version of a transaction they saw first</li>
          <li><strong>Economic Majority:</strong> Following the chain with the highest economic activity/value</li>
        </ul>
        
        <p>These coordination mechanisms are crucial for maintaining blockchain cohesion and preventing persistent forks that could fragment the network and reduce security.</p>
      `,
      'economic-security': `
        <h3>Economic Security and Attack Costs</h3>
        <p>Game theory helps us analyze blockchain security in economic terms, where the costs of attacking the network are weighed against potential benefits.</p>
        
        <h4>Attack Economics Framework</h4>
        <p>For an attack to be rational, the expected profit must exceed the cost:</p>
        
        <div class="formula-box">
          <p class="formula">Attack is rational if: Attack Profit > Attack Cost</p>
          <p class="formula">More precisely: Expected Profit × Success Probability > Attack Cost + Expected Penalties</p>
        </div>
        
        <p>Blockchain systems are designed to make this inequality false by maximizing the right side and minimizing the left.</p>
        
        <h4>Attack Costs in Different Consensus Mechanisms</h4>
        
        <div class="comparison-table">
          <table>
            <tr>
              <th>Consensus Mechanism</th>
              <th>Primary Attack Cost</th>
              <th>51% Attack Cost Estimate</th>
            </tr>
            <tr>
              <td>Proof of Work</td>
              <td>Hardware + Electricity</td>
              <td>$>$500,000/hour for Bitcoin</td>
            </tr>
            <tr>
              <td>Proof of Stake</td>
              <td>Capital Lockup + Slashing Risk</td>
              <td>$>$20 billion for Ethereum</td>
            </tr>
            <tr>
              <td>Delegated Proof of Stake</td>
              <td>Reputation + Voter Coordination</td>
              <td>Variable (lower than pure PoS)</td>
            </tr>
          </table>
        </div>
        
        <h4>Value Capture in Attacks</h4>
        <p>An important consideration is how much value an attacker can extract relative to the attack cost:</p>
        <ul>
          <li>Most attacks can only capture a small fraction of network value</li>
          <li>Double-spending attacks are limited by confirmation times and exchange limits</li>
          <li>Large attacks typically crash token value, reducing the attacker's profit</li>
        </ul>
        
        <div class="note-box">
          <strong>Key Security Principle:</strong> When <strong>Attack Cost > Attack Reward × (1-Detection Probability)</strong>, rational actors won't attack the network.
        </div>
        
        <h4>Counterintuitive Security Properties</h4>
        <p>Game theory reveals some surprising security properties:</p>
        <ul>
          <li>Higher token prices actually increase network security in PoS by making attacks more expensive</li>
          <li>Public verifiability of the blockchain makes many attacks unprofitable even if technically possible</li>
          <li>The value of an attacker's own holdings creates an additional disincentive against attacks</li>
        </ul>
        
        <p>These economic security guarantees explain why major blockchains have remained secure despite their high-value targets and public attack surfaces.</p>
      `,
      'interactive-game-theory': `
        <h3>Interactive Game Theory Simulation</h3>
        <p>This interactive demo lets you explore how different actors (rational vs. human) respond in blockchain consensus scenarios. Test different strategies and see how they affect outcomes in various game theory models.</p>
        
        <div class="note-box">
          <strong>Note:</strong> This is an interactive lesson. Experiment with the different simulations to understand game theory concepts in blockchain.
        </div>
        
        <div class="interactive-demo" id="game-theory-demo">
          <!-- The game theory demo will be initialized here -->
          <div class="demo-loading">Loading interactive demo...</div>
        </div>
        
        <h4>What to Explore</h4>
        <p>In this interactive simulation, you can experiment with:</p>
        <ul>
          <li><strong>Prisoner's Dilemma:</strong> See how different actor types (rational bots vs. emotional humans) behave in consensus validation scenarios</li>
          <li><strong>Coordination Games:</strong> Compare Standard Numbering vs. Pairing/Watcher solutions across different actor mixes</li>
          <li><strong>Consensus Attacks:</strong> Simulate attacks against different consensus mechanisms and see their success probability and cost</li>
        </ul>
        
        <p>By experimenting with these models, you'll gain insight into why certain blockchain protocols are more robust than others, and how protocol design must account for both mathematical game theory and human psychology.</p>
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
    
    if (lessonId === 'interactive-game-theory') {
      const demoContainer = document.getElementById('game-theory-demo');
      
      if (demoContainer) {
        demoContainer.innerHTML = `
          <div class="game-theory-tabs">
            <div class="tab-buttons">
              <button class="tab-btn active" data-tab="prisoners-dilemma">Prisoner's Dilemma</button>
              <button class="tab-btn" data-tab="coordination-game">Coordination Game</button>
              <button class="tab-btn" data-tab="consensus-attacks">Consensus Attacks</button>
            </div>
            
            <div class="tab-content active" id="prisoners-dilemma-tab">
              <h4>Prisoner's Dilemma Simulator</h4>
              <p>See how different actors behave in blockchain validation scenarios.</p>
              
              <div class="simulation-controls">
                <div class="control-group">
                  <label>Actor Distribution:</label>
                  <div class="slider-container">
                    <span>All Rational</span>
                    <input type="range" id="actor-slider" min="0" max="100" value="50">
                    <span>All Human</span>
                  </div>
                  <div class="slider-value">50% Rational / 50% Human</div>
                </div>
                
                <div class="control-group">
                  <label>Protocol Incentive Structure:</label>
                  <select id="incentive-structure">
                    <option value="basic">Basic Rewards/Penalties</option>
                    <option value="staking">Staking with Slashing</option>
                    <option value="reputation">Reputation-Based</option>
                    <option value="adaptive">Adaptive Penalties</option>
                  </select>
                </div>
              </div>
              
              <button id="run-pd-simulation" class="btn primary">Run Simulation</button>
              
              <div class="simulation-results">
                <canvas id="pd-results-chart" width="400" height="250"></canvas>
                <div class="results-summary" id="pd-summary">
                  <p>Configure the simulation parameters and click "Run Simulation" to see results.</p>
                </div>
              </div>
            </div>
            
            <div class="tab-content" id="coordination-game-tab">
              <h4>Coordination Game Analysis</h4>
              <p>Compare different coordination mechanisms across actor types.</p>
              
              <div class="simulation-controls">
                <div class="control-group">
                  <label>Solution Strategy:</label>
                  <select id="coordination-strategy">
                    <option value="standard">Standard Numbering</option>
                    <option value="pairing">Pairing/Watcher Solution</option>
                    <option value="hybrid">Hybrid Approach</option>
                  </select>
                </div>
                
                <div class="control-group">
                  <label>Actor Mix:</label>
                  <select id="actor-mix">
                    <option value="rational">Rational Actors (Bots)</option>
                    <option value="human">Human Actors</option>
                    <option value="mixed">Mixed Population</option>
                  </select>
                </div>
              </div>
              
              <button id="run-cg-simulation" class="btn primary">Analyze Strategy</button>
              
              <div class="simulation-results">
                <div class="comparison-table" id="strategy-comparison">
                  <table>
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Standard Numbering</th>
                        <th>Pairing/Watcher</th>
                        <th>Hybrid</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Success Rate (Rational)</td>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                      </tr>
                      <tr>
                        <td>Success Rate (Human)</td>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                      </tr>
                      <tr>
                        <td>Failure Probability</td>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                      </tr>
                      <tr>
                        <td>Implementation Complexity</td>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="results-summary" id="cg-summary">
                  <p>Select parameters and click "Analyze Strategy" to compare coordination approaches.</p>
                </div>
              </div>
            </div>
            
            <div class="tab-content" id="consensus-attacks-tab">
              <h4>Consensus Mechanism Attack Simulator</h4>
              <p>Model attacks against different blockchain consensus mechanisms.</p>
              
              <div class="simulation-controls">
                <div class="control-group">
                  <label>Consensus Mechanism:</label>
                  <select id="consensus-mechanism">
                    <option value="pow">Proof of Work</option>
                    <option value="pos">Proof of Stake</option>
                    <option value="dpos">Delegated Proof of Stake</option>
                  </select>
                </div>
                
                <div class="control-group">
                  <label>Attacker Resources:</label>
                  <div class="slider-container">
                    <span>Low</span>
                    <input type="range" id="attacker-resources" min="1" max="100" value="30">
                    <span>High</span>
                  </div>
                  <div class="slider-value">30% of Network Resources</div>
                </div>
                
                <div class="control-group">
                  <label>Attack Type:</label>
                  <select id="attack-type">
                    <option value="51">51% Attack</option>
                    <option value="selfish">Selfish Mining</option>
                    <option value="sybil">Sybil Attack</option>
                    <option value="long-range">Long-Range Attack</option>
                  </select>
                </div>
              </div>
              
              <button id="run-attack-simulation" class="btn primary">Simulate Attack</button>
              
              <div class="simulation-results">
                <div class="attack-results" id="attack-results">
                  <div class="metric">
                    <span class="metric-label">Attack Success Probability:</span>
                    <span class="metric-value" id="attack-probability">--</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Estimated Attack Cost:</span>
                    <span class="metric-value" id="attack-cost">--</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Maximum Potential Profit:</span>
                    <span class="metric-value" id="attack-profit">--</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Economic Rationality:</span>
                    <span class="metric-value" id="attack-rationality">--</span>
                  </div>
                </div>
                <div class="results-summary" id="attack-summary">
                  <p>Configure attack parameters and click "Simulate Attack" to see results.</p>
                </div>
              </div>
            </div>
          </div>
        `;
        
        // Set up tab functionality
        const tabButtons = demoContainer.querySelectorAll('.tab-btn');
        const tabContents = demoContainer.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
          button.addEventListener('click', () => {
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show corresponding tab content
            const tabId = button.getAttribute('data-tab');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
          });
        });
        
        // Initialize the Prisoner's Dilemma simulator
        const actorSlider = document.getElementById('actor-slider');
        const actorSliderValue = actorSlider.nextElementSibling;
        
        actorSlider.addEventListener('input', () => {
          const rational = actorSlider.value;
          const human = 100 - rational;
          actorSlider.nextElementSibling.textContent = `${rational}% Rational / ${human}% Human`;
        });
        
        // Initialize the Prisoner's Dilemma simulation button
        document.getElementById('run-pd-simulation').addEventListener('click', () => {
          const rationalPercentage = document.getElementById('actor-slider').value;
          const incentiveStructure = document.getElementById('incentive-structure').value;
          
          // In a real implementation, this would run an actual simulation
          // For this example, we'll just show pre-calculated results
          const resultsSummary = document.getElementById('pd-summary');
          let cooperationRate, stabilityIndex, networkSecurityScore;
          
          // Different outcomes based on actor distribution and incentive structure
          if (incentiveStructure === 'staking') {
            // Staking with slashing creates strong incentives for rational actors
            cooperationRate = 0.5 + (rationalPercentage / 200) + 0.3;
            stabilityIndex = 0.6 + (rationalPercentage / 250);
            networkSecurityScore = 0.7 + (rationalPercentage / 300);
          } else if (incentiveStructure === 'reputation') {
            // Reputation systems work well with human actors
            cooperationRate = 0.5 + ((100 - rationalPercentage) / 200) + 0.2;
            stabilityIndex = 0.5 + ((100 - rationalPercentage) / 250) + 0.1;
            networkSecurityScore = 0.6 + ((100 - rationalPercentage) / 300) + 0.1;
          } else if (incentiveStructure === 'adaptive') {
            // Adaptive penalties work well with mixed populations
            const balanceFactor = 1 - (Math.abs(rationalPercentage - 50) / 50);
            cooperationRate = 0.7 + (balanceFactor * 0.2);
            stabilityIndex = 0.65 + (balanceFactor * 0.25);
            networkSecurityScore = 0.75 + (balanceFactor * 0.15);
          } else {
            // Basic rewards/penalties
            cooperationRate = 0.4 + (rationalPercentage / 300) + ((100 - rationalPercentage) / 400);
            stabilityIndex = 0.3 + (rationalPercentage / 350) + ((100 - rationalPercentage) / 450);
            networkSecurityScore = 0.5 + (rationalPercentage / 400) + ((100 - rationalPercentage) / 500);
          }
          
          // Cap values at 1.0 (100%)
          cooperationRate = Math.min(cooperationRate, 1.0);
          stabilityIndex = Math.min(stabilityIndex, 1.0);
          networkSecurityScore = Math.min(networkSecurityScore, 1.0);
          
          // Show results
          resultsSummary.innerHTML = `
            <h5>Simulation Results:</h5>
            <div class="result-metric">
              <span class="metric-label">Cooperation Rate:</span>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.round(cooperationRate * 100)}%"></div>
              </div>
              <span class="metric-value">${Math.round(cooperationRate * 100)}%</span>
            </div>
            <div class="result-metric">
              <span class="metric-label">Network Stability:</span>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.round(stabilityIndex * 100)}%"></div>
              </div>
              <span class="metric-value">${Math.round(stabilityIndex * 100)}%</span>
            </div>
            <div class="result-metric">
              <span class="metric-label">Security Score:</span>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.round(networkSecurityScore * 100)}%"></div>
              </div>
              <span class="metric-value">${Math.round(networkSecurityScore * 100)}%</span>
            </div>
            <div class="result-insights">
              <p><strong>Key Insight:</strong> ${this.generatePrisonersDilemmaInsight(rationalPercentage, incentiveStructure, cooperationRate)}</p>
            </div>
          `;
        });
        
        // Initialize the Coordination Game analysis button
        document.getElementById('run-cg-simulation').addEventListener('click', () => {
          const strategy = document.getElementById('coordination-strategy').value;
          const actorMix = document.getElementById('actor-mix').value;
          
          // In a real implementation, this would perform actual analysis
          // For this example, we'll show pre-defined comparison based on screenshot analysis
          const comparisonTable = document.getElementById('strategy-comparison').querySelector('tbody');
          const summaryElement = document.getElementById('cg-summary');
          
          // Clear existing rows
          while (comparisonTable.firstChild) {
            comparisonTable.removeChild(comparisonTable.firstChild);
          }
          
          // Strategy comparison data (based on the screenshot analysis)
          const comparisonData = {
            'rational': {
              'successRate': {
                'standard': 'High (P=0)',
                'pairing': 'High (dominant)',
                'hybrid': 'Very High'
              },
              'humanSuccess': {
                'standard': 'Medium',
                'pairing': 'High',
                'hybrid': 'High'
              },
              'failProb': {
                'standard': '0%',
                'pairing': '~0%',
                'hybrid': '~0%'
              },
              'complexity': {
                'standard': 'Low',
                'pairing': 'Medium',
                'hybrid': 'Medium-High'
              }
            },
            'human': {
              'successRate': {
                'standard': 'Medium',
                'pairing': 'High',
                'hybrid': 'High'
              },
              'humanSuccess': {
                'standard': 'Low-Medium',
                'pairing': 'Very High (P=0.001)',
                'hybrid': 'High'
              },
              'failProb': {
                'standard': 'High (mass defection)',
                'pairing': 'Very Low (0.1%)',
                'hybrid': 'Low (1%)'
              },
              'complexity': {
                'standard': 'Low',
                'pairing': 'Medium',
                'hybrid': 'Medium-High'
              }
            },
            'mixed': {
              'successRate': {
                'standard': 'Medium',
                'pairing': 'High',
                'hybrid': 'Very High'
              },
              'humanSuccess': {
                'standard': 'Low-Medium',
                'pairing': 'High',
                'hybrid': 'Very High'
              },
              'failProb': {
                'standard': 'Medium-High',
                'pairing': 'Low',
                'hybrid': 'Very Low'
              },
              'complexity': {
                'standard': 'Low',
                'pairing': 'Medium',
                'hybrid': 'Medium-High'
              }
            }
          };
          
          // Add rows with data based on selected actor mix
          const data = comparisonData[actorMix];
          
          // Success Rate (Rational)
          const row1 = comparisonTable.insertRow();
          row1.insertCell().textContent = 'Success Rate (Rational)';
          row1.insertCell().textContent = data.successRate.standard;
          row1.insertCell().textContent = data.successRate.pairing;
          row1.insertCell().textContent = data.successRate.hybrid;
          
          // Success Rate (Human)
          const row2 = comparisonTable.insertRow();
          row2.insertCell().textContent = 'Success Rate (Human)';
          row2.insertCell().textContent = data.humanSuccess.standard;
          row2.insertCell().textContent = data.humanSuccess.pairing;
          row2.insertCell().textContent = data.humanSuccess.hybrid;
          
          // Failure Probability
          const row3 = comparisonTable.insertRow();
          row3.insertCell().textContent = 'Failure Probability';
          row3.insertCell().textContent = data.failProb.standard;
          row3.insertCell().textContent = data.failProb.pairing;
          row3.insertCell().textContent = data.failProb.hybrid;
          
          // Implementation Complexity
          const row4 = comparisonTable.insertRow();
          row4.insertCell().textContent = 'Implementation Complexity';
          row4.insertCell().textContent = data.complexity.standard;
          row4.insertCell().textContent = data.complexity.pairing;
          row4.insertCell().textContent = data.complexity.hybrid;
          
          // Highlight cells for the selected strategy
          const highlightColumn = strategy === 'standard' ? 1 : (strategy === 'pairing' ? 2 : 3);
          for (let i = 0; i < 4; i++) {
            comparisonTable.rows[i].cells[highlightColumn].classList.add('highlighted');
          }
          
          // Generate insight based on selection
          summaryElement.innerHTML = `
            <h5>Analysis Results:</h5>
            <p><strong>Key Insight:</strong> ${this.generateCoordinationGameInsight(strategy, actorMix)}</p>
          `;
        });
        
        // Initialize the Consensus Attack simulation button
        document.getElementById('run-attack-simulation').addEventListener('click', () => {
          const consensusMechanism = document.getElementById('consensus-mechanism').value;
          const attackerResources = document.getElementById('attacker-resources').value;
          const attackType = document.getElementById('attack-type').value;
          
          // Calculate attack results based on parameters
          let attackProbability, attackCost, attackProfit, isRational;
          
          if (consensusMechanism === 'pow') {
            // PoW attacks are expensive but somewhat linear in probability
            if (attackType === '51') {
              attackProbability = attackerResources > 50 ? 0.95 : attackerResources / 100;
              attackCost = `$${(5000 * attackerResources).toLocaleString()} per hour`;
              attackProfit = `Up to $${(1000 * attackerResources).toLocaleString()} per attack`;
            } else if (attackType === 'selfish') {
              attackProbability = attackerResources > 33 ? 0.8 : attackerResources / 100;
              attackCost = `$${(3000 * attackerResources).toLocaleString()} per hour`;
              attackProfit = `Up to $${(800 * attackerResources).toLocaleString()} per day`;
            } else {
              attackProbability = attackerResources / 150;
              attackCost = `$${(2000 * attackerResources).toLocaleString()} upfront`;
              attackProfit = `Variable, typically low`;
            }
          } else if (consensusMechanism === 'pos') {
            // PoS attacks require massive capital
            if (attackType === '51') {
              attackProbability = attackerResources > 50 ? 0.9 : attackerResources / 200;
              attackCost = `$${(200000 * attackerResources).toLocaleString()} in stake`;
              attackProfit = `Up to $${(20000 * attackerResources).toLocaleString()} potential`;
            } else if (attackType === 'long-range') {
              attackProbability = attackerResources / 300;
              attackCost = `$${(50000 * attackerResources).toLocaleString()} in stake`;
              attackProfit = `Highly variable, potentially high`;
            } else {
              attackProbability = attackerResources / 400;
              attackCost = `$${(100000 * attackerResources).toLocaleString()} in stake`;
              attackProfit = `Limited due to slashing`;
            }
          } else {
            // DPoS attacks focus on vote manipulation
            if (attackType === '51') {
              attackProbability = attackerResources > 50 ? 0.8 : attackerResources / 150;
              attackCost = `$${(50000 * attackerResources).toLocaleString()} + social capital`;
              attackProfit = `Up to $${(15000 * attackerResources).toLocaleString()} potential`;
            } else {
              attackProbability = attackerResources / 250;
              attackCost = `$${(30000 * attackerResources).toLocaleString()} in tokens`;
              attackProfit = `Limited by governance mechanisms`;
            }
          }
          
          // Calculate if attack is economically rational
          const costValue = parseInt(attackCost.replace(/\D/g,''));
          const profitValue = parseInt(attackProfit.replace(/\D/g,''));
          isRational = profitValue * attackProbability > costValue;
          
          // Update the UI
          document.getElementById('attack-probability').textContent = `${Math.round(attackProbability * 100)}%`;
          document.getElementById('attack-cost').textContent = attackCost;
          document.getElementById('attack-profit').textContent = attackProfit;
          document.getElementById('attack-rationality').textContent = isRational ? 
            'Potentially Rational' : 'Economically Irrational';
          document.getElementById('attack-rationality').className = 
            `metric-value ${isRational ? 'negative' : 'positive'}`;
          
          // Generate insight
          document.getElementById('attack-summary').innerHTML = `
            <h5>Simulation Results:</h5>
            <p><strong>Key Insight:</strong> ${this.generateAttackSimulationInsight(consensusMechanism, attackerResources, attackType, attackProbability, isRational)}</p>
          `;
        });
        
        // Initialize attacker resources slider
        const attackerSlider = document.getElementById('attacker-resources');
        attackerSlider.addEventListener('input', () => {
          attackerSlider.nextElementSibling.textContent = `${attackerSlider.value}% of Network Resources`;
        });
      }
    } else if (lessonId === 'using-metamask') {
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
   * Generate insight text for Prisoner's Dilemma simulation
   * @param {number} rationalPercentage - Percentage of rational actors
   * @param {string} incentiveStructure - Selected incentive structure
   * @param {number} cooperationRate - Resulting cooperation rate
   * @returns {string} Insight text
   * @private
   */
  generatePrisonersDilemmaInsight(rationalPercentage, incentiveStructure, cooperationRate) {
    if (cooperationRate > 0.8) {
      if (incentiveStructure === 'staking' && rationalPercentage > 70) {
        return "Staking with slashing is highly effective for rational actors, as the economic penalties create a strong Nash equilibrium favoring cooperation.";
      } else if (incentiveStructure === 'reputation' && rationalPercentage < 30) {
        return "Reputation-based systems work well with human actors who value social capital and long-term relationships over short-term gains.";
      } else if (incentiveStructure === 'adaptive') {
        return "Adaptive penalty systems excel at handling mixed populations by dynamically adjusting incentives based on observed behavior patterns.";
      } else {
        return "This combination creates strong incentives for cooperation, demonstrating how well-designed protocols can overcome the Prisoner's Dilemma.";
      }
    } else if (cooperationRate > 0.6) {
      return "Moderate cooperation levels indicate the protocol is somewhat resistant to defection, but could be improved with stronger incentive alignment.";
    } else {
      return "Low cooperation levels suggest this incentive structure is vulnerable to defection. In a blockchain context, this would translate to security vulnerabilities.";
    }
  }
  
  /**
   * Generate insight text for Coordination Game analysis
   * @param {string} strategy - Selected coordination strategy
   * @param {string} actorMix - Selected actor mix
   * @returns {string} Insight text
   * @private
   */
  generateCoordinationGameInsight(strategy, actorMix) {
    if (strategy === 'standard' && actorMix === 'rational') {
      return "Standard numbering works well for rational actors who calculate optimal strategies, but struggles with mass coordination failures among human actors.";
    } else if (strategy === 'pairing' && actorMix === 'human') {
      return "The Pairing/Watcher solution excels with human actors (P=0.001) because it uses psychological factors like fear and bluffing to prevent mass defection.";
    } else if (strategy === 'hybrid' && actorMix === 'mixed') {
      return "Hybrid approaches perform best in mixed populations by combining mathematical incentives for rational actors with psychological safeguards for human actors.";
    } else if (strategy === 'pairing') {
      return "The Pairing/Watcher solution improves coordination by introducing monitoring and targeted penalties that discourage defection.";
    } else if (strategy === 'hybrid') {
      return "Hybrid approaches add complexity but provide the most robust coordination across different actor types.";
    } else {
      return "Standard numbering offers simplicity but may struggle with coordination failures, especially when actors are not purely rational.";
    }
  }
  
  /**
   * Generate insight text for Attack Simulation
   * @param {string} consensusMechanism - Selected consensus mechanism
   * @param {number} attackerResources - Attacker resource percentage
   * @param {string} attackType - Selected attack type
   * @param {number} probability - Attack success probability
   * @param {boolean} isRational - Whether attack is economically rational
   * @returns {string} Insight text
   * @private
   */
  generateAttackSimulationInsight(consensusMechanism, attackerResources, attackType, probability, isRational) {
    if (consensusMechanism === 'pow' && attackType === '51' && attackerResources > 50) {
      return "While technically possible, 51% attacks on established PoW networks are prohibitively expensive and typically not economically rational due to the high hardware and electricity costs.";
    } else if (consensusMechanism === 'pos' && attackType === '51') {
      return "PoS systems make 51% attacks extremely expensive as attackers must acquire and risk a majority of the staked tokens, creating strong economic security.";
    } else if (consensusMechanism === 'dpos' && probability > 0.5) {
      return "DPoS systems are vulnerable to vote-buying attacks if governance is not designed carefully, as acquiring voting power can be cheaper than direct attacks.";
    } else if (attackType === 'selfish' && attackerResources > 30) {
      return "Selfish mining becomes viable with >33% network resources, highlighting the importance of protocol design that removes incentives for this behavior.";
    } else if (!isRational) {
      return "This attack is economically irrational - the expected profit doesn't justify the cost and risk, demonstrating how economic security can protect blockchain systems.";
    } else {
      return `This attack has a ${Math.round(probability * 100)}% success probability, showing why consensus mechanisms must be designed with strong economic incentives against attacks.`;
    }
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