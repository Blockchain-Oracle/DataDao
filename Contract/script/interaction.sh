#!/bin/bash

# Configuration
RPC_URL="https://auto-evm.taurus.autonomys.xyz/ws"
PRIVATE_KEY=""
TOKEN_ADDRESS="0xF3A7b4Bc6F72f2490dA7b9BCd8CE6b34A1A6335c"
NFT_ADDRESS="0xEd51ca2ebB382E6f28aCc011C13b516D458671C3"
PLATFORM_ADDRESS="0x470658a21d9f83248B18301972111DD1bBf774C9"

# Additional addresses
USER1="0xc75CB6f74819D36CB07f2eE9690C5c6D585E9a89"
USER2="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

echo "Starting interactions..."

# Set platform address in NFT contract
echo "Setting platform address in NFT contract..."
cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY $NFT_ADDRESS \
    "setDataLabelingPlatform(address)" $PLATFORM_ADDRESS

# Mint tokens and handle deposits for each user
INITIAL_MINT="1000000000000000000000" # 1000 tokens with 18 decimals
DEPOSIT_AMOUNT="100000000000000000000" # 100 tokens with 18 decimals

for USER in $USER1 $USER2; do
    echo "Processing user: $USER"
    
    # Mint tokens
    echo "Minting tokens..."
    cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY $TOKEN_ADDRESS \
        "mint(address,uint256)" $USER $INITIAL_MINT
    
    # Approve platform
    echo "Approving platform..."
    cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY $TOKEN_ADDRESS \
        "approve(address,uint256)" $PLATFORM_ADDRESS $INITIAL_MINT
    
    # Deposit tokens
    echo "Depositing tokens..."
    cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY $PLATFORM_ADDRESS \
        "depositTokens(uint256)" $DEPOSIT_AMOUNT
done

# Create tasks
IPFS_CID="bafkr6iakneiv5izqwkq6ig4ps6cqy4xibpwhgretrkn2bsq4hymagxycqm"
REWARDS=("10000000000000000000" "20000000000000000000" "30000000000000000000")
CURRENT_TIME=$(cast block latest -r $RPC_URL | grep timestamp | awk '{print $2}')
DEADLINES=(
    $((CURRENT_TIME + 86400))  # +1 day
    $((CURRENT_TIME + 259200)) # +3 days
    $((CURRENT_TIME + 604800)) # +7 days
)

for i in {0..2}; do
    echo "Creating task ${i}..."
    cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY $PLATFORM_ADDRESS \
        "createTask(string,uint256,uint256)" \
        $IPFS_CID ${REWARDS[$i]} ${DEADLINES[$i]}
done

echo "Script execution completed"