#!/bin/bash

# Configuration
RPC_URL="https://auto-evm.taurus.autonomys.xyz/ws"
PRIVATE_KEY="0x43e93d2b458a7b79518f6ab2ab26150899969193dde37c99edca68970921ea15"
TOKEN_ADDRESS="0xF3A7b4Bc6F72f2490dA7b9BCd8CE6b34A1A6335c"
NFT_ADDRESS="0x043Ba74ADfB67C23dbCCb52b3007E15dFe962320"
PLATFORM_ADDRESS="0xAae9C0dF6dF1A2274A3B4cE44BE3F34f381a164d"

# Additional addresses
USER1="0xc75CB6f74819D36CB07f2eE9690C5c6D585E9a89"
USER2="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"

# Function to handle errors
handle_error() {
    if [ $? -ne 0 ]; then
        echo "Error: $1"
        exit 1
    fi
}

echo "Starting interactions..."

# Get current block timestamp with retry mechanism
get_current_time() {
    local max_attempts=3
    local attempt=1
    while [ $attempt -le $max_attempts ]; do
        CURRENT_TIME=$(cast block latest -r $RPC_URL | grep timestamp | awk '{print $2}')
        if [ ! -z "$CURRENT_TIME" ]; then
            echo $CURRENT_TIME
            return 0
        fi
        echo "Attempt $attempt failed, retrying..."
        attempt=$((attempt + 1))
        sleep 2
    done
    echo "Failed to get current time after $max_attempts attempts"
    exit 1
}

# # Set platform address in NFT contract
# echo "Setting platform address in NFT contract..."
# cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY $NFT_ADDRESS \
#     "setDataLabelingPlatform(address)" $PLATFORM_ADDRESS
# handle_error "Failed to set platform address"

# Mint tokens and handle deposits for each user
INITIAL_MINT="1000000000000000000000" # 1000 tokens with 18 decimals
DEPOSIT_AMOUNT="100000000000000000000" # 100 tokens with 18 decimals

for USER in $USER1 $USER2; do
    echo "Processing user: $USER"
    
    # Mint tokens
    echo "Minting tokens..."
    cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY $TOKEN_ADDRESS \
        "mint(address,uint256)" $USER $INITIAL_MINT
    handle_error "Failed to mint tokens for $USER"
    
    # Approve platform
    echo "Approving platform..."
    cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY $TOKEN_ADDRESS \
        "approve(address,uint256)" $PLATFORM_ADDRESS $INITIAL_MINT
    handle_error "Failed to approve tokens for $USER"
    
    # Deposit tokens
    echo "Depositing tokens..."
    cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY $PLATFORM_ADDRESS \
        "depositTokens(uint256)" $DEPOSIT_AMOUNT
    handle_error "Failed to deposit tokens for $USER"
done

# Create tasks
AUTO_DRIVE="bafkr6iakneiv5izqwkq6ig4ps6cqy4xibpwhgretrkn2bsq4hymagxycqm"
REWARDS=("10000000000000000000" "20000000000000000000" "30000000000000000000")

# Get current time with retry mechanism
CURRENT_TIME=$(get_current_time)
handle_error "Failed to get current time"

DEADLINES=(
    $((CURRENT_TIME + 86400))  # +1 day
    $((CURRENT_TIME + 259200)) # +3 days
    $((CURRENT_TIME + 604800)) # +7 days
)

# Try using HTTP instead of WebSocket for more stability


for i in {0..2}; do
    echo "Creating task ${i}..."
    # Add retry mechanism for task creation
    max_attempts=3
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if cast send --rpc-url $RPC_URL --private-key $PRIVATE_KEY $PLATFORM_ADDRESS \
            "createTask(string,uint256,uint256)" \
            $AUTO_DRIVE ${REWARDS[$i]} ${DEADLINES[$i]}; then
            echo "Task ${i} created successfully"
            break
        fi
        echo "Attempt $attempt failed, retrying..."
        attempt=$((attempt + 1))
        sleep 2
    done
    if [ $attempt -gt $max_attempts ]; then
        echo "Failed to create task ${i} after $max_attempts attempts"
        exit 1
    fi
done

echo "Script execution completed successfully"