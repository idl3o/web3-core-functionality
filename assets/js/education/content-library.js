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
    this.interactiveDemos = options.interactiveDemos;
    this.topicGridElement = options.topicGrid;
    this.contentViewerElement = options.contentViewer;
    this.backButtonElement = options.backButton;
    this.notificationElement = options.notificationElement;
    this.apiEndpoint = options.apiEndpoint || 'api/education';
    
    this.topics = [];
    this.currentContent = null;
    this.currentDemo = null;
    this.contentCache = new Map(); // Cache for fetched content
    
    // Track user progress in localStorage
    this.userProgress = this._loadUserProgress();
    
    // Listen for wallet connection changes
    if (this.walletConnector) {
      this.walletConnector.addEventListener('connectionChanged', () => {
        this._updateContentAccess();
      });
    }
    
    // Set up offline support
    this._setupOfflineSupport();
  }
  
  /**
   * Update content access when wallet connection status changes
   * Checks current content and updates UI if premium content is being viewed
   */
  async _updateContentAccess() {
    console.debug('Wallet connection changed, updating content access');
    
    // If currently viewing premium content, verify access
    if (this.currentContent && this.currentContent.lesson && this.currentContent.lesson.isPremium) {
      const hasAccess = await this._checkPremiumAccess();
      
      if (hasAccess) {
        // User now has access, refresh content if in premium content message view
        const premiumMessage = document.getElementById('premium-content-message');
        if (premiumMessage) {
          // Hide premium message and show content
          this._hideLoadingIndicator();
          this.showContent(
            this.currentContent.content, 
            this.currentContent.lesson, 
            this.currentContent.topic
          );
          this._showNotification('Access granted to premium content!', 'success');
        }
      } else {
        // User lost access, show premium content message
        this._showPremiumContentMessage(this.currentContent.lesson);
      }
    }
  }
  
  /**
   * Check if user has access to premium content
   * @returns {Promise<boolean>} True if user has access
   */
  async _checkPremiumAccess() {
    try {
      // If no wallet connection or contract manager, no access
      if (!this.walletConnector || !this.contractManager) {
        console.debug('No wallet or contract manager available');
        return false;
      }
      
      // Check if wallet is connected
      if (!this.walletConnector.isConnected()) {
        console.debug('Wallet not connected');
        return false;
      }
      
      // Get wallet address
      const address = await this.walletConnector.getAddress();
      if (!address) {
        console.debug('Could not get wallet address');
        return false;
      }
      
      // Check if user has the required educational content token
      // This uses the StreamToken contract for checking access
      try {
        const hasAccess = await this.contractManager.checkStreamAccess('education_premium');
        console.debug('Premium access check result:', hasAccess);
        return hasAccess;
      } catch (error) {
        console.error('Error checking token access:', error);
        return false;
      }
    } catch (error) {
      console.error('Error checking premium access:', error);
      return false;
    }
  }
  
  /**
   * Shows premium content access message with wallet connection options
   * @param {Object} lesson Lesson that requires premium access
   */
  _showPremiumContentMessage(lesson) {
    if (!this.contentViewerElement) return;
    
    // Show the correct UI state
    if (this.topicGridElement) {
      this.topicGridElement.style.display = 'none';
      this.topicGridElement.setAttribute('aria-hidden', 'true');
    }
    
    // Show the content viewer with premium content message
    this.contentViewerElement.style.display = 'block';
    this.contentViewerElement.setAttribute('aria-hidden', 'false');
    
    // Show back button
    if (this.backButtonElement) {
      this.backButtonElement.style.display = 'block';
      this.backButtonElement.setAttribute('aria-hidden', 'false');
    }
    
    // Build the premium content message UI
    this.contentViewerElement.innerHTML = `
      <div id="premium-content-message" class="premium-content-message">
        <h2>Premium Content: ${lesson.title}</h2>
        <div class="premium-content-image">
          <img src="assets/images/premium-content.jpg" alt="Premium content illustration" />
        </div>
        <p class="premium-message">
          This is premium content that requires wallet authentication to access.
        </p>
        <div class="premium-content-options">
          <div class="access-options">
            <h3>Streaming Access</h3>
            <div class="access-info">
              <p><strong>Content ID:</strong> education_premium</p>
              <p><strong>Your Credits:</strong> <span id="token-balance">0</span> STRM</p>
              <p><strong>Stream Status:</strong> <span id="stream-status">Not started</span></p>
              <p><strong>Time Remaining:</strong> <span id="time-remaining">-</span></p>
            </div>
          </div>
          <div class="wallet-actions">
            ${!this.walletConnector?.isConnected() ? 
              `<button id="connect-wallet-btn" class="primary-btn">Connect Wallet</button>` : 
              `<button id="start-stream-btn" class="primary-btn">Start Streaming (1 Credit)</button>`
            }
            <button id="purchase-credits-btn" class="secondary-btn">Purchase Credits (0.01 ETH)</button>
          </div>
        </div>
      </div>
    `;
    
    // Set up event listeners for the buttons
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    if (connectWalletBtn) {
      connectWalletBtn.addEventListener('click', async () => {
        try {
          this._showLoadingIndicator('Connecting wallet...');
          await this.walletConnector.connect();
          
          // Check access again
          const hasAccess = await this._checkPremiumAccess();
          if (hasAccess) {
            // User has access, load the premium content
            this._hideLoadingIndicator();
            this._loadLesson(this.currentContent.topic.id, lesson.id);
          } else {
            // Update UI to show purchase options instead of connect
            this._hideLoadingIndicator();
            this._showPremiumContentMessage(lesson);
            
            // Update token balance if available
            this._updateTokenBalance();
          }
        } catch (error) {
          console.error('Error connecting wallet:', error);
          this._hideLoadingIndicator();
          this._showNotification('Failed to connect wallet. Please try again.', 'error');
        }
      });
    }
    
    const startStreamBtn = document.getElementById('start-stream-btn');
    if (startStreamBtn) {
      startStreamBtn.addEventListener('click', async () => {
        try {
          this._showLoadingIndicator('Starting stream...');
          
          // Request access via contract
          await this.contractManager.startStreaming('education_premium');
          
          // Verify access
          const hasAccess = await this._checkPremiumAccess();
          if (hasAccess) {
            // User has access, load the premium content
            this._hideLoadingIndicator();
            const expiry = await this.contractManager.getStreamExpiry('education_premium');
            this._showNotification(`Stream started! Valid for ${this._formatStreamDuration(expiry)}`, 'success');
            this._loadLesson(this.currentContent.topic.id, lesson.id);
          } else {
            this._hideLoadingIndicator();
            this._showNotification('Could not start stream. Please check your token balance.', 'error');
          }
        } catch (error) {
          console.error('Error starting stream:', error);
          this._hideLoadingIndicator();
          this._showNotification('Failed to start stream. Please try again.', 'error');
        }
      });
    }
    
    const purchaseCreditsBtn = document.getElementById('purchase-credits-btn');
    if (purchaseCreditsBtn) {
      purchaseCreditsBtn.addEventListener('click', async () => {
        try {
          if (!this.walletConnector?.isConnected()) {
            await this.walletConnector.connect();
          }
          
          this._showLoadingIndicator('Purchasing credits...');
          await this.contractManager.purchaseCredits();
          this._hideLoadingIndicator();
          this._showNotification('Credits purchased successfully!', 'success');
          
          // Update token balance
          await this._updateTokenBalance();
          
          // Refresh premium content message
          this._showPremiumContentMessage(lesson);
        } catch (error) {
          console.error('Error purchasing credits:', error);
          this._hideLoadingIndicator();
          this._showNotification('Failed to purchase credits. Please try again.', 'error');
        }
      });
    }
    
    // Update token balance if wallet is connected
    if (this.walletConnector?.isConnected()) {
      this._updateTokenBalance();
    }
  }
  
  /**
   * Format stream duration from expiry time
   * @param {number} expiryTime Expiry timestamp
   * @returns {string} Formatted duration
   */
  _formatStreamDuration(expiryTime) {
    const now = Math.floor(Date.now() / 1000);
    const remainingSecs = expiryTime - now;
    
    if (remainingSecs <= 0) return 'Expired';
    
    const hours = Math.floor(remainingSecs / 3600);
    const minutes = Math.floor((remainingSecs % 3600) / 60);
    const seconds = Math.floor(remainingSecs % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  }
  
  /**
   * Update token balance display
   */
  async _updateTokenBalance() {
    try {
      const balanceEl = document.getElementById('token-balance');
      if (balanceEl && this.contractManager) {
        const balance = await this.contractManager.getTokenBalance();
        balanceEl.textContent = balance || '0';
      }
    } catch (error) {
      console.error('Error updating token balance:', error);
    }
  }
  
  /**
   * Load all topics and render the topic grid
   */
  async loadTopics() {
    try {
      // Show loading indicator
      this._showLoadingIndicator('Loading educational content...');
      
      // Try to fetch from API first
      if (navigator.onLine) {
        try {
          const response = await fetch(`${this.apiEndpoint}/topics`);
          if (response.ok) {
            this.topics = await response.json();
            
            // Set all content to free
            this.topics.forEach(topic => {
              if (topic.lessons) {
                topic.lessons.forEach(lesson => {
                  lesson.isPremium = false;
                });
              }
            });
            
            // Cache the topics in localStorage
            localStorage.setItem('web3EduTopics', JSON.stringify(this.topics));
          } else {
            throw new Error('Failed to fetch topics from API');
          }
        } catch (error) {
          console.warn('Failed to fetch topics from API, falling back to local data:', error);
          this._loadFallbackTopics();
        }
      } else {
        console.info('Device is offline, loading cached topics');
        this._loadFallbackTopics();
      }
      
      // Hide loading indicator
      this._hideLoadingIndicator();
      
      // Render the topics
      this.renderTopicGrid();
      
      // Pre-fetch commonly accessed content
      this._preFetchPopularContent();
      
    } catch (error) {
      console.error('Error loading topics:', error);
      this._showNotification('Error loading content. Please try again later.', 'error');
      this._hideLoadingIndicator();
    }
  }
  
  /**
   * Load fallback topics from localStorage or hardcoded data
   */
  _loadFallbackTopics() {
    // Try to load from localStorage first
    const cachedTopics = localStorage.getItem('web3EduTopics');
    if (cachedTopics) {
      try {
        this.topics = JSON.parse(cachedTopics);
        // Set all content to free
        this.topics.forEach(topic => {
          if (topic.lessons) {
            topic.lessons.forEach(lesson => {
              lesson.isPremium = false;
            });
          }
        });
        return;
      } catch (e) {
        console.error('Failed to parse cached topics', e);
      }
    }
    
    // Fallback to hardcoded topics
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
            isPremium: false
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
            isPremium: false
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
            isPremium: false
          }
        ]
      }
    ];
  }
  
  /**
   * Pre-fetch popular content for better user experience
   */
  async _preFetchPopularContent() {
    if (!navigator.onLine) return;
    
    try {
      // Find most popular lessons based on user progress
      const popularLessons = this._getPopularLessons(3); // Top 3 most accessed
      
      // Pre-fetch these lessons in the background
      for (const lesson of popularLessons) {
        this._fetchLessonContent(lesson.contentPath)
          .then(content => {
            this.contentCache.set(lesson.contentPath, content);
            console.debug(`Pre-fetched content: ${lesson.title}`);
          })
          .catch(error => {
            console.debug(`Failed to pre-fetch ${lesson.title}:`, error);
          });
      }
    } catch (error) {
      console.debug('Error pre-fetching content:', error);
    }
  }
  
  /**
   * Get most popular lessons based on access patterns
   */
  _getPopularLessons(count = 3) {
    // Look at last accessed lessons from user progress
    if (!this.userProgress.lessonAccess) {
      return [];
    }
    
    const lessonData = Object.entries(this.userProgress.lessonAccess)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, count);
    
    // Find the lesson objects for these IDs
    return lessonData.map(data => {
      // Find the lesson with this ID across all topics
      for (const topic of this.topics) {
        const lesson = topic.lessons.find(l => l.id === data.id);
        if (lesson) return lesson;
      }
      return null;
    }).filter(lesson => lesson !== null);
  }
  
  /**
   * Load and display a specific lesson
   */
  async loadLesson(topicId, lessonId) {
    try {
      // Show loading indicator
      this._showLoadingIndicator('Loading lesson...');
      
      // Find the topic and lesson
      const topic = this.topics.find(t => t.id === topicId);
      if (!topic) throw new Error(`Topic ${topicId} not found`);
      
      const lesson = topic.lessons.find(l => l.id === lessonId);
      if (!lesson) throw new Error(`Lesson ${lessonId} not found in topic ${topicId}`);
      
      // Track lesson access
      this._trackLessonAccess(lessonId);
      
      // Check if the user has access to premium content
      if (lesson.isPremium) {
        const hasAccess = await this._checkPremiumAccess();
        if (!hasAccess) {
          this._hideLoadingIndicator();
          this._showPremiumContentMessage(lesson);
          return;
        }
      }
      
      // Fetch the lesson content - first check cache
      let lessonContent;
      if (this.contentCache.has(lesson.contentPath)) {
        lessonContent = this.contentCache.get(lesson.contentPath);
        console.debug('Loaded lesson from cache:', lesson.title);
      } else {
        lessonContent = await this._fetchLessonContent(lesson.contentPath);
        // Cache the content for future use
        this.contentCache.set(lesson.contentPath, lessonContent);
      }
      
      // Hide loading indicator
      this._hideLoadingIndicator();
      
      // Display the lesson content
      this.showContent(lessonContent, lesson, topic);
      
      // Track the lesson view if not already completed
      if (!this.userProgress.completedLessons.includes(lessonId)) {
        // Mark as viewed (not completed)
        if (!this.userProgress.viewedLessons) {
          this.userProgress.viewedLessons = [];
        }
        
        if (!this.userProgress.viewedLessons.includes(lessonId)) {
          this.userProgress.viewedLessons.push(lessonId);
          this._saveUserProgress();
        }
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
      this._hideLoadingIndicator();
      this._showNotification('Failed to load lesson content. Please try again later.', 'error');
    }
  }
  
  /**
   * Track lesson access for analytics and optimization
   */
  _trackLessonAccess(lessonId) {
    if (!this.userProgress.lessonAccess) {
      this.userProgress.lessonAccess = {};
    }
    
    if (!this.userProgress.lessonAccess[lessonId]) {
      this.userProgress.lessonAccess[lessonId] = {
        firstAccess: Date.now(),
        accessCount: 0,
      };
    }
    
    this.userProgress.lessonAccess[lessonId].lastAccess = Date.now();
    this.userProgress.lessonAccess[lessonId].accessCount += 1;
    this._saveUserProgress();
  }
  
  /**
   * Show the content in the content viewer with enhanced accessibility
   */
  showContent(content, lesson, topic) {
    if (!this.contentViewerElement) return;
    
    // Store the current content
    this.currentContent = { content, lesson, topic };
    
    // Show the back button
    if (this.backButtonElement) {
      this.backButtonElement.style.display = 'block';
      this.backButtonElement.setAttribute('aria-hidden', 'false');
    }
    
    // Hide the topic grid and show the content viewer
    if (this.topicGridElement) {
      this.topicGridElement.style.display = 'none';
      this.topicGridElement.setAttribute('aria-hidden', 'true');
    }
    this.contentViewerElement.style.display = 'block';
    this.contentViewerElement.setAttribute('aria-hidden', 'false');
    
    // Set the content HTML with enhanced accessibility
    this.contentViewerElement.innerHTML = `
      <h2 id="lesson-title">${content.title}</h2>
      <div class="lesson-meta" aria-labelledby="lesson-title">
        <span class="topic">${topic.title}</span> • <span class="duration">${lesson.duration}</span>
      </div>
      
      <div class="lesson-content" role="main">
        ${content.sections.map((section, index) => `
          <section class="content-section" id="section-${index}">
            <h3 id="section-heading-${index}">${section.title}</h3>
            <div class="section-content" aria-labelledby="section-heading-${index}">${section.html}</div>
            
            ${section.videoUrl ? `
              <div class="video-container">
                <video controls preload="metadata" aria-label="${section.title} video">
                  <source src="${section.videoUrl}" type="video/mp4">
                  Your browser does not support the video tag.
                </video>
              </div>
            ` : ''}
            
            ${section.codeExample ? `
              <div class="code-example">
                <h4>Code Example</h4>
                <pre><code tabindex="0" class="language-javascript">${section.codeExample}</code></pre>
              </div>
            ` : ''}
          </section>
        `).join('')}
      </div>
      
      ${content.interactive ? `
        <div class="interactive-demo">
          <h3 id="interactive-heading">Interactive Demo</h3>
          <div id="interactive-container" 
               data-demo-id="${content.interactive.id}" 
               data-demo-type="${content.interactive.type}"
               aria-labelledby="interactive-heading"
               role="application">
            <p class="loading-message">Loading interactive demo...</p>
          </div>
        </div>
      ` : ''}
      
      <div class="lesson-navigation" role="navigation">
        <button id="mark-complete-btn" class="mark-complete" aria-label="Mark lesson as complete">
          ${this.userProgress.completedLessons.includes(lesson.id) ? 'Completed' : 'Mark as Complete'}
        </button>
        <button id="next-lesson-btn" class="next-lesson">Next Lesson</button>
      </div>
    `;
    
    // Add event listeners for the lesson navigation
    const markCompleteBtn = document.getElementById('mark-complete-btn');
    if (markCompleteBtn) {
      if (this.userProgress.completedLessons.includes(lesson.id)) {
        markCompleteBtn.disabled = true;
      }
      
      markCompleteBtn.addEventListener('click', () => {
        if (!this.userProgress.completedLessons.includes(lesson.id)) {
          this.userProgress.completedLessons.push(lesson.id);
          this._saveUserProgress();
          this._showNotification('Lesson marked as complete!', 'success');
        }
        markCompleteBtn.textContent = 'Completed';
        markCompleteBtn.disabled = true;
      });
    }
    
    // Set up next lesson button
    const nextLessonBtn = document.getElementById('next-lesson-btn');
    if (nextLessonBtn) {
      // Find the index of the current lesson
      const currentIndex = topic.lessons.findIndex(l => l.id === lesson.id);
      if (currentIndex >= 0 && currentIndex < topic.lessons.length - 1) {
        // There is a next lesson in this topic
        const nextLesson = topic.lessons[currentIndex + 1];
        nextLessonBtn.addEventListener('click', () => {
          this.loadLesson(topic.id, nextLesson.id);
        });
      } else {
        // This is the last lesson in the topic
        nextLessonBtn.textContent = 'Back to Topics';
        nextLessonBtn.addEventListener('click', () => {
          this.showTopics();
        });
      }
    }
    
    // Initialize interactive demo if present
    if (content.interactive && this.interactiveDemos) {
      this._initializeInteractiveDemo(content.interactive);
    }
    
    // Initialize syntax highlighting if available
    this._initializeSyntaxHighlighting();
    
    // Scroll to the top
    window.scrollTo(0, 0);
    
    // Announce to screen readers
    this._announceToScreenReader(`Loaded lesson: ${content.title}`);
  }
  
  /**
   * Show the topic grid and hide the content viewer
   */
  showTopics() {
    // Hide the content viewer
    if (this.contentViewerElement) {
      this.contentViewerElement.style.display = 'none';
      this.contentViewerElement.setAttribute('aria-hidden', 'true');
    }
    
    // Show the topic grid
    if (this.topicGridElement) {
      this.topicGridElement.style.display = 'grid';
      this.topicGridElement.setAttribute('aria-hidden', 'false');
    }
    
    // Hide back button
    if (this.backButtonElement) {
      this.backButtonElement.style.display = 'none';
      this.backButtonElement.setAttribute('aria-hidden', 'true');
    }
    
    // Reset current content
    this.currentContent = null;
    
    // Scroll to the top
    window.scrollTo(0, 0);
    
    // Announce to screen readers
    this._announceToScreenReader('Showing topic list');
  }

  /**
   * Render the topic grid with all available topics
   */
  renderTopicGrid() {
    if (!this.topicGridElement || !this.topics || this.topics.length === 0) return;
    
    // Clear existing content
    this.topicGridElement.innerHTML = '';
    
    // Create topic cards
    this.topics.forEach(topic => {
      const topicElement = document.createElement('div');
      topicElement.className = 'topic-card';
      topicElement.setAttribute('data-topic-id', topic.id);
      
      // Create topic content
      topicElement.innerHTML = `
        <div class="topic-image" style="background-image: url('${topic.image || 'assets/images/default-topic.jpg'}')"></div>
        <div class="topic-details">
          <h3>${topic.title}</h3>
          <p>${topic.description || ''}</p>
          <ul class="lesson-list" aria-label="Lessons for ${topic.title}">
            ${topic.lessons.map(lesson => `
              <li class="lesson-item">
                <span class="lesson-title" 
                      data-topic-id="${topic.id}" 
                      data-lesson-id="${lesson.id}" 
                      tabindex="0" 
                      role="button">
                  ${lesson.title}
                </span>
                <span class="lesson-duration">${lesson.duration}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
      
      // Add to grid
      this.topicGridElement.appendChild(topicElement);
      
      // Add event listeners for lessons
      const lessonTitles = topicElement.querySelectorAll('.lesson-title');
      lessonTitles.forEach(lessonTitle => {
        lessonTitle.addEventListener('click', () => {
          const topicId = lessonTitle.getAttribute('data-topic-id');
          const lessonId = lessonTitle.getAttribute('data-lesson-id');
          this.loadLesson(topicId, lessonId);
        });
        
        // Keyboard accessibility
        lessonTitle.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const topicId = lessonTitle.getAttribute('data-topic-id');
            const lessonId = lessonTitle.getAttribute('data-lesson-id');
            this.loadLesson(topicId, lessonId);
          }
        });
      });
    });
    
    // Show the topic grid
    this.topicGridElement.style.display = 'grid';
    this.topicGridElement.setAttribute('aria-hidden', 'false');
  }
  
  /**
   * Initialize syntax highlighting for code examples
   */
  _initializeSyntaxHighlighting() {
    // Check if Prism or Highlight.js is available
    if (typeof Prism !== 'undefined') {
      Prism.highlightAll();
    } else if (typeof hljs !== 'undefined') {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
      });
    }
  }
  
  /**
   * Announce message to screen readers
   */
  _announceToScreenReader(message) {
    const announcer = document.getElementById('sr-announcer');
    
    if (!announcer) {
      // Create an announcer if it doesn't exist
      const newAnnouncer = document.createElement('div');
      newAnnouncer.id = 'sr-announcer';
      newAnnouncer.className = 'sr-only';
      newAnnouncer.setAttribute('aria-live', 'polite');
      document.body.appendChild(newAnnouncer);
      
      setTimeout(() => {
        newAnnouncer.textContent = message;
      }, 100);
    } else {
      announcer.textContent = '';
      setTimeout(() => {
        announcer.textContent = message;
      }, 100);
    }
  }
  
  /**
   * Show loading indicator
   */
  _showLoadingIndicator(message = 'Loading...') {
    // Create loading indicator if it doesn't exist
    let loadingEl = document.getElementById('content-loader');
    
    if (!loadingEl) {
      loadingEl = document.createElement('div');
      loadingEl.id = 'content-loader';
      loadingEl.className = 'content-loader';
      loadingEl.setAttribute('aria-live', 'polite');
      loadingEl.innerHTML = `
        <div class="loader-spinner"></div>
        <div class="loader-message">${message}</div>
      `;
      document.body.appendChild(loadingEl);
    } else {
      loadingEl.querySelector('.loader-message').textContent = message;
      loadingEl.style.display = 'flex';
    }
  }
  
  /**
   * Hide loading indicator
   */
  _hideLoadingIndicator() {
    const loadingEl = document.getElementById('content-loader');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
  }
  
  /**
   * Show notification to the user
   */
  _showNotification(message, type = 'info') {
    if (this.notificationElement) {
      this.notificationElement.textContent = message;
      this.notificationElement.className = `notification ${type}`;
      this.notificationElement.style.display = 'block';
      
      setTimeout(() => {
        this.notificationElement.style.display = 'none';
      }, 5000);
    } else {
      // Create a temporary notification element
      const notification = document.createElement('div');
      notification.className = `floating-notification ${type}`;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      // Animate in
      setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
      }, 10);
      
      // Remove after timeout
      setTimeout(() => {
        notification.style.transform = 'translateY(-20px)';
        notification.style.opacity = '0';
        setTimeout(() => {
          notification.remove();
        }, 300);
      }, 5000);
    }
  }
  
  /**
   * Set up offline support
   */
  _setupOfflineSupport() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this._showNotification('You are back online. Full functionality restored.', 'success');
      // Refresh data if needed
      if (this.topics.length === 0) {
        this.loadTopics();
      }
    });
    
    window.addEventListener('offline', () => {
      this._showNotification('You are offline. Limited functionality available.', 'warning');
    });
    
    // If using service workers, register here
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }
  
  /**
   * Fetch lesson content with better error handling and offline support
   */
  async _fetchLessonContent(contentPath) {
    try {
      if (navigator.onLine) {
        try {
          // Try to fetch from API first
          const response = await fetch(contentPath);
          if (response.ok) {
            const content = await response.json();
            // Cache the content
            localStorage.setItem(`web3Edu_content_${contentPath}`, JSON.stringify(content));
            return content;
          } else {
            throw new Error(`Failed to fetch content: ${response.status}`);
          }
        } catch (error) {
          console.warn(`API fetch failed for ${contentPath}, trying localStorage`);
          // Try to get from localStorage
          const cachedContent = localStorage.getItem(`web3Edu_content_${contentPath}`);
          if (cachedContent) {
            return JSON.parse(cachedContent);
          }
          // If not in localStorage, throw to try fallback
          throw error;
        }
      } else {
        // Offline - try to get from localStorage
        const cachedContent = localStorage.getItem(`web3Edu_content_${contentPath}`);
        if (cachedContent) {
          return JSON.parse(cachedContent);
        }
      }
      
      // If we get here, we need to use hardcoded fallbacks
      throw new Error('Content not available offline');
    } catch (error) {
      console.error(`Error fetching content: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Load user progress from localStorage with improved error handling
   */
  _loadUserProgress() {
    const storedProgress = localStorage.getItem('web3EduProgress');
    if (storedProgress) {
      try {
        const parsedProgress = JSON.parse(storedProgress);
        
        // Validate structure and provide defaults for missing properties
        if (!parsedProgress.completedLessons) parsedProgress.completedLessons = [];
        if (!parsedProgress.viewedLessons) parsedProgress.viewedLessons = [];
        if (!parsedProgress.interactiveUsage) parsedProgress.interactiveUsage = {};
        if (!parsedProgress.lastAccessed) parsedProgress.lastAccessed = Date.now();
        
        return parsedProgress;
      } catch (e) {
        console.error('Failed to parse stored progress', e);
        this._showNotification('There was a problem loading your progress data.', 'error');
      }
    }
    
    // Default progress object
    return {
      completedLessons: [],
      viewedLessons: [],
      interactiveUsage: {},
      lessonAccess: {},
      lastAccessed: Date.now()
    };
  }
  
  /**
   * Save user progress to localStorage with error handling and data cleanup
   */
  _saveUserProgress() {
    try {
      this.userProgress.lastAccessed = Date.now();
      
      // Clean up progress data to avoid localStorage bloat
      this._cleanupProgressData();
      
      localStorage.setItem('web3EduProgress', JSON.stringify(this.userProgress));
    } catch (e) {
      console.error('Failed to save progress', e);
      // If localStorage is full, try to clear some space
      if (e.code === 22 || e.name === 'QuotaExceededError') {
        this._handleStorageQuotaExceeded();
      }
    }
  }
  
  /**
   * Clean up progress data to prevent localStorage bloat
   */
  _cleanupProgressData() {
    // Limit the size of interactive usage history
    if (this.userProgress.interactiveUsage) {
      // Only keep the last 20 demo interactions
      const demos = Object.keys(this.userProgress.interactiveUsage);
      if (demos.length > 20) {
        const sortedDemos = demos
          .map(key => ({ 
            key, 
            lastUsed: this.userProgress.interactiveUsage[key].lastUsed || 0 
          }))
          .sort((a, b) => b.lastUsed - a.lastUsed);
        
        // Keep only the 20 most recent
        const demosToKeep = sortedDemos.slice(0, 20).map(item => item.key);
        
        // Create a new object with just the demos to keep
        const cleanedDemos = {};
        demosToKeep.forEach(key => {
          cleanedDemos[key] = this.userProgress.interactiveUsage[key];
        });
        
        this.userProgress.interactiveUsage = cleanedDemos;
      }
    }
  }
  
  /**
   * Handle localStorage quota exceeded error
   */
  _handleStorageQuotaExceeded() {
    console.warn('localStorage quota exceeded, clearing some space');
    
    try {
      // Clear old content caches
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('web3Edu_content_')) {
          localStorage.removeItem(key);
        }
      }
      
      // Try saving again with minimal data
      const minimalProgress = {
        completedLessons: this.userProgress.completedLessons,
        viewedLessons: this.userProgress.viewedLessons,
        lastAccessed: Date.now()
      };
      
      localStorage.setItem('web3EduProgress', JSON.stringify(minimalProgress));
    } catch (e) {
      console.error('Failed to recover from storage quota exceeded', e);
      this._showNotification('Unable to save your progress. Please clear your browser cache.', 'error');
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