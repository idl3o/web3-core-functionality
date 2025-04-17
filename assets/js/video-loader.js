/**
 * Video Loader for Web3 Crypto Streaming Service
 *
 * This script provides a fallback video source and simulates
 * loading videos from decentralized storage.
 */

class VideoLoader {
  constructor(options = {}) {
    this.options = {
      ipfsGateway: 'https://ipfs.io/ipfs/',
      fallbackVideo:
        'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
      loadingDelay: 1000,
      ...options
    };
  }

  /**
   * Load a video from IPFS or fallback to a test video
   * @param {string} cid - IPFS content identifier (optional)
   * @param {function} callback - Callback function when video is ready
   */
  loadVideo(cid, callback) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // If no CID is provided, use the fallback video
        const videoUrl = cid ? `${this.options.ipfsGateway}${cid}` : this.options.fallbackVideo;

        // Create a video element to test loading
        const testVideo = document.createElement('video');
        testVideo.style.display = 'none';
        testVideo.src = videoUrl;

        // Handle success
        testVideo.oncanplaythrough = () => {
          if (callback) callback(videoUrl, null);
          resolve(videoUrl);
          testVideo.remove();
        };

        // Handle error - use fallback
        testVideo.onerror = () => {
          console.warn('Video loading failed, using fallback');
          if (callback) callback(this.options.fallbackVideo, 'Using fallback video');
          resolve(this.options.fallbackVideo);
          testVideo.remove();
        };

        // Start loading the video
        document.body.appendChild(testVideo);
        testVideo.load();
      }, this.options.loadingDelay);
    });
  }

  /**
   * Get video preview image (simulated)
   * @param {string} contentId - Content identifier
   */
  getPreviewImage(contentId) {
    // This would normally fetch from IPFS, but we'll use placeholders for demo
    return `https://picsum.photos/seed/${contentId}/640/360`;
  }

  /**
   * Get demo content information
   * @param {string} contentId - Content identifier
   */
  getDemoContent(contentId = 'content_001') {
    const demoContents = {
      content_001: {
        title: 'Blockchain Basics',
        creator: 'Team MODSIAS',
        duration: '10:00',
        description: 'An introduction to blockchain technology and its applications.',
        thumbnail: this.getPreviewImage('blockchain-basics'),
        ipfsCid: '' // Empty for demo
      },
      content_002: {
        title: 'Smart Contract Development',
        creator: 'Idl3o',
        duration: '15:00',
        description: 'Learn how to develop and deploy smart contracts.',
        thumbnail: this.getPreviewImage('smart-contracts'),
        ipfsCid: ''
      },
      content_003: {
        title: 'Web3 Integration Guide',
        creator: 'ModSias Research',
        duration: '12:30',
        description: 'How to integrate Web3 technologies in your application.',
        thumbnail: this.getPreviewImage('web3-guide'),
        ipfsCid: ''
      }
    };

    return demoContents[contentId] || demoContents['content_001'];
  }
}

// Export for both browser and Node.js environments
if (typeof window !== 'undefined') {
  window.VideoLoader = VideoLoader;
} else if (typeof module !== 'undefined') {
  module.exports = VideoLoader;
}
