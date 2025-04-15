package io.web3streaming.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Bool;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthCall;

import java.io.IOException;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class StreamTokenService {
    private static final Logger logger = LoggerFactory.getLogger(StreamTokenService.class);
    private final Web3j web3j;
    private final String contractAddress;

    public StreamTokenService(Web3j web3j) {
        this.web3j = web3j;
        this.contractAddress = System.getenv("CONTRACT_ADDRESS");
    }

    public BigInteger getTokenBalance(String address) throws IOException {
        logger.info("Getting token balance for address: {}", address);

        Function function = new Function(
                "balanceOf",
                Collections.singletonList(new Address(address)),
                Collections.singletonList(new TypeReference<Uint256>() {})
        );

        String encodedFunction = FunctionEncoder.encode(function);
        EthCall response = web3j.ethCall(
                Transaction.createEthCallTransaction(
                        address,
                        contractAddress,
                        encodedFunction),
                DefaultBlockParameterName.LATEST)
                .send();

        if (response.hasError()) {
            throw new IOException("Error calling contract: " + response.getError().getMessage());
        }

        List<Type> result = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
        if (result.size() > 0) {
            return ((Uint256) result.get(0)).getValue();
        } else {
            throw new IOException("Empty response from contract");
        }
    }

    public boolean canStreamContent(String userAddress, String contentId) throws IOException {
        logger.info("Checking if user {} can stream content: {}", userAddress, contentId);

        Function function = new Function(
                "canStream",
                Arrays.asList(new Address(userAddress), new org.web3j.abi.datatypes.Utf8String(contentId)),
                Collections.singletonList(new TypeReference<Bool>() {})
        );

        String encodedFunction = FunctionEncoder.encode(function);
        EthCall response = web3j.ethCall(
                Transaction.createEthCallTransaction(
                        userAddress,
                        contractAddress,
                        encodedFunction),
                DefaultBlockParameterName.LATEST)
                .send();

        if (response.hasError()) {
            throw new IOException("Error calling contract: " + response.getError().getMessage());
        }

        List<Type> result = FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());
        if (result.size() > 0) {
            return ((Bool) result.get(0)).getValue();
        } else {
            throw new IOException("Empty response from contract");
        }
    }
}
