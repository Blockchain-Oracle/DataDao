// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title PerformanceNFT
 * @notice NFT contract that evolves based on user performance in the DataLabelingPlatform
 */
contract PerformanceNFT is ERC721, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Performance tracking
    struct UserPerformance {
        uint256 tasksCompleted;
        uint256 totalQualityScore;
        uint256 averageQualityScore;
        uint256 lastUpdateBlock;
        uint8 currentLevel;
    }

    // NFT Metadata
    struct NFTMetadata {
        uint8 level;
        uint256 qualityScore;
        uint256 lastEvolution;
        string baseURI;
    }

    // State variables
    Counters.Counter private _tokenIds;
    address public immutable dataLabelingPlatform;
    mapping(address => UserPerformance) public userPerformance;
    mapping(uint256 => NFTMetadata) public nftMetadata;

    // Evolution thresholds
    uint256 public constant ROOKIE_THRESHOLD = 5; // 5 tasks
    uint256 public constant INTERMEDIATE_THRESHOLD = 20; // 20 tasks
    uint256 public constant EXPERT_THRESHOLD = 50; // 50 tasks
    uint256 public constant MASTER_THRESHOLD = 100; // 100 tasks
    uint256 public constant MIN_QUALITY_SCORE = 70; // Minimum quality score for evolution

    // Events
    event NFTMinted(address indexed user, uint256 indexed tokenId);
    event NFTEvolved(uint256 indexed tokenId, uint8 newLevel, uint256 qualityScore);
    event PerformanceUpdated(address indexed user, uint256 tasksCompleted, uint256 qualityScore);

    constructor(address _dataLabelingPlatform) ERC721("Performance NFT", "PERF") {
        dataLabelingPlatform = _dataLabelingPlatform;
    }

    modifier onlyDataLabelingPlatform() {
        require(msg.sender == dataLabelingPlatform, "Only DataLabelingPlatform can call");
        _;
    }

    /**
     * @notice Mints initial NFT for new users
     * @param user Address of the user to mint for
     * @return tokenId The ID of the minted NFT
     */
    function mintInitialNFT(address user) external onlyDataLabelingPlatform returns (uint256) {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        _safeMint(user, tokenId);

        nftMetadata[tokenId] = NFTMetadata({
            level: 1,
            qualityScore: 0,
            lastEvolution: block.timestamp,
            baseURI: "ipfs://QmBaseURI/rookie/"
        });

        userPerformance[user] = UserPerformance({
            tasksCompleted: 0,
            totalQualityScore: 0,
            averageQualityScore: 0,
            lastUpdateBlock: block.number,
            currentLevel: 1
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
        require(qualityScore <= 100, "Invalid quality score");

        UserPerformance storage performance = userPerformance[user];
        performance.tasksCompleted++;
        performance.totalQualityScore += qualityScore;
        performance.averageQualityScore = performance.totalQualityScore / performance.tasksCompleted;
        performance.lastUpdateBlock = block.number;

        // Check for possible evolution
        checkAndEvolveNFT(user);

        emit PerformanceUpdated(user, performance.tasksCompleted, qualityScore);
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
            newBaseURI = "ipfs://QmBaseURI/master/";
        } else if (performance.tasksCompleted >= EXPERT_THRESHOLD && performance.currentLevel < 3) {
            newLevel = 3;
            newBaseURI = "ipfs://QmBaseURI/expert/";
        } else if (performance.tasksCompleted >= INTERMEDIATE_THRESHOLD && performance.currentLevel < 2) {
            newLevel = 2;
            newBaseURI = "ipfs://QmBaseURI/intermediate/";
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
        require(_exists(tokenId), "Token does not exist");
        NFTMetadata memory metadata = nftMetadata[tokenId];
        return string(abi.encodePacked(metadata.baseURI, toString(tokenId)));
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
