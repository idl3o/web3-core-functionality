import { resizeImage } from './utils.js';

/**
 * Creator Registration Handler for Web3 Crypto Streaming Service™
 * Implements ModSIAS™ (Modular Secure IPFS Authentication System)
 */
document.addEventListener('DOMContentLoaded', function() {
  const registrationForm = document.getElementById('creator-registration');
  const connectWalletBtn = document.getElementById('connect-wallet-register');
  const walletStatusElement = document.getElementById('wallet-status');
  const successMessage = document.getElementById('registration-success');
  const errorMessage = document.getElementById('registration-error');
  const errorDetails = errorMessage.querySelector('.error-details');
  const tryAgainBtn = document.getElementById('try-again');
  const profileCidElement = document.getElementById('profile-cid');
  const profilePreview = document.getElementById('profile-preview'); // Add this line
  
  // File upload handling
  const fileInput = document.getElementById('profile-image');
  const fileSelectButton = document.querySelector('.file-select-button');
  const fileName = document.querySelector('.file-name');
  
  let connectedWalletAddress = null;
  let profileImageFile = null;
  
  // Initialize IPFS connection on page load
  window.ipfsIntegration.initialize().catch(error => {
    console.error('Failed to initialize IPFS:', error);
  });
  
  // File selection handling
  if (fileSelectButton) {
    fileSelectButton.addEventListener('click', function() {
      fileInput.click();
    });
  }
  
  if (fileInput) {
    fileInput.addEventListener('change', async function(e) {
      if (e.target.files.length > 0) {
        profileImageFile = e.target.files[0];
        fileName.textContent = profileImageFile.name;

        // Display preview of the selected image
        if (profilePreview) {
          profilePreview.src = URL.createObjectURL(profileImageFile);
        }
      } else {
        fileName.textContent = 'No file selected';
        profileImageFile = null;
        if (profilePreview) {
          profilePreview.src = '';
        }
      }
    });
  }
  
  // Wallet connection
  if (connectWalletBtn) {
    connectWalletBtn.addEventListener('click', async function() {
      try {
        if (window.ethereum) {
          // Request account access
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          connectedWalletAddress = accounts[0];
          
          // Update wallet status display
          walletStatusElement.innerHTML = `
            <span class="wallet-connected">
              <i class="fas fa-check-circle"></i>
              Connected: ${connectedWalletAddress.substring(0, 6)}...${connectedWalletAddress.substring(38)}
            </span>
          `;
          
          connectWalletBtn.classList.add('connected');
          connectWalletBtn.innerHTML = '<i class="fas fa-wallet"></i> Wallet Connected';
        } else {
          throw new Error('No Ethereum wallet detected. Please install MetaMask or another Web3 wallet.');
        }
      } catch (error) {
        console.error('Error connecting wallet:', error);
        walletStatusElement.innerHTML = `
          <span class="wallet-error">
            <i class="fas fa-exclamation-circle"></i>
            Connection failed: ${error.message}
          </span>
        `;
      }
    });
  }
  
  // Form submission
  if (registrationForm) {
    registrationForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Show loading state
      const submitButton = registrationForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      
      try {
        // Validate wallet connection
        if (!connectedWalletAddress) {
          throw new Error('Please connect your wallet to continue registration.');
        }
        
        // Get form data
        const creatorData = {
          name: document.getElementById('creator-name').value,
          email: document.getElementById('creator-email').value,
          bio: document.getElementById('creator-bio').value,
          category: document.getElementById('creator-category').value,
          walletAddress: connectedWalletAddress,
          registrationDate: new Date().toISOString(),
          profileImageCid: null,
          trademark: {
            platform: 'Web3 Crypto Streaming Service™',
            technology: 'ModSIAS™'
          }
        };
        
        // Handle profile image upload to IPFS if provided
        if (profileImageFile) {
          // Resize image before uploading
          const resizedImageFile = await resizeImage(profileImageFile, 200, 200); // Resize to 200x200 pixels
          const imageCid = await window.ipfsIntegration.addFile(resizedImageFile);
          creatorData.profileImageCid = imageCid;
          creatorData.profileImageUrl = window.ipfsIntegration.getPublicURL(imageCid);
        }
        
        // Store creator data on IPFS
        const creatorDataCid = await window.ipfsIntegration.addJSON(creatorData);
        
        // In a real implementation, we would now:
        // 1. Store the mapping of wallet address -> CID in a smart contract
        // 2. Verify the registration transaction on the blockchain
        // 3. Update the creator database with the new registration
        
        // Show success message
        registrationForm.style.display = 'none';
        successMessage.style.display = 'block';
        if (profileCidElement) {
          profileCidElement.textContent = creatorDataCid;
        }
        
        // Log success
        console.log(`Creator ${creatorData.name} registered successfully with CID: ${creatorDataCid}`);
        
      } catch (error) {
        console.error('Registration error:', error);
        
        // Show error message
        errorDetails.textContent = error.message || 'Unknown error occurred.';
        registrationForm.style.display = 'none';
        errorMessage.style.display = 'block';
      }
    });
  }
  
  // Try again button handler
  if (tryAgainBtn) {
    tryAgainBtn.addEventListener('click', function() {
      errorMessage.style.display = 'none';
      registrationForm.style.display = 'block';
      
      // Reset submit button
      const submitButton = registrationForm.querySelector('button[type="submit"]');
      submitButton.disabled = false;
      submitButton.innerHTML = 'Complete Registration';
    });
  }
});