#!/bin/bash

# Script to test the GitHub Pages site locally

echo "Starting local server to test GitHub Pages site..."

# Check if Python is installed
if command -v python3 &> /dev/null; then
    echo "Starting Python HTTP server on port 8000..."
    python3 -m http.server
elif command -v python &> /dev/null; then
    echo "Starting Python HTTP server on port 8000..."
    python -m http.server
else
    echo "Error: Python is not installed. Cannot start local server."
    echo "Please install Python or use another local server solution."
    exit 1
fi

# The script will not reach this point unless the server is stopped
echo "Local server stopped."
