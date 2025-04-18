/**
 * Web3 Educational Interactive Demos
 * 
 * This module provides interactive demonstrations for the educational content,
 * including blockchain explorers, code editors, and DeFi simulators.
 */

class InteractiveDemos {
  constructor(options = {}) {
    this.walletConnector = options.walletConnector;
    this.contractManager = options.contractManager;
    
    // Store active demos
    this.activeDemos = new Map();
    
    // Demo initializers by type
    this.demoInitializers = {
      'block-explorer': this._initBlockExplorerDemo.bind(this),
      'code-editor': this._initCodeEditorDemo.bind(this),
      'defi-simulator': this._initDefiSimulatorDemo.bind(this)
    };
  }
  
  /**
   * Initialize a demo of the specified type
   */
  initializeDemo(demoType, containerId, demoId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found for demo ${demoId}`);
      return;
    }
    
    // Clear the container
    container.innerHTML = '';
    
    // Initialize the demo based on type
    const initializer = this.demoInitializers[demoType];
    if (!initializer) {
      container.innerHTML = `<div class="demo-error">Demo type '${demoType}' not supported</div>`;
      return;
    }
    
    // Call the initializer
    try {
      const demo = initializer(container, demoId);
      if (demo) {
        this.activeDemos.set(demoId, demo);
      }
    } catch (error) {
      console.error(`Error initializing ${demoType} demo:`, error);
      container.innerHTML = `<div class="demo-error">Failed to initialize demo: ${error.message}</div>`;
    }
  }
  
  /**
   * Cleanup all active demos
   */
  cleanupAllDemos() {
    for (const [demoId, demo] of this.activeDemos.entries()) {
      if (demo.cleanup && typeof demo.cleanup === 'function') {
        try {
          demo.cleanup();
        } catch (error) {
          console.warn(`Error cleaning up demo ${demoId}:`, error);
        }
      }
    }
    
    // Clear the active demos map
    this.activeDemos.clear();
  }
  
  /**
   * Initialize a blockchain explorer demo
   */
  _initBlockExplorerDemo(container, demoId) {
    // Create the demo container
    container.className = 'demo-container block-explorer';
    
    // Create the header
    const header = document.createElement('div');
    header.className = 'demo-header';
    header.innerHTML = `
      <h3>Interactive Blockchain Explorer</h3>
      <div class="demo-controls">
        <button id="${demoId}-add-block">Add Block</button>
        <button id="${demoId}-reset">Reset Blockchain</button>
      </div>
    `;
    container.appendChild(header);
    
    // Create the blockchain visualization
    const visualizationContainer = document.createElement('div');
    visualizationContainer.className = 'blockchain-visualization';
    
    const blockchain = document.createElement('div');
    blockchain.className = 'blockchain';
    blockchain.id = `${demoId}-blockchain`;
    visualizationContainer.appendChild(blockchain);
    
    container.appendChild(visualizationContainer);
    
    // Create the demo panel
    const demoPanel = document.createElement('div');
    demoPanel.className = 'demo-panel';
    
    // Create left panel (block modification)
    const modifyPanel = document.createElement('div');
    modifyPanel.className = 'panel-section';
    modifyPanel.innerHTML = `
      <h4>Modify Block Data</h4>
      <div class="form-group">
        <label for="${demoId}-block-index">Block Index:</label>
        <select id="${demoId}-block-index">
          <option value="0">Genesis Block</option>
        </select>
      </div>
      <div class="form-group">
        <label for="${demoId}-block-data">Block Data:</label>
        <textarea id="${demoId}-block-data" rows="4" placeholder="Enter block data"></textarea>
      </div>
      <button id="${demoId}-update-block">Update Block</button>
    `;
    demoPanel.appendChild(modifyPanel);
    
    // Create right panel (blockchain status)
    const statusPanel = document.createElement('div');
    statusPanel.className = 'panel-section';
    statusPanel.innerHTML = `
      <h4>Blockchain Status</h4>
      <div id="${demoId}-chain-status" class="chain-status valid">
        Blockchain Valid
      </div>
      <div id="${demoId}-block-details">
        <p>Select a block to view details</p>
      </div>
    `;
    demoPanel.appendChild(statusPanel);
    
    container.appendChild(demoPanel);
    
    // Initialize the blockchain state
    const blockchainState = {
      blocks: [
        {
          index: 0,
          timestamp: Date.now(),
          data: 'Genesis Block',
          previousHash: '0',
          hash: this._calculateHash(0, Date.now(), 'Genesis Block', '0'),
          nonce: 0
        }
      ],
      selectedBlockIndex: 0
    };
    
    // Render the initial blockchain
    this._renderBlockchain(demoId, blockchainState);
    
    // Add event listeners
    document.getElementById(`${demoId}-add-block`).addEventListener('click', () => {
      const lastBlock = blockchainState.blocks[blockchainState.blocks.length - 1];
      const newBlock = {
        index: lastBlock.index + 1,
        timestamp: Date.now(),
        data: `Block Data ${lastBlock.index + 1}`,
        previousHash: lastBlock.hash,
        nonce: 0
      };
      newBlock.hash = this._calculateHash(
        newBlock.index, 
        newBlock.timestamp, 
        newBlock.data, 
        newBlock.previousHash,
        newBlock.nonce
      );
      
      blockchainState.blocks.push(newBlock);
      this._refreshBlockSelector(demoId, blockchainState);
      this._renderBlockchain(demoId, blockchainState);
    });
    
    document.getElementById(`${demoId}-reset`).addEventListener('click', () => {
      blockchainState.blocks = [
        {
          index: 0,
          timestamp: Date.now(),
          data: 'Genesis Block',
          previousHash: '0',
          hash: this._calculateHash(0, Date.now(), 'Genesis Block', '0'),
          nonce: 0
        }
      ];
      blockchainState.selectedBlockIndex = 0;
      this._refreshBlockSelector(demoId, blockchainState);
      this._renderBlockchain(demoId, blockchainState);
    });
    
    document.getElementById(`${demoId}-update-block`).addEventListener('click', () => {
      const blockIndex = parseInt(document.getElementById(`${demoId}-block-index`).value, 10);
      const blockData = document.getElementById(`${demoId}-block-data`).value;
      
      if (blockIndex >= 0 && blockIndex < blockchainState.blocks.length) {
        const block = blockchainState.blocks[blockIndex];
        block.data = blockData;
        block.hash = this._calculateHash(
          block.index, 
          block.timestamp, 
          block.data, 
          block.previousHash,
          block.nonce
        );
        
        this._renderBlockchain(demoId, blockchainState);
      }
    });
    
    document.getElementById(`${demoId}-block-index`).addEventListener('change', (e) => {
      const blockIndex = parseInt(e.target.value, 10);
      if (blockIndex >= 0 && blockIndex < blockchainState.blocks.length) {
        blockchainState.selectedBlockIndex = blockIndex;
        const block = blockchainState.blocks[blockIndex];
        document.getElementById(`${demoId}-block-data`).value = block.data;
        this._updateBlockDetails(demoId, block);
      }
    });
    
    // Return the demo instance
    return {
      state: blockchainState,
      cleanup: () => {
        // Remove event listeners if needed
      }
    };
  }
  
  /**
   * Initialize a Solidity code editor demo
   */
  _initCodeEditorDemo(container, demoId) {
    // Create the demo container
    container.className = 'demo-container code-editor-demo';
    
    // Create the header
    const header = document.createElement('div');
    header.className = 'demo-header';
    header.innerHTML = `
      <h3>Solidity Code Editor</h3>
      <div class="demo-controls">
        <button id="${demoId}-compile">Compile</button>
        <button id="${demoId}-deploy">Deploy</button>
        <button id="${demoId}-reset">Reset</button>
      </div>
    `;
    container.appendChild(header);
    
    // Create the editor container
    const editorContainer = document.createElement('div');
    editorContainer.className = 'editor-container';
    
    const codeEditor = document.createElement('textarea');
    codeEditor.className = 'code-editor-textarea';
    codeEditor.id = `${demoId}-editor`;
    codeEditor.rows = 12;
    codeEditor.value = `// SPDX-License-Identifier: MIT
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
}`;
    
    editorContainer.appendChild(codeEditor);
    container.appendChild(editorContainer);
    
    // Create the output container
    const outputContainer = document.createElement('div');
    outputContainer.className = 'output-container';
    outputContainer.innerHTML = `
      <h4>Compiler Output</h4>
      <div id="${demoId}-output" class="editor-output">// Compiler output will appear here</div>
      
      <div class="contract-interaction">
        <h4>Contract Interaction</h4>
        <div id="${demoId}-deployed-status">Contract not deployed yet</div>
        
        <div class="function-call">
          <select id="${demoId}-function-selector">
            <option value="get">get()</option>
            <option value="set">set(uint256)</option>
          </select>
          <input type="text" id="${demoId}-function-param" placeholder="Parameter value" />
          <button id="${demoId}-call-function">Call</button>
        </div>
        
        <div id="${demoId}-function-result"></div>
      </div>
    `;
    container.appendChild(outputContainer);
    
    // Initialize the demo state
    const editorState = {
      code: codeEditor.value,
      compiled: false,
      deployed: false,
      contractMethods: {
        get: () => Math.floor(Math.random() * 100), // Mock implementation
        set: (value) => parseInt(value, 10) // Mock implementation
      },
      storedValue: 0
    };
    
    // Add event listeners
    document.getElementById(`${demoId}-compile`).addEventListener('click', () => {
      const code = document.getElementById(`${demoId}-editor`).value;
      editorState.code = code;
      
      // Simulate compilation
      const output = document.getElementById(`${demoId}-output`);
      
      // Simple validation
      if (code.includes('contract') && code.includes('function')) {
        output.textContent = `Compilation successful!
ABI: [
  {
    "inputs": [],
    "name": "get",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "set",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]`;
        editorState.compiled = true;
      } else {
        output.textContent = 'Error: Invalid contract code';
        editorState.compiled = false;
      }
    });
    
    document.getElementById(`${demoId}-deploy`).addEventListener('click', () => {
      if (!editorState.compiled) {
        alert('Please compile the contract first');
        return;
      }
      
      const deployedStatus = document.getElementById(`${demoId}-deployed-status`);
      deployedStatus.textContent = 'Contract deployed at: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
      editorState.deployed = true;
    });
    
    document.getElementById(`${demoId}-reset`).addEventListener('click', () => {
      document.getElementById(`${demoId}-editor`).value = `// SPDX-License-Identifier: MIT
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
}`;
      document.getElementById(`${demoId}-output`).textContent = '// Compiler output will appear here';
      document.getElementById(`${demoId}-deployed-status`).textContent = 'Contract not deployed yet';
      document.getElementById(`${demoId}-function-result`).textContent = '';
      editorState.compiled = false;
      editorState.deployed = false;
      editorState.storedValue = 0;
    });
    
    document.getElementById(`${demoId}-call-function`).addEventListener('click', () => {
      if (!editorState.deployed) {
        alert('Please deploy the contract first');
        return;
      }
      
      const functionName = document.getElementById(`${demoId}-function-selector`).value;
      const paramValue = document.getElementById(`${demoId}-function-param`).value;
      const resultElement = document.getElementById(`${demoId}-function-result`);
      
      if (functionName === 'get') {
        resultElement.textContent = `Result: ${editorState.storedValue}`;
      } else if (functionName === 'set') {
        if (!paramValue || isNaN(parseInt(paramValue, 10))) {
          resultElement.textContent = 'Error: Please provide a valid number parameter';
          return;
        }
        
        editorState.storedValue = parseInt(paramValue, 10);
        resultElement.textContent = `Transaction successful: Value set to ${editorState.storedValue}`;
      }
    });
    
    // Return the demo instance
    return {
      state: editorState,
      cleanup: () => {
        // Remove event listeners if needed
      }
    };
  }
  
  /**
   * Initialize a DeFi simulator demo
   */
  _initDefiSimulatorDemo(container, demoId) {
    // Create the demo container
    container.className = 'demo-container defi-simulator';
    
    // Create the header
    const header = document.createElement('div');
    header.className = 'demo-header';
    header.innerHTML = `
      <h3>DeFi Protocol Simulator</h3>
      <div class="demo-controls">
        <button id="${demoId}-reset">Reset Simulation</button>
      </div>
    `;
    container.appendChild(header);
    
    // Create the simulator container
    const simulatorContainer = document.createElement('div');
    simulatorContainer.className = 'simulator-container';
    
    // Protocol info panel
    const protocolPanel = document.createElement('div');
    protocolPanel.className = 'defi-protocol';
    protocolPanel.innerHTML = `
      <h4>Liquidity Pool</h4>
      <div class="liquidity-pool">
        <div class="pool-token">
          <span class="token-symbol">ETH</span>
          <span class="token-amount">100.0</span>
        </div>
        <div class="pool-token">
          <span class="token-symbol">USDC</span>
          <span class="token-amount">200,000.0</span>
        </div>
      </div>
      <div class="pool-price">
        Price: 1 ETH = 2,000 USDC
      </div>
    `;
    simulatorContainer.appendChild(protocolPanel);
    
    // Wallet balances panel
    const walletPanel = document.createElement('div');
    walletPanel.className = 'wallet-balances';
    walletPanel.innerHTML = `
      <h4>Your Wallet</h4>
      <div class="balance">
        <span>ETH</span>
        <span id="${demoId}-eth-balance">10.0</span>
      </div>
      <div class="balance">
        <span>USDC</span>
        <span id="${demoId}-usdc-balance">5,000.0</span>
      </div>
      <div class="balance">
        <span>LP Tokens</span>
        <span id="${demoId}-lp-balance">0.0</span>
      </div>
    `;
    simulatorContainer.appendChild(walletPanel);
    
    container.appendChild(simulatorContainer);
    
    // Create the transaction panel
    const txPanel = document.createElement('div');
    txPanel.className = 'transaction-panel';
    txPanel.innerHTML = `
      <div class="transaction-form">
        <h4>Swap Tokens</h4>
        <div class="form-group">
          <label for="${demoId}-swap-from">From:</label>
          <input type="number" id="${demoId}-swap-amount" step="0.1" min="0.1" value="1.0">
          <select id="${demoId}-swap-from">
            <option value="eth">ETH</option>
            <option value="usdc">USDC</option>
          </select>
        </div>
        <div class="form-group">
          <label>To (estimated):</label>
          <span id="${demoId}-swap-to-amount">2,000.0</span>
          <span id="${demoId}-swap-to-token">USDC</span>
        </div>
        <button id="${demoId}-swap">Swap Tokens</button>
      </div>
      
      <div class="transaction-form" style="margin-top: 20px;">
        <h4>Provide Liquidity</h4>
        <div class="form-group">
          <label for="${demoId}-lp-eth">ETH Amount:</label>
          <input type="number" id="${demoId}-lp-eth" step="0.1" min="0.1" value="1.0">
        </div>
        <div class="form-group">
          <label>USDC Amount (auto):</label>
          <span id="${demoId}-lp-usdc">2,000.0</span>
        </div>
        <button id="${demoId}-add-liquidity">Add Liquidity</button>
      </div>
      
      <div class="staking-info">
        <h5>Staking Rewards</h5>
        <div>Pool APY: <span>8.5%</span></div>
        <div>Your Staked LP: <span id="${demoId}-staked-lp">0.0</span></div>
        <div>Earned Rewards: <span id="${demoId}-rewards">0.0</span> DEFI</div>
        <div class="form-group" style="margin-top: 10px;">
          <button id="${demoId}-stake">Stake LP Tokens</button>
          <button id="${demoId}-claim">Claim Rewards</button>
        </div>
      </div>
    `;
    container.appendChild(txPanel);
    
    // Initialize the demo state
    const defiState = {
      pool: {
        ethBalance: 100.0,
        usdcBalance: 200000.0,
        lpTokenSupply: 100.0,
        priceRatio: 2000 // 1 ETH = 2000 USDC
      },
      wallet: {
        ethBalance: 10.0,
        usdcBalance: 5000.0,
        lpBalance: 0.0,
        stakedLp: 0.0,
        rewards: 0.0
      }
    };
    
    // Helper to update UI with current state
    const updateUI = () => {
      // Update pool info
      const ethAmount = document.querySelector(`${container.id} .pool-token:nth-child(1) .token-amount`);
      const usdcAmount = document.querySelector(`${container.id} .pool-token:nth-child(2) .token-amount`);
      const priceDisplay = document.querySelector(`${container.id} .pool-price`);
      
      ethAmount.textContent = defiState.pool.ethBalance.toFixed(1);
      usdcAmount.textContent = defiState.pool.usdcBalance.toLocaleString('en-US', {minimumFractionDigits: 1});
      priceDisplay.textContent = `Price: 1 ETH = ${defiState.pool.priceRatio.toLocaleString('en-US')} USDC`;
      
      // Update wallet balances
      document.getElementById(`${demoId}-eth-balance`).textContent = defiState.wallet.ethBalance.toFixed(1);
      document.getElementById(`${demoId}-usdc-balance`).textContent = defiState.wallet.usdcBalance.toLocaleString('en-US', {minimumFractionDigits: 1});
      document.getElementById(`${demoId}-lp-balance`).textContent = defiState.wallet.lpBalance.toFixed(1);
      document.getElementById(`${demoId}-staked-lp`).textContent = defiState.wallet.stakedLp.toFixed(1);
      document.getElementById(`${demoId}-rewards`).textContent = defiState.wallet.rewards.toFixed(1);
      
      // Update swap estimate
      const swapAmount = parseFloat(document.getElementById(`${demoId}-swap-amount`).value) || 0;
      const swapFrom = document.getElementById(`${demoId}-swap-from`).value;
      const swapToAmount = document.getElementById(`${demoId}-swap-to-amount`);
      const swapToToken = document.getElementById(`${demoId}-swap-to-token`);
      
      if (swapFrom === 'eth') {
        swapToAmount.textContent = (swapAmount * defiState.pool.priceRatio).toLocaleString('en-US', {minimumFractionDigits: 1});
        swapToToken.textContent = 'USDC';
      } else {
        swapToAmount.textContent = (swapAmount / defiState.pool.priceRatio).toFixed(4);
        swapToToken.textContent = 'ETH';
      }
      
      // Update LP estimate
      const lpEthAmount = parseFloat(document.getElementById(`${demoId}-lp-eth`).value) || 0;
      document.getElementById(`${demoId}-lp-usdc`).textContent = (lpEthAmount * defiState.pool.priceRatio).toLocaleString('en-US', {minimumFractionDigits: 1});
    };
    
    // Initial UI update
    updateUI();
    
    // Add event listeners
    document.getElementById(`${demoId}-swap-from`).addEventListener('change', () => {
      const swapFrom = document.getElementById(`${demoId}-swap-from`).value;
      const swapToToken = document.getElementById(`${demoId}-swap-to-token`);
      
      if (swapFrom === 'eth') {
        swapToToken.textContent = 'USDC';
      } else {
        swapToToken.textContent = 'ETH';
      }
      
      updateUI();
    });
    
    document.getElementById(`${demoId}-swap-amount`).addEventListener('input', updateUI);
    document.getElementById(`${demoId}-lp-eth`).addEventListener('input', updateUI);
    
    document.getElementById(`${demoId}-swap`).addEventListener('click', () => {
      const swapAmount = parseFloat(document.getElementById(`${demoId}-swap-amount`).value) || 0;
      const swapFrom = document.getElementById(`${demoId}-swap-from`).value;
      
      if (swapAmount <= 0) {
        alert('Please enter a valid amount');
        return;
      }
      
      if (swapFrom === 'eth') {
        // Check if user has enough ETH
        if (swapAmount > defiState.wallet.ethBalance) {
          alert('Insufficient ETH balance');
          return;
        }
        
        // Calculate USDC to receive (with 0.3% fee)
        const fee = swapAmount * 0.003;
        const ethAmountAfterFee = swapAmount - fee;
        const usdcToReceive = ethAmountAfterFee * defiState.pool.priceRatio;
        
        // Update balances
        defiState.wallet.ethBalance -= swapAmount;
        defiState.wallet.usdcBalance += usdcToReceive;
        defiState.pool.ethBalance += swapAmount;
        defiState.pool.usdcBalance -= usdcToReceive;
        
        // Recalculate price
        defiState.pool.priceRatio = defiState.pool.usdcBalance / defiState.pool.ethBalance;
      } else {
        // Check if user has enough USDC
        if (swapAmount > defiState.wallet.usdcBalance) {
          alert('Insufficient USDC balance');
          return;
        }
        
        // Calculate ETH to receive (with 0.3% fee)
        const fee = swapAmount * 0.003;
        const usdcAmountAfterFee = swapAmount - fee;
        const ethToReceive = usdcAmountAfterFee / defiState.pool.priceRatio;
        
        // Update balances
        defiState.wallet.usdcBalance -= swapAmount;
        defiState.wallet.ethBalance += ethToReceive;
        defiState.pool.usdcBalance += swapAmount;
        defiState.pool.ethBalance -= ethToReceive;
        
        // Recalculate price
        defiState.pool.priceRatio = defiState.pool.usdcBalance / defiState.pool.ethBalance;
      }
      
      updateUI();
    });
    
    document.getElementById(`${demoId}-add-liquidity`).addEventListener('click', () => {
      const ethAmount = parseFloat(document.getElementById(`${demoId}-lp-eth`).value) || 0;
      const usdcAmount = ethAmount * defiState.pool.priceRatio;
      
      if (ethAmount <= 0) {
        alert('Please enter a valid ETH amount');
        return;
      }
      
      // Check if user has enough balances
      if (ethAmount > defiState.wallet.ethBalance) {
        alert('Insufficient ETH balance');
        return;
      }
      
      if (usdcAmount > defiState.wallet.usdcBalance) {
        alert('Insufficient USDC balance');
        return;
      }
      
      // Calculate LP tokens to mint
      // LP tokens = (contributed ETH / total ETH) * total LP supply
      const lpTokensToMint = (ethAmount / defiState.pool.ethBalance) * defiState.pool.lpTokenSupply;
      
      // Update balances
      defiState.wallet.ethBalance -= ethAmount;
      defiState.wallet.usdcBalance -= usdcAmount;
      defiState.wallet.lpBalance += lpTokensToMint;
      
      defiState.pool.ethBalance += ethAmount;
      defiState.pool.usdcBalance += usdcAmount;
      defiState.pool.lpTokenSupply += lpTokensToMint;
      
      updateUI();
    });
    
    document.getElementById(`${demoId}-stake`).addEventListener('click', () => {
      if (defiState.wallet.lpBalance <= 0) {
        alert('No LP tokens to stake');
        return;
      }
      
      // Stake all LP tokens
      defiState.wallet.stakedLp += defiState.wallet.lpBalance;
      defiState.wallet.lpBalance = 0;
      
      updateUI();
    });
    
    document.getElementById(`${demoId}-claim`).addEventListener('click', () => {
      if (defiState.wallet.rewards <= 0) {
        alert('No rewards to claim');
        return;
      }
      
      // Simple simulation: claim rewards and reset
      defiState.wallet.rewards = 0;
      
      updateUI();
    });
    
    document.getElementById(`${demoId}-reset`).addEventListener('click', () => {
      // Reset to initial state
      defiState.pool = {
        ethBalance: 100.0,
        usdcBalance: 200000.0,
        lpTokenSupply: 100.0,
        priceRatio: 2000
      };
      
      defiState.wallet = {
        ethBalance: 10.0,
        usdcBalance: 5000.0,
        lpBalance: 0.0,
        stakedLp: 0.0,
        rewards: 0.0
      };
      
      // Reset form inputs
      document.getElementById(`${demoId}-swap-amount`).value = '1.0';
      document.getElementById(`${demoId}-swap-from`).value = 'eth';
      document.getElementById(`${demoId}-lp-eth`).value = '1.0';
      
      updateUI();
    });
    
    // Simulate staking rewards over time
    const rewardsInterval = setInterval(() => {
      if (defiState.wallet.stakedLp > 0) {
        // Simple APY simulation - 8.5% annually, simulated for demo purposes
        const rewardIncrement = (defiState.wallet.stakedLp * 0.085) / (365 * 24); // hourly increment
        defiState.wallet.rewards += rewardIncrement;
        document.getElementById(`${demoId}-rewards`).textContent = defiState.wallet.rewards.toFixed(4);
      }
    }, 5000); // Simulate faster for demo purposes
    
    // Return the demo instance
    return {
      state: defiState,
      cleanup: () => {
        clearInterval(rewardsInterval);
      }
    };
  }
  
  /**
   * Helper to render blockchain blocks
   */
  _renderBlockchain(demoId, state) {
    const blockchainEl = document.getElementById(`${demoId}-blockchain`);
    if (!blockchainEl) return;
    
    blockchainEl.innerHTML = '';
    
    // Add blocks to the visualization
    state.blocks.forEach((block, index) => {
      const blockEl = document.createElement('div');
      blockEl.className = 'block';
      blockEl.dataset.index = block.index;
      
      // Check if this block is valid
      const isValid = this._isBlockValid(block, index > 0 ? state.blocks[index - 1] : null);
      
      // Add class based on validity
      if (!isValid) {
        blockEl.classList.add('invalid');
      } else if (index > 0 && block.previousHash !== state.blocks[index - 1].hash) {
        blockEl.classList.add('modified');
      }
      
      blockEl.innerHTML = `
        <div class="block-header">Block #${block.index}</div>
        <div class="block-content">
          <div class="block-info">
            <div><strong>Previous Hash:</strong></div>
            <div>${block.previousHash.substring(0, 8)}...</div>
            <div><strong>Data:</strong></div>
            <div>${block.data.substring(0, 20)}${block.data.length > 20 ? '...' : ''}</div>
            <div><strong>Hash:</strong></div>
            <div>${block.hash.substring(0, 8)}...</div>
          </div>
        </div>
      `;
      
      blockchainEl.appendChild(blockEl);
      
      // Add connector except for last block
      if (index < state.blocks.length - 1) {
        const connectorEl = document.createElement('div');
        connectorEl.className = 'block-connector';
        connectorEl.textContent = '→';
        blockchainEl.appendChild(connectorEl);
      }
      
      // Add click handler
      blockEl.addEventListener('click', () => {
        state.selectedBlockIndex = index;
        document.getElementById(`${demoId}-block-index`).value = index;
        document.getElementById(`${demoId}-block-data`).value = block.data;
        this._updateBlockDetails(demoId, block);
      });
    });
    
    // Update chain status
    this._updateChainStatus(demoId, state);
  }
  
  /**
   * Helper to update block selector dropdown
   */
  _refreshBlockSelector(demoId, state) {
    const selector = document.getElementById(`${demoId}-block-index`);
    if (!selector) return;
    
    // Save current selection
    const currentValue = selector.value;
    
    // Clear options
    selector.innerHTML = '';
    
    // Add options for each block
    state.blocks.forEach((block, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = index === 0 ? 'Genesis Block' : `Block #${index}`;
      selector.appendChild(option);
    });
    
    // Restore selection if valid, otherwise select the last block
    if (currentValue && currentValue < state.blocks.length) {
      selector.value = currentValue;
    } else {
      selector.value = state.blocks.length - 1;
      state.selectedBlockIndex = state.blocks.length - 1;
      
      // Update textarea with the data of the selected block
      const selectedBlock = state.blocks[state.selectedBlockIndex];
      if (selectedBlock) {
        document.getElementById(`${demoId}-block-data`).value = selectedBlock.data;
        this._updateBlockDetails(demoId, selectedBlock);
      }
    }
  }
  
  /**
   * Helper to update block details display
   */
  _updateBlockDetails(demoId, block) {
    const detailsEl = document.getElementById(`${demoId}-block-details`);
    if (!detailsEl) return;
    
    detailsEl.innerHTML = `
      <h5>Block #${block.index} Details</h5>
      <div><strong>Timestamp:</strong> ${new Date(block.timestamp).toLocaleString()}</div>
      <div><strong>Previous Hash:</strong> ${block.previousHash}</div>
      <div><strong>Data:</strong> ${block.data}</div>
      <div><strong>Hash:</strong> ${block.hash}</div>
      <div><strong>Nonce:</strong> ${block.nonce}</div>
    `;
  }
  
  /**
   * Helper to update blockchain status display
   */
  _updateChainStatus(demoId, state) {
    const statusEl = document.getElementById(`${demoId}-chain-status`);
    if (!statusEl) return;
    
    // Check if the entire blockchain is valid
    const isValid = this._isBlockchainValid(state.blocks);
    
    if (isValid) {
      statusEl.textContent = 'Blockchain Valid';
      statusEl.className = 'chain-status valid';
    } else {
      statusEl.textContent = 'Blockchain Invalid';
      statusEl.className = 'chain-status invalid';
    }
  }
  
  /**
   * Helper to calculate a block's hash
   */
  _calculateHash(index, timestamp, data, previousHash, nonce = 0) {
    // In a real implementation, we would use a cryptographic hash function
    // Here we use a simple simulation
    const stringToHash = `${index}${timestamp}${data}${previousHash}${nonce}`;
    
    // Simple hash function for demo purposes
    let hash = 0;
    for (let i = 0; i < stringToHash.length; i++) {
      const char = stringToHash.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to hex string and ensure positive
    const hexHash = (hash >>> 0).toString(16);
    return hexHash.padStart(16, '0');
  }
  
  /**
   * Helper to check if a block is valid
   */
  _isBlockValid(block, previousBlock) {
    // For genesis block, only validate the hash
    if (block.index === 0) {
      const hash = this._calculateHash(
        block.index, 
        block.timestamp, 
        block.data, 
        block.previousHash,
        block.nonce
      );
      return block.hash === hash;
    }
    
    // For other blocks, check previous hash and current hash
    if (!previousBlock) return false;
    
    if (block.previousHash !== previousBlock.hash) {
      return false;
    }
    
    const hash = this._calculateHash(
      block.index, 
      block.timestamp, 
      block.data, 
      block.previousHash,
      block.nonce
    );
    
    return block.hash === hash;
  }
  
  /**
   * Helper to check if the entire blockchain is valid
   */
  _isBlockchainValid(blocks) {
    for (let i = 0; i < blocks.length; i++) {
      const currentBlock = blocks[i];
      const previousBlock = i > 0 ? blocks[i - 1] : null;
      
      if (!this._isBlockValid(currentBlock, previousBlock)) {
        return false;
      }
    }
    
    return true;
  }
}

// For use in browser environment
if (typeof window !== 'undefined') {
  window.InteractiveDemos = InteractiveDemos;
}

// For use in Node.js environment
if (typeof module !== 'undefined') {
  module.exports = InteractiveDemos;
}