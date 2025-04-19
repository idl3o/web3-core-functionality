/**
 * @license
 * Web3 Crypto Streaming Service
 * Copyright (c) 2023-2025 idl3o-redx
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * IPFSStreaming class
 * 
 * Manages streaming of content from IPFS and handles payment channels
 * for Web3 streaming platform
 */
class IPFSStreaming {
  /**
   * Create an IPFS streaming manager
   * @param {Object} options - Configuration options
   * @param {WalletConnector} options.walletConnector - Wallet connector instance
   * @param {ContractManager} options.contractManager - Contract manager instance
   * @param {NetworkConfig} options.networkConfig - Network configuration
   */
  constructor(options = {}) {
    this.walletConnector = options.walletConnector;
    this.contractManager = options.contractManager;
    this.networkConfig = options.networkConfig;
    this.ipfs = null;
    this.gateways = [
      'https://ipfs.io/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/',
      'https://gateway.pinata.cloud/ipfs/',
      'https://ipfs.infura.io/ipfs/'
    ];
    this.currentGatewayIndex = 0;
    this.contentMetadata = {};
    this.streamingActive = false;
    this.streamTickInterval = null;
    this.paymentChannelOpen = false;
    this.paymentChannelId = null;
    this.paymentInterval = null;
    this.debugMode = false;
    this.eventListeners = {};
    
    // Stream quality settings
    this.qualityLevels = {
      low: { bitrate: '500kbps', resolution: '480p' },
      medium: { bitrate: '1000kbps', resolution: '720p' },
      high: { bitrate: '2500kbps', resolution: '1080p' }
    };
    this.currentQuality = 'medium';
    
    // Initialize IPFS client
    this.initializeIPFS();
  }

  /**
   * Initialize IPFS client (browser version)
   * @private
   */
  async initializeIPFS() {
    try {
      if (window.IpfsHttpClient) {
        this.ipfs = window.IpfsHttpClient.create({
          host: 'ipfs.infura.io',
          port: 5001,
          protocol: 'https'
        });
        console.log('IPFS client initialized');
      } else {
        console.warn('IPFS client not available, using gateway fallback');
      }
    } catch (error) {
      console.error('Error initializing IPFS client:', error);
    }
  }

  /**
   * Get next IPFS gateway URL in rotation
   * @private
   * @returns {string} Gateway URL
   */
  getNextGateway() {
    const gateway = this.gateways[this.currentGatewayIndex];
    this.currentGatewayIndex = (this.currentGatewayIndex + 1) % this.gateways.length;
    return gateway;
  }

  /**
   * Set preferred quality level for streaming
   * @param {string} quality - Quality level (low, medium, high)
   */
  setQuality(quality) {
    if (this.qualityLevels[quality]) {
      this.currentQuality = quality;
      return true;
    }
    return false;
  }

  /**
   * Load content metadata from IPFS
   * @param {string} contentId - Content identifier
   * @returns {Promise<Object>} Content metadata
   */
  async getContentMetadata(contentId) {
    try {
      // Check if we already have this metadata cached
      if (this.contentMetadata[contentId]) {
        return this.contentMetadata[contentId];
      }
      
      // Try to fetch metadata from each gateway
      for (let i = 0; i < this.gateways.length; i++) {
        const gateway = this.gateways[i];
        try {
          // For a real implementation, metadata would be at a known IPFS location
          // For this demo, simulate with a JSON fetch with timeout
          const response = await Promise.race([
            fetch(`${gateway}${contentId}/metadata.json`),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Gateway timeout')), 5000)
            )
          ]);
          
          if (response.ok) {
            const metadata = await response.json();
            // Cache the metadata
            this.contentMetadata[contentId] = metadata;
            this.triggerEvent('metadataLoaded', { contentId, metadata });
            return metadata;
          }
        } catch (error) {
          console.warn(`Failed to fetch metadata from ${gateway}:`, error.message);
          // Continue to next gateway
        }
      }
      
      // If we get here, all gateways failed
      throw new Error('Failed to load content metadata from all gateways');
    } catch (error) {
      console.error('Error getting content metadata:', error);
      throw error;
    }
  }

  /**
   * Start streaming content from IPFS
   * @param {string} contentId - Content identifier (IPFS CID)
   * @param {HTMLVideoElement} videoElement - Video element to stream to
   * @returns {Promise<boolean>} Success indicator
   */
  async startStream(contentId, videoElement) {
    try {
      if (!this.walletConnector.isConnected()) {
        throw new Error('Wallet not connected');
      }
      
      // Check if user has access to this content
      const hasAccess = await this.checkAccess(contentId);
      
      if (!hasAccess) {
        // If no access, try to purchase access
        const purchased = await this.purchaseAccess(contentId);
        if (!purchased) {
          throw new Error('Failed to purchase access to content');
        }
      }
      
      // Get content metadata (this would include the actual video CID)
      let metadata;
      try {
        metadata = await this.getContentMetadata(contentId);
      } catch (error) {
        // For demo purposes, create some default metadata
        metadata = {
          title: 'Demo Content',
          description: 'Demo streaming content with IPFS',
          videoCid: contentId,
          creator: '0x123...456',
          duration: 300,
          format: 'mp4',
          quality: {
            low: `${contentId}/480p.mp4`,
            medium: `${contentId}/720p.mp4`,
            high: `${contentId}/1080p.mp4`
          }
        };
      }
      
      // Get video URL for current quality
      const videoCid = metadata.quality?.[this.currentQuality] || metadata.videoCid || contentId;
      
      // Try to stream from each gateway until one works
      let streamSuccess = false;
      for (let i = 0; i < this.gateways.length && !streamSuccess; i++) {
        const gateway = this.gateways[i];
        try {
          const videoUrl = `${gateway}${videoCid}`;
          
          // Set the video source
          videoElement.src = videoUrl;
          videoElement.load();
          
          // Check if video can play from this source
          await new Promise((resolve, reject) => {
            const canplayHandler = () => {
              videoElement.removeEventListener('canplay', canplayHandler);
              videoElement.removeEventListener('error', errorHandler);
              resolve();
            };
            
            const errorHandler = (event) => {
              videoElement.removeEventListener('canplay', canplayHandler);
              videoElement.removeEventListener('error', errorHandler);
              reject(new Error('Video cannot be played from this source'));
            };
            
            videoElement.addEventListener('canplay', canplayHandler);
            videoElement.addEventListener('error', errorHandler);
            
            // Set a timeout in case neither event fires
            setTimeout(() => {
              videoElement.removeEventListener('canplay', canplayHandler);
              videoElement.removeEventListener('error', errorHandler);
              reject(new Error('Video source loading timeout'));
            }, 5000);
          });
          
          // If we get here, the video can play
          streamSuccess = true;
          
          // Start the streaming session
          this.streamingActive = true;
          this.openPaymentChannel(contentId);
          this.startStreamTicking(contentId);
          
          // Trigger event
          this.triggerEvent('streamStarted', { contentId, metadata, gateway });
          
          // Start video playback
          try {
            await videoElement.play();
          } catch (playError) {
            console.warn('Autoplay prevented, user must click play:', playError);
            // This is not a fatal error, user can still click play
          }
          
        } catch (gatewayError) {
          console.warn(`Failed to stream from gateway ${gateway}:`, gatewayError);
          // Continue to next gateway
        }
      }
      
      if (!streamSuccess) {
        // All gateways failed, try local fallback for demo
        console.log('All IPFS gateways failed, using local fallback');
        videoElement.src = 'assets/videos/consensus-mechanisms.mp4';
        videoElement.load();
        
        // Consider this a partial success for demo purposes
        this.streamingActive = true;
        this.triggerEvent('streamStarted', { 
          contentId, 
          metadata, 
          gateway: 'local-fallback',
          fallback: true
        });
        
        // No payment channel needed for fallback
        return true;
      }
      
      return streamSuccess;
    } catch (error) {
      console.error('Error starting IPFS stream:', error);
      this.triggerEvent('streamError', { contentId, error: error.message });
      throw error;
    }
  }

  /**
   * Check if user has access to stream content
   * @param {string} contentId - Content identifier
   * @returns {Promise<boolean>} Access status
   */
  async checkAccess(contentId) {
    try {
      if (!this.contractManager.getContract('streamingToken')) {
        // If no contract available yet, try to load it
        await this.loadStreamingContract();
      }
      
      return await this.contractManager.checkStreamAccess(contentId);
    } catch (error) {
      console.error('Error checking access:', error);
      
      // For demo purposes, return true sometimes
      if (error.message.includes('Contract streamingToken not loaded')) {
        console.log('Demo mode: Allowing access without contract');
        return true;
      }
      
      return false;
    }
  }

  /**
   * Load the streaming token contract
   * @private
   */
  async loadStreamingContract() {
    try {
      // Get contract address from network config
      const networkId = await this.walletConnector.getNetworkId();
      const networkConfig = this.networkConfig.getNetworkConfig(networkId);
      
      if (!networkConfig || !networkConfig.contracts || !networkConfig.contracts.streamingToken) {
        throw new Error(`No contract configuration for network ${networkId}`);
      }
      
      const contractAddress = networkConfig.contracts.streamingToken.address;
      const contractAbi = networkConfig.contracts.streamingToken.abi;
      
      // Load contract
      await this.contractManager.loadContract('streamingToken', contractAddress, contractAbi);
      return true;
    } catch (error) {
      console.error('Error loading streaming contract:', error);
      return false;
    }
  }

  /**
   * Purchase access to content
   * @param {string} contentId - Content identifier
   * @returns {Promise<boolean>} Purchase success
   */
  async purchaseAccess(contentId) {
    try {
      if (!this.contractManager.getContract('streamingToken')) {
        await this.loadStreamingContract();
      }
      
      // Check token balance first
      try {
        const balance = await this.getTokenBalance();
        if (parseFloat(balance) < 1) {
          // Need to purchase tokens
          const purchased = await this.purchaseTokens('0.01'); // Default small amount
          if (!purchased) {
            throw new Error('Failed to purchase streaming tokens');
          }
        }
      } catch (balanceError) {
        console.warn('Error checking token balance:', balanceError);
        // Try to purchase tokens anyway
        await this.purchaseTokens('0.01');
      }
      
      // Start stream with token
      await this.contractManager.startStream(contentId);
      return true;
    } catch (error) {
      console.error('Error purchasing access:', error);
      
      // For demo purposes, simulate success sometimes
      const demoMode = true; // Toggle for demo
      if (demoMode) {
        console.log('Demo mode: Simulating successful purchase');
        return true;
      }
      
      return false;
    }
  }

  /**
   * Purchase streaming tokens
   * @param {string} ethAmount - Amount of ETH to spend
   * @returns {Promise<boolean>} Purchase success
   */
  async purchaseTokens(ethAmount) {
    try {
      if (!this.contractManager.getContract('streamingToken')) {
        await this.loadStreamingContract();
      }
      
      // Use auto-commit if enabled
      const useAutoCommit = this.contractManager.isAutoCommitEnabled();
      
      // Purchase credits
      await this.contractManager.purchaseCredits(ethAmount, useAutoCommit);
      this.triggerEvent('tokensPurchased', { amount: ethAmount });
      return true;
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      
      // Demo mode
      const demoMode = true;
      if (demoMode) {
        console.log('Demo mode: Simulating successful token purchase');
        this.triggerEvent('tokensPurchased', { 
          amount: ethAmount, 
          demo: true 
        });
        return true;
      }
      
      return false;
    }
  }

  /**
   * Get token balance
   * @returns {Promise<string>} Token balance
   */
  async getTokenBalance() {
    try {
      if (!this.contractManager.getContract('streamingToken')) {
        await this.loadStreamingContract();
      }
      
      // Get network config for token address
      const networkId = await this.walletConnector.getNetworkId();
      const networkConfig = this.networkConfig.getNetworkConfig(networkId);
      
      if (!networkConfig || !networkConfig.contracts || !networkConfig.contracts.streamingToken) {
        throw new Error(`No contract configuration for network ${networkId}`);
      }
      
      const tokenAddress = networkConfig.contracts.streamingToken.address;
      return await this.contractManager.getTokenBalance(tokenAddress);
    } catch (error) {
      console.error('Error getting token balance:', error);
      
      // Demo mode
      return '10'; // Demo balance
    }
  }

  /**
   * Open payment channel for streaming
   * @param {string} contentId - Content identifier
   * @private
   */
  async openPaymentChannel(contentId) {
    try {
      // Generate a payment channel ID
      this.paymentChannelId = `pc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      this.paymentChannelOpen = true;
      
      // Log channel opening
      console.log(`Payment channel ${this.paymentChannelId} opened for content ${contentId}`);
      
      // Enable auto-commit if not already enabled
      if (!this.contractManager.isAutoCommitEnabled()) {
        this.contractManager.enableAutoCommit(3600); // 1 hour default
      }
      
      // Set up payment interval (in a real implementation, this would make micro-payments)
      this.paymentInterval = setInterval(() => {
        this.processStreamingPayment(contentId);
      }, 60000); // Every minute for demo
      
      this.triggerEvent('paymentChannelOpened', { 
        channelId: this.paymentChannelId, 
        contentId 
      });
      
      return true;
    } catch (error) {
      console.error('Error opening payment channel:', error);
      return false;
    }
  }

  /**
   * Process streaming payment
   * @param {string} contentId - Content identifier
   * @private
   */
  async processStreamingPayment(contentId) {
    if (!this.streamingActive || !this.paymentChannelOpen) {
      return;
    }
    
    try {
      // In a real implementation, this would send a micropayment
      // For demo, just log the payment
      if (this.debugMode) {
        console.log(`Processing payment for content ${contentId} in channel ${this.paymentChannelId}`);
      }
      
      this.triggerEvent('paymentProcessed', {
        channelId: this.paymentChannelId,
        contentId,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  }

  /**
   * Start stream ticking (for tracking stream time)
   * @param {string} contentId - Content identifier
   * @private
   */
  startStreamTicking(contentId) {
    // Clear any existing interval
    if (this.streamTickInterval) {
      clearInterval(this.streamTickInterval);
    }
    
    // Create new interval
    let tickCount = 0;
    this.streamTickInterval = setInterval(() => {
      tickCount++;
      
      // Trigger tick event
      this.triggerEvent('streamTick', {
        contentId,
        tickCount,
        seconds: tickCount * 10,
        channelId: this.paymentChannelId
      });
      
    }, 10000); // Tick every 10 seconds
  }

  /**
   * Stop streaming content
   * @returns {Promise<boolean>} Success indicator
   */
  async stopStream() {
    try {
      // Clear intervals
      if (this.streamTickInterval) {
        clearInterval(this.streamTickInterval);
        this.streamTickInterval = null;
      }
      
      if (this.paymentInterval) {
        clearInterval(this.paymentInterval);
        this.paymentInterval = null;
      }
      
      // Close payment channel
      if (this.paymentChannelOpen) {
        console.log(`Closing payment channel ${this.paymentChannelId}`);
        this.paymentChannelOpen = false;
        
        this.triggerEvent('paymentChannelClosed', { 
          channelId: this.paymentChannelId 
        });
      }
      
      // Mark streaming as inactive
      this.streamingActive = false;
      
      this.triggerEvent('streamStopped');
      return true;
    } catch (error) {
      console.error('Error stopping stream:', error);
      return false;
    }
  }

  /**
   * Enable debug mode
   */
  enableDebug() {
    this.debugMode = true;
  }

  /**
   * Disable debug mode
   */
  disableDebug() {
    this.debugMode = false;
  }

  /**
   * Add event listener
   * @param {string} eventName - Event name
   * @param {Function} callback - Event callback
   */
  addEventListener(eventName, callback) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(callback);
  }

  /**
   * Remove event listener
   * @param {string} eventName - Event name
   * @param {Function} callback - Event callback to remove
   */
  removeEventListener(eventName, callback) {
    if (!this.eventListeners[eventName]) return;
    
    this.eventListeners[eventName] = this.eventListeners[eventName]
      .filter(cb => cb !== callback);
  }

  /**
   * Trigger event
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   * @private
   */
  triggerEvent(eventName, data = {}) {
    if (!this.eventListeners[eventName]) return;
    
    for (const callback of this.eventListeners[eventName]) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${eventName} event handler:`, error);
      }
    }
  }
  
  /**
   * Get streaming status
   * @returns {Object} Status object
   */
  getStatus() {
    return {
      streamingActive: this.streamingActive,
      currentQuality: this.currentQuality,
      paymentChannelOpen: this.paymentChannelOpen,
      paymentChannelId: this.paymentChannelId,
      autoCommitEnabled: this.contractManager?.isAutoCommitEnabled() || false,
      autoCommitTimeRemaining: this.contractManager?.getAutoCommitTimeRemaining() || 0,
      timestamp: Date.now()
    };
  }
}

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IPFSStreaming;
}