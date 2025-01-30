// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {DataLabelingPlatform} from "../src/DataLabelingPlatform.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract Interactions is Script {
    DataLabelingPlatform platform;
    ERC20Mock token;

    // function setUp() public {
    //     // Load existing contract addresses if needed
    // }

    function run() public {
        // uint256 deployerPrivateKey = vm.envUint();
        vm.startBroadcast();

        // Deploy mock token
        token = ERC20Mock(payable(0x5FbDB2315678afecb367f032d93F642f64180aa3));

        // Deploy platform with mock token
        platform = DataLabelingPlatform(payable(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512));
        // address(0xc75CB6f74819D36CB07f2eE9690C5c6D585E9a89).call{value: 4 ether}("");
        // Mint initial tokens using ERC20._mint (since Erc20Mock inherits from ERC20)
        uint256 initialMint = 1000 * 10 ** 18; // 1000 tokens with 18 decimals
        token.mint(msg.sender, initialMint);
        token.mint(0xc75CB6f74819D36CB07f2eE9690C5c6D585E9a89, initialMint);
        // Approve platform to spend tokens
        token.approve(address(platform), initialMint);

        // Deposit tokens to platform
        platform.depositTokens(100 * 10 ** 18); // Deposit 100 tokens

        // Create a task
        string memory ipfsCID = "bafkr6icg3wimyq6mwlbmlaynulbvpisddt6wttnftrxdcp2kj6aws6jkre"; // Replace with actual IPFS CID
        uint256 totalReward = 10 * 10 ** 18; // 10 tokens as reward
        uint256 deadline = block.timestamp + 10 hours; // Set deadline 4 hours from now

        platform.createTask(ipfsCID, totalReward, deadline);

        vm.stopBroadcast();
    }
}
