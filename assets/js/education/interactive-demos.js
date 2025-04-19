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
      'defi-simulator': this._initDefiSimulatorDemo.bind(this),
      'game-theory': this._initGameTheoryDemo.bind(this) // Add new demo type
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
   * Initialize a Game Theory demo
   */
  _initGameTheoryDemo(container, demoId) {
    // Create the demo container
    container.className = 'demo-container game-theory-demo';
    
    // Create the header
    const header = document.createElement('div');
    header.className = 'demo-header';
    header.innerHTML = `
      <h3>Game Theory in Blockchain Consensus</h3>
      <div class="demo-controls">
        <button id="${demoId}-reset">Reset Simulation</button>
      </div>
    `;
    container.appendChild(header);
    
    // Create the explanation section
    const explanationSection = document.createElement('div');
    explanationSection.className = 'explanation-section';
    explanationSection.innerHTML = `
      <div class="theory-intro">
        <h4>Game Theory and Blockchain Consensus</h4>
        <p>
          Game theory is essential to understanding blockchain incentive structures. 
          This demo explores how different actors (rational bots vs. emotional humans) 
          respond to coordination problems in consensus mechanisms.
        </p>
      </div>
    `;
    container.appendChild(explanationSection);
    
    // Create the game simulation container
    const simulationContainer = document.createElement('div');
    simulationContainer.className = 'simulation-container';
    
    // Create tabs for different game theory models
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-container';
    tabsContainer.innerHTML = `
      <div class="tabs">
        <div class="tab active" data-tab="prisoners-dilemma">Prisoner's Dilemma</div>
        <div class="tab" data-tab="coordination-game">Coordination Game</div>
        <div class="tab" data-tab="consensus-mechanism">Consensus Mechanism</div>
      </div>
    `;
    simulationContainer.appendChild(tabsContainer);
    
    // Create tab content container
    const tabContentContainer = document.createElement('div');
    tabContentContainer.className = 'tab-content-container';
    
    // Prisoner's Dilemma Content
    const prisonersDilemmaContent = document.createElement('div');
    prisonersDilemmaContent.className = 'tab-content active';
    prisonersDilemmaContent.dataset.tabContent = 'prisoners-dilemma';
    prisonersDilemmaContent.innerHTML = `
      <h4>Blockchain Prisoner's Dilemma</h4>
      <p>This classic game theory scenario illustrates why rational actors may choose not to cooperate even when it's in their best interest.</p>
      
      <div class="game-board">
        <div class="game-scenario">
          <h5>Scenario: Block Validation</h5>
          <p>Two validators must independently decide whether to validate a block honestly or try to cheat for short-term gain.</p>
          <p>If both validate honestly, the network runs efficiently and both earn stable rewards.</p>
          <p>If one cheats while the other is honest, the cheater gets a temporary advantage before likely being caught.</p>
          <p>If both cheat, the network integrity suffers and both lose significantly in the long run.</p>
        </div>
        
        <div class="payoff-matrix">
          <h5>Payoff Matrix</h5>
          <table>
            <tr>
              <td></td>
              <td></td>
              <td colspan="2" class="matrix-header">Validator B</td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td class="matrix-header">Validate Honestly</td>
              <td class="matrix-header">Cheat</td>
            </tr>
            <tr>
              <td rowspan="2" class="matrix-header vertical">Validator A</td>
              <td class="matrix-header">Validate Honestly</td>
              <td class="matrix-cell good">A: +3<br>B: +3</td>
              <td class="matrix-cell bad">A: -1<br>B: +5</td>
            </tr>
            <tr>
              <td class="matrix-header">Cheat</td>
              <td class="matrix-cell bad">A: +5<br>B: -1</td>
              <td class="matrix-cell danger">A: -2<br>B: -2</td>
            </tr>
          </table>
        </div>
        
        <div class="game-controls">
          <h5>Simulation</h5>
          <div class="control-group">
            <label for="${demoId}-actor-type">Actor Type:</label>
            <select id="${demoId}-actor-type">
              <option value="rational">Rational Actors (Bots)</option>
              <option value="human">Human Actors</option>
            </select>
          </div>
          <div class="control-group">
            <label for="${demoId}-rounds">Simulation Rounds:</label>
            <input type="number" id="${demoId}-rounds" min="1" max="1000" value="100">
          </div>
          <button id="${demoId}-run-sim" class="btn primary">Run Simulation</button>
        </div>
      </div>
      
      <div class="simulation-results" id="${demoId}-pd-results">
        <h5>Simulation Results</h5>
        <div class="results-placeholder">Run a simulation to see results</div>
      </div>
    `;
    
    // Coordination Game Content
    const coordinationGameContent = document.createElement('div');
    coordinationGameContent.className = 'tab-content';
    coordinationGameContent.dataset.tabContent = 'coordination-game';
    coordinationGameContent.innerHTML = `
      <h4>Blockchain Coordination Problem</h4>
      <p>Coordination games demonstrate how actors in a decentralized system can achieve optimal outcomes through coordination.</p>
      
      <div class="game-board">
        <div class="game-scenario">
          <h5>Scenario: Fork Choice</h5>
          <p>Miners must choose which chain to mine on. If they coordinate on the same chain, they all benefit.</p>
          <p>If they split effort across chains, the network security suffers and everyone earns less.</p>
          <p>This explains why proof-of-work chains tend to converge on a single canonical chain.</p>
        </div>
        
        <div class="solution-comparison">
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
        
        <div class="simulation-controls">
          <h5>Choose Your Strategy</h5>
          <div class="control-group">
            <label for="${demoId}-strategy">Select Coordination Strategy:</label>
            <select id="${demoId}-strategy">
              <option value="standard">Standard Numbering</option>
              <option value="pairing">Pairing/Watcher Solution</option>
            </select>
          </div>
          <div class="control-group">
            <label for="${demoId}-actor-mix">Actor Mix:</label>
            <input type="range" id="${demoId}-actor-mix" min="0" max="100" value="50">
            <div class="range-labels">
              <span>All Rational</span>
              <span>Mixed</span>
              <span>All Human</span>
            </div>
          </div>
          <button id="${demoId}-analyze" class="btn primary">Analyze Outcome</button>
        </div>
      </div>
      
      <div class="analysis-results" id="${demoId}-cg-results">
        <h5>Analysis Results</h5>
        <div class="results-placeholder">Run an analysis to see results</div>
      </div>
    `;
    
    // Consensus Mechanism Content
    const consensusMechanismContent = document.createElement('div');
    consensusMechanismContent.className = 'tab-content';
    consensusMechanismContent.dataset.tabContent = 'consensus-mechanism';
    consensusMechanismContent.innerHTML = `
      <h4>Blockchain Consensus Mechanisms</h4>
      <p>Different consensus mechanisms leverage game theory to secure their networks. This simulator compares them.</p>
      
      <div class="mechanism-selector">
        <h5>Select Mechanism</h5>
        <div class="mechanism-options">
          <div class="mechanism-option selected" data-mechanism="pow">
            <h6>Proof of Work</h6>
            <p>Economic cost creates security through energy expenditure</p>
          </div>
          <div class="mechanism-option" data-mechanism="pos">
            <h6>Proof of Stake</h6>
            <p>Economic security through capital lockup</p>
          </div>
          <div class="mechanism-option" data-mechanism="dpos">
            <h6>Delegated Proof of Stake</h6>
            <p>Elected validators with reputation at stake</p>
          </div>
        </div>
      </div>
      
      <div class="mechanism-simulation">
        <h5>Attack Simulation</h5>
        <div class="simulation-parameters">
          <div class="parameter">
            <label for="${demoId}-attack-budget">Attacker Budget (% of network):</label>
            <input type="range" id="${demoId}-attack-budget" min="1" max="99" value="30">
            <span class="parameter-value">30%</span>
          </div>
          <div class="parameter">
            <label for="${demoId}-honest-nodes">Honest Nodes:</label>
            <input type="range" id="${demoId}-honest-nodes" min="10" max="1000" value="100">
            <span class="parameter-value">100</span>
          </div>
          <div class="parameter">
            <label for="${demoId}-attack-type">Attack Type:</label>
            <select id="${demoId}-attack-type">
              <option value="51">51% Attack</option>
              <option value="selfish">Selfish Mining</option>
              <option value="sybil">Sybil Attack</option>
            </select>
          </div>
          <button id="${demoId}-simulate-attack" class="btn primary">Simulate Attack</button>
        </div>
        
        <div class="attack-results" id="${demoId}-attack-results">
          <h5>Attack Results</h5>
          <div class="results-placeholder">Run a simulation to see results</div>
        </div>
      </div>
    `;
    
    // Append tab contents to container
    tabContentContainer.appendChild(prisonersDilemmaContent);
    tabContentContainer.appendChild(coordinationGameContent);
    tabContentContainer.appendChild(consensusMechanismContent);
    
    // Append tab content container to simulation container
    simulationContainer.appendChild(tabContentContainer);
    
    // Append simulation container to main container
    container.appendChild(simulationContainer);
    
    // Add conclusion section
    const conclusionSection = document.createElement('div');
    conclusionSection.className = 'conclusion-section';
    conclusionSection.innerHTML = `
      <h4>Key Insights from Game Theory for Blockchain</h4>
      <div class="insights-grid">
        <div class="insight-card">
          <h5>Nash Equilibrium</h5>
          <p>In blockchain consensus, validators reach a Nash equilibrium when no single participant can gain by changing their strategy while others maintain theirs.</p>
        </div>
        <div class="insight-card">
          <h5>Schelling Points</h5>
          <p>Focal points that participants naturally gravitate toward without communication - like choosing the longest valid chain in PoW systems.</p>
        </div>
        <div class="insight-card">
          <h5>Rational vs. Human Actors</h5>
          <p>Optimal protocol design must account for both mathematical rationality and human emotional/psychological factors.</p>
        </div>
        <div class="insight-card">
          <h5>Byzantine Generals Problem</h5>
          <p>Game theory helps solve this fundamental coordination problem in distributed systems through economic incentives.</p>
        </div>
      </div>
    `;
    container.appendChild(conclusionSection);
    
    // Initialize the demo state
    const gameTheoryState = {
      currentTab: 'prisoners-dilemma',
      prisonersDilemma: {
        actorType: 'rational',
        rounds: 100,
        results: null
      },
      coordinationGame: {
        strategy: 'standard',
        actorMix: 50,
        results: null
      },
      consensusMechanism: {
        selected: 'pow',
        attackBudget: 30,
        honestNodes: 100,
        attackType: '51',
        results: null
      }
    };
    
    // Tab switching functionality
    const tabs = tabsContainer.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active content
        const tabContents = tabContentContainer.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.remove('active'));
        
        const activeTabName = tab.dataset.tab;
        const activeContent = tabContentContainer.querySelector(`.tab-content[data-tab-content="${activeTabName}"]`);
        activeContent.classList.add('active');
        
        gameTheoryState.currentTab = activeTabName;
      });
    });
    
    // Prisoners Dilemma Simulation
    document.getElementById(`${demoId}-run-sim`).addEventListener('click', () => {
      const actorType = document.getElementById(`${demoId}-actor-type`).value;
      const rounds = parseInt(document.getElementById(`${demoId}-rounds`).value);
      
      // Update state
      gameTheoryState.prisonersDilemma.actorType = actorType;
      gameTheoryState.prisonersDilemma.rounds = rounds;
      
      // Run simulation
      const results = simulatePrisonersDilemma(actorType, rounds);
      gameTheoryState.prisonersDilemma.results = results;
      
      // Display results
      const resultsContainer = document.getElementById(`${demoId}-pd-results`);
      resultsContainer.innerHTML = `
        <h5>Simulation Results (${rounds} rounds)</h5>
        <div class="results-summary">
          <div class="result-item">
            <span class="result-label">Mutual Cooperation:</span>
            <span class="result-value">${results.mutualCooperation} rounds (${Math.round(results.mutualCooperation / rounds * 100)}%)</span>
          </div>
          <div class="result-item">
            <span class="result-label">Mutual Defection:</span>
            <span class="result-value">${results.mutualDefection} rounds (${Math.round(results.mutualDefection / rounds * 100)}%)</span>
          </div>
          <div class="result-item">
            <span class="result-label">Mixed Outcomes:</span>
            <span class="result-value">${results.mixedOutcomes} rounds (${Math.round(results.mixedOutcomes / rounds * 100)}%)</span>
          </div>
          <div class="result-item">
            <span class="result-label">Network Security Score:</span>
            <span class="result-value ${results.securityScore > 70 ? 'good' : results.securityScore > 40 ? 'medium' : 'bad'}">${results.securityScore}/100</span>
          </div>
        </div>
        
        <div class="results-chart">
          <div class="chart-bar cooperation" style="width: ${Math.round(results.mutualCooperation / rounds * 100)}%">
            <span>Cooperation</span>
          </div>
          <div class="chart-bar mixed" style="width: ${Math.round(results.mixedOutcomes / rounds * 100)}%">
            <span>Mixed</span>
          </div>
          <div class="chart-bar defection" style="width: ${Math.round(results.mutualDefection / rounds * 100)}%">
            <span>Defection</span>
          </div>
        </div>
        
        <div class="results-conclusion">
          <strong>Conclusion:</strong> ${results.conclusion}
        </div>
      `;
    });
    
    // Coordination Game Analysis
    document.getElementById(`${demoId}-analyze`).addEventListener('click', () => {
      const strategy = document.getElementById(`${demoId}-strategy`).value;
      const actorMix = parseInt(document.getElementById(`${demoId}-actor-mix`).value);
      
      // Update state
      gameTheoryState.coordinationGame.strategy = strategy;
      gameTheoryState.coordinationGame.actorMix = actorMix;
      
      // Run analysis
      const results = analyzeCoordinationGame(strategy, actorMix);
      gameTheoryState.coordinationGame.results = results;
      
      // Display results
      const resultsContainer = document.getElementById(`${demoId}-cg-results`);
      resultsContainer.innerHTML = `
        <h5>Analysis Results</h5>
        <div class="results-summary">
          <div class="result-item">
            <span class="result-label">Strategy:</span>
            <span class="result-value">${strategy === 'standard' ? 'Standard Numbering' : 'Pairing/Watcher Solution'}</span>
          </div>
          <div class="result-item">
            <span class="result-label">Actor Composition:</span>
            <span class="result-value">${actorMix}% Human / ${100-actorMix}% Rational</span>
          </div>
          <div class="result-item">
            <span class="result-label">Success Probability:</span>
            <span class="result-value ${results.successProbability > 0.9 ? 'good' : results.successProbability > 0.5 ? 'medium' : 'bad'}">${(results.successProbability * 100).toFixed(1)}%</span>
          </div>
        </div>
        
        <div class="results-visual">
          <div class="strategy-effectiveness" style="--effectiveness: ${results.successProbability * 100}%">
            <div class="effectiveness-bar"></div>
            <div class="effectiveness-marker"></div>
          </div>
          <div class="effectiveness-scale">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
        
        <div class="results-conclusion">
          <strong>Analysis:</strong> ${results.conclusion}
        </div>
      `;
    });
    
    // Consensus Mechanism Simulation
    document.getElementById(`${demoId}-simulate-attack`).addEventListener('click', () => {
      const mechanism = document.querySelector(`.mechanism-option.selected`).dataset.mechanism;
      const attackBudget = parseInt(document.getElementById(`${demoId}-attack-budget`).value);
      const honestNodes = parseInt(document.getElementById(`${demoId}-honest-nodes`).value);
      const attackType = document.getElementById(`${demoId}-attack-type`).value;
      
      // Update state
      gameTheoryState.consensusMechanism.selected = mechanism;
      gameTheoryState.consensusMechanism.attackBudget = attackBudget;
      gameTheoryState.consensusMechanism.honestNodes = honestNodes;
      gameTheoryState.consensusMechanism.attackType = attackType;
      
      // Run simulation
      const results = simulateConsensusAttack(mechanism, attackBudget, honestNodes, attackType);
      gameTheoryState.consensusMechanism.results = results;
      
      // Display results
      const resultsContainer = document.getElementById(`${demoId}-attack-results`);
      resultsContainer.innerHTML = `
        <h5>Attack Simulation Results</h5>
        <div class="attack-outcome ${results.attackSuccess ? 'attack-success' : 'attack-failed'}">
          <span class="outcome-label">Outcome:</span>
          <span class="outcome-value">${results.attackSuccess ? 'Attack Successful' : 'Attack Failed'}</span>
        </div>
        
        <div class="attack-details">
          <div class="detail-item">
            <span class="detail-label">Attack Cost:</span>
            <span class="detail-value">${results.attackCost} ETH</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Economic Security:</span>
            <span class="detail-value ${results.economicSecurity > 70 ? 'good' : results.economicSecurity > 40 ? 'medium' : 'bad'}">${results.economicSecurity}/100</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Block Reversal Depth:</span>
            <span class="detail-value">${results.blockReversalDepth} blocks</span>
          </div>
        </div>
        
        <div class="results-conclusion">
          <strong>Security Analysis:</strong> ${results.securityAnalysis}
        </div>
      `;
    });
    
    // Mechanism option selection
    const mechanismOptions = document.querySelectorAll(`.mechanism-option`);
    mechanismOptions.forEach(option => {
      option.addEventListener('click', () => {
        mechanismOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        gameTheoryState.consensusMechanism.selected = option.dataset.mechanism;
      });
    });
    
    // Update parameter values display
    const attackBudgetInput = document.getElementById(`${demoId}-attack-budget`);
    attackBudgetInput?.addEventListener('input', () => {
      const valueDisplay = attackBudgetInput.nextElementSibling;
      if (valueDisplay) {
        valueDisplay.textContent = `${attackBudgetInput.value}%`;
      }
    });
    
    const honestNodesInput = document.getElementById(`${demoId}-honest-nodes`);
    honestNodesInput?.addEventListener('input', () => {
      const valueDisplay = honestNodesInput.nextElementSibling;
      if (valueDisplay) {
        valueDisplay.textContent = `${honestNodesInput.value}`;
      }
    });
    
    // Game theory simulation functions
    function simulatePrisonersDilemma(actorType, rounds) {
      // Simulation logic based on actor type
      let mutualCooperation, mutualDefection, mixedOutcomes, securityScore, conclusion;
      
      if (actorType === 'rational') {
        // Rational actors tend toward Nash equilibrium (mutual defection)
        mutualCooperation = Math.floor(rounds * 0.05); // 5%
        mixedOutcomes = Math.floor(rounds * 0.15); // 15%
        mutualDefection = rounds - mutualCooperation - mixedOutcomes; // 80%
        securityScore = 25;
        conclusion = "Rational actors tend toward mutual defection as it's the Nash equilibrium, resulting in poor network security. This is the classic prisoner's dilemma.";
      } else {
        // Human actors show more cooperation due to trust, reputation, and repeated games
        mutualCooperation = Math.floor(rounds * 0.60); // 60%
        mixedOutcomes = Math.floor(rounds * 0.25); // 25%
        mutualDefection = rounds - mutualCooperation - mixedOutcomes; // 15%
        securityScore = 75;
        conclusion = "Human actors show higher rates of cooperation due to trust building, reputation effects, and understanding of long-term benefits, resulting in better network security.";
      }
      
      return {
        mutualCooperation,
        mutualDefection,
        mixedOutcomes,
        securityScore,
        conclusion
      };
    }
    
    function analyzeCoordinationGame(strategy, actorMix) {
      let successProbability, conclusion;
      
      // Calculate base probability based on strategy
      const baseRationalProb = strategy === 'standard' ? 0.98 : 0.99;
      const baseHumanProb = strategy === 'standard' ? 0.70 : 0.95;
      
      // Adjust based on actor mix
      const rationalPct = (100 - actorMix) / 100;
      const humanPct = actorMix / 100;
      
      // Combined probability
      successProbability = (baseRationalProb * rationalPct) + (baseHumanProb * humanPct);
      
      // Generate conclusion
      if (strategy === 'standard') {
        if (actorMix > 70) {
          conclusion = "Standard numbering is less effective with primarily human actors. The risk of mass coordination failure is significant.";
        } else if (actorMix < 30) {
          conclusion = "Standard numbering works well with primarily rational actors who can recursively compute optimal strategies.";
        } else {
          conclusion = "Mixed actor populations create uncertainty in standard numbering models, as human unpredictability can disrupt mathematical equilibria.";
        }
      } else { // pairing strategy
        if (actorMix > 70) {
          conclusion = "The Pairing/Watcher solution is highly effective for human actors, as direct accountability and fear of consequences drive cooperation.";
        } else if (actorMix < 30) {
          conclusion = "The Pairing/Watcher solution works well even with rational actors, as it creates a dominant strategy through multi-layered incentives.";
        } else {
          conclusion = "This solution is robust across mixed actor populations, combining mathematical incentives for rational actors with psychological incentives for humans.";
        }
      }
      
      return {
        successProbability,
        conclusion
      };
    }
    
    function simulateConsensusAttack(mechanism, attackBudget, honestNodes, attackType) {
      let attackSuccess, attackCost, economicSecurity, blockReversalDepth, securityAnalysis;
      
      // Baseline variables
      const networkValue = 100000; // 100k ETH
      const attackSuccessThreshold = mechanism === 'pow' ? 51 : mechanism === 'pos' ? 67 : 34;
      
      // Check if attack succeeds based on budget and mechanism
      attackSuccess = attackBudget >= attackSuccessThreshold;
      
      // Calculate attack cost based on mechanism
      if (mechanism === 'pow') {
        // PoW: Cost is proportional to hash power needed
        attackCost = (networkValue * attackBudget / 100) * 0.02 * (attackType === '51' ? 1 : attackType === 'selfish' ? 0.7 : 0.5);
        economicSecurity = attackBudget < 51 ? 85 : 30;
        blockReversalDepth = attackSuccess ? Math.floor(attackBudget / 10) : 0;
        securityAnalysis = attackSuccess 
          ? "The 51% attack succeeded because the attacker controlled enough hash power. PoW security is directly proportional to the energy expended by honest miners."
          : "The attack failed because it didn't reach the 51% threshold needed for PoW. The economic cost of attacking PoW networks scales with overall hash power.";
      } 
      else if (mechanism === 'pos') {
        // PoS: Cost is capital locked + slashing risk
        attackCost = (networkValue * attackBudget / 100) + (attackSuccess ? (networkValue * attackBudget / 100) * 0.3 : 0);
        economicSecurity = attackBudget < 67 ? 90 : 40;
        blockReversalDepth = attackSuccess ? Math.floor((attackBudget-60) / 5) : 0;
        securityAnalysis = attackSuccess 
          ? "The attack succeeded but at great cost due to capital requirements and slashing penalties. The attacker needed 67% of staked tokens."
          : "The attack failed because PoS systems require a supermajority (67%) to compromise. Additionally, the attacker would lose their stake through slashing mechanisms.";
      } 
      else { // DPoS
        // DPoS: Less capital required but more social coordination
        attackCost = (networkValue * attackBudget / 100) * 0.5;
        economicSecurity = attackBudget < 34 ? 75 : 35;
        blockReversalDepth = attackSuccess ? Math.floor(attackBudget / 8) : 0;
        securityAnalysis = attackSuccess 
          ? "The attack succeeded because DPoS relies on fewer validators, making it easier to compromise if enough block producers collude."
          : "The attack failed because attacking a DPoS system requires controlling enough delegate votes, which has both economic and social costs.";
      }
      
      return {
        attackSuccess,
        attackCost: Math.round(attackCost),
        economicSecurity,
        blockReversalDepth,
        securityAnalysis
      };
    }
    
    // Add styles for game theory demo
    const style = document.createElement('style');
    style.textContent = `
      .game-theory-demo {
        margin-bottom: 40px;
      }
      
      .explanation-section {
        margin-bottom: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
      }
      
      .tabs-container {
        margin-bottom: 20px;
      }
      
      .tabs {
        display: flex;
        border-bottom: 1px solid #dee2e6;
      }
      
      .tab {
        padding: 10px 20px;
        cursor: pointer;
        font-weight: 500;
        border-bottom: 2px solid transparent;
      }
      
      .tab.active {
        border-bottom: 2px solid #0066cc;
        color: #0066cc;
      }
      
      .tab-content {
        display: none;
        padding: 20px 0;
      }
      
      .tab-content.active {
        display: block;
      }
      
      .game-board {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 25px;
      }
      
      .game-scenario {
        flex: 1;
        min-width: 250px;
        background: #fff;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      .payoff-matrix {
        flex: 1;
        min-width: 300px;
      }
      
      .payoff-matrix table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #dee2e6;
      }
      
      .payoff-matrix td {
        padding: 10px;
        text-align: center;
        border: 1px solid #dee2e6;
      }
      
      .matrix-header {
        background: #f1f3f5;
        font-weight: bold;
      }
      
      .matrix-header.vertical {
        writing-mode: vertical-lr;
        transform: rotate(180deg);
        padding: 15px 5px;
      }
      
      .matrix-cell {
        padding: 15px !important;
      }
      
      .matrix-cell.good {
        background-color: rgba(40, 167, 69, 0.15);
      }
      
      .matrix-cell.bad {
        background-color: rgba(255, 193, 7, 0.15);
      }
      
      .matrix-cell.danger {
        background-color: rgba(220, 53, 69, 0.15);
      }
      
      .game-controls {
        flex: 1;
        min-width: 250px;
      }
      
      .control-group {
        margin-bottom: 15px;
      }
      
      .control-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
      }
      
      .control-group select,
      .control-group input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ced4da;
        border-radius: 4px;
      }
      
      .simulation-results,
      .analysis-results,
      .attack-results {
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        margin-top: 20px;
      }
      
      .results-placeholder {
        color: #6c757d;
        font-style: italic;
        padding: 15px 0;
      }
      
      .results-summary {
        margin-bottom: 20px;
      }
      
      .result-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #dee2e6;
      }
      
      .result-value.good {
        color: #28a745;
        font-weight: bold;
      }
      
      .result-value.medium {
        color: #fd7e14;
        font-weight: bold;
      }
      
      .result-value.bad {
        color: #dc3545;
        font-weight: bold;
      }
      
      .results-chart {
        height: 30px;
        display: flex;
        margin: 20px 0;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .chart-bar {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
        transition: width 0.5s ease;
      }
      
      .chart-bar.cooperation {
        background-color: #28a745;
      }
      
      .chart-bar.mixed {
        background-color: #fd7e14;
      }
      
      .chart-bar.defection {
        background-color: #dc3545;
      }
      
      .results-conclusion {
        padding: 15px;
        background: #e9ecef;
        border-left: 3px solid #6c757d;
        margin-top: 15px;
      }
      
      .solution-comparison table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
      }
      
      .solution-comparison th,
      .solution-comparison td {
        padding: 8px 12px;
        border: 1px solid #dee2e6;
        text-align: left;
      }
      
      .solution-comparison th {
        background-color: #f1f3f5;
      }
      
      .range-labels {
        display: flex;
        justify-content: space-between;
        margin-top: 5px;
        font-size: 12px;
        color: #6c757d;
      }
      
      .strategy-effectiveness {
        height: 40px;
        background-color: #e9ecef;
        border-radius: 20px;
        position: relative;
        margin: 20px 0;
      }
      
      .effectiveness-bar {
        height: 100%;
        width: var(--effectiveness);
        background-color: #0066cc;
        border-radius: 20px;
        transition: width 0.5s ease;
      }
      
      .effectiveness-marker {
        position: absolute;
        top: -10px;
        left: var(--effectiveness);
        transform: translateX(-50%);
        width: 20px;
        height: 20px;
        background-color: #0066cc;
        border: 3px solid white;
        border-radius: 50%;
      }
      
      .effectiveness-scale {
        display: flex;
        justify-content: space-between;
        margin-top: 5px;
        font-size: 12px;
        color: #6c757d;
      }
      
      .mechanism-selector {
        margin-bottom: 20px;
      }
      
      .mechanism-options {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-top: 10px;
      }
      
      .mechanism-option {
        flex: 1;
        min-width: 200px;
        padding: 15px;
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      
      .mechanism-option.selected {
        background: #e8f4ff;
        border-color: #0066cc;
        box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.25);
      }
      
      .mechanism-option h6 {
        margin-top: 0;
        margin-bottom: 8px;
      }
      
      .mechanism-option p {
        margin: 0;
        font-size: 14px;
        color: #6c757d;
      }
      
      .parameter {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }
      
      .parameter label {
        width: 180px;
      }
      
      .parameter input[type="range"] {
        flex: 1;
      }
      
      .attack-outcome {
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .attack-outcome.attack-success {
        background-color: rgba(220, 53, 69, 0.15);
      }
      
      .attack-outcome.attack-failed {
        background-color: rgba(40, 167, 69, 0.15);
      }
      
      .attack-details {
        margin-bottom: 15px;
      }
      
      .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px solid #dee2e6;
      }
      
      .conclusion-section {
        margin-top: 30px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
      }
      
      .insights-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 15px;
        margin-top: 15px;
      }
      
      .insight-card {
        padding: 15px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }
      
      .insight-card h5 {
        margin-top: 0;
        margin-bottom: 10px;
        color: #0066cc;
      }
      
      .insight-card p {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
      }
    `;
    
    document.head.appendChild(style);
    
    // Reset button
    document.getElementById(`${demoId}-reset`).addEventListener('click', () => {
      // Reset prisoners dilemma
      document.getElementById(`${demoId}-actor-type`).value = 'rational';
      document.getElementById(`${demoId}-rounds`).value = '100';
      document.getElementById(`${demoId}-pd-results`).innerHTML = '<div class="results-placeholder">Run a simulation to see results</div>';
      
      // Reset coordination game
      document.getElementById(`${demoId}-strategy`).value = 'standard';
      document.getElementById(`${demoId}-actor-mix`).value = '50';
      document.getElementById(`${demoId}-cg-results`).innerHTML = '<div class="results-placeholder">Run an analysis to see results</div>';
      
      // Reset consensus mechanism
      mechanismOptions.forEach(opt => opt.classList.remove('selected'));
      document.querySelector(`.mechanism-option[data-mechanism="pow"]`).classList.add('selected');
      document.getElementById(`${demoId}-attack-budget`).value = '30';
      document.getElementById(`${demoId}-honest-nodes`).value = '100';
      document.getElementById(`${demoId}-attack-type`).value = '51';
      document.getElementById(`${demoId}-attack-results`).innerHTML = '<div class="results-placeholder">Run a simulation to see results</div>';
      
      // Reset state
      gameTheoryState.prisonersDilemma = {
        actorType: 'rational',
        rounds: 100,
        results: null
      };
      
      gameTheoryState.coordinationGame = {
        strategy: 'standard',
        actorMix: 50,
        results: null
      };
      
      gameTheoryState.consensusMechanism = {
        selected: 'pow',
        attackBudget: 30,
        honestNodes: 100,
        attackType: '51',
        results: null
      };
    });
    
    // Return the demo instance
    return {
      state: gameTheoryState,
      cleanup: () => {
        // Remove event listeners if needed
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

/**
 * Interactive Demos for Web3 Education
 * This file contains interactive components for blockchain education
 */

/**
 * Initialize interactive demos when the page loads
 */
document.addEventListener('DOMContentLoaded', function() {
  // We'll detect and initialize demos based on their presence in the DOM
  initializeAvailableDemos();
});

/**
 * Initialize all available demos
 */
function initializeAvailableDemos() {
  // Check for specific demo containers and initialize as needed
  if (document.getElementById('blockchain-demo')) {
    initializeBlockchainDemo();
  }
  
  if (document.getElementById('signing-demo')) {
    initializeSigningDemo();
  }
  
  if (document.getElementById('smart-contract-demo')) {
    initializeSmartContractDemo();
  }
}

/**
 * Initialize blockchain visualization demo
 */
function initializeBlockchainDemo() {
  const demoContainer = document.getElementById('blockchain-demo');
  if (!demoContainer) return;
  
  // Create a simple blockchain visualization
  const blockCount = 5;
  let blocks = [];
  
  // Create initial UI
  demoContainer.innerHTML = `
    <h4>Interactive Blockchain Demo</h4>
    <p>See how changing data affects the entire blockchain:</p>
    
    <div class="blockchain-container">
      <div id="blocks-container" class="blocks-container"></div>
    </div>
    
    <div class="demo-controls">
      <button id="add-block-btn" class="btn secondary">Add Block</button>
      <button id="reset-chain-btn" class="btn secondary">Reset Chain</button>
    </div>
  `;
  
  // Generate initial blockchain
  generateBlocks(blockCount);
  
  // Set up event listeners
  document.getElementById('add-block-btn').addEventListener('click', addNewBlock);
  document.getElementById('reset-chain-btn').addEventListener('click', () => {
    blocks = [];
    generateBlocks(blockCount);
  });
  
  /**
   * Generate blockchain blocks
   * @param {number} count - Number of blocks to generate
   */
  function generateBlocks(count) {
    const blocksContainer = document.getElementById('blocks-container');
    blocksContainer.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
      // For the first block, previous hash is "0"
      const previousHash = i === 0 ? "0000000000000000" : blocks[i-1].hash;
      
      // Create a new block with some data
      const block = {
        index: i,
        timestamp: new Date().toISOString(),
        data: `Transaction data ${i}`,
        previousHash: previousHash,
        nonce: Math.floor(Math.random() * 100000)
      };
      
      // Calculate hash
      block.hash = calculateHash(block);
      blocks[i] = block;
      
      // Create block element
      const blockElement = document.createElement('div');
      blockElement.className = 'block';
      blockElement.innerHTML = `
        <div class="block-header">Block #${i}</div>
        <div class="block-content">
          <div class="block-field">
            <label>Data:</label>
            <input type="text" class="block-data" value="${block.data}" data-index="${i}">
          </div>
          <div class="block-field">
            <label>Previous Hash:</label>
            <div class="hash">${block.previousHash.substring(0, 8)}...</div>
          </div>
          <div class="block-field">
            <label>Hash:</label>
            <div class="hash">${block.hash.substring(0, 8)}...</div>
          </div>
        </div>
      `;
      
      blocksContainer.appendChild(blockElement);
    }
    
    // Add event listeners to data inputs
    document.querySelectorAll('.block-data').forEach(input => {
      input.addEventListener('input', updateBlockData);
    });
  }
  
  /**
   * Update block data when input changes
   * @param {Event} event - Input event
   */
  function updateBlockData(event) {
    const index = parseInt(event.target.getAttribute('data-index'));
    
    // Update block data
    blocks[index].data = event.target.value;
    blocks[index].hash = calculateHash(blocks[index]);
    
    // Update UI for this block's hash
    const blockElements = document.querySelectorAll('.block');
    const hashDisplay = blockElements[index].querySelector('.hash:last-child');
    hashDisplay.textContent = blocks[index].hash.substring(0, 8) + '...';
    
    // Update all subsequent blocks (they're now invalid)
    for (let i = index + 1; i < blocks.length; i++) {
      blocks[i].previousHash = blocks[i-1].hash;
      blocks[i].hash = calculateHash(blocks[i]);
      
      // Update UI
      const prevHashDisplay = blockElements[i].querySelector('.hash:first-of-type');
      const hashDisplay = blockElements[i].querySelector('.hash:last-child');
      
      prevHashDisplay.textContent = blocks[i].previousHash.substring(0, 8) + '...';
      hashDisplay.textContent = blocks[i].hash.substring(0, 8) + '...';
      
      // Mark block as invalid
      blockElements[i].classList.add('invalid');
    }
    
    // Mark the changed block as changed
    blockElements[index].classList.add('changed');
    
    // Remove changed class after animation
    setTimeout(() => {
      blockElements[index].classList.remove('changed');
    }, 1000);
  }
  
  /**
   * Add a new block to the chain
   */
  function addNewBlock() {
    const index = blocks.length;
    const previousHash = blocks[index-1].hash;
    
    // Create a new block
    const block = {
      index: index,
      timestamp: new Date().toISOString(),
      data: `Transaction data ${index}`,
      previousHash: previousHash,
      nonce: Math.floor(Math.random() * 100000)
    };
    
    // Calculate hash
    block.hash = calculateHash(block);
    blocks.push(block);
    
    // Create block element
    const blockElement = document.createElement('div');
    blockElement.className = 'block new-block';
    blockElement.innerHTML = `
      <div class="block-header">Block #${index}</div>
      <div class="block-content">
        <div class="block-field">
          <label>Data:</label>
          <input type="text" class="block-data" value="${block.data}" data-index="${index}">
        </div>
        <div class="block-field">
          <label>Previous Hash:</label>
          <div class="hash">${block.previousHash.substring(0, 8)}...</div>
        </div>
        <div class="block-field">
          <label>Hash:</label>
          <div class="hash">${block.hash.substring(0, 8)}...</div>
        </div>
      </div>
    `;
    
    document.getElementById('blocks-container').appendChild(blockElement);
    
    // Add event listener
    blockElement.querySelector('.block-data').addEventListener('input', updateBlockData);
    
    // Remove the new-block class after animation
    setTimeout(() => {
      blockElement.classList.remove('new-block');
    }, 1000);
  }
  
  /**
   * Calculate a simple hash for a block
   * @param {Object} block - Block to hash
   * @returns {string} Block hash
   */
  function calculateHash(block) {
    // In a real blockchain, this would be a cryptographic hash function
    // For this demo, we'll use a simple string-based approach
    const blockString = block.index + block.previousHash + block.timestamp + block.data + block.nonce;
    
    // Simple hash function that returns a hex string
    let hash = 0;
    for (let i = 0; i < blockString.length; i++) {
      const char = blockString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to hex string and ensure it's 16 characters
    return Math.abs(hash).toString(16).padStart(16, '0');
  }
}

/**
 * Initialize signing demo
 */
function initializeSigningDemo() {
  const demoContainer = document.getElementById('signing-demo');
  if (!demoContainer) return;
  
  // Create UI
  demoContainer.innerHTML = `
    <h4>Digital Signature Demo</h4>
    <p>See how digital signatures work in blockchain:</p>
    
    <div class="signing-container">
      <div class="input-group">
        <label for="message-input">Message:</label>
        <textarea id="message-input" rows="3">Hello, blockchain world!</textarea>
      </div>
      
      <div class="key-container">
        <div class="key private-key">
          <h5>Private Key (Keep Secret!)</h5>
          <div class="key-value" id="private-key">...</div>
          <button id="generate-keys-btn" class="btn secondary">Generate New Keys</button>
        </div>
        
        <div class="key public-key">
          <h5>Public Key (Share Freely)</h5>
          <div class="key-value" id="public-key">...</div>
        </div>
      </div>
      
      <div class="signature-container">
        <button id="sign-btn" class="btn primary">Sign Message</button>
        <div class="signature-output">
          <h5>Signature:</h5>
          <div class="signature-value" id="signature">No signature yet</div>
        </div>
        <div class="verification">
          <button id="verify-btn" class="btn secondary" disabled>Verify Signature</button>
          <div class="verification-result" id="verification-result"></div>
        </div>
      </div>
    </div>
  `;
  
  // Mock key pair
  let keyPair = null;
  
  // Set up event listeners
  document.getElementById('generate-keys-btn').addEventListener('click', generateKeyPair);
  document.getElementById('sign-btn').addEventListener('click', signMessage);
  document.getElementById('verify-btn').addEventListener('click', verifySignature);
  document.getElementById('message-input').addEventListener('input', clearSignature);
  
  // Generate initial keys
  generateKeyPair();
  
  /**
   * Generate a new key pair
   */
  function generateKeyPair() {
    // In a real application, this would use proper cryptographic functions
    // For this demo, we'll just create mock keys
    const privateKey = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const publicKey = Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    keyPair = { privateKey, publicKey };
    
    document.getElementById('private-key').textContent = `${privateKey.substring(0, 6)}...${privateKey.substring(privateKey.length - 4)}`;
    document.getElementById('public-key').textContent = `${publicKey.substring(0, 6)}...${publicKey.substring(publicKey.length - 4)}`;
    
    clearSignature();
  }
  
  /**
   * Sign a message
   */
  function signMessage() {
    const message = document.getElementById('message-input').value;
    if (!message || !keyPair) return;
    
    const signatureElement = document.getElementById('signature');
    signatureElement.textContent = 'Signing...';
    
    // Simulate processing time
    setTimeout(() => {
      // In a real application, this would use proper cryptographic functions
      // For this demo, we'll create a mock signature based on the message and private key
      const mockSignature = createMockSignature(message, keyPair.privateKey);
      
      signatureElement.textContent = `${mockSignature.substring(0, 12)}...${mockSignature.substring(mockSignature.length - 8)}`;
      signatureElement.setAttribute('data-full-signature', mockSignature);
      
      // Enable verify button
      document.getElementById('verify-btn').disabled = false;
      document.getElementById('verification-result').textContent = '';
    }, 800);
  }
  
  /**
   * Verify a signature
   */
  function verifySignature() {
    const message = document.getElementById('message-input').value;
    const signature = document.getElementById('signature').getAttribute('data-full-signature');
    
    if (!message || !signature || !keyPair) return;
    
    const verificationResult = document.getElementById('verification-result');
    verificationResult.textContent = 'Verifying...';
    verificationResult.className = 'verification-result';
    
    // Simulate processing time
    setTimeout(() => {
      // In a real application, this would use proper cryptographic functions
      // For this demo, we'll verify by recreating the mock signature
      const expectedSignature = createMockSignature(message, keyPair.privateKey);
      const isValid = (expectedSignature === signature);
      
      verificationResult.textContent = isValid ? 'Valid signature ✓' : 'Invalid signature ✗';
      verificationResult.className = `verification-result ${isValid ? 'valid' : 'invalid'}`;
    }, 1000);
  }
  
  /**
   * Clear signature when message changes
   */
  function clearSignature() {
    document.getElementById('signature').textContent = 'No signature yet';
    document.getElementById('signature').removeAttribute('data-full-signature');
    document.getElementById('verify-btn').disabled = true;
    document.getElementById('verification-result').textContent = '';
    document.getElementById('verification-result').className = 'verification-result';
  }
  
  /**
   * Create a mock signature
   * @param {string} message - Message to sign
   * @param {string} privateKey - Private key
   * @returns {string} Signature
   */
  function createMockSignature(message, privateKey) {
    // In a real application, this would use proper cryptographic functions
    // For this demo, we'll create a mock signature based on the message and private key
    let hash = 0;
    const combinedString = message + privateKey;
    
    for (let i = 0; i < combinedString.length; i++) {
      const char = combinedString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to hex string
    const mockSignature = Array.from({length: 64}, (_, i) => {
      const shift = (hash >> (i % 32)) & 15;
      return (shift + Math.floor(Math.random() * 16) % 16).toString(16);
    }).join('');
    
    return mockSignature;
  }
}

/**
 * Initialize smart contract demo
 */
function initializeSmartContractDemo() {
  const demoContainer = document.getElementById('smart-contract-demo');
  if (!demoContainer) return;
  
  // Create UI
  demoContainer.innerHTML = `
    <h4>Smart Contract Interaction Demo</h4>
    <p>Experience how smart contracts work by interacting with a simple token contract:</p>
    
    <div class="contract-container">
      <div class="contract-code">
        <h5>Sample Token Contract Code:</h5>
        <pre><code class="language-solidity">// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(string memory _name, string memory _symbol, uint8 _decimals, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _initialSupply * 10**uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[_from] >= _value);
        require(allowance[_from][msg.sender] >= _value);
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}</code></pre>
      </div>
      
      <div class="contract-interaction">
        <div class="contract-state">
          <h5>Contract State:</h5>
          <div class="state-item">
            <span>Name:</span>
            <span id="token-name">Education Token</span>
          </div>
          <div class="state-item">
            <span>Symbol:</span>
            <span id="token-symbol">EDU</span>
          </div>
          <div class="state-item">
            <span>Total Supply:</span>
            <span id="token-supply">1,000,000</span>
          </div>
          <div class="state-item">
            <span>Your Balance:</span>
            <span id="token-balance">0</span>
          </div>
        </div>
        
        <div class="contract-actions">
          <h5>Interact with Contract:</h5>
          <div class="action-item">
            <label for="transfer-amount">Transfer Amount:</label>
            <input type="number" id="transfer-amount" min="1" max="1000" value="100">
          </div>
          <div class="action-item">
            <label for="transfer-address">To Address:</label>
            <input type="text" id="transfer-address" placeholder="0x..." value="0xdAC17F958D2ee523a2206206994597C13D831ec7">
          </div>
          <button id="transfer-btn" class="btn primary">Transfer Tokens</button>
          <div id="transfer-result" class="action-result"></div>
          
          <div class="action-divider"></div>
          
          <div class="action-item">
            <label for="mint-amount">Request Test Tokens:</label>
            <input type="number" id="mint-amount" min="100" max="1000" value="100">
          </div>
          <button id="mint-btn" class="btn secondary">Request Tokens</button>
          <div id="mint-result" class="action-result"></div>
        </div>
      </div>
    </div>
  `;
  
  // Mock contract state
  let tokenState = {
    name: 'Education Token',
    symbol: 'EDU',
    totalSupply: 1000000,
    userBalance: 0,
    transactions: []
  };
  
  // Set up event listeners
  const transferBtn = document.getElementById('transfer-btn');
  const mintBtn = document.getElementById('mint-btn');
  
  if (transferBtn) {
    transferBtn.addEventListener('click', handleTransfer);
  }
  
  if (mintBtn) {
    mintBtn.addEventListener('click', handleMint);
  }
  
  // Apply syntax highlighting if available
  if (window.hljs) {
    document.querySelectorAll('pre code').forEach((block) => {
      window.hljs.highlightBlock(block);
    });
  }
  
  /**
   * Handle token transfer
   */
  async function handleTransfer() {
    const amount = parseInt(document.getElementById('transfer-amount').value);
    const toAddress = document.getElementById('transfer-address').value;
    const resultElement = document.getElementById('transfer-result');
    
    if (!amount || !toAddress || toAddress.length < 10) {
      resultElement.innerHTML = '<span class="error">Please enter a valid amount and address</span>';
      return;
    }
    
    if (tokenState.userBalance < amount) {
      resultElement.innerHTML = '<span class="error">Insufficient balance</span>';
      return;
    }
    
    resultElement.innerHTML = '<span class="pending">Processing transaction...</span>';
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update balances
    tokenState.userBalance -= amount;
    
    // Add transaction to history
    const txHash = '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    tokenState.transactions.push({
      hash: txHash,
      from: 'Your Address',
      to: toAddress,
      amount: amount,
      timestamp: new Date()
    });
    
    // Update UI
    document.getElementById('token-balance').textContent = tokenState.userBalance;
    
    resultElement.innerHTML = `
      <span class="success">Transfer successful!</span>
      <div class="tx-details">
        <span>Transaction Hash:</span>
        <a href="#" class="tx-hash">${txHash.substring(0, 8)}...${txHash.substring(60)}</a>
      </div>
    `;
  }
  
  /**
   * Handle token mint (request tokens)
   */
  async function handleMint() {
    const amount = parseInt(document.getElementById('mint-amount').value);
    const resultElement = document.getElementById('mint-result');
    
    if (!amount || amount < 100 || amount > 1000) {
      resultElement.innerHTML = '<span class="error">Please enter a valid amount (100-1000)</span>';
      return;
    }
    
    resultElement.innerHTML = '<span class="pending">Requesting tokens...</span>';
    
    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user has requested tokens in the last minute
    const lastMint = tokenState.transactions.find(tx => 
      tx.type === 'mint' && (new Date() - tx.timestamp) < 60000
    );
    
    if (lastMint) {
      resultElement.innerHTML = '<span class="error">Please wait before requesting more tokens</span>';
      return;
    }
    
    // Update balance
    tokenState.userBalance += amount;
    
    // Add transaction to history
    const txHash = '0x' + Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    tokenState.transactions.push({
      hash: txHash,
      type: 'mint',
      amount: amount,
      timestamp: new Date()
    });
    
    // Update UI
    document.getElementById('token-balance').textContent = tokenState.userBalance;
    
    resultElement.innerHTML = `
      <span class="success">Received ${amount} EDU tokens!</span>
      <div class="tx-details">
        <span>Transaction Hash:</span>
        <a href="#" class="tx-hash">${txHash.substring(0, 8)}...${txHash.substring(60)}</a>
      </div>
    `;
  }
}

/**
 * Add stylesheet for interactive demos
 */
function addDemoStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .blockchain-container {
      margin: 20px 0;
      overflow-x: auto;
    }
    
    .blocks-container {
      display: flex;
      gap: 15px;
      padding: 10px 0;
    }
    
    .block {
      min-width: 200px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .block.invalid {
      background-color: #ffecec;
      border-left: 3px solid #f44336;
    }
    
    .block.changed {
      animation: pulse 1s;
    }
    
    .block.new-block {
      animation: slide-in 0.5s;
    }
    
    @keyframes pulse {
      0% { background-color: #fff; }
      50% { background-color: #e3f2fd; }
      100% { background-color: #fff; }
    }
    
    @keyframes slide-in {
      from { opacity: 0; transform: translateX(50px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    .block-header {
      padding: 10px;
      background: #0066cc;
      color: white;
      font-weight: bold;
    }
    
    .block-content {
      padding: 15px;
    }
    
    .block-field {
      margin-bottom: 10px;
    }
    
    .block-field label {
      display: block;
      font-size: 0.8rem;
      color: #666;
      margin-bottom: 5px;
    }
    
    .block-data {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .hash {
      font-family: monospace;
      background: #f5f5f5;
      padding: 5px 8px;
      border-radius: 4px;
      font-size: 14px;
      word-break: break-all;
    }
    
    .demo-controls {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }
    
    /* Signing demo styles */
    .signing-container {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .key-container {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin: 20px 0;
    }
    
    .key {
      flex: 1;
      min-width: 250px;
      padding: 15px;
      border-radius: 8px;
    }
    
    .private-key {
      background: #fff3e0;
      border: 1px solid #ffcc80;
    }
    
    .public-key {
      background: #e8f5e9;
      border: 1px solid #a5d6a7;
    }
    
    .key h5 {
      margin-top: 0;
      margin-bottom: 10px;
    }
    
    .key-value {
      font-family: monospace;
      padding: 8px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 4px;
      margin-bottom: 15px;
    }
    
    .signature-container {
      margin-top: 20px;
    }
    
    .signature-output {
      margin: 15px 0;
    }
    
    .signature-value {
      font-family: monospace;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
      word-break: break-all;
    }
    
    .verification {
      margin-top: 15px;
    }
    
    .verification-result {
      margin-top: 10px;
      padding: 8px;
      border-radius: 4px;
      text-align: center;
    }
    
    .verification-result.valid {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .verification-result.invalid {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    /* Smart contract demo styles */
    .contract-container {
      margin: 20px 0;
    }
    
    .contract-code {
      margin-bottom: 20px;
    }
    
    .contract-interaction {
      display: flex;
      flex-wrap: wrap;
      gap: 30px;
    }
    
    .contract-state, .contract-actions {
      flex: 1;
      min-width: 250px;
    }
    
    .state-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    
    .action-item {
      margin-bottom: 15px;
    }
    
    .action-item label {
      display: block;
      margin-bottom: 5px;
    }
    
    .action-item input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .action-divider {
      height: 1px;
      background: #eee;
      margin: 20px 0;
    }
    
    .action-result {
      margin-top: 10px;
      min-height: 24px;
    }
    
    .action-result .error {
      color: #dc3545;
    }
    
    .action-result .success {
      color: #28a745;
    }
    
    .action-result .pending {
      color: #ffc107;
    }
    
    .tx-details {
      margin-top: 8px;
      font-size: 0.9rem;
      display: flex;
      gap: 8px;
    }
    
    .tx-hash {
      font-family: monospace;
      color: #0066cc;
    }
  `;
  
  document.head.appendChild(style);
}

// Add styles when the page loads
document.addEventListener('DOMContentLoaded', addDemoStyles);