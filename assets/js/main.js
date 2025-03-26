/**
 * Web3 Crypto Streaming Service
 * Main JavaScript file
 */

// Wait for DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle functionality
  setupThemeToggle();
  
  // Mobile menu toggle
  setupMobileMenu();
  
  // Smooth scrolling for anchor links
  setupSmoothScrolling();
});

/**
 * Set up dark/light theme toggle
 */
function setupThemeToggle() {
  const themeToggle = document.querySelector('#theme-toggle');
  if (!themeToggle) return;

  themeToggle.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update toggle text
    themeToggle.textContent = newTheme === 'light' ? 'Dark Mode' : 'Light Mode';
  });
  
  // Set initial theme from localStorage or system preference
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.textContent = savedTheme === 'light' ? 'Dark Mode' : 'Light Mode';
}

/**
 * Set up mobile menu toggle
 */
function setupMobileMenu() {
  const menuToggle = document.querySelector('.menu-icon');
  const navTrigger = document.querySelector('#nav-trigger');
  
  if (!menuToggle || !navTrigger) return;
  
  menuToggle.addEventListener('click', function() {
    // The checkbox state change will handle the display via CSS
  });
}

/**
 * Set up smooth scrolling for anchor links
 */
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;
      
      e.preventDefault();
      
      window.scrollTo({
        top: targetElement.offsetTop - 80, // Account for fixed header
        behavior: 'smooth'
      });
    });
  });
}

/**
 * Wallet connection functionality (placeholder)
 */
function connectWallet() {
  const connectButton = document.querySelector('#connect-wallet');
  if (!connectButton) return;
  
  connectButton.addEventListener('click', async function() {
    // Placeholder for wallet connection logic
    connectButton.textContent = 'Connecting...';
    
    try {
      // This would be replaced with actual Web3 wallet connection code
      console.log('Connecting to wallet...');
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update UI after successful connection
      connectButton.textContent = 'Connected';
      connectButton.classList.add('connected');
      
    } catch (error) {
      console.error('Error connecting wallet:', error);
      connectButton.textContent = 'Connection Failed';
      
      // Reset button after delay
      setTimeout(() => {
        connectButton.textContent = 'Connect Wallet';
      }, 2000);
    }
  });
}
