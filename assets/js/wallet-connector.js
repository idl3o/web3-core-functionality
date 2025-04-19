/**
 * WalletConnector class for handling Web3 wallet connections
 * @class
 */
class WalletConnector {
  /**
   * Create a wallet connector
   * @param {Object} options - Configuration options
   * @param {Array<number>} options.supportedNetworks - List of supported network IDs
   * @param {number} options.preferredNetwork - Preferred network ID
   */
  constructor(options = {}) {
    this.supportedNetworks = options.supportedNetworks || [1, 5, 56, 97];
    this.preferredNetwork = options.preferredNetwork || 1;
    this.provider = null;
    this.accounts = [];
    this.networkId = null;
    this.eventListeners = {};
    this.initialize();
  }

  /**
   * Initialize wallet connection if previously connected
   * @private
   */
  async initialize() {
    // Check if ethereum is available
    if (window.ethereum) {
      this.provider = window.ethereum;
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Check if already connected
      try {
        const accounts = await this.provider.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          this.accounts = accounts;
          this.networkId = await this.getNetworkId();
          this.triggerEvent('connectionChanged', { connected: true, address: accounts[0] });
        } // Validate if current network is supported
      } catch (error) {portedNetworks.includes(this.networkId)) {
        console.error('Error checking connection:', error);ID: ${this.networkId}. Supported networks are: ${this.supportedNetworks.join(', ')}`);
      }   }
    }     
  }       // Emit connection event
          this.triggerEvent('connectionChanged', { connected: true, address: accounts[0] });
  /**     
   * Set up event listeners for the Ethereum provideretworks
   * @privates.initializeForNetwork(this.networkId);
   */   }
  setupEventListeners() {
    if (!this.provider) return;ecking connection:', error);
      }
    this.provider.on('accountsChanged', (accounts) => {
      this.accounts = accounts;less common now)
      this.triggerEvent('accountsChanged', accounts);nsider using a more modern Ethereum provider.');
      this.triggerEvent('connectionChanged', { er;
        connected: accounts.length > 0,
        address: accounts.length > 0 ? accounts[0] : null
      }); {
    }); if (this.provider.selectedAddress) {
          this.accounts = [this.provider.selectedAddress];
    this.provider.on('chainChanged', (chainIdHex) => {nected: true, address: this.provider.selectedAddress });
      this.networkId = parseInt(chainIdHex, 16);
      this.triggerEvent('networkChanged', this.networkId);
    }); console.error('Error with legacy provider:', error);
      }
    this.provider.on('disconnect', () => {
      this.accounts = [];lable
      this.triggerEvent('connectionChanged', { connected: false, address: null });k or another wallet extension.');
    });
  }
  
  /**
   * Connect to wallet-specific features for different networks
   * @returns {Promise<string>} Connected account address
   */@private
  async connect() {
    if (!window.ethereum) {k(networkId) {
      throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
    } // Network-specific initializations
      switch (networkId) {
    this.provider = window.ethereum;
          // Initialize mainnet-specific features
    try { this.triggerEvent('networkSpecificInit', { network: 'mainnet', features: ['high gas fees', 'large liquidity'] });
      // Request account access
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' });
      this.accounts = accounts;-specific features
          this.triggerEvent('networkSpecificInit', { network: 'goerli', features: ['test environment', 'faucets available'] });
      // Get current network
      this.networkId = await this.getNetworkId();
        case 97: // BSC Testnet
      // Check if network is supportedeatures
      if (!this.supportedNetworks.includes(this.networkId)) { 'binance', features: ['lower fees', 'faster blocks'] });
        await this.switchNetwork(this.preferredNetwork);
      } default:
          // Generic initialization for other networks
      this.triggerEvent('connectionChanged', { connected: true, address: accounts[0] });
      return accounts[0];
    } catch (error) {
      console.error('Error connecting to wallet:', error); basic transactions
      throw error;ounts.length > 0) {
    }   await this.checkBalance();
  }   }
    } catch (error) {
  /** console.error('Error in network-specific initialization:', error);
   * Disconnect from wallet
   */
  async disconnect() {
    // Note: There's no standard way to disconnect from browser wallets
    // We just clear our local state balance for transactions
    this.accounts = [];
    this.triggerEvent('connectionChanged', { connected: false, address: null });
  }sync checkBalance() {
    if (!this.provider) return;
  /**
   * Get current address
   * @returns {Promise<string|null>} Current account address or null if not connected
   */ const balanceHex = await this.provider.request({
  async getAddress() {etBalance',
    if (this.accounts.length === 0) return null;
    return this.accounts[0];
  }   
      const balance = parseInt(balanceHex, 16) / 1e18; // Convert to ETH
  /** 
   * Check if wallet is connected
   * @returns {boolean} True if connected, false otherwisece, sufficientFunds: balance > 0.001 });
   */ 
  isConnected() {balance is very low
    return this.accounts.length > 0;
  }     console.warn(`Account balance is low: ${balance} ETH. Some transactions may fail.`);
      }
  /** catch (error) {
   * Get current network IDchecking balance:', error);
   * @returns {Promise<number>} Network ID
   */
  async getNetworkId() {
    if (!this.provider) return null;
     Set up event listeners for the Ethereum provider
    try {vate
      const chainIdHex = await this.provider.request({ method: 'eth_chainId' });
      return parseInt(chainIdHex, 16);
    } catch (error) {r) return;
      console.error('Error getting network ID:', error);
      throw error;on('accountsChanged', (accounts) => {
    } this.accounts = accounts;
  }   this.triggerEvent('accountsChanged', accounts);
      this.triggerEvent('connectionChanged', { 
  /**   connected: accounts.length > 0,
   * Switch to a different network 0 ? accounts[0] : null
   * @param {number} networkId - Network ID to switch to
   */);
  async switchNetwork(networkId) {
    if (!this.provider) throw new Error('No provider available');
      this.networkId = parseInt(chainIdHex, 16);
    const networkMap = {'networkChanged', this.networkId);
      1: { chainId: '0x1', name: 'Ethereum Mainnet' },
      5: { chainId: '0x5', name: 'Goerli Testnet' },
      56: { chainId: '0x38', name: 'Binance Smart Chain' },
      97: { chainId: '0x61', name: 'BSC Testnet' }
    };this.triggerEvent('connectionChanged', { connected: false, address: null });
    });
    const network = networkMap[networkId];
    if (!network) throw new Error(`Network ID ${networkId} not supported`);
    *
    try {ect to wallet
      await this.provider.request({nected account address
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }]
      });window.ethereum) {
      throw new Error('No Ethereum provider found. Please install MetaMask or another wallet.');
      this.networkId = networkId;
      this.triggerEvent('networkChanged', networkId);
    } catch (error) {indow.ethereum;
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        // Add the networkccess
        try {ccounts = await this.provider.request({ method: 'eth_requestAccounts' });
          await this.addNetwork(networkId);
        } catch (addError) {
          throw addError;ork
        }s.networkId = await this.getNetworkId();
      } else {
        throw error;twork is supported
      }f (!this.supportedNetworks.includes(this.networkId)) {
    }   await this.switchNetwork(this.preferredNetwork);
  }   }
      
  /** this.triggerEvent('connectionChanged', { connected: true, address: accounts[0] });
   * Add a network to the wallet
   * @param {number} networkId - Network ID to add
   */ console.error('Error connecting to wallet:', error);
  async addNetwork(networkId) {
    if (!this.provider) throw new Error('No provider available');
    
    const networkParams = {
      1: {
        chainId: '0x1',llet
        chainName: 'Ethereum Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.infura.io/v3/'],from browser wallets
        blockExplorerUrls: ['https://etherscan.io']
      },.accounts = [];
      5: {riggerEvent('connectionChanged', { connected: false, address: null });
        chainId: '0x5',
        chainName: 'Goerli Testnet',
        nativeCurrency: { name: 'Goerli Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://goerli.infura.io/v3/'],
        blockExplorerUrls: ['https://goerli.etherscan.io']ss or null if not connected
      },
      56: {Address() {
        chainId: '0x38',ngth === 0) return null;
        chainName: 'Binance Smart Chain',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com']
      },ck if wallet is connected
      97: {ns {boolean} True if connected, false otherwise
        chainId: '0x61',
        chainName: 'BSC Testnet',
        nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
        rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
        blockExplorerUrls: ['https://testnet.bscscan.com']
      }
    };et current network ID
     @returns {Promise<number>} Network ID
    const params = networkParams[networkId];
    if (!params) throw new Error(`Network ID ${networkId} not supported`);
    if (!this.provider) return null;
    await this.provider.request({
      method: 'wallet_addEthereumChain',
      params: [params] = await this.provider.request({ method: 'eth_chainId' });
    });eturn parseInt(chainIdHex, 16);
  } } catch (error) {
      console.error('Error getting network ID:', error);
  /** throw error;
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {rk ID to switch to
      this.eventListeners[event] = [];
    }nc switchNetwork(networkId) {
    this.eventListeners[event].push(callback);ovider available');
  } 
    const networkMap = {
  /** 1: { chainId: '0x1', name: 'Ethereum Mainnet' },
   * Remove event listener name: 'Goerli Testnet' },
   * @param {string} event - Event nameance Smart Chain' },
   * @param {Function} callback - Callback function
   */;
  removeEventListener(event, callback) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
  } 
    try {
  /** await this.provider.request({
   * Trigger eventallet_switchEthereumChain',
   * @param {string} event - Event nameinId }]
   * @param {any} data - Event data
   * @private
   */ this.networkId = networkId;
  triggerEvent(event, data) {orkChanged', networkId);
    if (!this.eventListeners[event]) return;
    this.eventListeners[event].forEach(callback => callback(data));d to MetaMask
  }   if (error.code === 4902) {
       // Add the network
  /**        try {

































































































































































































































}  }    }      };        message: error.message         missing: ['error'],         ready: false,       return {       console.error(`Error checking readiness for ${feature}:`, error);    } catch (error) {      }          };            message: `Unknown feature: ${feature}`             missing: ['unknown'],             ready: false,           return {         default:                    };            message: 'Current network has limited NFT support'             missing: ['network'],             ready: false,           return {           }            return { ready: true };          if ([1, 5, 56, 137].includes(networkId)) {          // Check if network supports NFTs        case 'nft':                    };            message: 'Current network does not support standard ERC20 tokens'             missing: ['network'],             ready: false,           return {           }            return { ready: true };          if ([1, 3, 4, 5, 42, 56, 97, 137].includes(networkId)) {          // Check if network supports ERC20        case 'erc20':                    return { ready: true };          // All connected wallets should support signing        case 'signing':      switch (feature.toLowerCase()) {            const networkId = await this.getNetworkId();    try {        }      return { ready: false, missing: ['connection'], message: 'Wallet not connected' };    if (!this.isConnected()) {  async checkFeatureReadiness(feature) {   */   * @returns {Promise<Object>} Result with readiness status and any missing requirements   * @param {string} feature - Feature to check ('signing', 'erc20', 'nft', etc.)   * Check if the wallet is ready to use a specific feature  /**    }    }      throw error;      this.triggerEvent('signError', { message, error: error.message });      console.error('Error signing message:', error);    } catch (error) {      return signature;      this.triggerEvent('messageSigned', { message, signature });            });        params: [message, address]        method: 'personal_sign',      const signature = await this.provider.request({      const address = await this.getAddress();    try {        }      throw new Error('No provider available');    if (!this.provider) {        }      throw new Error('Wallet not connected');    if (!this.isConnected()) {  async signMessage(message) {   */   * @returns {Promise<string>} Signature   * @param {string} message - Message to sign   * Sign a message with the connected wallet  /**    }    return networks[networkId] || `Unknown Network (${networkId})`;        };      43113: 'Avalanche Fuji Testnet'      43114: 'Avalanche C-Chain',      80001: 'Mumbai Testnet',      137: 'Polygon Mainnet',      97: 'BSC Testnet',      56: 'Binance Smart Chain',      42: 'Kovan Testnet',      5: 'Goerli Testnet',      4: 'Rinkeby Testnet',      3: 'Ropsten Testnet',      1: 'Ethereum Mainnet',    const networks = {  getNetworkName(networkId) {   */   * @returns {string} Network name   * @param {number} networkId - Network ID   * Get network name from ID  /**    }    }      };        error: error.message        address: this.accounts[0],        connected: true,      return {      console.error('Error getting wallet info:', error);    } catch (error) {      };        isHardware: address.includes('hardware') // Just for demo, would be tracked differently in real implementation        balance,        ensName,        networkName,        networkId,        address,        connected: true,      return {            const balance = parseInt(balanceHex, 16) / 1e18;      });        params: [address, 'latest']        method: 'eth_getBalance',      const balanceHex = await this.provider.request({      // Get balance            }        }          console.warn('Error fetching ENS name:', error);        } catch (error) {          }            ensName = 'eth-name.eth'; // Simplified - real implementation would decode the name          if (ensResponse && ensResponse !== '0x' && !ensResponse.endsWith('0'.repeat(64))) {                    });            ]              'latest'              },                data: '0x0178b8bf' + address.substring(2).padStart(64, '0') // Simplified ENS query                to: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', // ENS Registry              {            params: [            method: 'eth_call',          const ensResponse = await this.provider.request({          // This is a simplified approach - actual ENS resolution is more complex        try {      if (networkId === 1 && this.provider.request) {      let ensName = null;      // Get ENS name if on Ethereum mainnet            const networkName = this.getNetworkName(networkId);      const networkId = await this.getNetworkId();      const address = await this.getAddress();    try {        }      return { connected: false };    if (!this.isConnected()) {  async getWalletInfo() {   */   * @returns {Object} Wallet information   * Get wallet information  /**    }    }      throw error;      this.triggerEvent('hardwareWalletError', { walletType, error: error.message });      console.error(`Error connecting to ${walletType}:`, error);    } catch (error) {      return address;            this.triggerEvent('hardwareWalletConnected', { walletType, address });      this.triggerEvent('connectionChanged', { connected: true, address, walletType });            this.networkId = await this.getNetworkId();      this.accounts = [address];      // Update accounts            }          throw new Error(`Unsupported hardware wallet type: ${walletType}`);        default:                    break;            Math.floor(Math.random() * 16).toString(16)).join('');          address = '0x' + Array(40).fill(0).map(() =>           await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay          console.log('Connecting to Trezor...');          // Simulate Trezor connection        case 'trezor':                    break;            Math.floor(Math.random() * 16).toString(16)).join('');          address = '0x' + Array(40).fill(0).map(() =>           await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay          console.log('Connecting to Ledger...');          // Simulate Ledger connection        case 'ledger':      switch (walletType.toLowerCase()) {      let address;            // This is a simplified implementation for demo purposes      // In a real implementation, this would use wallet-specific libraries            this.triggerEvent('hardwareWalletConnecting', { walletType });    try {        if (!walletType) throw new Error('Hardware wallet type must be specified');  async connectHardwareWallet(walletType) {   */   * @returns {Promise<string>} Connected account address   * @param {string} walletType - Type of hardware wallet ('ledger', 'trezor', etc.)   * Connect to a hardware wallet          await this.addNetwork(networkId);
        } catch (addError) {
          throw addError;
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Add a network to the wallet
   * @param {number} networkId - Network ID to add
   */
  async addNetwork(networkId) {
    if (!this.provider) throw new Error('No provider available');
    
    const networkParams = {
      1: {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://mainnet.infura.io/v3/'],
        blockExplorerUrls: ['https://etherscan.io']
      },
      5: {
        chainId: '0x5',
        chainName: 'Goerli Testnet',
        nativeCurrency: { name: 'Goerli Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://goerli.infura.io/v3/'],
        blockExplorerUrls: ['https://goerli.etherscan.io']
      },
      56: {
        chainId: '0x38',
        chainName: 'Binance Smart Chain',
        nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com']
      },
      97: {
        chainId: '0x61',
        chainName: 'BSC Testnet',
        nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
        rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
        blockExplorerUrls: ['https://testnet.bscscan.com']
      }
    };
    
    const params = networkParams[networkId];
    if (!params) throw new Error(`Network ID ${networkId} not supported`);
    
    await this.provider.request({
      method: 'wallet_addEthereumChain',
      params: [params]
    });
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  removeEventListener(event, callback) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
  }

  /**
   * Trigger event
   * @param {string} event - Event name
   * @param {any} data - Event data
   * @private
   */
  triggerEvent(event, data) {
    if (!this.eventListeners[event]) return;
    this.eventListeners[event].forEach(callback => callback(data));
  }
}
