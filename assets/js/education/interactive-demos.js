/**
 * Web3 Educational Interactive Demos
 * 
 * This module provides interactive demonstrations for educational content,
 * including blockchain visualizers, code editors, and DeFi simulators.
 */

class InteractiveDemos {
  constructor(options = {}) {
    this.contractManager = options.contractManager;
    this.walletConnector = options.walletConnector;
    
    // Map of demo types to their initialization functions
    this.demoInitializers = {
      'block-explorer': this.initBlockExplorer.bind(this),
      'code-editor': this.initCodeEditor.bind(this),
      'defi-simulator': this.initDefiSimulator.bind(this)
    };
    
    // Optional configurations
    this.config = {
      codeEditorTheme: options.codeEditorTheme || 'vs-dark',
      maxBlocks: options.maxBlocks || 5,
      simulationSpeed: options.simulationSpeed || 'normal'
    };
  }
  
  /**
   * Initialize a demo in the provided container
   */
  initializeDemo(demoType, containerId, demoId = null) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID "${containerId}" not found`);
      return false;
    }
    
    // Get the initializer for this demo type
    const initializer = this.demoInitializers[demoType];
    if (!initializer) {
      console.error(`Demo type "${demoType}" not supported`);
      container.innerHTML = 'Interactive demo type not supported.';
      return false;
    }
    
    // Call the initializer
    try {
      initializer(container, demoId);
      return true;
    } catch (error) {
      console.error(`Error initializing ${demoType} demo:`, error);
      container.innerHTML = 'Failed to initialize interactive demo.';
      return false;
    }
  }
  
  /**
   * Initialize a Block Explorer demo
   */
  initBlockExplorer(container, demoId) {
    container.innerHTML = `
      <div class="block-explorer demo-container">
        <div class="demo-header">
          <h3>Blockchain Explorer</h3>
          <div class="demo-controls">
            <button id="add-block-btn">Add Block</button>
            <button id="modify-block-btn">Modify Data</button>
            <button id="verify-chain-btn">Verify Chain</button>
          </div>
        </div>
        
        <div class="blockchain-visualization" id="chain-visualization">
          <div class="blockchain">
            <!-- Blocks will be added here -->
          </div>
        </div>
        
        <div class="demo-panel">
          <div class="panel-section">
            <h4>Block Data</h4>
            <div class="form-group">
              <label for="new-block-data">Transaction Data:</label>
              <textarea id="new-block-data" rows="3" placeholder="Enter transaction data for the next block...">Alice sends 5 ETH to Bob</textarea>
            </div>
          </div>
          
          <div class="panel-section">
            <h4>Chain Status</h4>
            <div id="chain-status" class="chain-status valid">
              VALID: Blockchain integrity verified
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Set up the initial blockchain
    this._setupBlockchain(container);
    
    // Add event listeners
    const addBlockBtn = container.querySelector('#add-block-btn');
    if (addBlockBtn) {
      addBlockBtn.addEventListener('click', () => {
        this._addNewBlock(container);
      });
    }
    
    const modifyBlockBtn = container.querySelector('#modify-block-btn');
    if (modifyBlockBtn) {
      modifyBlockBtn.addEventListener('click', () => {
        this._modifyRandomBlock(container);
      });
    }
    
    const verifyChainBtn = container.querySelector('#verify-chain-btn');
    if (verifyChainBtn) {
      verifyChainBtn.addEventListener('click', () => {
        this._verifyBlockchain(container);
      });
    }
  }
  
  /**
   * Set up initial blockchain with genesis block
   */
  _setupBlockchain(container) {
    const blockchain = container.querySelector('.blockchain');
    if (!blockchain) return;
    
    // Clear existing blocks
    blockchain.innerHTML = '';
    
    // Add genesis block
    const genesisBlock = this._createBlockElement(0, 'Genesis Block', '0000000000000000000000000000000000000000000000000000000000000000');
    blockchain.appendChild(genesisBlock);
    
    // Store blockchain data
    container.dataset.blocks = JSON.stringify([
      {
        index: 0,
        timestamp: Date.now(),
        data: 'Genesis Block',
        previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
        hash: this._calculateHash(0, Date.now(), 'Genesis Block', '0000000000000000000000000000000000000000000000000000000000000000'),
        nonce: 0
      }
    ]);
  }
  
  /**
   * Create a block element for visualization
   */
  _createBlockElement(index, data, previousHash) {
    const timestamp = Date.now();
    const hash = this._calculateHash(index, timestamp, data, previousHash);
    
    const blockEl = document.createElement('div');
    blockEl.className = 'block';
    blockEl.dataset.index = index;
    blockEl.dataset.hash = hash;
    
    blockEl.innerHTML = `
      <div class="block-header">Block #${index}</div>
      <div class="block-content">
        <div class="block-info">
          <div>Previous Hash: <span class="prev-hash">${previousHash.substring(0, 6)}...</span></div>
          <div>Hash: <span class="block-hash">${hash.substring(0, 6)}...</span></div>
          <div>Data: <span class="block-data">${data.length > 20 ? data.substring(0, 20) + '...' : data}</span></div>
        </div>
      </div>
    `;
    
    return blockEl;
  }
  
  /**
   * Calculate hash for a block (simplified)
   */
  _calculateHash(index, timestamp, data, previousHash) {
    // In a real app, we would use a proper hashing algorithm
    // For this demo, we'll create a simplified hash
    const str = index + timestamp + data + previousHash;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to hex string and ensure it's positive
    return (hash >>> 0).toString(16).padStart(64, '0');
  }
  
  /**
   * Add a new block to the blockchain
   */
  _addNewBlock(container) {
    const blockchain = container.querySelector('.blockchain');
    const dataInput = container.querySelector('#new-block-data');
    if (!blockchain || !dataInput) return;
    
    // Get blockchain data
    const blocks = JSON.parse(container.dataset.blocks || '[]');
    if (blocks.length === 0) {
      this._setupBlockchain(container);
      return;
    }
    
    // Get previous block
    const previousBlock = blocks[blocks.length - 1];
    const newIndex = previousBlock.index + 1;
    const data = dataInput.value.trim() || `Transaction #${newIndex}`;
    
    // Create new block
    const timestamp = Date.now();
    const newHash = this._calculateHash(newIndex, timestamp, data, previousBlock.hash);
    
    // Add to visualizer
    const newBlockEl = this._createBlockElement(newIndex, data, previousBlock.hash);
    
    // Add block connector
    const connector = document.createElement('div');
    connector.className = 'block-connector';
    connector.textContent = '→';
    blockchain.appendChild(connector);
    blockchain.appendChild(newBlockEl);
    
    // Add to data
    blocks.push({
      index: newIndex,
      timestamp,
      data,
      previousHash: previousBlock.hash,
      hash: newHash,
      nonce: 0
    });
    
    container.dataset.blocks = JSON.stringify(blocks);
    
    // Clear input
    dataInput.value = '';
    
    // Verify chain is valid
    this._verifyBlockchain(container);
    
    // Scroll to the end
    blockchain.scrollLeft = blockchain.scrollWidth;
  }
  
  /**
   * Modify a random block to demonstrate blockchain immutability
   */
  _modifyRandomBlock(container) {
    // Get blockchain data
    const blocks = JSON.parse(container.dataset.blocks || '[]');
    if (blocks.length <= 1) return; // Don't modify genesis block
    
    // Select a random block (not the genesis block)
    const randomIndex = Math.floor(Math.random() * (blocks.length - 1)) + 1;
    const blockToModify = blocks[randomIndex];
    
    // Modify the data
    blockToModify.data = `MODIFIED: ${blockToModify.data}`;
    
    // Update hash
    blockToModify.hash = this._calculateHash(
      blockToModify.index,
      blockToModify.timestamp,
      blockToModify.data,
      blockToModify.previousHash
    );
    
    // Update visuals
    const blockEl = container.querySelector(`.block[data-index="${blockToModify.index}"]`);
    if (blockEl) {
      const dataEl = blockEl.querySelector('.block-data');
      const hashEl = blockEl.querySelector('.block-hash');
      if (dataEl) dataEl.textContent = blockToModify.data.length > 20 ? blockToModify.data.substring(0, 20) + '...' : blockToModify.data;
      if (hashEl) hashEl.textContent = blockToModify.hash.substring(0, 6) + '...';
      blockEl.dataset.hash = blockToModify.hash;
      
      // Indicate modified block
      blockEl.classList.add('modified');
    }
    
    // Save updates
    container.dataset.blocks = JSON.stringify(blocks);
    
    // Verify chain to show it's now invalid
    this._verifyBlockchain(container);
  }
  
  /**
   * Verify the integrity of the blockchain
   */
  _verifyBlockchain(container) {
    const blocks = JSON.parse(container.dataset.blocks || '[]');
    const chainStatusEl = container.querySelector('#chain-status');
    if (!chainStatusEl) return;
    
    let isValid = true;
    const blockElements = container.querySelectorAll('.block');
    
    // Reset visual state
    blockElements.forEach(blockEl => {
      blockEl.classList.remove('invalid');
    });
    
    // Check each block
    for (let i = 1; i < blocks.length; i++) {
      const currentBlock = blocks[i];
      const previousBlock = blocks[i - 1];
      
      // Check if previous hash reference is correct
      if (currentBlock.previousHash !== previousBlock.hash) {
        isValid = false;
        
        // Mark invalid in UI
        const blockEl = container.querySelector(`.block[data-index="${currentBlock.index}"]`);
        if (blockEl) blockEl.classList.add('invalid');
        
        continue;
      }
      
      // Check if current hash is valid
      const calculatedHash = this._calculateHash(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.previousHash
      );
      
      if (currentBlock.hash !== calculatedHash) {
        isValid = false;
        
        // Mark this and all subsequent blocks as invalid
        for (let j = i; j < blocks.length; j++) {
          const invalidBlockEl = container.querySelector(`.block[data-index="${blocks[j].index}"]`);
          if (invalidBlockEl) invalidBlockEl.classList.add('invalid');
        }
        
        break;
      }
    }
    
    // Update status indicator
    if (isValid) {
      chainStatusEl.className = 'chain-status valid';
      chainStatusEl.textContent = 'VALID: Blockchain integrity verified';
    } else {
      chainStatusEl.className = 'chain-status invalid';
      chainStatusEl.textContent = 'INVALID: Blockchain tampering detected';
    }
  }
  
  /**
   * Initialize a Code Editor demo
   */
  initCodeEditor(container, demoId) {
    container.innerHTML = `
      <div class="code-editor-demo demo-container">
        <div class="demo-header">
          <h3>Solidity Playground</h3>
          <div class="demo-controls">
            <button id="compile-code-btn">Compile</button>
            <button id="deploy-code-btn">Deploy</button>
            <button id="reset-code-btn">Reset</button>
          </div>
        </div>
        
        <div class="editor-container">
          <textarea id="code-editor" class="code-editor-textarea" rows="15">// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    string public name = "MyToken";
    string public symbol = "MTK";
    uint256 public totalSupply = 1000000;
    
    mapping(address => uint256) public balanceOf;
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Not enough tokens");
        
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}</textarea>
        </div>
        
        <div class="output-container">
          <h4>Console Output</h4>
          <div id="editor-output" class="editor-output">Ready to compile...</div>
        </div>
      </div>
    `;
    
    // Add event listeners
    const compileBtn = container.querySelector('#compile-code-btn');
    if (compileBtn) {
      compileBtn.addEventListener('click', () => {
        this._compileCode(container);
      });
    }
    
    const deployBtn = container.querySelector('#deploy-code-btn');
    if (deployBtn) {
      deployBtn.addEventListener('click', () => {
        this._deployCode(container);
      });
    }
    
    const resetBtn = container.querySelector('#reset-code-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this._resetEditor(container);
      });
    }
    
    // If a third-party code editor is available (like Monaco or CodeMirror),
    // we could initialize it here for a better experience
  }
  
  /**
   * Simulate code compilation
   */
  _compileCode(container) {
    const outputEl = container.querySelector('#editor-output');
    const codeTextarea = container.querySelector('#code-editor');
    if (!outputEl || !codeTextarea) return;
    
    const code = codeTextarea.value;
    
    // Simple validation
    outputEl.innerHTML = 'Compiling...\n';
    
    setTimeout(() => {
      let hasError = false;
      
      // Very basic checks - in a real app this would be actual compilation
      if (!code.includes('pragma solidity')) {
        outputEl.innerHTML += 'Error: Missing solidity version pragma\n';
        hasError = true;
      }
      
      if (!code.includes('contract')) {
        outputEl.innerHTML += 'Error: No contract definition found\n';
        hasError = true;
      }
      
      // Check for opening/closing braces mismatch
      const openBraces = (code.match(/{/g) || []).length;
      const closeBraces = (code.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        outputEl.innerHTML += 'Error: Mismatched braces - check your syntax\n';
        hasError = true;
      }
      
      if (!hasError) {
        outputEl.innerHTML += 'Compilation successful! No errors found.\n';
        
        // Enable deploy button
        const deployBtn = container.querySelector('#deploy-code-btn');
        if (deployBtn) deployBtn.disabled = false;
      }
    }, 1000);
  }
  
  /**
   * Simulate contract deployment
   */
  _deployCode(container) {
    const outputEl = container.querySelector('#editor-output');
    if (!outputEl) return;
    
    const walletConnected = this.walletConnector && 
                           this.walletConnector.getConnectionState && 
                           this.walletConnector.getConnectionState().isConnected;
    
    if (!walletConnected) {
      outputEl.innerHTML = 'Please connect your wallet to deploy the contract.\n';
      
      // Add connect wallet button
      outputEl.innerHTML += '<button id="connect-wallet-btn" class="connect-btn">Connect Wallet</button>\n';
      
      const connectBtn = outputEl.querySelector('#connect-wallet-btn');
      if (connectBtn && this.walletConnector) {
        connectBtn.addEventListener('click', () => {
          this.walletConnector.connectWallet();
        });
      }
      return;
    }
    
    // Simulate deployment process
    outputEl.innerHTML = 'Deploying contract...\n';
    
    setTimeout(() => {
      outputEl.innerHTML += 'Waiting for confirmation...\n';
      
      setTimeout(() => {
        const fakeAddress = '0x' + Math.random().toString(16).substring(2, 42);
        outputEl.innerHTML += `Contract deployed successfully!\n`;
        outputEl.innerHTML += `Contract address: ${fakeAddress}\n`;
        
        // Add interaction UI
        outputEl.innerHTML += `
          <div class="contract-interaction">
            <h4>Contract Interaction</h4>
            <div class="function-call">
              <select id="function-selector">
                <option value="balanceOf">balanceOf(address)</option>
                <option value="transfer">transfer(address, uint256)</option>
              </select>
              <button id="call-function-btn">Call</button>
            </div>
          </div>
        `;
        
        // Add event listener for function call button
        const callFunctionBtn = outputEl.querySelector('#call-function-btn');
        if (callFunctionBtn) {
          callFunctionBtn.addEventListener('click', () => {
            const functionSelector = outputEl.querySelector('#function-selector');
            if (functionSelector) {
              outputEl.innerHTML += `Calling ${functionSelector.value}...\nFunction returned: true\n`;
            }
          });
        }
      }, 2000);
    }, 1500);
  }
  
  /**
   * Reset the code editor to initial state
   */
  _resetEditor(container) {
    const codeTextarea = container.querySelector('#code-editor');
    const outputEl = container.querySelector('#editor-output');
    
    if (codeTextarea) {
      codeTextarea.value = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    string public name = "MyToken";
    string public symbol = "MTK";
    uint256 public totalSupply = 1000000;
    
    mapping(address => uint256) public balanceOf;
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Not enough tokens");
        
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}`;
    }
    
    if (outputEl) {
      outputEl.innerHTML = 'Editor reset. Ready to compile...';
    }
  }
  
  /**
   * Initialize a DeFi Simulator demo
   */
  initDefiSimulator(container, demoId) {
    container.innerHTML = `
      <div class="defi-simulator demo-container">
        <div class="demo-header">
          <h3>DeFi Simulator</h3>
          <div class="demo-controls">
            <button id="add-liquidity-btn">Add Liquidity</button>
            <button id="swap-tokens-btn">Swap Tokens</button>
            <button id="stake-tokens-btn">Stake Tokens</button>
          </div>
        </div>
        
        <div class="simulator-container">
          <div class="defi-protocol">
            <h4>Decentralized Exchange</h4>
            <div class="liquidity-pool">
              <div class="pool-token">
                <span class="token-symbol">ETH</span>
                <span class="token-amount">100.0</span>
              </div>
              <div class="pool-token">
                <span class="token-symbol">DAI</span>
                <span class="token-amount">200000.0</span>
              </div>
            </div>
            <div class="pool-price">
              <span>Price: 1 ETH = 2000 DAI</span>
            </div>
          </div>
          
          <div class="wallet-balances">
            <h4>Your Wallet</h4>
            <div class="balance">
              <span class="token-symbol">ETH</span>
              <span class="token-amount" id="eth-balance">10.0</span>
            </div>
            <div class="balance">
              <span class="token-symbol">DAI</span>
              <span class="token-amount" id="dai-balance">5000.0</span>
            </div>
            <div class="balance">
              <span class="token-symbol">LP Tokens</span>
              <span class="token-amount" id="lp-balance">0.0</span>
            </div>
          </div>
        </div>
        
        <div class="transaction-panel">
          <div class="transaction-form swap-form">
            <h4>Swap Tokens</h4>
            <div class="form-group">
              <label for="swap-from-amount">From:</label>
              <input type="number" id="swap-from-amount" value="1.0" min="0" step="0.1">
              <select id="swap-from-token">
                <option value="ETH">ETH</option>
                <option value="DAI">DAI</option>
              </select>
            </div>
            <div class="form-group">
              <label for="swap-to-amount">To (estimated):</label>
              <input type="number" id="swap-to-amount" value="2000" disabled>
              <select id="swap-to-token">
                <option value="DAI">DAI</option>
                <option value="ETH">ETH</option>
              </select>
            </div>
            <div class="form-group">
              <button id="execute-swap-btn">Execute Swap</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    const addLiquidityBtn = container.querySelector('#add-liquidity-btn');
    if (addLiquidityBtn) {
      addLiquidityBtn.addEventListener('click', () => {
        this._showLiquidityForm(container);
      });
    }
    
    const swapTokensBtn = container.querySelector('#swap-tokens-btn');
    if (swapTokensBtn) {
      swapTokensBtn.addEventListener('click', () => {
        this._showSwapForm(container);
      });
    }
    
    const stakeTokensBtn = container.querySelector('#stake-tokens-btn');
    if (stakeTokensBtn) {
      stakeTokensBtn.addEventListener('click', () => {
        this._showStakeForm(container);
      });
    }
    
    const executeSwapBtn = container.querySelector('#execute-swap-btn');
    if (executeSwapBtn) {
      executeSwapBtn.addEventListener('click', () => {
        this._executeSwap(container);
      });
    }
    
    // Set up token exchange rate calculations
    const fromAmountEl = container.querySelector('#swap-from-amount');
    const fromTokenEl = container.querySelector('#swap-from-token');
    const toAmountEl = container.querySelector('#swap-to-amount');
    const toTokenEl = container.querySelector('#swap-to-token');
    
    if (fromAmountEl && fromTokenEl && toAmountEl && toTokenEl) {
      const updateToAmount = () => {
        const fromAmount = parseFloat(fromAmountEl.value) || 0;
        const fromToken = fromTokenEl.value;
        const toToken = toTokenEl.value;
        
        let toAmount;
        if (fromToken === 'ETH' && toToken === 'DAI') {
          toAmount = fromAmount * 2000; // 1 ETH = 2000 DAI
        } else if (fromToken === 'DAI' && toToken === 'ETH') {
          toAmount = fromAmount / 2000; // 2000 DAI = 1 ETH
        } else {
          toAmount = fromAmount;
        }
        
        toAmountEl.value = toAmount.toFixed(2);
      };
      
      fromAmountEl.addEventListener('input', updateToAmount);
      fromTokenEl.addEventListener('change', () => {
        // Swap the to token
        toTokenEl.value = fromTokenEl.value === 'ETH' ? 'DAI' : 'ETH';
        updateToAmount();
      });
    }
  }
  
  /**
   * Show the liquidity provision form
   */
  _showLiquidityForm(container) {
    const transactionPanel = container.querySelector('.transaction-panel');
    if (!transactionPanel) return;
    
    transactionPanel.innerHTML = `
      <div class="transaction-form liquidity-form">
        <h4>Add Liquidity</h4>
        <div class="form-group">
          <label for="liquidity-eth-amount">ETH Amount:</label>
          <input type="number" id="liquidity-eth-amount" value="1.0" min="0" step="0.1">
        </div>
        <div class="form-group">
          <label for="liquidity-dai-amount">DAI Amount:</label>
          <input type="number" id="liquidity-dai-amount" value="2000" min="0">
        </div>
        <div class="form-group">
          <button id="execute-add-liquidity-btn">Add Liquidity</button>
        </div>
      </div>
    `;
    
    const ethInputEl = transactionPanel.querySelector('#liquidity-eth-amount');
    const daiInputEl = transactionPanel.querySelector('#liquidity-dai-amount');
    
    // Link the two inputs with the correct ratio
    if (ethInputEl && daiInputEl) {
      ethInputEl.addEventListener('input', () => {
        const ethAmount = parseFloat(ethInputEl.value) || 0;
        daiInputEl.value = (ethAmount * 2000).toFixed(2);
      });
      
      daiInputEl.addEventListener('input', () => {
        const daiAmount = parseFloat(daiInputEl.value) || 0;
        ethInputEl.value = (daiAmount / 2000).toFixed(2);
      });
    }
    
    // Add event listener for liquidity button
    const addLiquidityBtn = transactionPanel.querySelector('#execute-add-liquidity-btn');
    if (addLiquidityBtn) {
      addLiquidityBtn.addEventListener('click', () => {
        this._executeAddLiquidity(container);
      });
    }
  }
  
  /**
   * Execute add liquidity operation
   */
  _executeAddLiquidity(container) {
    const ethInputEl = container.querySelector('#liquidity-eth-amount');
    const daiInputEl = container.querySelector('#liquidity-dai-amount');
    
    if (!ethInputEl || !daiInputEl) return;
    
    const ethAmount = parseFloat(ethInputEl.value) || 0;
    const daiAmount = parseFloat(daiInputEl.value) || 0;
    
    // Check user balances
    const ethBalanceEl = container.querySelector('#eth-balance');
    const daiBalanceEl = container.querySelector('#dai-balance');
    const lpBalanceEl = container.querySelector('#lp-balance');
    
    if (!ethBalanceEl || !daiBalanceEl || !lpBalanceEl) return;
    
    const ethBalance = parseFloat(ethBalanceEl.textContent) || 0;
    const daiBalance = parseFloat(daiBalanceEl.textContent) || 0;
    const lpBalance = parseFloat(lpBalanceEl.textContent) || 0;
    
    if (ethAmount > ethBalance) {
      alert('Insufficient ETH balance');
      return;
    }
    
    if (daiAmount > daiBalance) {
      alert('Insufficient DAI balance');
      return;
    }
    
    // Update balances
    ethBalanceEl.textContent = (ethBalance - ethAmount).toFixed(1);
    daiBalanceEl.textContent = (daiBalance - daiAmount).toFixed(1);
    
    // Give LP tokens - simplified calculation
    const newLpTokens = Math.sqrt(ethAmount * daiAmount) / 10;
    lpBalanceEl.textContent = (lpBalance + newLpTokens).toFixed(1);
    
    // Update pool in UI
    const poolEthEl = container.querySelector('.pool-token:nth-child(1) .token-amount');
    const poolDaiEl = container.querySelector('.pool-token:nth-child(2) .token-amount');
    
    if (poolEthEl && poolDaiEl) {
      const poolEth = parseFloat(poolEthEl.textContent) || 0;
      const poolDai = parseFloat(poolDaiEl.textContent) || 0;
      
      poolEthEl.textContent = (poolEth + ethAmount).toFixed(1);
      poolDaiEl.textContent = (poolDai + daiAmount).toFixed(1);
    }
    
    alert('Liquidity added successfully!');
  }
  
  /**
   * Show the swap form
   */
  _showSwapForm(container) {
    const transactionPanel = container.querySelector('.transaction-panel');
    if (!transactionPanel) return;
    
    transactionPanel.innerHTML = `
      <div class="transaction-form swap-form">
        <h4>Swap Tokens</h4>
        <div class="form-group">
          <label for="swap-from-amount">From:</label>
          <input type="number" id="swap-from-amount" value="1.0" min="0" step="0.1">
          <select id="swap-from-token">
            <option value="ETH">ETH</option>
            <option value="DAI">DAI</option>
          </select>
        </div>
        <div class="form-group">
          <label for="swap-to-amount">To (estimated):</label>
          <input type="number" id="swap-to-amount" value="2000" disabled>
          <select id="swap-to-token">
            <option value="DAI">DAI</option>
            <option value="ETH">ETH</option>
          </select>
        </div>
        <div class="form-group">
          <button id="execute-swap-btn">Execute Swap</button>
        </div>
      </div>
    `;
    
    // Set up token exchange rate calculations
    const fromAmountEl = transactionPanel.querySelector('#swap-from-amount');
    const fromTokenEl = transactionPanel.querySelector('#swap-from-token');
    const toAmountEl = transactionPanel.querySelector('#swap-to-amount');
    const toTokenEl = transactionPanel.querySelector('#swap-to-token');
    
    if (fromAmountEl && fromTokenEl && toAmountEl && toTokenEl) {
      const updateToAmount = () => {
        const fromAmount = parseFloat(fromAmountEl.value) || 0;
        const fromToken = fromTokenEl.value;
        const toToken = toTokenEl.value;
        
        let toAmount;
        if (fromToken === 'ETH' && toToken === 'DAI') {
          toAmount = fromAmount * 2000; // 1 ETH = 2000 DAI
        } else if (fromToken === 'DAI' && toToken === 'ETH') {
          toAmount = fromAmount / 2000; // 2000 DAI = 1 ETH
        } else {
          toAmount = fromAmount;
        }
        
        toAmountEl.value = toAmount.toFixed(2);
      };
      
      fromAmountEl.addEventListener('input', updateToAmount);
      fromTokenEl.addEventListener('change', () => {
        // Swap the to token
        toTokenEl.value = fromTokenEl.value === 'ETH' ? 'DAI' : 'ETH';
        updateToAmount();
      });
      
      // Initial calculation
      updateToAmount();
    }
    
    // Add event listener for swap button
    const swapBtn = transactionPanel.querySelector('#execute-swap-btn');
    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        this._executeSwap(container);
      });
    }
  }
  
  /**
   * Execute a token swap
   */
  _executeSwap(container) {
    const fromAmountEl = container.querySelector('#swap-from-amount');
    const fromTokenEl = container.querySelector('#swap-from-token');
    const toAmountEl = container.querySelector('#swap-to-amount');
    const toTokenEl = container.querySelector('#swap-to-token');
    
    if (!fromAmountEl || !fromTokenEl || !toAmountEl || !toTokenEl) return;
    
    const fromAmount = parseFloat(fromAmountEl.value) || 0;
    const fromToken = fromTokenEl.value;
    const toAmount = parseFloat(toAmountEl.value) || 0;
    const toToken = toTokenEl.value;
    
    // Check balances
    const ethBalanceEl = container.querySelector('#eth-balance');
    const daiBalanceEl = container.querySelector('#dai-balance');
    
    if (!ethBalanceEl || !daiBalanceEl) return;
    
    const ethBalance = parseFloat(ethBalanceEl.textContent) || 0;
    const daiBalance = parseFloat(daiBalanceEl.textContent) || 0;
    
    // Validate balance
    if (fromToken === 'ETH' && fromAmount > ethBalance) {
      alert('Insufficient ETH balance');
      return;
    }
    
    if (fromToken === 'DAI' && fromAmount > daiBalance) {
      alert('Insufficient DAI balance');
      return;
    }
    
    // Update balances
    if (fromToken === 'ETH') {
      ethBalanceEl.textContent = (ethBalance - fromAmount).toFixed(1);
      daiBalanceEl.textContent = (daiBalance + toAmount).toFixed(1);
    } else {
      daiBalanceEl.textContent = (daiBalance - fromAmount).toFixed(1);
      ethBalanceEl.textContent = (ethBalance + toAmount).toFixed(1);
    }
    
    // Update pool balances (simple simulation, not accurately modeling AMM)
    const poolEthEl = container.querySelector('.pool-token:nth-child(1) .token-amount');
    const poolDaiEl = container.querySelector('.pool-token:nth-child(2) .token-amount');
    
    if (poolEthEl && poolDaiEl) {
      const poolEth = parseFloat(poolEthEl.textContent) || 0;
      const poolDai = parseFloat(poolDaiEl.textContent) || 0;
      
      if (fromToken === 'ETH') {
        poolEthEl.textContent = (poolEth + fromAmount).toFixed(1);
        poolDaiEl.textContent = (poolDai - toAmount).toFixed(1);
      } else {
        poolDaiEl.textContent = (poolDai + fromAmount).toFixed(1);
        poolEthEl.textContent = (poolEth - toAmount).toFixed(1);
      }
      
      // Update price based on new ratio
      const newPoolEth = parseFloat(poolEthEl.textContent) || 1;
      const newPoolDai = parseFloat(poolDaiEl.textContent) || 2000;
      const newPrice = newPoolDai / newPoolEth;
      
      const poolPriceEl = container.querySelector('.pool-price span');
      if (poolPriceEl) {
        poolPriceEl.textContent = `Price: 1 ETH = ${newPrice.toFixed(2)} DAI`;
      }
    }
    
    alert('Swap executed successfully!');
    
    // Reset form
    fromAmountEl.value = (fromToken === 'ETH' ? 1.0 : 2000).toFixed(1);
    toAmountEl.value = (toToken === 'DAI' ? 2000 : 1.0).toFixed(1);
  }
  
  /**
   * Show staking form
   */
  _showStakeForm(container) {
    const transactionPanel = container.querySelector('.transaction-panel');
    if (!transactionPanel) return;
    
    transactionPanel.innerHTML = `
      <div class="transaction-form stake-form">
        <h4>Stake LP Tokens</h4>
        <div class="form-group">
          <label for="stake-amount">LP Tokens to Stake:</label>
          <input type="number" id="stake-amount" value="0.0" min="0" step="0.1">
        </div>
        <div class="form-group">
          <button id="execute-stake-btn">Stake Tokens</button>
        </div>
        <div class="staking-info">
          <h5>Staking Info</h5>
          <div>APR: 25.0%</div>
          <div>Your Staked: <span id="staked-amount">0.0</span> LP</div>
          <div>Rewards: <span id="rewards-amount">0.0</span> REWARD</div>
        </div>
      </div>
    `;
    
    // Add event listener for stake button
    const stakeBtn = transactionPanel.querySelector('#execute-stake-btn');
    if (stakeBtn) {
      stakeBtn.addEventListener('click', () => {
        this._executeStake(container);
      });
    }
  }
  
  /**
   * Execute LP token staking
   */
  _executeStake(container) {
    const stakeAmountEl = container.querySelector('#stake-amount');
    
    if (!stakeAmountEl) return;
    
    const stakeAmount = parseFloat(stakeAmountEl.value) || 0;
    
    // Check LP token balance
    const lpBalanceEl = container.querySelector('#lp-balance');
    
    if (!lpBalanceEl) return;
    
    const lpBalance = parseFloat(lpBalanceEl.textContent) || 0;
    
    if (stakeAmount > lpBalance) {
      alert('Insufficient LP token balance');
      return;
    }
    
    // Update LP token balance
    lpBalanceEl.textContent = (lpBalance - stakeAmount).toFixed(1);
    
    // Update staked amount
    const stakedAmountEl = container.querySelector('#staked-amount');
    
    if (stakedAmountEl) {
      const currentStaked = parseFloat(stakedAmountEl.textContent) || 0;
      stakedAmountEl.textContent = (currentStaked + stakeAmount).toFixed(1);
    }
    
    alert('LP tokens staked successfully!');
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