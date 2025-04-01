# Project RED X on GitHub Pages

This document explains how Project RED X works on GitHub Pages and what limitations exist.

## Limitations of GitHub Pages Deployment

GitHub Pages only supports static content, which means:

1. **No Server-Side Code**: Node.js server, Socket.io, and API endpoints don't work
2. **No Claude AI**: AWS Bedrock integration requires server-side authentication
3. **No Real-Time Networking**: WebSocket connections for multiplayer won't function
4. **No Build Process**: Code must be pre-compiled before pushing to GitHub Pages

## What Works in Static Mode

1. **WebAssembly Demo**: The core C/SDL2 demo compiled to WebAssembly
2. **WUB Links**: External links still work (they're client-side rendered)
3. **Basic UI**: All visual elements display properly

## Deployment Process

To deploy to GitHub Pages:

1. Run the deployment script: `./deploy-gh-pages.sh`
2. Push the contents of the `build` directory to the `gh-pages` branch
3. Make sure GitHub Pages is enabled in your repository settings

Alternatively, use GitHub Actions to automate deployment (see `.github/workflows/deploy.yml`).

## Local Development

For full functionality including AI features and real-time networking, run the project locally:

