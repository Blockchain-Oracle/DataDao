#!/bin/bash

# Set environment variables (replace with your actual values)
PRIVATE_KEY=""
RPC_URL="https://auto-evm.taurus.autonomys.xyz/ws"
VERIFIER_URL="https://blockscout.taurus.autonomys.xyz/api/"
BASE_URI="https://data-dao.vercel.app/api/nft"

# Clean and rebuild
echo "Cleaning and rebuilding..."
forge clean
forge build

# Deploy PerformanceNFT
echo "Deploying PerformanceNFT..."
NFT_ADDRESS=$(forge create \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --constructor-args $BASE_URI \
    --verify \
    --verifier blockscout \
    --verifier-url $VERIFIER_URL \
    src/PerformanceNft.sol:PerformanceNFT)

echo "PerformanceNFT deployed at: $NFT_ADDRESS"

# Deploy ERC20Mock
echo "Deploying ERC20Mock..."
TOKEN_ADDRESS=$(forge create \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    src/mocks/ERC20Mock.sol:ERC20Mock)

echo "ERC20Mock deployed at: $TOKEN_ADDRESS"

# Deploy DataLabelingPlatform
echo "Deploying DataLabelingPlatform..."
PLATFORM_ADDRESS=$(forge create \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --constructor-args $TOKEN_ADDRESS $NFT_ADDRESS \
    src/DataLabelingPlatform.sol:DataLabelingPlatform)

echo "DataLabelingPlatform deployed at: $PLATFORM_ADDRESS"

# Run the interactions script
echo "Running interactions..."
forge script script/Interactions.s.sol \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast

echo "Deployment completed!"