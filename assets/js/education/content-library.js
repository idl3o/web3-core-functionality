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
    
    this.topics = [];
    this.currentContent = null;
    this.currentDemo = null;
    
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
          <div id="interactive-container" data-demo-id="${content.interactive.id}" data-demo-type="${content.interactive.type}">
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
   * Initialize an interactive demo using the InteractiveDemos component
   */
  _initializeInteractiveDemo(interactive) {
    if (!this.interactiveDemos) {
      console.warn('InteractiveDemos component is not available');
      return;
    }
    
    const container = document.getElementById('interactive-container');
    if (!container) return;
    
    try {
      // Initialize the demo using the InteractiveDemos helper
      this.currentDemo = this.interactiveDemos.initializeDemo(
        interactive.type, 
        'interactive-container', 
        interactive.id,
        interactive.config || {},
        this._handleDemoInteraction.bind(this)
      );
      
      // Add controls for the interactive demo if specified
      if (interactive.controls) {
        this._addDemoControls(container, interactive.controls);
      }
      
      // Set up event listeners for demo interaction
      container.addEventListener('demo-completed', (e) => {
        this._handleDemoCompletion(e.detail);
      });
      
      container.addEventListener('demo-error', (e) => {
        this._handleDemoError(e.detail);
      });
      
      // Track demo usage in user progress
      if (!this.userProgress.interactiveUsage) {
        this.userProgress.interactiveUsage = {};
      }
      
      if (!this.userProgress.interactiveUsage[interactive.id]) {
        this.userProgress.interactiveUsage[interactive.id] = {
          startedAt: Date.now(),
          completions: 0,
          lastUsed: Date.now()
        };
      } else {
        this.userProgress.interactiveUsage[interactive.id].lastUsed = Date.now();
      }
      
      this._saveUserProgress();
    } catch (error) {
      console.error('Failed to initialize interactive demo:', error);
      container.innerHTML = `
        <div class="demo-error">
          <p>Failed to load interactive demo. Please try refreshing the page.</p>
          <p>Error: ${error.message}</p>
        </div>
      `;
    }
  }
  
  /**
   * Add interactive controls to a demo container
   */
  _addDemoControls(container, controls) {
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'demo-controls';
    
    if (controls.reset) {
      const resetBtn = document.createElement('button');
      resetBtn.className = 'demo-control-btn reset';
      resetBtn.textContent = 'Reset Demo';
      resetBtn.addEventListener('click', () => this._resetDemo());
      controlsDiv.appendChild(resetBtn);
    }
    
    if (controls.fullscreen) {
      const fullscreenBtn = document.createElement('button');
      fullscreenBtn.className = 'demo-control-btn fullscreen';
      fullscreenBtn.textContent = 'Fullscreen';
      fullscreenBtn.addEventListener('click', () => this._toggleFullscreen(container));
      controlsDiv.appendChild(fullscreenBtn);
    }
    
    if (controls.custom && Array.isArray(controls.custom)) {
      controls.custom.forEach(customControl => {
        const customBtn = document.createElement('button');
        customBtn.className = `demo-control-btn ${customControl.className || ''}`;
        customBtn.textContent = customControl.label;
        customBtn.addEventListener('click', () => {
          if (this.currentDemo && typeof this.currentDemo[customControl.action] === 'function') {
            this.currentDemo[customControl.action](customControl.params);
          }
        });
        controlsDiv.appendChild(customBtn);
      });
    }
    
    if (controlsDiv.children.length > 0) {
      container.parentNode.insertBefore(controlsDiv, container.nextSibling);
    }
  }
  
  /**
   * Handle interactions from the demo
   */
  _handleDemoInteraction(type, data) {
    if (!this.currentDemo || !this.currentContent) return;
    
    console.log(`Demo interaction: ${type}`, data);
    
    // Handle different interaction types
    switch (type) {
      case 'state-change':
        // Update user progress based on demo state changes
        if (this.userProgress.interactiveUsage && 
            this.userProgress.interactiveUsage[this.currentContent.interactive.id]) {
          this.userProgress.interactiveUsage[this.currentContent.interactive.id].state = data;
          this._saveUserProgress();
        }
        break;
        
      case 'checkpoint':
        // User reached a checkpoint in the demo
        if (this.userProgress.interactiveUsage && 
            this.userProgress.interactiveUsage[this.currentContent.interactive.id]) {
          if (!this.userProgress.interactiveUsage[this.currentContent.interactive.id].checkpoints) {
            this.userProgress.interactiveUsage[this.currentContent.interactive.id].checkpoints = [];
          }
          this.userProgress.interactiveUsage[this.currentContent.interactive.id].checkpoints.push({
            id: data.checkpointId,
            timestamp: Date.now()
          });
          this._saveUserProgress();
        }
        break;
        
      case 'wallet-request':
        // Demo is requesting wallet connectivity
        if (this.walletConnector && !this.walletConnector.getConnectionState().isConnected) {
          this.walletConnector.connectWallet()
            .then(() => {
              if (this.currentDemo && typeof this.currentDemo.onWalletConnected === 'function') {
                this.currentDemo.onWalletConnected(this.walletConnector.getConnectionState());
              }
            })
            .catch(error => {
              console.error('Failed to connect wallet for demo:', error);
              if (this.currentDemo && typeof this.currentDemo.onWalletError === 'function') {
                this.currentDemo.onWalletError(error);
              }
            });
        } else if (this.walletConnector && this.walletConnector.getConnectionState().isConnected) {
          if (this.currentDemo && typeof this.currentDemo.onWalletConnected === 'function') {
            this.currentDemo.onWalletConnected(this.walletConnector.getConnectionState());
          }
        }
        break;
    }
  }
  
  /**
   * Handle demo completion
   */
  _handleDemoCompletion(detail) {
    if (!this.currentDemo || !this.currentContent) return;
    
    // Update user progress
    if (this.userProgress.interactiveUsage && 
        this.userProgress.interactiveUsage[this.currentContent.interactive.id]) {
      this.userProgress.interactiveUsage[this.currentContent.interactive.id].completions += 1;
      this.userProgress.interactiveUsage[this.currentContent.interactive.id].lastCompleted = Date.now();
      this.userProgress.interactiveUsage[this.currentContent.interactive.id].lastResult = detail;
      this._saveUserProgress();
    }
    
    // Display completion message or reward
    const container = document.getElementById('interactive-container');
    if (container) {
      const completionDiv = document.createElement('div');
      completionDiv.className = 'demo-completion';
      completionDiv.innerHTML = `
        <h4>🎉 Demo Completed!</h4>
        <p>${detail.message || 'You have successfully completed this interactive demo.'}</p>
        ${detail.score ? `<p>Score: ${detail.score} points</p>` : ''}
      `;
      
      container.appendChild(completionDiv);
      
      // Auto-mark the lesson as complete if it's not already
      if (!this.userProgress.completedLessons.includes(this.currentContent.lesson.id)) {
        this.userProgress.completedLessons.push(this.currentContent.lesson.id);
        this._saveUserProgress();
        
        const markCompleteBtn = document.getElementById('mark-complete-btn');
        if (markCompleteBtn) {
          markCompleteBtn.textContent = 'Completed';
          markCompleteBtn.disabled = true;
        }
      }
    }
  }
  
  /**
   * Handle demo errors
   */
  _handleDemoError(detail) {
    console.error('Demo error:', detail);
    
    const container = document.getElementById('interactive-container');
    if (container) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'demo-error-message';
      errorDiv.innerHTML = `
        <h4>⚠️ Demo Error</h4>
        <p>${detail.message || 'An error occurred in the interactive demo.'}</p>
        <button class="retry-demo-btn">Retry</button>
      `;
      
      container.appendChild(errorDiv);
      
      // Add retry button functionality
      const retryBtn = errorDiv.querySelector('.retry-demo-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          errorDiv.remove();
          this._resetDemo();
        });
      }
    }
  }
  
  /**
   * Reset the current demo
   */
  _resetDemo() {
    if (!this.currentDemo || !this.currentContent) return;
    
    try {
      if (typeof this.currentDemo.reset === 'function') {
        this.currentDemo.reset();
      } else {
        // Fallback: re-initialize the demo
        const container = document.getElementById('interactive-container');
        if (container) {
          container.innerHTML = 'Reloading interactive demo...';
          setTimeout(() => {
            this._initializeInteractiveDemo(this.currentContent.interactive);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Failed to reset demo:', error);
    }
  }
  
  /**
   * Toggle fullscreen mode for the demo
   */
  _toggleFullscreen(element) {
    if (!element) return;
    
    try {
      if (!document.fullscreenElement) {
        // Enter fullscreen
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen();
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
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
      interactiveUsage: {},
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