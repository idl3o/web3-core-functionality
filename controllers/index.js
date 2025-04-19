/**
 * @license
 * Web3 Crypto Streaming Service
 * Copyright (c) 2023-2025 idl3o-redx
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Controllers Index
 * Entry point for all controllers in the Web3 Streaming Service
 * @module controllers
 */

const express = require('express');
const router = express.Router();

// Import controllers
const userController = require('./user-controller');
const contentController = require('./content-controller');
const tokenController = require('./token-controller');
const paymentController = require('./payment-controller');
const insightsController = require('./insights-controller');
const nftController = require('./nft-controller');
const betaController = require('./beta-controller');
const adminController = require('./admin-controller');

// User routes
router.post('/users/register', userController.register);
router.post('/users/login', userController.login);
router.get('/users/profile', userController.authenticateToken, userController.getProfile);
router.put('/users/profile', userController.authenticateToken, userController.updateProfile);
router.get('/users/:address', userController.getUserByAddress);

// Content routes
router.post('/content/register', contentController.authenticateToken, contentController.registerContent);
router.get('/content/:contentId', contentController.getContent);
router.get('/content', contentController.getContentList);
router.post('/content/:contentId/access', contentController.authenticateToken, contentController.checkAccess);

// Token routes
router.post('/token/purchase', tokenController.authenticateToken, tokenController.purchaseTokens);
router.get('/token/balance/:address', tokenController.getTokenBalance);
router.post('/token/transfer', tokenController.authenticateToken, tokenController.transferTokens);

// Payment routes
router.post('/payment/create', paymentController.authenticateToken, paymentController.createPayment);
router.get('/payment/history', paymentController.authenticateToken, paymentController.getPaymentHistory);
router.get('/payment/:paymentId', paymentController.authenticateToken, paymentController.getPaymentDetails);

// Insights routes
router.get('/insights/dashboard', insightsController.authenticateToken, insightsController.getDashboard);
router.get('/insights/audience', insightsController.authenticateToken, insightsController.getAudienceData);
router.get('/insights/revenue', insightsController.authenticateToken, insightsController.getRevenueData);

// NFT routes
router.post('/nft/mint', nftController.authenticateToken, nftController.mintNFT);
router.get('/nft/collection/:address', nftController.getNFTCollection);

// Beta routes
router.post('/beta/register', betaController.registerForBeta);
router.get('/beta/status', betaController.authenticateToken, betaController.getBetaStatus);

// Admin routes (owner access only)
router.post('/admin/login', adminController.login);
router.get('/admin/stats', adminController.authenticateAdmin, adminController.getStats);
router.post('/admin/grant-access', adminController.authenticateAdmin, adminController.grantAccess);
router.post('/admin/revoke-access', adminController.authenticateAdmin, adminController.revokeAccess);
router.post('/admin/mint-tokens', adminController.authenticateAdmin, adminController.mintTokens);
router.post('/admin/update-treasury', adminController.authenticateAdmin, adminController.updateTreasury);
router.post('/admin/update-content-creator', adminController.authenticateAdmin, adminController.updateContentCreator);

module.exports = router;
