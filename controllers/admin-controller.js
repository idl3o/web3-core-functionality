/**
 * Admin Controller
 * 
 * Handles owner-level access operations for the Web3 streaming platform
 */

const { ethers } = require('ethers');
const TokenModel = require('../models/token-model');
const UserModel = require('../models/user-model');
const ContentModel = require('../models/content-model');
const StreamModel = require('../models/stream-model');
const tokenService = require('../services/token/index');

// Contracts
const StreamingTokenABI = require('../artifacts/contracts/StreamingToken.sol/StreamingToken.json').abi;

class AdminController {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    this.adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, this.provider);
    this.contractAddress = process.env.STREAMING_TOKEN_ADDRESS;
    this.contract = new ethers.Contract(this.contractAddress, StreamingTokenABI, this.adminWallet);
  }

  /**
   * Authenticate admin request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async authenticateAdmin(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication token required' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = await tokenService.verifyAdminToken(token);
      
      if (!decoded || !decoded.isOwner) {
        return res.status(403).json({ error: 'Not authorized as owner' });
      }
      
      // Add user info to request
      req.admin = decoded;
      next();
    } catch (error) {
      console.error('Admin authentication error:', error);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  }

  /**
   * Admin login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const { signature, message, address } = req.body;
      
      if (!signature || !message || !address) {
        return res.status(400).json({ error: 'Signature, message and address required' });
      }

      // Verify the signature
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
      
      // Check if address is owner
      const owner = await this.contract.owner();
      
      if (owner.toLowerCase() !== address.toLowerCase()) {
        return res.status(403).json({ error: 'Address is not the contract owner' });
      }
      
      // Generate admin token
      const token = await tokenService.generateAdminToken(address);
      
      return res.status(200).json({
        message: 'Admin authenticated successfully',
        token,
        address
      });
    } catch (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({ error: 'Login failed' });
    }
  }

  /**
   * Grant user access to content
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async grantAccess(req, res) {
    try {
      const { userAddress, contentId, durationInSeconds } = req.body;
      
      if (!userAddress || !contentId || !durationInSeconds) {
        return res.status(400).json({ error: 'User address, content ID, and duration required' });
      }
      
      // Grant access on blockchain
      const tx = await this.contract.grantAccess(userAddress, contentId, durationInSeconds);
      await tx.wait();
      
      // Update database
      await StreamModel.createOrUpdateStream({
        userAddress,
        contentId,
        expiryTime: Math.floor(Date.now() / 1000) + parseInt(durationInSeconds),
        grantedByAdmin: true
      });
      
      return res.status(200).json({
        message: 'Access granted successfully',
        transaction: tx.hash
      });
    } catch (error) {
      console.error('Grant access error:', error);
      return res.status(500).json({ error: 'Failed to grant access' });
    }
  }

  /**
   * Revoke user access to content
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async revokeAccess(req, res) {
    try {
      const { userAddress, contentId } = req.body;
      
      if (!userAddress || !contentId) {
        return res.status(400).json({ error: 'User address and content ID required' });
      }
      
      // Revoke access on blockchain
      const tx = await this.contract.revokeAccess(userAddress, contentId);
      await tx.wait();
      
      // Update database
      await StreamModel.revokeAccess(userAddress, contentId);
      
      return res.status(200).json({
        message: 'Access revoked successfully',
        transaction: tx.hash
      });
    } catch (error) {
      console.error('Revoke access error:', error);
      return res.status(500).json({ error: 'Failed to revoke access' });
    }
  }

  /**
   * Mint tokens to address
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async mintTokens(req, res) {
    try {
      const { toAddress, amount } = req.body;
      
      if (!toAddress || !amount) {
        return res.status(400).json({ error: 'Address and amount required' });
      }
      
      // Convert amount to wei (with 18 decimals)
      const amountInWei = ethers.utils.parseEther(amount.toString());
      
      // Mint tokens
      const tx = await this.contract.ownerMint(toAddress, amountInWei);
      await tx.wait();
      
      // Update database
      await TokenModel.recordTokenMint({
        toAddress,
        amount,
        transactionHash: tx.hash,
        mintedByAdmin: true
      });
      
      return res.status(200).json({
        message: 'Tokens minted successfully',
        transaction: tx.hash
      });
    } catch (error) {
      console.error('Mint tokens error:', error);
      return res.status(500).json({ error: 'Failed to mint tokens' });
    }
  }

  /**
   * Update treasury address
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateTreasury(req, res) {
    try {
      const { treasuryAddress } = req.body;
      
      if (!treasuryAddress) {
        return res.status(400).json({ error: 'Treasury address required' });
      }
      
      // Update treasury address
      const tx = await this.contract.setTreasuryAddress(treasuryAddress);
      await tx.wait();
      
      return res.status(200).json({
        message: 'Treasury address updated successfully',
        transaction: tx.hash
      });
    } catch (error) {
      console.error('Update treasury error:', error);
      return res.status(500).json({ error: 'Failed to update treasury address' });
    }
  }

  /**
   * Update content creator
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateContentCreator(req, res) {
    try {
      const { contentId, creatorAddress } = req.body;
      
      if (!contentId || !creatorAddress) {
        return res.status(400).json({ error: 'Content ID and creator address required' });
      }
      
      // Update content creator
      const tx = await this.contract.updateContentCreator(contentId, creatorAddress);
      await tx.wait();
      
      // Update database
      await ContentModel.updateContentCreator(contentId, creatorAddress);
      
      return res.status(200).json({
        message: 'Content creator updated successfully',
        transaction: tx.hash
      });
    } catch (error) {
      console.error('Update content creator error:', error);
      return res.status(500).json({ error: 'Failed to update content creator' });
    }
  }

  /**
   * Get platform statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getStats(req, res) {
    try {
      // Get user count
      const userCount = await UserModel.getUserCount();
      
      // Get content count
      const contentCount = await ContentModel.getContentCount();
      
      // Get active streams
      const activeStreams = await StreamModel.getActiveStreamCount();
      
      // Get token stats
      const totalSupply = await this.contract.totalSupply();
      const treasuryBalance = await this.contract.balanceOf(await this.contract.treasuryAddress());
      
      return res.status(200).json({
        users: userCount,
        content: contentCount,
        activeStreams,
        tokenStats: {
          totalSupply: ethers.utils.formatEther(totalSupply),
          treasuryBalance: ethers.utils.formatEther(treasuryBalance)
        }
      });
    } catch (error) {
      console.error('Get stats error:', error);
      return res.status(500).json({ error: 'Failed to get platform statistics' });
    }
  }
}

module.exports = new AdminController();