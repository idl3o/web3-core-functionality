/**
 * Recreation Center - Handles all interactive functionality for the education and recreation center
 * This includes games, simulations, and token rewards for educational activities
 */

class RecreationCenter {
    constructor() {
        this.userTokens = 0;
        this.userBadges = [];
        this.initialized = false;
        this.walletConnected = false;
        this.walletAddress = null;
    }

    init() {
        if (this.initialized) return;
        
        console.log('Initializing Recreation Center...');
        
        // Check if wallet is connected
        this.checkWalletConnection();
        
        // Initialize game components
        this.initGames();
        
        // Initialize simulations
        this.initSimulations();
        
        // Initialize event handlers
        this.initEventHandlers();
        
        // Load user progress if wallet is connected
        if (this.walletConnected) {
            this.loadUserProgress();
        }
        
        this.initialized = true;
    }

    checkWalletConnection() {
        // Check if window.ethereum is available (MetaMask or similar wallet)
        if (typeof window.ethereum !== 'undefined') {
            const walletAddress = localStorage.getItem('walletAddress');
            if (walletAddress) {
                this.walletConnected = true;
                this.walletAddress = walletAddress;
                console.log('Wallet connected:', this.walletAddress);
                
                // Update UI to show connected state
                this.updateWalletUI();
            }
        }
    }

    updateWalletUI() {
        const tokenDisplay = document.querySelector('.token-count');
        if (tokenDisplay) {
            tokenDisplay.textContent = this.userTokens;
        }
    }

    initGames() {
        // Blockchain Builder Game
        const blockchainBuilderBtn = document.getElementById('blockchain-builder');
        if (blockchainBuilderBtn) {
            blockchainBuilderBtn.addEventListener('click', () => this.launchGame('blockchain-builder'));
        }

        // Token Trader Game
        const tokenTraderBtn = document.getElementById('token-trader');
        if (tokenTraderBtn) {
            tokenTraderBtn.addEventListener('click', () => this.launchGame('token-trader'));
        }

        // Smart Contract Challenge
        const smartContractBtn = document.getElementById('smart-contract-challenge');
        if (smartContractBtn) {
            smartContractBtn.addEventListener('click', () => this.launchGame('smart-contract'));
        }

        // Consensus Quest
        const consensusQuestBtn = document.getElementById('consensus-quest');
        if (consensusQuestBtn) {
            consensusQuestBtn.addEventListener('click', () => this.launchGame('consensus-quest'));
        }
    }

    initSimulations() {
        // Market Simulator
        const marketSimBtn = document.getElementById('market-simulator');
        if (marketSimBtn) {
            marketSimBtn.addEventListener('click', () => this.launchSimulation('market'));
        }

        // Network Attack Simulator
        const attackSimBtn = document.getElementById('attack-simulator');
        if (attackSimBtn) {
            attackSimBtn.addEventListener('click', () => this.launchSimulation('attack'));
        }

        // Governance Simulator
        const govSimBtn = document.getElementById('governance-simulator');
        if (govSimBtn) {
            govSimBtn.addEventListener('click', () => this.launchSimulation('governance'));
        }

        // NFT Creation Studio
        const nftStudioBtn = document.getElementById('nft-studio');
        if (nftStudioBtn) {
            nftStudioBtn.addEventListener('click', () => this.launchSimulation('nft-studio'));
        }
    }

    initEventHandlers() {
        // Community event handlers
        const communityButtons = [
            'join-book-club',
            'join-code-review',
            'join-career-network',
            'browse-study-groups'
        ];

        communityButtons.forEach(id => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', () => this.handleCommunityAction(id));
            }
        });
    }

    launchGame(gameId) {
        if (!this.walletConnected) {
            this.showWalletPrompt();
            return;
        }

        console.log(`Launching game: ${gameId}`);
        
        // Here we would typically launch the game in an iframe or redirect
        // For demo purposes, we'll just show an alert
        alert(`Launching ${gameId} game. This would open the interactive game environment.`);
        
        // Award tokens for playing (in a real app, this would happen after completion)
        this.awardTokens(5, 'game participation');
    }

    launchSimulation(simId) {
        if (!this.walletConnected) {
            this.showWalletPrompt();
            return;
        }

        console.log(`Launching simulation: ${simId}`);
        
        // Here we would typically launch the simulation in an iframe or redirect
        // For demo purposes, we'll just show an alert
        alert(`Launching ${simId} simulation. This would open the interactive simulation environment.`);
        
        // Award tokens for using a simulation
        this.awardTokens(10, 'simulation participation');
    }

    handleCommunityAction(actionId) {
        if (!this.walletConnected) {
            this.showWalletPrompt();
            return;
        }

        console.log(`Handling community action: ${actionId}`);
        
        // Here we would typically handle the community action 
        // (register for event, join group, etc.)
        switch (actionId) {
            case 'join-book-club':
                alert('Thank you for joining the Web3 Book Club! You will receive an email with meeting details.');
                this.awardTokens(15, 'book club registration');
                break;
            case 'join-code-review':
                alert('You have registered for the next code review session. A calendar invite will be sent to your email.');
                this.awardTokens(15, 'code review registration');
                break;
            case 'join-career-network':
                alert('Welcome to the Web3 Career Network! You now have access to job postings and networking events.');
                this.awardTokens(15, 'career network joining');
                break;
            case 'browse-study-groups':
                alert('Redirecting to study groups page where you can browse and join groups based on your interests.');
                // No tokens awarded for just browsing
                break;
        }
    }

    showWalletPrompt() {
        alert('Please connect your wallet to participate in this activity and earn tokens.');
        
        // Trigger wallet connection if available
        if (typeof window.ethereum !== 'undefined') {
            const connectWalletBtn = document.getElementById('connect-wallet');
            if (connectWalletBtn) {
                connectWalletBtn.click();
            }
        }
    }

    loadUserProgress() {
        // In a real application, this would load from a backend API
        // For demo purposes, we'll simulate loading from localStorage
        const savedTokens = localStorage.getItem(`recreation-tokens-${this.walletAddress}`);
        if (savedTokens) {
            this.userTokens = parseInt(savedTokens);
        }
        
        const savedBadges = localStorage.getItem(`recreation-badges-${this.walletAddress}`);
        if (savedBadges) {
            try {
                this.userBadges = JSON.parse(savedBadges);
                this.updateBadgesUI();
            } catch (e) {
                console.error('Failed to parse saved badges', e);
            }
        }
        
        // Update UI with loaded data
        this.updateWalletUI();
    }

    saveUserProgress() {
        // In a real application, this would save to a backend API
        // For demo purposes, we'll save to localStorage
        if (!this.walletConnected) return;
        
        localStorage.setItem(`recreation-tokens-${this.walletAddress}`, this.userTokens.toString());
        localStorage.setItem(`recreation-badges-${this.walletAddress}`, JSON.stringify(this.userBadges));
    }

    awardTokens(amount, reason) {
        if (!this.walletConnected) return;
        
        this.userTokens += amount;
        this.updateWalletUI();
        this.saveUserProgress();
        
        console.log(`Awarded ${amount} tokens for ${reason}. New balance: ${this.userTokens}`);
        
        // Display a toast or notification
        this.showNotification(`+${amount} tokens awarded!`);
        
        // Check if any badges should be awarded based on new token count
        this.checkBadgeEligibility();
    }

    awardBadge(badgeId, badgeName) {
        if (!this.walletConnected) return;
        
        if (!this.userBadges.includes(badgeId)) {
            this.userBadges.push(badgeId);
            this.saveUserProgress();
            
            console.log(`Awarded badge: ${badgeName}`);
            
            // Display a notification
            this.showNotification(`New badge earned: ${badgeName}!`, 'badge');
            
            // Update badges UI
            this.updateBadgesUI();
        }
    }

    checkBadgeEligibility() {
        // Example badge awarding logic based on tokens
        if (this.userTokens >= 50 && !this.userBadges.includes('blockchain-expert')) {
            this.awardBadge('blockchain-expert', 'Blockchain Expert');
        }
        
        if (this.userTokens >= 100 && !this.userBadges.includes('web3-enthusiast')) {
            this.awardBadge('web3-enthusiast', 'Web3 Enthusiast');
        }
        
        if (this.userTokens >= 200 && !this.userBadges.includes('crypto-master')) {
            this.awardBadge('crypto-master', 'Crypto Master');
        }
    }

    updateBadgesUI() {
        const badgesContainer = document.querySelector('.user-badges');
        if (!badgesContainer) return;
        
        if (this.userBadges.length === 0) {
            badgesContainer.innerHTML = '<p>No badges earned yet. Complete activities to earn badges!</p>';
            return;
        }
        
        let badgesHTML = '<div class="badges-grid earned">';
        
        // Map badge IDs to display names and icons
        const badgeMapping = {
            'blockchain-expert': { name: 'Blockchain Expert', icon: '⛓️' },
            'web3-enthusiast': { name: 'Web3 Enthusiast', icon: '🚀' },
            'crypto-master': { name: 'Crypto Master', icon: '💰' }
            // Add more badge mappings as needed
        };
        
        this.userBadges.forEach(badgeId => {
            const badge = badgeMapping[badgeId] || { name: badgeId, icon: '🏅' };
            badgesHTML += `
                <div class="badge-item earned">
                    <div class="badge-icon">${badge.icon}</div>
                    <p>${badge.name}</p>
                </div>
            `;
        });
        
        badgesHTML += '</div>';
        badgesContainer.innerHTML = badgesHTML;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Add visible class after a brief delay (for animation)
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);
        
        // Remove after a delay
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => {
                notification.remove();
            }, 300); // Wait for fade out animation
        }, 3000);
    }
}

// Initialize the Recreation Center when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const recreationCenter = new RecreationCenter();
    recreationCenter.init();
    
    // Make available globally for debugging
    window.recreationCenter = recreationCenter;
});

/**
 * Web3 Core Platform - Education & Recreation Center
 * Functionality for Recreation Center features
 */

// Timeline and RSS functionality
document.addEventListener('DOMContentLoaded', () => {
  // Setup timeline interaction
  setupRecentChangesTimeline();
  
  // Tab navigation is already in the main HTML file
});

/**
 * Sets up the Recent Changes Timeline functionality
 */
function setupRecentChangesTimeline() {
  const refreshButton = document.getElementById('refresh-timeline');
  const loadMoreButton = document.getElementById('load-more-changes');
  
  // Last refresh timestamp to track updates
  let lastRefresh = new Date();

  // Handle refresh button click
  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      refreshTimeline();
    });
  }
  
  // Handle load more button click
  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', () => {
      loadMoreUpdates();
    });
  }
  
  // Check for updates when the page has been open for a while
  setTimeout(checkForUpdates, 60000); // Check after 1 minute
}

/**
 * Refreshes the timeline with latest updates
 * In a real implementation, this would fetch from an API
 */
function refreshTimeline() {
  const timeline = document.getElementById('changes-timeline');
  if (!timeline) return;
  
  // Show loading state
  const refreshButton = document.getElementById('refresh-timeline');
  if (refreshButton) {
    const originalText = refreshButton.innerHTML;
    refreshButton.innerHTML = '<span class="icon">⌛</span> Refreshing...';
    refreshButton.disabled = true;
    
    // Simulate loading time with local changes
    setTimeout(() => {
      // Here we would normally fetch from an API
      // For demo purposes, we're just adding a new item locally
      const currentDate = new Date();
      
      // Create a new update element
      const newUpdate = document.createElement('div');
      newUpdate.className = 'timeline-item new';
      newUpdate.innerHTML = `
        <div class="timeline-date">
          <span class="date">${formatDate(currentDate)}</span>
          <span class="badge">New</span>
        </div>
        <div class="timeline-content">
          <h4>Local Change Update</h4>
          <p>This update was generated locally by your browser. In a production environment, this would fetch real updates from the server.</p>
          <div class="timeline-meta">
            <span class="author">By You</span>
            <span class="category">Local</span>
          </div>
        </div>
      `;
      
      // Insert at the top of the timeline
      timeline.insertBefore(newUpdate, timeline.firstChild);
      
      // Highlight the new item
      newUpdate.style.animation = 'fadeIn 0.5s ease';
      
      // Reset button state
      refreshButton.innerHTML = originalText;
      refreshButton.disabled = false;
      
      // Show notification
      showNotification('Timeline refreshed with local changes');
      
      // Update last refresh time
      lastRefresh = new Date();
    }, 1500);
  }
}

/**
 * Loads more past updates
 * In a real implementation, this would fetch from an API
 */
function loadMoreUpdates() {
  const timeline = document.getElementById('changes-timeline');
  const loadMoreButton = document.getElementById('load-more-changes');
  
  if (!timeline || !loadMoreButton) return;
  
  // Show loading state
  const originalText = loadMoreButton.innerHTML;
  loadMoreButton.innerHTML = 'Loading...';
  loadMoreButton.disabled = true;
  
  // Simulate loading time
  setTimeout(() => {
    // Add more items (in a real app these would come from an API)
    const pastUpdates = [
      {
        date: 'March 28, 2025',
        title: 'API Documentation Expanded',
        content: 'Comprehensive API documentation now available for developers building on the Web3 Core platform.',
        author: 'Documentation Team',
        category: 'Development'
      },
      {
        date: 'March 22, 2025',
        title: 'Mobile Experience Improvements',
        content: 'Enhanced responsive design for better experience on smartphones and tablets.',
        author: 'UX Team',
        category: 'UI/UX'
      },
      {
        date: 'March 15, 2025',
        badge: 'fix',
        title: 'Smart Contract Simulation Bug Fix',
        content: 'Fixed an issue with gas estimation in the Smart Contract Challenge game.',
        author: 'QA Team',
        category: 'Bugfix'
      }
    ];
    
    // Add items to the timeline
    pastUpdates.forEach(update => {
      const itemElement = document.createElement('div');
      itemElement.className = update.badge === 'fix' ? 'timeline-item issue-fixed' : 'timeline-item';
      
      let badgeHtml = '';
      if (update.badge === 'fix') {
        badgeHtml = '<span class="badge fix">Fixed</span>';
      }
      
      itemElement.innerHTML = `
        <div class="timeline-date">
          <span class="date">${update.date}</span>
          ${badgeHtml}
        </div>
        <div class="timeline-content">
          <h4>${update.title}</h4>
          <p>${update.content}</p>
          <div class="timeline-meta">
            <span class="author">By ${update.author}</span>
            <span class="category">${update.category}</span>
          </div>
        </div>
      `;
      
      timeline.appendChild(itemElement);
    });
    
    // Reset button
    loadMoreButton.innerHTML = originalText;
    
    // If we've loaded "all" updates, disable the button
    // In a real app, this would depend on whether more data is available
    loadMoreButton.innerHTML = 'All Updates Loaded';
    loadMoreButton.disabled = true;
  }, 1500);
}

/**
 * Checks if there are new updates available
 * In a real implementation, this would poll an API
 */
function checkForUpdates() {
  // This would typically fetch from an API endpoint
  // For demo purposes, we'll simulate a check every minute
  
  // Random chance of having a new update (20%)
  const hasNewUpdates = Math.random() < 0.2;
  
  if (hasNewUpdates) {
    showNotification('New updates are available', () => {
      refreshTimeline();
    });
  }
  
  // Schedule next check
  setTimeout(checkForUpdates, 60000); // Check every minute
}

/**
 * Shows a notification to the user
 * @param {string} message - The message to display
 * @param {Function} clickAction - Optional action to perform when clicked
 */
function showNotification(message, clickAction = null) {
  // Create notification element if it doesn't exist
  let notification = document.querySelector('.user-notification');
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'user-notification';
    document.body.appendChild(notification);
  }
  
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close">×</button>
    </div>
  `;
  
  notification.classList.add('active');
  
  // Handle click events
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.classList.remove('active');
  });
  
  if (clickAction) {
    notification.querySelector('.notification-content').addEventListener('click', (e) => {
      if (!e.target.classList.contains('notification-close')) {
        clickAction();
        notification.classList.remove('active');
      }
    });
  }
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    notification.classList.remove('active');
  }, 5000);
}

/**
 * Formats a date for display in the timeline
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// Game and Simulation Launchers
document.addEventListener('DOMContentLoaded', () => {
  // Game launchers
  setupGameLaunchers();
  
  // Simulation launchers
  setupSimulationLaunchers();
  
  // Community join buttons
  setupCommunityJoinButtons();
});

/**
 * Sets up the game launcher buttons
 */
function setupGameLaunchers() {
  const gameLaunchers = [
    'blockchain-builder', 
    'token-trader', 
    'smart-contract-challenge', 
    'consensus-quest'
  ];
  
  gameLaunchers.forEach(id => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', () => {
        // In a production app, this would launch the actual game
        alert(`Launching ${id.replace(/-/g, ' ')}! This is a placeholder.`);
      });
    }
  });
}

/**
 * Sets up the simulation launcher buttons
 */
function setupSimulationLaunchers() {
  const simulationLaunchers = [
    'market-simulator', 
    'attack-simulator', 
    'governance-simulator', 
    'nft-studio'
  ];
  
  simulationLaunchers.forEach(id => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', () => {
        // In a production app, this would launch the actual simulation
        alert(`Launching ${id.replace(/-/g, ' ')}! This is a placeholder.`);
      });
    }
  });
}

/**
 * Sets up the community join buttons
 */
function setupCommunityJoinButtons() {
  const joinButtons = [
    'join-book-club', 
    'join-code-review', 
    'join-career-network', 
    'browse-study-groups'
  ];
  
  joinButtons.forEach(id => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', () => {
        // In a production app, this would open join forms or details
        alert(`Opening ${id.replace(/join-|browse-/g, '').replace(/-/g, ' ')} information! This is a placeholder.`);
      });
    }
  });
}