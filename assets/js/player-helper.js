/**
 * Player Helper Module
 * 
 * Provides additional utility functions to help debug and test the
 * Web3 streaming player functionality.
 */

class PlayerHelper {
  constructor(options = {}) {
    this.walletConnector = options.walletConnector;
    this.contractManager = options.contractManager;
    this.videoLoader = options.videoLoader || new VideoLoader();
    this.networkConfig = options.networkConfig || new NetworkConfig();
    
    this.debug = localStorage.getItem('web3StreamingDebug') === 'true';
    
    if (this.debug) {
      console.log('PlayerHelper initialized in debug mode');
    }
    
    // Make helper accessible globally for console debugging
    window.playerHelper = this;
  }
  
  /**
   * Enable debug mode
   */
  enableDebug() {
    localStorage.setItem('web3StreamingDebug', 'true');
    this.debug = true;
    console.log('Debug mode enabled');
  }
  
  /**
   * Disable debug mode
   */
  disableDebug() {
    localStorage.removeItem('web3StreamingDebug');
    this.debug = false;
    console.log('Debug mode disabled');
  }
  
  /**
   * Get a quick status report of the current player state
   */
  async getStatusReport() {
    const report = {
      wallet: {
        isConnected: false,
        isDemoMode: false,
        address: null,
        network: null
      },
      contracts: {
        streamingToken: null,
        contentRegistry: null,
        isInitialized: false
      },
      player: {
        currentContent: null,
        accessStatus: null,
        timeRemaining: null
      },
      userBalance: null
    };
    
    // Get wallet info
    if (this.walletConnector) {
      const state = this.walletConnector.getConnectionState();
      report.wallet.isConnected = state.isConnected;
      report.wallet.isDemoMode = state.isDemoMode;
      report.wallet.address = state.address;
      
      if (state.chainId) {
        report.wallet.network = this.networkConfig.getNetworkName(state.chainId);
        
        // Get contracts info
        const addresses = this.networkConfig.getContractAddresses(state.chainId);
        report.contracts.streamingToken = addresses.streamingToken;
        report.contracts.contentRegistry = addresses.contentRegistry;
      }
    }
    
    // Get contract status
    if (this.contractManager) {
      report.contracts.isInitialized = !!this.contractManager.contracts.streamingToken;
      
      // Get user balance
      if (report.contracts.isInitialized && report.wallet.isConnected) {
        try {
          const balance = await this.contractManager.getBalance();
          report.userBalance = balance.toString();
        } catch (error) {
          report.userBalance = "Error fetching balance";
        }
      }
    }
    
    // Get player status
    const contentIdElement = document.getElementById('content-id');
    if (contentIdElement) {
      const contentId = contentIdElement.textContent;
      report.player.currentContent = contentId;
      
      if (report.contracts.isInitialized && report.wallet.isConnected) {
        try {
          const canStream = await this.contractManager.checkStreamAccess(contentId);
          report.player.accessStatus = canStream ? "Active" : "Inactive";
          
          if (canStream) {
            try {
              const expiry = await this.contractManager.getStreamExpiry(contentId);
              const now = Math.floor(Date.now() / 1000);
              report.player.timeRemaining = Math.max(0, expiry - now);
            } catch (e) {
              report.player.timeRemaining = "Error fetching time";
            }
          }
        } catch (error) {
          report.player.accessStatus = "Error checking access";
        }
      }
    }
    
    if (this.debug) {
      console.log('Player Status Report:', report);
    }
    
    return report;
  }
  
  /**
   * Quick helper to purchase credits
   * @param {string} ethAmount - Amount of ETH to spend
   */
  async quickPurchaseCredits(ethAmount = '0.01') {
    if (!this.contractManager) {
      throw new Error('Contract manager not initialized');
    }
    
    this.log(`Purchasing credits with ${ethAmount} ETH...`);
    
    try {
      const receipt = await this.contractManager.purchaseCredits(ethAmount);
      this.log('Credits purchased successfully!', receipt);
      return receipt;
    } catch (error) {
      this.log('Error purchasing credits:', error);
      throw error;
    }
  }
  
  /**
   * Quick helper to start a stream
   * @param {string} contentId - Content ID to stream
   */
  async quickStartStream(contentId) {
    if (!this.contractManager) {
      throw new Error('Contract manager not initialized');
    }
    
    if (!contentId) {
      const contentIdElement = document.getElementById('content-id');
      contentId = contentIdElement ? contentIdElement.textContent : 'content_001';
    }
    
    this.log(`Starting stream for content: ${contentId}...`);
    
    try {
      const receipt = await this.contractManager.startStream(contentId);
      this.log('Stream started successfully!', receipt);
      
      // Load video content
      const content = this.videoLoader.getDemoContent(contentId);
      
      if (content) {
        this.log('Loading content:', content);
        this.videoLoader.loadVideo(content.ipfsCid, (videoUrl, error) => {
          if (error) {
            this.log('Error loading video:', error);
          } else {
            this.log('Video loaded at URL:', videoUrl);
            
            // Update player if it exists
            const videoPlayer = document.getElementById('video-player');
            if (videoPlayer) {
              videoPlayer.src = videoUrl;
              videoPlayer.style.display = 'block';
              
              const placeholder = document.getElementById('player-placeholder');
              if (placeholder) {
                placeholder.style.display = 'none';
              }
              
              videoPlayer.play().catch(e => this.log('Auto-play prevented:', e));
            }
          }
        });
      }
      
      return receipt;
    } catch (error) {
      this.log('Error starting stream:', error);
      throw error;
    }
  }
  
  /**
   * Register new content
   * @param {string} contentId - Content ID
   * @param {string} cid - IPFS CID
   * @param {Object} metadata - Content metadata
   */
  async registerContent(contentId, cid, metadata = {}) {
    if (!this.contractManager || !this.contractManager.contracts.contentRegistry) {
      throw new Error('Content registry contract not initialized');
    }
    
    this.log(`Registering content: ${contentId} with CID: ${cid}...`);
    
    try {
      const contentRegistryAddress = await this.contractManager.contracts.contentRegistry.getAddress();
      
      const metadataJSON = JSON.stringify(metadata);
      const contentUri = `ipfs://${cid}`;
      const price = ethers.utils.parseEther('1'); // 1 STRM token
      
      const tx = await this.contractManager.contracts.contentRegistry.registerContent(
        contentId,
        contentUri,
        price,
        metadataJSON
      );
      
      this.log('Content registration submitted:', tx.hash);
      
      const receipt = await tx.wait();
      this.log('Content registered successfully!', receipt);
      return receipt;
    } catch (error) {
      this.log('Error registering content:', error);
      throw error;
    }
  }
  
  /**
   * Enable auto-commit for streaming transactions
   * @param {number} durationHours - Duration in hours to auto-commit (default: 1 hour)
   * @returns {Object} Result with expiry info
   */
  enableAutoCommit(durationHours = 1) {
    if (!this.contractManager) {
      throw new Error('Contract manager not initialized');
    }
    
    const durationSeconds = durationHours * 3600;
    const expiryTimestamp = this.contractManager.enableAutoCommit(durationSeconds);
    const expiryDate = new Date(expiryTimestamp * 1000);
    
    this.log(`Auto-commit enabled for ${durationHours} hour(s) until ${expiryDate.toLocaleString()}`);
    
    return {
      enabled: true,
      expiryTimestamp,
      expiryDate,
      durationHours
    };
  }
  
  /**
   * Disable auto-commit for streaming transactions
   */
  disableAutoCommit() {
    if (!this.contractManager) {
      throw new Error('Contract manager not initialized');
    }
    
    this.contractManager.disableAutoCommit();
    this.log('Auto-commit disabled');
    
    return {
      enabled: false
    };
  }
  
  /**
   * Check auto-commit status
   * @returns {Object} Auto-commit status info
   */
  getAutoCommitStatus() {
    if (!this.contractManager) {
      return { enabled: false, error: 'Contract manager not initialized' };
    }
    
    const isEnabled = this.contractManager.isAutoCommitEnabled();
    const remainingSeconds = this.contractManager.getAutoCommitTimeRemaining();
    const remainingMinutes = Math.floor(remainingSeconds / 60);
    const remainingHours = Math.floor(remainingMinutes / 60);
    
    return {
      enabled: isEnabled,
      remainingSeconds,
      remainingMinutes,
      remainingHours,
      expiryDate: isEnabled ? new Date((Math.floor(Date.now() / 1000) + remainingSeconds) * 1000) : null
    };
  }
  
  /**
   * Log message if debug mode is enabled
   * @private
   */
  log(...args) {
    if (this.debug) {
      console.log('[PlayerHelper]', ...args);
    }
  }
}

// For use in browser environment
if (typeof window !== 'undefined') {
  window.PlayerHelper = PlayerHelper;
}

// For use in Node.js environment
if (typeof module !== 'undefined') {
  module.exports = PlayerHelper;
}
