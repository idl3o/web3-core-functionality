#!/bin/bash
# Script to update dependencies for Vite build and testing

echo "===== Installing Required Dependencies ====="

# Install Vite plugins and polyfills
npm install --save-dev vite-plugin-node-polyfills crypto-js

# Install testing dependencies
npm install --save-dev jest babel-jest @babel/core @babel/preset-env jest-fetch-mock

# Install linting and formatting dependencies
npm install --save-dev eslint prettier eslint-config-prettier

# Update package.json with the NODE_OPTIONS for the build script
if [ -f "package.json" ]; then
  cp package.json package.json.bak
  # Add NODE_OPTIONS to the build:vite script
  perl -i -pe 's/"build:vite":\s*"vite build"/"build:vite": "NODE_OPTIONS=--openssl-legacy-provider vite build"/' package.json
  # Add test script if it doesn't exist
  if ! grep -q '"test"' package.json; then
    perl -i -pe 's/("scripts":\s*\{)/\1\n    "test": "jest",/' package.json
  fi
fi

# Create a simplified build command that bypasses Vite if needed
cat > jekyll-only-build.sh << 'EOF'
#!/bin/bash
# Build script that skips Vite and only uses Jekyll

echo "===== Building with Jekyll Only ====="
bundle exec jekyll build
echo "Build complete! Files in _site directory"
EOF

chmod +x jekyll-only-build.sh

echo "===== Dependencies Updated ====="
echo ""
echo "To build with the updated configuration, run:"
echo "npm run build"
echo ""
echo "If Vite continues to have issues, use the Jekyll-only build:"
echo "./jekyll-only-build.sh"
echo ""
echo "To format and fix linting issues, run:"
echo "./format-and-lint.sh"
