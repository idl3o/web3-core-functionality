#!/bin/bash

echo "GitHub Pages Local Testing Setup"
echo "================================"

# Option 1: Simple HTTP Server (Python)
start_python_server() {
  echo "Starting Python HTTP server on port 8000..."
  echo "Open your browser to http://localhost:8000"
  echo "Press Ctrl+C to stop the server"
  python3 -m http.server 8000
}

# Option 2: Jekyll (matches GitHub Pages build process)
setup_jekyll() {
  echo "Setting up Jekyll environment..."

  # Check if Ruby is installed
  if ! command -v ruby &> /dev/null; then
    echo "Ruby is required but not found. Please install Ruby first."
    exit 1
  fi

  # Check if Bundler is installed
  if ! command -v bundle &> /dev/null; then
    echo "Installing Bundler..."
    gem install bundler
  fi

  # Create Gemfile if it doesn't exist
  if [ ! -f Gemfile ]; then
    echo "Creating Gemfile..."
    cat > Gemfile << EOL
source 'https://rubygems.org'
gem 'github-pages', group: :jekyll_plugins
EOL
  fi

  # Install dependencies
  echo "Installing Jekyll and GitHub Pages dependencies..."
  bundle install

  # Run Jekyll server
  echo "Starting Jekyll server on port 4000..."
  echo "Open your browser to http://localhost:4000"
  echo "Press Ctrl+C to stop the server"
  bundle exec jekyll serve
}

# Clone the specific branch if not already in the repository
clone_repo() {
  if [ ! -d ".git" ]; then
    echo "Cloning the repository..."
    git clone https://github.com/idl3o/gh-pages.git .
  fi

  echo "Checking out the backup-functional-demo branch..."
  git checkout backup-functional-demo || {
    echo "Failed to checkout branch. Fetching and trying again..."
    git fetch
    git checkout backup-functional-demo
  }
}

# Menu
echo "Choose how you want to test:"
echo "1) Simple HTTP Server (Python)"
echo "2) Jekyll (GitHub Pages equivalent)"
echo "3) Clone repo and test with HTTP Server"
echo "4) Clone repo and test with Jekyll"
read -p "Enter choice [1-4]: " choice

case $choice in
  1) start_python_server ;;
  2) setup_jekyll ;;
  3) clone_repo && start_python_server ;;
  4) clone_repo && setup_jekyll ;;
  *) echo "Invalid option. Exiting." ;;
esac
