/**
 * Quick Start Script for Web3 Streaming Player
 * Run this script to quickly set up the project
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

console.log(`${colors.bright}${colors.blue}Web3 Streaming Player - Quick Start${colors.reset}\n`);

// Main function wrapped in async to allow await usage
async function main() {
  try {
    // Step 1: Create necessary directories if they don't exist
    console.log(`${colors.yellow}Step 1: Creating directory structure...${colors.reset}`);
    
    const dirs = [
      'assets/images',
      'cache',
      'artifacts',
      'contracts',
      'dist'
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`  Created directory: ${dir}`);
      }
    });
    
    // Step 2: Check if .env file exists, create if not
    console.log(`\n${colors.yellow}Step 2: Checking environment configuration...${colors.reset}`);
    
    if (!fs.existsSync('.env') && fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      console.log(`  Created .env file from template. Please edit it with your API keys.`);
    } else if (!fs.existsSync('.env')) {
      console.log(`${colors.red}  Warning: .env.example not found. Please create .env file manually.${colors.reset}`);
    } else {
      console.log(`  .env file already exists.`);
    }

    // Step 3: Install dependencies
    console.log(`\n${colors.yellow}Step 3: Installing dependencies...${colors.reset}`);
    execSync('npm install', { stdio: 'inherit' });
    
    // Step 4: Compile contracts
    console.log(`\n${colors.yellow}Step 4: Compiling smart contracts...${colors.reset}`);
    execSync('npx hardhat compile', { stdio: 'inherit' });
    
    // Step 5: Check if test content images exist, create placeholders if not
    console.log(`\n${colors.yellow}Step 5: Setting up demo content...${colors.reset}`);
    
    const placeholderImages = [
      { name: 'blockchain-basics-thumbnail.jpg', color: '#4361ee' },
      { name: 'smart-contract-dev-thumbnail.jpg', color: '#3a56d4' },
      { name: 'web3-integration-thumbnail.jpg', color: '#2c4bca' }
    ];
    
    // Use node-canvas if available, otherwise create empty files
    try {
      const { createCanvas } = require('canvas');
      
      placeholderImages.forEach(img => {
        const imagePath = path.join('assets', 'images', img.name);
        
        if (!fs.existsSync(imagePath)) {
          // Create a 640x360 canvas (16:9)
          const canvas = createCanvas(640, 360);
          const ctx = canvas.getContext('2d');
          
          // Fill with color
          ctx.fillStyle = img.color;
          ctx.fillRect(0, 0, 640, 360);
          
          // Add text
          ctx.fillStyle = 'white';
          ctx.font = '30px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(img.name.replace('-thumbnail.jpg', ''), 320, 180);
          
          // Save as JPG
          const buffer = canvas.toBuffer('image/jpeg');
          fs.writeFileSync(imagePath, buffer);
          console.log(`  Created placeholder image: ${imagePath}`);
        } else {
          console.log(`  Image already exists: ${imagePath}`);
        }
      });
    } catch (err) {
      console.log(`  Optional dependency 'canvas' not installed. Creating empty placeholder files.`);
      
      placeholderImages.forEach(img => {
        const imagePath = path.join('assets', 'images', img.name);
        if (!fs.existsSync(imagePath)) {
          fs.writeFileSync(imagePath, '');
          console.log(`  Created empty placeholder file: ${imagePath}`);
        }
      });
    }
    
    // Step 6: Check if hardhat is running, start if needed
    console.log(`\n${colors.yellow}Step 6: Checking local blockchain...${colors.reset}`);
    
    try {
      // Try to connect to local node
      const { ethers } = require("ethers");
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      
      // Will throw if not connected
      const blockNumber = execSync('npx hardhat --network localhost block-number 2>/dev/null || echo "offline"')
        .toString().trim();
      
      if (blockNumber === "offline") {
        console.log(`  Local blockchain not running, starting Hardhat node...`);
        // Start node in background
        require('child_process').spawn('npx', ['hardhat', 'node'], {
          detached: true,
          stdio: 'ignore'
        }).unref();
        
        // Wait for node to start
        console.log(`  Waiting for Hardhat node to start...`);
        // Using setTimeout with a promise to allow for async/await
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log(`  Hardhat node should be running now.`);
      } else {
        console.log(`  Hardhat node already running at block ${blockNumber}.`);
      }
    } catch (err) {
      console.log(`  Could not connect to local node. You may need to run 'npx hardhat node' manually.`);
    }
    
    // Step 7: Deploy contracts if not already deployed
    console.log(`\n${colors.yellow}Step 7: Checking contract deployment...${colors.reset}`);
    
    if (!fs.existsSync('contract-addresses.json')) {
      console.log(`  Deploying contracts to local network...`);
      try {
        execSync('npm run deploy:local', { stdio: 'inherit' });
      } catch (err) {
        console.log(`${colors.red}  Error deploying contracts. You may need to run 'npm run deploy:local' manually.${colors.reset}`);
      }
    } else {
      console.log(`  Contracts already deployed. Using existing addresses.`);
    }
    
    // New Step: Add URL refresh capability to assets
    console.log(`\n${colors.yellow}Step 8: Adding URL refresh capability...${colors.reset}`);
    addUrlRefreshCapability();
    
    // Step 8: Start web server (now step 9)
    console.log(`\n${colors.yellow}Step 9: Starting development server...${colors.reset}`);
    console.log(`  Starting server at http://localhost:8000 ...`);
    
    // Use serve package to start the server
    execSync('npx serve . -l 8000', { stdio: 'inherit' });

  } catch (error) {
    console.error(`\n${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

/**
 * Adds URL refresh functionality to prevent browser caching issues
 */
function addUrlRefreshCapability() {
  // Files to modify
  const htmlFiles = ['streaming.html', 'token-explorer.html'];
  const jsFiles = [
    'assets/js/contract-manager.js',
    'assets/js/network-config.js',
    'assets/js/video-loader.js',
    'assets/js/wallet-connector.js'
  ];

  // Add cache-busting query parameters to script tags in HTML files
  htmlFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      console.log(`  Warning: ${file} not found, skipping.`);
      return;
    }

    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Already has refresh functionality
    if (content.includes('addVersionQueryParam')) {
      console.log(`  ${file} already has refresh URL functionality.`);
      return;
    }

    // Add the script block for URL refreshing if not present
    if (!content.includes('function addVersionQueryParam')) {
      const scriptBlock = `
  <!-- URL refresh functionality -->
  <script>
    // Add cache-busting query parameters to script and link tags
    function addVersionQueryParam() {
      const timestamp = Date.now();
      document.querySelectorAll('script[src], link[rel="stylesheet"]').forEach(el => {
        // Only add to local resources, not CDN links
        if (el.src && !el.src.includes('//')) {
          el.src = appendQueryParam(el.src, 'v', timestamp);
        } else if (el.href && !el.href.includes('//')) {
          el.href = appendQueryParam(el.href, 'v', timestamp);
        }
      });
    }

    // Helper function to append query param
    function appendQueryParam(url, key, value) {
      const separator = url.includes('?') ? '&' : '?';
      return \`\${url}\${separator}\${key}=\${value}\`;
    }

    // Call when page loads
    window.addEventListener('DOMContentLoaded', addVersionQueryParam);
    
    // Call when refresh button is clicked
    function refreshResources() {
      console.log('Refreshing resources...');
      addVersionQueryParam();
      // Force reload of scripts by removing and re-adding them
      document.querySelectorAll('script[src]').forEach(el => {
        const src = el.src;
        const parent = el.parentNode;
        const newScript = document.createElement('script');
        newScript.src = appendQueryParam(src.split('?')[0], 'v', Date.now());
        el.remove();
        parent.appendChild(newScript);
      });
    }
  </script>`;

      // Insert before closing </head> tag
      content = content.replace('</head>', `${scriptBlock}\n</head>`);
      modified = true;
    }

    // Add refresh button if not present
    if (!content.includes('id="refresh-resources"')) {
      // Find end of navigation or beginning of body
      const insertPositions = [
        '<div class="navigation">', 
        '<body>'
      ];
      
      let insertPos = -1;
      let insertIndex = -1;
      
      for (const pos of insertPositions) {
        insertIndex = content.indexOf(pos);
        if (insertIndex !== -1) {
          insertPos = pos;
          break;
        }
      }

      if (insertIndex !== -1) {
        const buttonHtml = `
    <!-- Resource Refresh Button -->
    <div style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
      <button id="refresh-resources" onclick="refreshResources()" 
        style="background-color: #4361ee; color: white; border: none; padding: 8px 15px; 
               border-radius: 4px; cursor: pointer; font-weight: bold;">
        🔄 Refresh Resources
      </button>
    </div>`;

        // Insert after the identified position tag's closing >
        const insertAt = insertIndex + insertPos.length;
        content = content.slice(0, insertAt) + buttonHtml + content.slice(insertAt);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(file, content);
      console.log(`  Added refresh URL functionality to ${file}`);
    } else {
      console.log(`  No changes needed for ${file}`);
    }
  });

  // Add timestamp to JS file exports
  jsFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      console.log(`  Warning: ${file} not found, skipping.`);
      return;
    }

    let content = fs.readFileSync(file, 'utf8');
    
    // Already has version info
    if (content.includes('_VERSION = ')) {
      console.log(`  ${file} already has version information.`);
      return;
    }

    // Add version info to class or module
    const className = path.basename(file, '.js').split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)).join('');
    
    // Check if file contains a class definition
    const classPattern = new RegExp(`class\\s+${className}`);
    if (classPattern.test(content)) {
      // Add static version property to class
      const replacement = `class ${className} {
  static _VERSION = '${new Date().toISOString()}';`;
      content = content.replace(new RegExp(`class\\s+${className}\\s*\\{`), replacement);
      
      fs.writeFileSync(file, content);
      console.log(`  Added version information to ${file}`);
    } else {
      console.log(`  Could not add version info to ${file} - class structure not found.`);
    }
  });

  console.log('  URL refresh capability added. Use the refresh button when testing changes.');
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
