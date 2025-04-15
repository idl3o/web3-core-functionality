/**
 * Web3 Connection Handler
 *
 * Handles wallet connections for the Web3 Crypto Streaming Service
 */

document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const connectWalletBtn = document.getElementById('connect-wallet');
  const walletModal = document.getElementById('wallet-modal');
  const closeModal = document.querySelector('.close-modal');
  const walletOptions = document.querySelectorAll('.wallet-option');

  // Web3 state
  let web3Instance = null;
  let userAccount = null;

  // Check if Web3 is injected
  const isWeb3Available = () => {
    return typeof window.ethereum !== 'undefined' ||
           typeof window.web3 !== 'undefined';
  };

  // Show modal when connect button is clicked
  if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', function() {
      if (walletModal) {
        walletModal.style.display = 'flex';
      } else {
        console.warn('Wallet modal not found');
      }
    });
  }

  // Close modal when X is clicked
  if (closeModal) {
    closeModal.addEventListener('click', function() {
      walletModal.style.display = 'none';
    });
  }

  // Close modal when clicking outside of it
  if (walletModal) {
    window.addEventListener('click', function(event) {
      if (event.target === walletModal) {
        walletModal.style.display = 'none';
      }
    });
  }

  // Handle wallet connection options
  if (walletOptions) {
    walletOptions.forEach(option => {
      option.addEventListener('click', function() {
        const walletType = this.getAttribute('data-wallet');
        connectWallet(walletType);
      });
    });
  }

  // Connect wallet based on selected type
  async function connectWallet(walletType) {
    if (!isWeb3Available()) {
      alert('Web3 provider not found. Please install MetaMask or another wallet.');
      return;
    }

    try {
      // For demo purposes, we're using a mock connection
      // In a real implementation, this would connect to the actual provider
      console.log(`Connecting to ${walletType}...`);

      // Mock successful connection
      setTimeout(() => {
        userAccount = '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        walletModal.style.display = 'none';

        // Update UI to show connected state
        if (connectWalletBtn) {
          connectWalletBtn.textContent = `Connected: ${userAccount.substr(0, 6)}...${userAccount.substr(-4)}`;
          connectWalletBtn.classList.add('connected');
        }

        console.log(`Connected with address: ${userAccount}`);
      }, 1000);

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  }
});
