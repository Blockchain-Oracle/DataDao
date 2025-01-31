// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {DataLabelingPlatform} from "../src/DataLabelingPlatform.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {PerformanceNFT} from "../src/PerformanceNft.sol";
import {console} from "forge-std/console.sol";

contract Interactions is Script {
    DataLabelingPlatform platform;
    ERC20Mock token;
    PerformanceNFT nft;

    string private constant BASE_ENDPOINT = "localhost:3000/api/nft/";

    function run() public {
        vm.startBroadcast();

        // Deploy mock token
        token = ERC20Mock(payable(0x5FbDB2315678afecb367f032d93F642f64180aa3));
        console.log("Mock token deployed at:", address(token));

        // Deploy NFT contract
        nft = PerformanceNFT(payable(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512));
        console.log("NFT contract deployed at:", address(nft));

        // Deploy platform with mock token and NFT
        platform = DataLabelingPlatform(payable(0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0));
        console.log("Platform deployed at:", address(platform));

        // Set platform address in NFT contract
        nft.setDataLabelingPlatform(address(platform));

        // Mint initial tokens to multiple addresses
        uint256 initialMint = 1000 * 10 ** 18; // 1000 tokens with 18 decimals
        address[] memory users = new address[](3);
        users[0] = msg.sender;
        users[1] = 0xc75CB6f74819D36CB07f2eE9690C5c6D585E9a89;
        users[2] = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        for (uint i = 0; i < users.length; i++) {
            console.log("Minting", initialMint, "tokens to", users[i]);
            token.mint(users[i], initialMint);
            token.approve(address(platform), initialMint);
            platform.depositTokens(100 * 10 ** 18); // Each user deposits 100 tokens
            console.log("Deposited 100 tokens for user", users[i]);
        }
        address(0xc75CB6f74819D36CB07f2eE9690C5c6D585E9a89).call{value: 4 ether}("");
        console.log("Sent 4 ETH to test address");

        // Create multiple tasks with different parameters
        string[] memory ipfsCIDs = new string[](3);
        ipfsCIDs[0] = "bafkr6iakneiv5izqwkq6ig4ps6cqy4xibpwhgretrkn2bsq4hymagxycqm";
        ipfsCIDs[1] = "bafkr6iakneiv5izqwkq6ig4ps6cqy4xibpwhgretrkn2bsq4hymagxycqm";
        ipfsCIDs[2] = "bafkr6iakneiv5izqwkq6ig4ps6cqy4xibpwhgretrkn2bsq4hymagxycqm";

        uint256[] memory rewards = new uint256[](3);
        rewards[0] = 10 * 10 ** 18; // 10 tokens
        rewards[1] = 20 * 10 ** 18; // 20 tokens
        rewards[2] = 30 * 10 ** 18; // 30 tokens

        uint256[] memory deadlines = new uint256[](3);
        deadlines[0] = block.timestamp + 1 days;
        deadlines[1] = block.timestamp + 3 days;
        deadlines[2] = block.timestamp + 7 days;

        // for (uint i = 0; i < ipfsCIDs.length; i++) {
        //     // console.log("Creating task", i, "with reward", rewards[i], "and deadline", deadlines[i]);
        //     platform.createTask(ipfsCIDs[i], rewards[i], deadlines[i]);
        //     console.log("task created successfully", i);
        // }

        vm.stopBroadcast();
        console.log("Script execution completed");
    }
}
