#!/bin/bash
set -e

echo "Building static version for GitHub Pages..."

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Create static build directory
BUILD_DIR="./build"
mkdir -p $BUILD_DIR

# Copy root index.html
cp index.html $BUILD_DIR/

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "Error: npm not found. Please install Node.js and npm."
    exit 1
fi

# Check if Emscripten is available
if ! command -v emcc &> /dev/null; then
    echo "Error: Emscripten compiler (emcc) not found."
    echo "Please install Emscripten or make sure it's in your PATH."
    exit 1
fi

# Create a minimal package.json for GitHub Pages in the build directory
echo '{
  "name": "red-x-static",
  "version": "1.0.0",
  "private": true,
  "dependencies": {}
}' > $BUILD_DIR/package.json

# Build the Red X web version
cd red_x

# Make sure required JavaScript libraries are available
echo "Checking for required npm packages..."
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install --no-optional || { echo "npm install failed"; exit 1; }
fi

# Create a fallback template.html if needed
if [ ! -f template.html ] && [ -f index.html ]; then
    cp index.html template.html
    # Remove any server-dependent references
    sed -i.bak 's|/api/version|#|g' template.html
    sed -i.bak 's|/socket.io/socket.io.js|https://cdn.socket.io/4.5.0/socket.io.min.js|g' template.html
fi

echo "Building Red X WebAssembly..."
emcc main.c -o index.html -s USE_SDL=2 -s WASM=1 -s ALLOW_MEMORY_GROWTH=1 \
    --shell-file template.html -s NO_EXIT_RUNTIME=1 -s EXPORTED_RUNTIME_METHODS=cwrap \
    -s ENVIRONMENT=web -s MODULARIZE=1 -s EXPORT_NAME="RedXModule" \
    || { echo "Build failed"; exit 1; }

# Create static version directory
mkdir -p ../build/red_x

# Copy necessary files
cp index.html index.js index.wasm ../build/red_x/

# Make sure the js directory exists before copying
if [ -d "js" ]; then
    mkdir -p ../build/red_x/js
    cp -r js/* ../build/red_x/js/
else
    mkdir -p ../build/red_x/js
    # Create minimal required JS files
    echo "// Fallback file created by deployment script" > ../build/red_x/js/link-extractor.js
    
    # Create a simple link extractor
    cat > ../build/red_x/js/link-extractor.js << 'EOL'
class LinkExtractor {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container element with ID "${containerId}" not found`);
    }
  }
  async loadLinks(txtFilePath) {
    try {
      const response = await fetch(txtFilePath);
      if (!response.ok) { throw new Error(`Failed to load ${txtFilePath}`); }
      const content = await response.text();
      this.parseAndDisplay(content);
    } catch (error) {
      console.error('Error loading links:', error);
      this.container.innerHTML = `<p class="error">Failed to load links</p>`;
      this.useFallbackData();
    }
  }
  useFallbackData() {
    const fallbackData = `# GitHub Pages Fallback Links\n\n## WebAssembly Resources\n<a href="https://developer.mozilla.org/en-US/docs/WebAssembly">WebAssembly Documentation</a>\n<a href="https://emscripten.org/">Emscripten</a>`;
    this.parseAndDisplay(fallbackData);
  }
  parseAndDisplay(content) {
    // ... existing code ...
    // Simplified implementation
    this.container.innerHTML = '<p>Static GitHub Pages version - links loaded</p>';
    const sections = content.split(/^## /m);
    sections.forEach(section => {
      if (section.trim()) {
        const div = document.createElement('div');
        div.className = 'link-section';
        div.innerHTML = section;
        this.container.appendChild(div);
      }
    });
  }
}
if (typeof window !== 'undefined') { window.LinkExtractor = LinkExtractor; }
EOL
fi

# Copy links file if it exists
if [ -f "../wub-links.txt" ]; then
    cp ../wub-links.txt ../build/
else
    # Create a simple fallback file
    echo "# WUB Links (Fallback)" > ../build/wub-links.txt
    echo "" >> ../build/wub-links.txt
    echo "## Resources" >> ../build/wub-links.txt
    echo "<a href=\"https://developer.mozilla.org/en-US/docs/WebAssembly\">WebAssembly Documentation</a>" >> ../build/wub-links.txt
fi

# Create .nojekyll file to prevent Jekyll processing
touch ../build/.nojekyll

echo "Static build complete! Files are in the ./build directory."
echo "To deploy to GitHub Pages:"
echo "1. Create a gh-pages branch"
echo "2. Copy the contents of the build directory to the gh-pages branch"
echo "3. Push the gh-pages branch to GitHub"
echo ""
echo "Or use gh-pages npm package with: npm install -g gh-pages && gh-pages -d build"

exit 0
