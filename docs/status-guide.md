# Web3 Crypto Streaming Service - Status System Guide

## Introduction

The System Status page provides real-time information about the health and performance of the Web3 Crypto Streaming Service platform. This guide will help you understand how to read the information presented and troubleshoot common issues.

## Accessing the Status Page

You can access the Status page in several ways:

1. **From the main website:** Click on the "System Status" button in the homepage footer
2. **Direct URL:** Visit [https://idl3o.github.io/gh-pages/status.html](https://idl3o.github.io/gh-pages/status.html)
3. **Locally:** During development, access at [http://127.0.0.1:5500/status.html](http://127.0.0.1:5500/status.html)
4. **Using batch file:** Run the `run-status.cmd` script from the project directory

## Understanding Status Indicators

The Status page displays several key indicators:

| Indicator | Status | Description |
|-----------|--------|-------------|
| 🟢 | Operational | Component is functioning normally |
| 🟡 | Degraded | Component is experiencing issues but still operational |
| 🔴 | Outage | Component is unavailable |
| ⚪ | Unknown | Status cannot be determined |

## System Components

The status page monitors the following key components:

1. **Blockchain Connectivity** - Connection to Ethereum and other blockchains
2. **Smart Contract Status** - Health of deployed contracts
3. **Content Delivery Network** - Video and asset delivery performance
4. **API Services** - API endpoint availability and response times
5. **User Authentication** - Login and wallet connection services

## Interpreting Metrics

### Response Time
* **Good:** < 200ms
* **Moderate:** 200-500ms
* **Poor:** > 500ms

### Transaction Success Rate
* **Good:** > 98%
* **Moderate:** 95-98%
* **Poor:** < 95%

## Troubleshooting Common Issues

If you encounter issues with the platform, consult the status page first to identify if there's a system-wide problem.

### Connection Issues
If blockchain connectivity shows degraded performance:
1. Check your internet connection
2. Verify your wallet has sufficient funds for gas
3. Try switching to a different RPC endpoint

### Content Not Loading
If CDN status shows degraded performance:
1. Clear your browser cache
2. Try a different browser
3. Check if your region is experiencing CDN issues

## Historical Data

The status page maintains a 7-day history of platform performance. Click the "View Historical Data" button to access detailed information about past incidents and maintenance periods.

## Setting Up Notifications

You can subscribe to status notifications by:

1. Clicking the "Subscribe" button on the status page
2. Selecting your preferred notification method (email, SMS, webhook)
3. Confirming your subscription

## For Developers

To integrate the status API into your applications, see our [Status API documentation](https://idl3o.github.io/gh-pages/docs/api.html#status).

## Feedback

If you have suggestions for improving the status monitoring system, please submit them through our [feedback form](https://idl3o.github.io/gh-pages/feedback.html) or create an issue in our [GitHub repository](https://github.com/idl3o/gh-pages/issues).
