# Web3 Crypto Streaming Service - Java Serverless Integration

This module provides Java-based serverless functions for interacting with the Web3 Crypto Streaming Service platform, particularly focused on STREAM token operations.

## Overview

The Java serverless integration enables:

- Token balance checking via REST API endpoints
- Content registration and verification
- User authentication via Web3 wallets
- Transaction history and analytics

## Requirements

- Java 17 or higher
- AWS CLI (for deployment to AWS Lambda)
- Maven 3.8+
- An Ethereum wallet with STREAM tokens for testing

## Quick Start

### Local Development

```bash
cd serverless-function
mvn clean package
sam local start-api
```

### Deployment

```bash
cd serverless-function
mvn clean package
aws s3 mb s3://web3-streaming-deployment-bucket --region your-region
sam deploy --stack-name web3-streaming-lambda --s3-bucket web3-streaming-deployment-bucket --capabilities CAPABILITY_IAM
```

## API Endpoints

Once deployed, the following endpoints are available:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/token/balance/{address}` | GET | Get STREAM token balance for an address |
| `/content/register` | POST | Register new content on the platform |
| `/content/access/{contentId}` | GET | Check access rights for content |
| `/transaction/history/{address}` | GET | Get transaction history for an address |

## Integration with Smart Contracts

The Java serverless functions interact with the platform's smart contracts using Web3j. See [StreamAccessContract](../docs/contracts/stream-access.html) for the contract interfaces.

## Configuration

Environment variables for Lambda functions:

- `ETHEREUM_NETWORK`: Mainnet, Goerli, or Polygon
- `CONTRACT_ADDRESS`: Address of the deployed StreamToken contract
- `WEB3_PROVIDER_URL`: URL of the Ethereum node provider

## Example Usage

```java
// Example code to check token balance
StreamTokenClient client = new StreamTokenClient(Web3jProvider.getWeb3j());
BigInteger balance = client.getTokenBalance("0x1234567890123456789012345678901234567890");
System.out.println("Token balance: " + balance);
```

## Monitoring and Logging

All serverless functions are integrated with AWS CloudWatch for monitoring and logging.
