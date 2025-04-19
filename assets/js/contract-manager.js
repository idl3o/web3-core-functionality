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
}
