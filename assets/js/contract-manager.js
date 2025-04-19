/**
 * ContractManager class for managing smart contract interactions
 * @class
 */
class ContractManager {
  /**
   * Create a contract manager
   * @param {Object} options - Configuration options
   * @param {WalletConnector} options.walletConnector - Wallet connector instance
   */
  constructor(options = {}) {
    this.walletConnector = options.walletConnector;
    this.contracts = {};
    this.ethers = null;
    
    // Initialize ethers
    this.initializeEthers();
    
    // Auto-commit settings
    this.autoCommitEnabled = localStorage.getItem('web3StreamingAutoCommit') === 'true';
    this.autoCommitExpiry = parseInt(localStorage.getItem('web3StreamingAutoCommitExpiry') || '0', 10);
    this.autoCommitDuration = parseInt(localStorage.getItem('web3StreamingAutoCommitDuration') || '3600', 10); // Default 1 hour
  }

  /**
   * Initialize ethers library
   * @private
   */
  async initializeEthers() {
    // Check if ethers is already loaded
    if (window.ethers) {
      this.ethers = window.ethers;
    } else {
      // Try to load ethers from CDN
      try {
        await this.loadScript('https://cdn.ethers.io/lib/ethers-5.7.umd.min.js');
        if (window.ethers) {
          this.ethers = window.ethers;
        } else {
          console.error('Failed to load ethers.js');
        }
      } catch (error) {
        console.error('Error loading ethers.js:', error);
      }
    }
  }

  /**
   * Load a script from URL
   * @param {string} url - Script URL
   * @returns {Promise<void>} Promise that resolves when script is loaded
   * @private
   */
  loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Load a contract
   * @param {string} name - Contract name
   * @param {string} address - Contract address
   * @param {Array} abi - Contract ABI
   * @returns {Object} Contract instance
   */
  async loadContract(name, address, abi) {
    if (!this.ethers) {
      await this.initializeEthers();
      if (!this.ethers) {
        throw new Error('ethers.js not available');
      }
    }
    
    if (!this.walletConnector.isConnected()) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const provider = new this.ethers.providers.Web3Provider(this.walletConnector.provider);
      const signer = provider.getSigner();
      const contract = new this.ethers.Contract(address, abi, signer);
      
      this.contracts[name] = contract;
      return contract;
    } catch (error) {
      console.error(`Error loading contract ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get a loaded contract
   * @param {string} name - Contract name
   * @returns {Object|null} Contract instance or null if not loaded
   */
  getContract(name) {
    return this.contracts[name] || null;
  }

  /**
   * Call a read-only contract method
   * @param {string} contractName - Contract name
   * @param {string} method - Method name
   * @param {Array} args - Method arguments
   * @returns {Promise<any>} Method result
   */
  async callMethod(contractName, method, ...args) {
    const contract = this.getContract(contractName);
    if (!contract) {
      throw new Error(`Contract ${contractName} not loaded`);
    }
    
    try {
      return await contract[method](...args);
    } catch (error) {
      console.error(`Error calling method ${method} on contract ${contractName}:`, error);
      throw error;
    }
  }

  /**
   * Send a transaction to a contract method
   * @param {string} contractName - Contract name
   * @param {string} method - Method name
   * @param {Array} args - Method arguments
   * @param {Object} options - Transaction options (gasLimit, value, etc.)
   * @returns {Promise<Object>} Transaction receipt
   */
  async sendTransaction(contractName, method, args = [], options = {}) {
    const contract = this.getContract(contractName);
    if (!contract) {
      throw new Error(`Contract ${contractName} not loaded`);
    }
    
    try {
      const tx = await contract[method](...args, options);
      return await tx.wait();
    } catch (error) {
      console.error(`Error sending transaction to method ${method} on contract ${contractName}:`, error);
      throw error;
    }
  }

  /**
   * Get current user's balance of a token
   * @param {string} tokenAddress - Token contract address
   * @returns {Promise<string>} Token balance as string
   */
  async getTokenBalance(tokenAddress) {
    if (!this.ethers) {
      await this.initializeEthers();
      if (!this.ethers) {
        throw new Error('ethers.js not available');
      }
    }
    
    if (!this.walletConnector.isConnected()) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const provider = new this.ethers.providers.Web3Provider(this.walletConnector.provider);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      
      // ERC20 minimal ABI for balanceOf
      const minABI = [
        {
          constant: true,
          inputs: [{ name: "_owner", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "balance", type: "uint256" }],
          type: "function"
        }
      ];
      
      const tokenContract = new this.ethers.Contract(tokenAddress, minABI, provider);
      const balance = await tokenContract.balanceOf(userAddress);
      
      return balance.toString();
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  }

  /**
   * Enable auto-commit for streaming transactions
   * @param {number} duration - Duration in seconds to auto-commit (default: 1 hour)
   */
  enableAutoCommit(duration = 3600) {
    this.autoCommitEnabled = true;
    this.autoCommitDuration = duration;
    this.autoCommitExpiry = Math.floor(Date.now() / 1000) + duration;
    
    // Save settings to local storage
    localStorage.setItem('web3StreamingAutoCommit', 'true');
    localStorage.setItem('web3StreamingAutoCommitDuration', duration.toString());
    localStorage.setItem('web3StreamingAutoCommitExpiry', this.autoCommitExpiry.toString());
    
    console.log(`Auto-commit enabled for ${duration} seconds`);
    
    // Return expiry timestamp for display
    return this.autoCommitExpiry;
  }
  
  /**
   * Disable auto-commit for streaming transactions
   */
  disableAutoCommit() {
    this.autoCommitEnabled = false;
    this.autoCommitExpiry = 0;
    
    // Clear settings from local storage
    localStorage.setItem('web3StreamingAutoCommit', 'false');
    localStorage.setItem('web3StreamingAutoCommitExpiry', '0');
    
    console.log('Auto-commit disabled');
  }
  
  /**
   * Check if auto-commit is currently enabled and valid
   * @returns {boolean} True if auto-commit is enabled and not expired
   */
  isAutoCommitEnabled() {
    if (!this.autoCommitEnabled) return false;
    
    // Check if auto-commit has expired
    const now = Math.floor(Date.now() / 1000);
    if (now > this.autoCommitExpiry) {
      // Auto-commit has expired, disable it
      this.disableAutoCommit();
      return false;
    }
    
    return true;
  }
  
  /**
   * Get remaining time for auto-commit in seconds
   * @returns {number} Seconds remaining for auto-commit (0 if disabled)
   */
  getAutoCommitTimeRemaining() {
    if (!this.autoCommitEnabled) return 0;
    
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, this.autoCommitExpiry - now);
  }

  /**
   * Start a stream for content
   * @param {string} contentId - Content ID to stream
   * @param {boolean} useAutoCommit - Whether to use auto-commit if enabled
   * @returns {Promise<Object>} Transaction receipt
   */
  async startStream(contentId, useAutoCommit = true) {
    const streamToken = this.getContract('streamingToken');
    if (!streamToken) {
      throw new Error('StreamingToken contract not loaded');
    }
    
    try {
      // Check if we should use auto-commit
      if (useAutoCommit && this.isAutoCommitEnabled()) {
        console.log(`Using auto-commit for streaming ${contentId}`);
        // Execute transaction with pre-approved auto-commit
        const tx = await streamToken.startStream(contentId);
        return await tx.wait();
      } else {
        // Normal flow requiring manual confirmation
        const tx = await streamToken.startStream(contentId);
        return await tx.wait();
      }
    } catch (error) {
      console.error(`Error starting stream for ${contentId}:`, error);
      throw error;
    }
  }

  /**
   * Purchase credits with ETH
   * @param {string} ethAmount - Amount of ETH to spend
   * @param {boolean} useAutoCommit - Whether to use auto-commit if enabled
   * @returns {Promise<Object>} Transaction receipt
   */
  async purchaseCredits(ethAmount, useAutoCommit = true) {
    const streamToken = this.getContract('streamingToken');
    if (!streamToken) {
      throw new Error('StreamingToken contract not loaded');
    }
    
    try {
      const options = { 
        value: this.ethers.utils.parseEther(ethAmount) 
      };
      
      // Check if we should use auto-commit
      if (useAutoCommit && this.isAutoCommitEnabled()) {
        console.log(`Using auto-commit for purchasing credits with ${ethAmount} ETH`);
        // Execute transaction with pre-approved auto-commit
        const tx = await streamToken.purchaseCredits(options);
        return await tx.wait();
      } else {
        // Normal flow requiring manual confirmation
        const tx = await streamToken.purchaseCredits(options);
        return await tx.wait();
      }
    } catch (error) {
      console.error(`Error purchasing credits with ${ethAmount} ETH:`, error);
      throw error;
    }
  }

  /**
   * Check if user has access to stream content
   * @param {string} contentId - Content ID to check
   * @returns {Promise<boolean>} True if user has access
   */
  async checkStreamAccess(contentId) {
    const streamToken = this.getContract('streamingToken');
    if (!streamToken) {
      throw new Error('StreamingToken contract not loaded');
    }
    
    try {
      const provider = new this.ethers.providers.Web3Provider(this.walletConnector.provider);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      
      return await streamToken.canStream(userAddress, contentId);
    } catch (error) {
      console.error(`Error checking stream access for ${contentId}:`, error);
      throw error;
    }
  }

  /**
   * Get stream expiry time
   * @param {string} contentId - Content ID to check
   * @returns {Promise<number>} Expiry timestamp
   */
  async getStreamExpiry(contentId) {
    const streamToken = this.getContract('streamingToken');
    if (!streamToken) {
      throw new Error('StreamingToken contract not loaded');
    }
    
    try {
      const provider = new this.ethers.providers.Web3Provider(this.walletConnector.provider);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      
      const expiryBN = await streamToken.streamExpiry(userAddress, contentId);
      return expiryBN.toNumber();
    } catch (error) {
      console.error(`Error getting stream expiry for ${contentId}:`, error);
      throw error;
    }
  }
}
