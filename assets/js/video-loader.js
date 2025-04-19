/**
 * Video Loader Module
 *
 * Handles loading video content from IPFS for the Web3 streaming platform
 */

class VideoLoader {
  constructor() {
    // IPFS gateway URLs to try (in order) - Updated with more reliable gateways
    this.ipfsGateways = [
      'https://cloudflare-ipfs.com/ipfs/',  // Cloudflare first (most reliable)
      'https://gateway.pinata.cloud/ipfs/',
      'https://ipfs.io/ipfs/',
      'https://gateway.ipfs.io/ipfs/',
      'https://dweb.link/ipfs/',
      'https://ipfs.fleek.co/ipfs/',       // Added Fleek gateway
      'https://ipfs.infura.io/ipfs/',
      'https://hardhat.org/ipfs/',         // Added Hardhat gateway
      'https://gateway.pinata.cloud/ipfs/', // Try Pinata again at the end
    ];

    // Demo content for testing without actual IPFS content
    this.demoContent = {
      'content_001': {
        title: 'Blockchain Basics',
        creator: 'Team MODSIAS',
        description: 'An introduction to blockchain technology fundamentals.',
        ipfsCid: 'QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR', // Updated to valid IPFS CID (Big Buck Bunny)
        thumbnail: 'assets/images/blockchain-basics-thumbnail.jpg',
        fallbackUrl: 'https://cdn.livepeer.com/recordings/78jb42d7w7ok/source.mp4'
      },
      'content_002': {
        title: 'Smart Contract Development',
        creator: 'Web3 University',
        description: 'Learn how to write secure and efficient smart contracts.',
        ipfsCid: 'QmTKZgRNwDNZwHtJSjCp6r5FYefzpULfy37JvMt9DwvXse', // Updated to valid IPFS CID (Crypto video)
        thumbnail: 'assets/images/smart-contract-dev-thumbnail.jpg',
        fallbackUrl: 'https://cdn.livepeer.com/recordings/15jus21rourk/source.mp4'
      },
      'content_003': {
        title: 'Web3 Integration Guide',
        creator: 'DApp Developers Guild',
        description: 'How to integrate Web3 technologies into your applications.',
        ipfsCid: 'QmSgvgwxZGaBLqkGyWemEDqikCqU52XxsYLKtdy3vGZ8uq', // Updated to valid IPFS CID (NFT explainer)
        thumbnail: 'assets/images/web3-integration-thumbnail.jpg',
        fallbackUrl: 'https://cdn.livepeer.com/recordings/f12jqn38x52f/source.mp4'
      }
    };
  }

  /**
   * Get demo content by ID
   * @param {string} contentId - Content identifier
   * @return {object} Content object
   */
  getDemoContent(contentId) {
    return this.demoContent[contentId] || this.demoContent['content_001'];
  }

  /**
   * Load video from IPFS
   * @param {string} cid - IPFS content identifier
   * @param {function} callback - Called with (videoUrl, error) when complete
   */
  loadVideo(cid, callback) {
    if (!cid) {
      callback(null, 'Invalid content identifier');
      return;
    }

    // Try to load from each gateway
    this._tryLoadFromGateways(cid, 0, callback);
  }

  /**
   * Recursively try to load content from each gateway
   * @private
   */
  _tryLoadFromGateways(cid, index, callback) {
    if (index >= this.ipfsGateways.length) {
      // We've tried all gateways, use fallback
      console.warn('Failed to load from all IPFS gateways, using fallback');

      // Find content with matching CID
      const content = Object.values(this.demoContent).find(c => c.ipfsCid === cid);

      if (content && content.fallbackUrl) {
        console.log(`Using fallback URL for ${cid}: ${content.fallbackUrl}`);
        callback(content.fallbackUrl, 'Failed to load from IPFS, using CDN fallback');
      } else {
        // Last resort fallback - use a reliable CDN video if nothing else works
        const lastResortUrl = 'https://cdn.livepeer.com/recordings/78jb42d7w7ok/source.mp4';
        console.warn(`No fallback URL found for CID ${cid}, using last resort video`);
        callback(lastResortUrl, 'Failed to load content, using default video');
      }
      return;
    }

    const gateway = this.ipfsGateways[index];
    const videoUrl = `${gateway}${cid}`;

    console.log(`Trying to load video from: ${videoUrl}`);

    // Create a temporary video element to test the URL
    const tempVideo = document.createElement('video');

    // Set timeout for gateway attempt - reduced from 5000ms to 3000ms for faster fallback
    const timeoutId = setTimeout(() => {
      console.warn(`Timeout loading from ${gateway}`);
      tempVideo.onerror = null;
      tempVideo.onloadeddata = null;
      tempVideo.removeAttribute('src');
      this._tryLoadFromGateways(cid, index + 1, callback);
    }, 3000);

    // Handle successful load
    tempVideo.onloadeddata = () => {
      clearTimeout(timeoutId);
      console.log(`Successfully loaded video from ${gateway}`);
      callback(videoUrl);
    };

    // Handle load error
    tempVideo.onerror = () => {
      clearTimeout(timeoutId);
      console.warn(`Failed to load video from ${gateway}`);
      tempVideo.removeAttribute('src');
      this._tryLoadFromGateways(cid, index + 1, callback);
    };

    // Start loading from current gateway
    tempVideo.src = videoUrl;
    tempVideo.load();
  }
}

// For use in browser environment
if (typeof window !== 'undefined') {
  window.VideoLoader = VideoLoader;
}

// For use in Node.js environment
if (typeof module !== 'undefined') {
  module.exports = VideoLoader;
}
