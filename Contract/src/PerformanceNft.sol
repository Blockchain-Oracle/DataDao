// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721Enumerable, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
/**
 * @title PerformanceNFT
 * @notice NFT contract that evolves based on user performance in the DataLabelingPlatform
 */

contract PerformanceNFT is ERC721Enumerable, ReentrancyGuard, Ownable {
    // Performance tracking
    struct UserPerformance {
        uint256 tasksCompleted;
        uint256 lastUpdateBlock;
        uint8 currentLevel;
    }

    // NFT Metadata
    struct NFTMetadata {
        uint8 level;
        uint256 lastEvolution;
        string baseURI;
    }

    // State variables
    uint256 private _tokenIdCounter;
    address public dataLabelingPlatform;
    mapping(address => UserPerformance) public userPerformance;
    mapping(uint256 => NFTMetadata) public nftMetadata;

    // Evolution thresholds
    uint256 public constant LEVEL_1_THRESHOLD = 5;  // 5 tasks
    uint256 public constant LEVEL_2_THRESHOLD = 10; // 10 tasks
    uint256 public constant LEVEL_3_THRESHOLD = 15; // 15 tasks
    uint256 public constant LEVEL_4_THRESHOLD = 20; // 20 tasks

    // Base URI for Auto Drive endpoint
    string public baseEndpoint;

    // Events
    event NFTMinted(address indexed user, uint256 indexed tokenId);
    event NFTEvolved(uint256 indexed tokenId, uint8 newLevel);
    event PerformanceUpdated(address indexed user, uint256 tasksCompleted);

    constructor(string memory _baseEndpoint) ERC721("Performance NFT", "PERF") Ownable(msg.sender) {
        baseEndpoint = _baseEndpoint;
    }

    modifier onlyDataLabelingPlatform() {
        require(msg.sender == dataLabelingPlatform, "Only DataLabelingPlatform can call");
        _;
    }

    // Add setter for dataLabelingPlatform address
    function setDataLabelingPlatform(address _dataLabelingPlatform) external {
        require(msg.sender == owner(), "Only owner can set platform");
        require(dataLabelingPlatform == address(0), "Platform already set");
        require(_dataLabelingPlatform != address(0), "Invalid platform address");
        dataLabelingPlatform = _dataLabelingPlatform;
    }

    // Allow platform owner to update base endpoint if needed
    function setBaseEndpoint(string memory _newEndpoint) external onlyDataLabelingPlatform {
        baseEndpoint = _newEndpoint;
    }

    /**
     * @notice Mints initial NFT for new users
     * @param user Address of the user to mint for
     * @return tokenId The ID of the minted NFT
     */
    function mintInitialNFT(address user) external onlyDataLabelingPlatform returns (uint256) {
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(user, tokenId);

        nftMetadata[tokenId] = NFTMetadata({
            level: 1,
            lastEvolution: block.timestamp,
            baseURI: string(abi.encodePacked(baseEndpoint, "/rookie/"))
        });

        userPerformance[user] = UserPerformance({
            tasksCompleted: 0,
            lastUpdateBlock: block.number,
            currentLevel: 1
        });

        emit NFTMinted(user, tokenId);
        return tokenId;
    }

    /**
     * @notice Updates user performance and potentially evolves their NFT
     * @param user Address of the user
     */
    function updatePerformance(address user) external onlyDataLabelingPlatform nonReentrant {
        UserPerformance storage performance = userPerformance[user];
        
        // Increment tasks completed
        performance.tasksCompleted++;
        performance.lastUpdateBlock = block.number;

        // Check for evolution
        checkAndEvolveNFT(user);

        emit PerformanceUpdated(user, performance.tasksCompleted);
    }

    /**
     * @notice Checks if NFT should evolve and performs evolution if criteria are met
     * @param user Address of the user whose NFT to check
     */
    function checkAndEvolveNFT(address user) internal {
        UserPerformance storage performance = userPerformance[user];
        uint256 tokenId = tokenOfOwnerByIndex(user, 0);
        NFTMetadata storage metadata = nftMetadata[tokenId];

        uint8 newLevel = performance.currentLevel;
        string memory newBaseURI = metadata.baseURI;

        // Check evolution thresholds
        if (performance.tasksCompleted >= LEVEL_4_THRESHOLD && performance.currentLevel < 4) {
            newLevel = 4;
            newBaseURI = string(abi.encodePacked(baseEndpoint, "/master/"));
        } else if (performance.tasksCompleted >= LEVEL_3_THRESHOLD && performance.currentLevel < 3) {
            newLevel = 3;
            newBaseURI = string(abi.encodePacked(baseEndpoint, "/expert/"));
        } else if (performance.tasksCompleted >= LEVEL_2_THRESHOLD && performance.currentLevel < 2) {
            newLevel = 2;
            newBaseURI = string(abi.encodePacked(baseEndpoint, "/intermediate/"));
        } else if (performance.tasksCompleted >= LEVEL_1_THRESHOLD && performance.currentLevel < 1) {
            newLevel = 1;
            newBaseURI = string(abi.encodePacked(baseEndpoint, "/rookie/"));
        }

        if (newLevel != performance.currentLevel) {
            performance.currentLevel = newLevel;
            metadata.level = newLevel;
            metadata.baseURI = newBaseURI;
            metadata.lastEvolution = block.timestamp;

            emit NFTEvolved(tokenId, newLevel);
        }
    }

    /**
     * @notice Returns the token URI for a given token ID
     * @param tokenId The ID of the token
     * @return The token URI string
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        NFTMetadata memory metadata = nftMetadata[tokenId];
        address owner = ownerOf(tokenId);
        UserPerformance memory performance = userPerformance[owner];
//https://vercel.com/blockchain-oracles-projects/data-dao/api/nft/rookie/1/metadata?level=1&tasks=5

        return string(
            abi.encodePacked(
                metadata.baseURI,
                toString(tokenId),
                "/metadata?level=",
                toString(metadata.level),
                "&tasks=",
                toString(performance.tasksCompleted)
            )
        );
    }

    /**
     * @notice Converts uint256 to string
     * @param value The uint256 to convert
     * @return The string representation
     */
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
