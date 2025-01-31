// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
/**
 * @title PerformanceNFT
 * @notice NFT contract that evolves based on user performance in the DataLabelingPlatform
 */
contract PerformanceNFT is ERC721Enumerable, ReentrancyGuard, Ownable {
    // Add error for invalid quality score
    error PerformanceNFT__InvalidQualityScore();

    // Performance tracking
    struct UserPerformance {
        uint256 tasksCompleted;
        uint256 totalQualityScore;
        uint256 averageQualityScore;
        uint256 lastUpdateBlock;
        uint8 currentLevel;
        uint256 highestQualityScore;
        uint256 consecutiveHighScores;  // Track consecutive scores above threshold
    }

    // NFT Metadata
    struct NFTMetadata {
        uint8 level;
        uint256 qualityScore;
        uint256 lastEvolution;
        string baseURI;
    }

    // State variables
    uint256 private _tokenIdCounter;
    address public  dataLabelingPlatform;
    mapping(address => UserPerformance) public userPerformance;
    mapping(uint256 => NFTMetadata) public nftMetadata;

    // Evolution thresholds
    uint256 public constant ROOKIE_THRESHOLD = 5; // 5 tasks
    uint256 public constant INTERMEDIATE_THRESHOLD = 20; // 20 tasks
    uint256 public constant EXPERT_THRESHOLD = 50; // 50 tasks
    uint256 public constant MASTER_THRESHOLD = 100; // 100 tasks
    uint256 public constant MIN_QUALITY_SCORE = 70; // Minimum quality score for evolution

    // Base URI for Auto Drive endpoint
    string public baseEndpoint;

    // Events
    event NFTMinted(address indexed user, uint256 indexed tokenId);
    event NFTEvolved(uint256 indexed tokenId, uint8 newLevel, uint256 qualityScore);
    event PerformanceUpdated(address indexed user, uint256 tasksCompleted, uint256 qualityScore);
    event QualityScoreUpdated(address indexed user, uint256 newScore, uint256 averageScore);
    event ConsecutiveHighScoreAchieved(address indexed user, uint256 count);

    constructor(
        string memory _baseEndpoint
    ) ERC721("Performance NFT", "PERF") Ownable(msg.sender) {
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
            qualityScore: 0,
            lastEvolution: block.timestamp,
            //https://localhost:3000/api/nft/rookie/
            baseURI: string(abi.encodePacked(baseEndpoint, "/rookie/"))
        });

        userPerformance[user] = UserPerformance({
            tasksCompleted: 0,
            totalQualityScore: 0,
            averageQualityScore: 0,
            lastUpdateBlock: block.number,
            currentLevel: 1,
            highestQualityScore: 0,
            consecutiveHighScores: 0
        });

        emit NFTMinted(user, tokenId);
        return tokenId;
    }

    /**
     * @notice Updates user performance and potentially evolves their NFT
     * @param user Address of the user
     * @param qualityScore Quality score for the completed task (0-100)
     */
    function updatePerformance(address user, uint256 qualityScore) external onlyDataLabelingPlatform nonReentrant {
        if (qualityScore > 100) {
            revert PerformanceNFT__InvalidQualityScore();
        }

        UserPerformance storage performance = userPerformance[user];
        
        // Update performance metrics
        performance.tasksCompleted++;
        performance.totalQualityScore += qualityScore;
        performance.averageQualityScore = performance.totalQualityScore / performance.tasksCompleted;
        
        // Track highest score
        if (qualityScore > performance.highestQualityScore) {
            performance.highestQualityScore = qualityScore;
        }
        
        // Track consecutive high scores
        if (qualityScore >= MIN_QUALITY_SCORE) {
            performance.consecutiveHighScores++;
            if (performance.consecutiveHighScores % 5 == 0) { // Every 5 consecutive high scores
                emit ConsecutiveHighScoreAchieved(user, performance.consecutiveHighScores);
            }
        } else {
            performance.consecutiveHighScores = 0;
        }

        performance.lastUpdateBlock = block.number;

        // Check for evolution
        checkAndEvolveNFT(user);

        emit PerformanceUpdated(user, performance.tasksCompleted, qualityScore);
        emit QualityScoreUpdated(user, qualityScore, performance.averageQualityScore);
    }

    /**
     * @notice Checks if NFT should evolve and performs evolution if criteria are met
     * @param user Address of the user whose NFT to check
     */
    function checkAndEvolveNFT(address user) internal {
        UserPerformance storage performance = userPerformance[user];
        uint256 tokenId = tokenOfOwnerByIndex(user, 0); // Get user's first NFT
        NFTMetadata storage metadata = nftMetadata[tokenId];

        // Only evolve if minimum quality score is met
        if (performance.averageQualityScore < MIN_QUALITY_SCORE) {
            return;
        }

        uint8 newLevel = performance.currentLevel;
        string memory newBaseURI = metadata.baseURI;

        if (performance.tasksCompleted >= MASTER_THRESHOLD && performance.currentLevel < 4) {
            newLevel = 4;
            newBaseURI = string(abi.encodePacked(baseEndpoint, "/master/"));
        } else if (performance.tasksCompleted >= EXPERT_THRESHOLD && performance.currentLevel < 3) {
            newLevel = 3;
            newBaseURI = string(abi.encodePacked(baseEndpoint, "/expert/"));
        } else if (performance.tasksCompleted >= INTERMEDIATE_THRESHOLD && performance.currentLevel < 2) {
            newLevel = 2;
            newBaseURI = string(abi.encodePacked(baseEndpoint, "/intermediate/"));
        }

        if (newLevel != performance.currentLevel) {
            performance.currentLevel = newLevel;
            metadata.level = newLevel;
            metadata.baseURI = newBaseURI;
            metadata.lastEvolution = block.timestamp;
            metadata.qualityScore = performance.averageQualityScore;

            emit NFTEvolved(tokenId, newLevel, performance.averageQualityScore);
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
        
        // Get the owner's performance data
        address owner = ownerOf(tokenId);
        UserPerformance memory performance = userPerformance[owner];
        
        // Include performance data in the URI
        //https://localhost/api/nft/rokkie/123/metadata?level=2&tasks=50&quality=85&highscore=95

        return string(abi.encodePacked(
            metadata.baseURI,
            toString(tokenId),
            "/metadata?level=", toString(metadata.level),
            "&tasks=", toString(performance.tasksCompleted),
            "&quality=", toString(performance.averageQualityScore),
            "&highscore=", toString(performance.highestQualityScore)
        ));
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
