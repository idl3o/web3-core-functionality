/**
 * @license
 * Web3 Crypto Streaming Service
 * Copyright (c) 2023-2025 idl3o-redx
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Token Generator Service
 * Handles token generation for various activities including streaming
 */

const EventEmitter = require('events');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const TokenModel = require('../../models/token-model');
const StreamModel = require('../../models/stream-model');

const SECRET_KEY = process.env.JWT_SECRET || 'web3-streaming-secret';
const ADMIN_SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'web3-admin-secret-key';
const TOKEN_EXPIRY = '7d'; // Regular user tokens
const ADMIN_TOKEN_EXPIRY = '24h'; // Admin tokens expire more frequently for security

class TokenGeneratorService extends EventEmitter {
  constructor() {
    super();
    this.initialized = false;
    this.tokenHistory = new Map();
    this.pendingTokens = new Map();
    
    // Token generation rates
    this.rates = {
      // Stream creator rewards
      streamStart: 10,              // Tokens for starting a stream
      streamMinuteCreator: 2,       // Tokens per minute for creator
      streamViewerBonus: 0.1,       // Additional tokens per viewer per minute
      streamCompletionBonus: 20,    // Bonus for completing 30+ minute stream
      
      // Stream viewer rewards
      streamMinuteViewer: 1,        // Tokens per minute for viewers
      streamInteractionBonus: 5,    // Bonus for interactions (comments, etc)
      streamLoyaltyBonus: 15,       // Bonus for watching 80%+ of a stream
      
      // Activity rewards (generic)
      contentCreation: 25,          // Creating content
      commentPosting: 2,            // Posting a comment
      referralSuccessful: 50        // Successful referral
    };
  }

  /**
   * Initialize the service
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    // Set up listeners for stream events
    StreamModel.on('stream:started', this.handleStreamStarted.bind(this));
    StreamModel.on('stream:ended', this.handleStreamEnded.bind(this));
    StreamModel.on('viewer:joined', this.handleViewerJoined.bind(this));
    StreamModel.on('viewer:left', this.handleViewerLeft.bind(this));
    
    // Process any pending tokens every 5 minutes
    this.processingInterval = setInterval(() => {
      this.processStreamingRewards();
    }, 5 * 60 * 1000);
    
    console.log('Token generator service initialized');
    this.initialized = true;
  }

  /**
   * Generate tokens with unique ID and tracking
   * @param {Object} tokenData Token generation data
   * @returns {Object} Generated token data
   */
  async generateTokens(tokenData) {
    if (!tokenData.recipientAddress || !tokenData.amount) {
      throw new Error('Recipient address and amount are required');
    }
    
    const tokenId = `token_${crypto.randomBytes(8).toString('hex')}`;
    const timestamp = new Date().toISOString();
    
    const token = {
      id: tokenId,
      recipientAddress: tokenData.recipientAddress,
      amount: tokenData.amount,
      reason: tokenData.reason || 'manual',
      timestamp,
      status: 'pending',
      metadata: tokenData.metadata || {}
    };
    
    // Store token in history
    this.tokenHistory.set(tokenId, token);
    this.pendingTokens.set(tokenId, token);
    
    // Emit generation event
    this.emit('token:generated', token);
    
    // Process token (in real implementation, this might involve blockchain tx)
    setTimeout(() => {
      this.confirmToken(tokenId);
    }, 2000);
    
    return token;
  }
  
  /**
   * Confirm a token has been processed
   * @param {string} tokenId Token ID to confirm
   * @returns {Object|null} Confirmed token or null
   */
  async confirmToken(tokenId) {
    const token = this.pendingTokens.get(tokenId);
    if (!token) {
      return null;
    }
    
    // Update token status
    token.status = 'confirmed';
    token.confirmedAt = new Date().toISOString();
    token.txHash = `tx_${crypto.randomBytes(16).toString('hex')}`;
    
    // Remove from pending list
    this.pendingTokens.delete(tokenId);
    
    // Update in history
    this.tokenHistory.set(tokenId, token);
    
    // Emit confirmation event
    this.emit('token:confirmed', token);
    
    return token;
  }

  /**
   * Generate rewards for stream activity
   * @param {string} recipientAddress Recipient wallet address 
   * @param {string} activityType Activity type
   * @param {Object} activityData Activity data
   * @returns {Object} Generated token
   */
  async generateActivityReward(recipientAddress, activityType, activityData) {
    let amount = 0;
    const metadata = { activityType, ...activityData };
    
    switch (activityType) {
      case 'stream_start':
        amount = this.rates.streamStart;
        break;
      case 'stream_end':
        // Base completion amount
        amount = this.calculateStreamEndReward(activityData);
        break;
      case 'viewer_watch_time':
        amount = this.calculateViewerWatchTimeReward(activityData);
        break;
      case 'content_creation':
        amount = this.rates.contentCreation;
        break;
      case 'comment_post':
        amount = this.rates.commentPosting;
        break;
      case 'referral_success':
        amount = this.rates.referralSuccessful;
        break;
      default:
        amount = 1; // Default small amount
    }
    
    // Generate the tokens
    return this.generateTokens({
      recipientAddress,
      amount,
      reason: `reward_${activityType}`,
      metadata
    });
  }
  
  /**
   * Calculate stream end reward for creator
   * @private
   * @param {Object} data Stream data
   * @returns {number} Reward amount
   */
  calculateStreamEndReward(data) {
    let amount = 0;
    
    // Calculate duration in minutes
    const startTime = new Date(data.startedAt).getTime();
    const endTime = new Date(data.endedAt).getTime();
    const durationMinutes = (endTime - startTime) / (1000 * 60);
    
    // Base time reward
    amount += durationMinutes * this.rates.streamMinuteCreator;
    
    // Viewer bonus
    amount += durationMinutes * data.averageViewers * this.rates.streamViewerBonus;
    
    // Completion bonus for longer streams
    if (durationMinutes >= 30) {
      amount += this.rates.streamCompletionBonus;
    }
    
    return Math.round(amount * 100) / 100; // Round to 2 decimal places
  }
  
  /**
   * Calculate viewer watch time reward
   * @private
   * @param {Object} data Viewer data
   * @returns {number} Reward amount
   */
  calculateViewerWatchTimeReward(data) {
    let amount = 0;
    
    // Calculate duration in minutes
    const watchTimeMinutes = data.watchTimeMinutes || 0;
    
    // Base time reward
    amount += watchTimeMinutes * this.rates.streamMinuteViewer;
    
    // Interaction bonus
    if (data.interactions && data.interactions > 0) {
      amount += Math.min(data.interactions, 5) * this.rates.streamInteractionBonus;
    }
    
    // Loyalty bonus if watched most of the stream
    if (data.percentWatched && data.percentWatched >= 80) {
      amount += this.rates.streamLoyaltyBonus;
    }
    
    return Math.round(amount * 100) / 100; // Round to 2 decimal places
  }
  
  /**
   * Handle stream started event
   * @private
   * @param {Object} stream Stream data
   */
  async handleStreamStarted(stream) {
    try {
      // Award tokens to creator for starting stream
      await this.generateActivityReward(
        stream.creatorAddress,
        'stream_start',
        { 
          streamId: stream.id,
          streamTitle: stream.title
        }
      );
    } catch (error) {
      console.error('Error handling stream start reward:', error);
    }
  }
  
  /**
   * Handle stream ended event
   * @private
   * @param {Object} stream Stream data
   */
  async handleStreamEnded(stream) {
    try {
      // Calculate average viewers
      const averageViewers = stream.peakViewerCount > 0 
        ? (stream.peakViewerCount + stream.viewerCount) / 2
        : stream.viewerCount;
        
      // Award tokens to creator for stream completion
      await this.generateActivityReward(
        stream.creatorAddress,
        'stream_end',
        {
          streamId: stream.id,
          streamTitle: stream.title,
          startedAt: stream.startedAt,
          endedAt: stream.endedAt,
          peakViewers: stream.peakViewerCount,
          totalViews: stream.totalViews,
          averageViewers
        }
      );
    } catch (error) {
      console.error('Error handling stream end reward:', error);
    }
  }
  
  /**
   * Process streaming rewards for active viewers
   * @private
   */
  async processStreamingRewards() {
    const activeSessions = new Map(StreamModel.streamSessions);
    const now = new Date();
    
    for (const [sessionId, session] of activeSessions.entries()) {
      try {
        const lastPingTime = new Date(session.lastPing).getTime();
        const minutesWatched = (now.getTime() - lastPingTime) / (1000 * 60);
        
        // Only reward if more than 1 minute passed since last reward
        if (minutesWatched >= 1) {
          const stream = StreamModel.getStreamById(session.streamId);
          if (stream && stream.status === 'live') {
            // Award tokens to viewer
            await this.generateActivityReward(
              session.viewerAddress,
              'viewer_watch_time',
              {
                streamId: session.streamId,
                sessionId,
                streamTitle: stream.title,
                creatorAddress: stream.creatorAddress,
                watchTimeMinutes: minutesWatched
              }
            );
            
            // Update last ping time (in a production environment, you'd want to update the actual session object)
            session.lastPing = now.toISOString();
          }
        }
      } catch (error) {
        console.error(`Error processing streaming reward for session ${sessionId}:`, error);
      }
    }
  }
  
  /**
   * Handle viewer joined event
   * @private
   * @param {Object} data Viewer join data
   */
  async handleViewerJoined(data) {
    // Track viewer join for potential rewards
    // In a production system, this might store additional viewer metadata
    console.log(`Viewer ${data.viewerAddress} joined stream ${data.streamId}`);
  }
  
  /**
   * Handle viewer left event
   * @private
   * @param {Object} data Viewer left data
   */
  async handleViewerLeft(data) {
    // Process final watch time rewards when viewer leaves
    try {
      const session = StreamModel.streamSessions.get(data.sessionId);
      if (!session) return;
      
      const stream = StreamModel.getStreamById(data.streamId);
      if (!stream) return;
      
      const startTime = new Date(session.startedAt).getTime();
      const endTime = new Date().getTime();
      const watchTimeMinutes = (endTime - startTime) / (1000 * 60);
      
      // Only reward if watched more than a minute
      if (watchTimeMinutes >= 1) {
        // Calculate percentage watched if stream has ended
        let percentWatched = null;
        if (stream.status === 'ended' && stream.startedAt && stream.endedAt) {
          const streamStartTime = new Date(stream.startedAt).getTime();
          const streamEndTime = new Date(stream.endedAt).getTime();
          const streamDuration = (streamEndTime - streamStartTime) / (1000 * 60);
          
          if (streamDuration > 0) {
            percentWatched = (watchTimeMinutes / streamDuration) * 100;
          }
        }
        
        // Award tokens to viewer
        await this.generateActivityReward(
          data.viewerAddress,
          'viewer_watch_time',
          {
            streamId: data.streamId,
            sessionId: data.sessionId,
            streamTitle: stream.title,
            creatorAddress: stream.creatorAddress,
            watchTimeMinutes,
            percentWatched,
            sessionComplete: true
          }
        );
      }
    } catch (error) {
      console.error(`Error handling viewer left reward for session ${data.sessionId}:`, error);
    }
  }
  
  /**
   * Get token generation history for a wallet
   * @param {string} walletAddress Wallet address
   * @returns {Array} Array of token generations
   */
  getTokenHistory(walletAddress) {
    const history = [];
    
    for (const token of this.tokenHistory.values()) {
      if (token.recipientAddress === walletAddress) {
        history.push(token);
      }
    }
    
    return history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  
  /**
   * Get pending tokens for a wallet
   * @param {string} walletAddress Wallet address
   * @returns {Array} Array of pending tokens
   */
  getPendingTokens(walletAddress) {
    const pending = [];
    
    for (const token of this.pendingTokens.values()) {
      if (token.recipientAddress === walletAddress) {
        pending.push(token);
      }
    }
    
    return pending;
  }
  
  /**
   * Generate a JWT token for a user
   * @param {string} address - User's wallet address
   * @param {Object} additionalData - Additional data to include in token
   * @returns {string} JWT token
   */
  async generateToken(address, additionalData = {}) {
    try {
      if (!address) throw new Error('Address is required');
      
      // Normalize address to lowercase
      const normalizedAddress = address.toLowerCase();
      
      // Create token payload
      const payload = {
        address: normalizedAddress,
        ...additionalData,
        // Add random nonce for uniqueness
        nonce: crypto.randomBytes(8).toString('hex'),
        // Add timestamp for reference
        timestamp: Math.floor(Date.now() / 1000)
      };
      
      // Sign the token
      const token = jwt.sign(payload, SECRET_KEY, {
        expiresIn: TOKEN_EXPIRY
      });
      
      return token;
    } catch (error) {
      console.error('Error generating token:', error);
      throw error;
    }
  }

  /**
   * Generate an admin JWT token for owner-level access
   * @param {string} address - Owner's wallet address
   * @param {Object} additionalData - Additional data to include in token
   * @returns {string} Admin JWT token
   */
  async generateAdminToken(address, additionalData = {}) {
    try {
      if (!address) throw new Error('Address is required');
      
      // Normalize address to lowercase
      const normalizedAddress = address.toLowerCase();
      
      // Create token payload with owner flag
      const payload = {
        address: normalizedAddress,
        isOwner: true,  // Flag indicating owner-level access
        ...additionalData,
        // Add random nonce for uniqueness
        nonce: crypto.randomBytes(16).toString('hex'),
        // Add timestamp for reference
        timestamp: Math.floor(Date.now() / 1000)
      };
      
      // Sign the token with admin secret
      const token = jwt.sign(payload, ADMIN_SECRET_KEY, {
        expiresIn: ADMIN_TOKEN_EXPIRY
      });
      
      return token;
    } catch (error) {
      console.error('Error generating admin token:', error);
      throw error;
    }
  }

  /**
   * Verify a JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload or null if invalid
   */
  async verifyToken(token) {
    try {
      if (!token) return null;
      
      // Verify the token
      const decoded = jwt.verify(token, SECRET_KEY);
      return decoded;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  /**
   * Verify an admin JWT token
   * @param {string} token - Admin JWT token to verify
   * @returns {Object} Decoded token payload or null if invalid
   */
  async verifyAdminToken(token) {
    try {
      if (!token) return null;
      
      // Verify the token using admin secret
      const decoded = jwt.verify(token, ADMIN_SECRET_KEY);
      
      // Ensure it's an admin token
      if (!decoded.isOwner) {
        throw new Error('Not an admin token');
      }
      
      return decoded;
    } catch (error) {
      console.error('Admin token verification error:', error);
      return null;
    }
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
  }
}

module.exports = new TokenGeneratorService();