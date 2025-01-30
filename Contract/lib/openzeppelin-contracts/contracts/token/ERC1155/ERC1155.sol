// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract PerformanceNFT is ERC1155, AccessControl {
    bytes32 public constant PLATFORM_ROLE = keccak256("PLATFORM_ROLE");

    // Performance levels
    uint256 public constant ROOKIE_LEVEL = 1;
    uint256 public constant INTERMEDIATE_LEVEL = 2;
    uint256 public constant EXPERT_LEVEL = 3;
    uint256 public constant MASTER_LEVEL = 4;

    struct Token {
        uint256 level;
        uint256 supply;
        address creator;
        string autoDriveCid;
        uint256 qualityScore;
        uint256 lastEvolution;
    }

    // Mappings for token and user data
    mapping(uint256 => Token) public tokens;
    mapping(address => UserPerformance) public userPerformance;
    uint256[] public tokenIds;

    struct UserPerformance {
        uint256 tasksCompleted;
        uint256 totalQualityScore;
        uint256 currentLevel;
        uint256 lastUpdateBlock;
        bool hasNFT;
    }

    // Events
    event NFTMinted(address indexed user, uint256 indexed tokenId, uint256 level);
    event NFTEvolved(address indexed user, uint256 indexed tokenId, uint256 newLevel, uint256 qualityScore);
    event PerformanceUpdated(address indexed user, uint256 tasksCompleted, uint256 qualityScore);

    constructor(string memory baseURI) ERC1155(baseURI) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PLATFORM_ROLE, msg.sender);
    }

    function setPlatformRole(address platform) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(PLATFORM_ROLE, platform);
    }

    function getTokenId(address user, uint256 level) public pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(user, level)));
    }

    function mintInitialNFT(address user, string memory autoDriveCid)
        external
        onlyRole(PLATFORM_ROLE)
        returns (uint256)
    {
        require(!userPerformance[user].hasNFT, "User already has NFT");

        uint256 tokenId = getTokenId(user, ROOKIE_LEVEL);

        tokens[tokenId] = Token({
            level: ROOKIE_LEVEL,
            supply: 1,
            creator: user,
            autoDriveCid: autoDriveCid,
            qualityScore: 0,
            lastEvolution: block.timestamp
        });

        userPerformance[user] = UserPerformance({
            tasksCompleted: 0,
            totalQualityScore: 0,
            currentLevel: ROOKIE_LEVEL,
            lastUpdateBlock: block.number,
            hasNFT: true
        });

        tokenIds.push(tokenId);
        _mint(user, tokenId, 1, "");

        emit NFTMinted(user, tokenId, ROOKIE_LEVEL);
        return tokenId;
    }

    function updatePerformance(address user, uint256 qualityScore) external onlyRole(PLATFORM_ROLE) {
        require(qualityScore <= 100, "Invalid quality score");
        require(userPerformance[user].hasNFT, "User has no NFT");

        UserPerformance storage performance = userPerformance[user];
        performance.tasksCompleted++;
        performance.totalQualityScore += qualityScore;
        performance.lastUpdateBlock = block.number;

        // Check for evolution
        checkAndEvolveNFT(user, qualityScore);

        emit PerformanceUpdated(user, performance.tasksCompleted, qualityScore);
    }

    function checkAndEvolveNFT(address user, uint256 qualityScore) internal {
        UserPerformance storage performance = userPerformance[user];
        uint256 avgQualityScore = performance.totalQualityScore / performance.tasksCompleted;

        // Only evolve if quality score is above 70
        if (avgQualityScore < 70) return;

        uint256 newLevel = performance.currentLevel;

        // Determine new level based on tasks completed
        if (performance.tasksCompleted >= 100 && performance.currentLevel < MASTER_LEVEL) {
            newLevel = MASTER_LEVEL;
        } else if (performance.tasksCompleted >= 50 && performance.currentLevel < EXPERT_LEVEL) {
            newLevel = EXPERT_LEVEL;
        } else if (performance.tasksCompleted >= 20 && performance.currentLevel < INTERMEDIATE_LEVEL) {
            newLevel = INTERMEDIATE_LEVEL;
        }

        // If eligible for evolution
        if (newLevel > performance.currentLevel) {
            uint256 oldTokenId = getTokenId(user, performance.currentLevel);
            uint256 newTokenId = getTokenId(user, newLevel);

            // Burn old token
            _burn(user, oldTokenId, 1);

            // Mint new level token
            tokens[newTokenId] = Token({
                level: newLevel,
                supply: 1,
                creator: user,
                autoDriveCid: generateNewCID(user, newLevel),
                qualityScore: avgQualityScore,
                lastEvolution: block.timestamp
            });

            tokenIds.push(newTokenId);
            _mint(user, newTokenId, 1, "");

            performance.currentLevel = newLevel;

            emit NFTEvolved(user, newTokenId, newLevel, avgQualityScore);
        }
    }

    function generateNewCID(address user, uint256 level) internal pure returns (string memory) {
        // This would be replaced with your actual auto drive CID generation logic
        return string(abi.encodePacked("autoDrive://level", toString(level), "/", toHexString(user)));
    }

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

    function toHexString(address addr) internal pure returns (string memory) {
        bytes memory buffer = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(addr)) / (2 ** (8 * (19 - i)))));
            buffer[i * 2] = bytes1(uint8(b) / 16 >= 10 ? uint8(b) / 16 + 87 : uint8(b) / 16 + 48);
            buffer[i * 2 + 1] = bytes1(uint8(b) % 16 >= 10 ? uint8(b) % 16 + 87 : uint8(b) % 16 + 48);
        }
        return string(buffer);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
