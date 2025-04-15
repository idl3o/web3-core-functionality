# Web3 Streaming Service - Java Implementation

This directory contains the Java server-side components of the Web3 Crypto Streaming Service. These components handle token operations, content verification, and blockchain interactions through AWS Lambda functions.

## Project Structure

```
java/
├── README.md                  # This file
├── index.html                 # API documentation page
├── serverless-function/       # AWS Lambda function code
│   ├── pom.xml                # Maven configuration
│   ├── template.yaml          # AWS SAM template
│   └── src/
│       └── main/
│           └── java/
│               └── io/
│                   └── web3streaming/
│                       ├── handlers/     # Lambda handlers
│                       ├── models/       # Data models
│                       ├── services/     # Business logic
│                       └── utils/        # Helper classes
└── javadocs/                  # Generated JavaDocs
```

## Key Components

### TokenBalanceHandler

This Lambda handler processes API Gateway events to retrieve token balances from the blockchain.

```java
public APIGatewayProxyResponseEvent handleRequest(APIGatewayProxyRequestEvent event, Context context) {
    String address = extractAddressFromEvent(event);
    try {
        BigInteger balance = tokenService.getBalance(address);
        return createSuccessResponse(balance);
    } catch (Exception e) {
        return createErrorResponse(e);
    }
}
```

### StreamTokenService

Service class for interacting with the STREAM token contract:

```java
public BigInteger getBalance(String address) throws Web3StreamingException {
    try {
        ERC20Contract contract = ERC20Contract.load(
            tokenContractAddress,
            web3j,
            credentials,
            new DefaultGasProvider()
        );
        return contract.balanceOf(address).send();
    } catch (Exception e) {
        throw new Web3StreamingException("Failed to retrieve token balance", e);
    }
}
```

## Getting Started

### Prerequisites

- Java 17+
- Maven
- AWS CLI (for deployment)
- AWS SAM CLI (for local testing)

### Local Testing

```bash
# Navigate to the serverless function directory
cd serverless-function

# Build the project
mvn clean package

# Run local API with SAM
sam local start-api
```

### Deployment

The functions are automatically deployed via GitHub Actions when changes are pushed to the main branch. For manual deployment:

```bash
cd serverless-function
sam deploy --guided
```

## API Reference

For detailed API documentation, visit the [Java API documentation page](./index.html).
