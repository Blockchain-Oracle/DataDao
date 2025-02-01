// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {PerformanceNFT} from "./PerformanceNft.sol";
/**
 * @title DataLabelingPlatform
 * @author Blockchain Oracle
 * @notice A decentralized platform for creating and participating in data labeling tasks
 * @dev This contract allows users to:
 * - Create data labeling tasks with ERC20 token rewards
 * - Participate in tasks by labeling data
 * - Distribute rewards to participants
 * - Claim earned rewards
 * @dev Important:
 * - The creator of the task can't participate in the task to receive rewards
 * - Task are not deletable
 * - Sending ETH to the contract is not allowed will revert // aware of case of self destruct
 * - Any Erc20 token transfer without using the depositTokens function will be locked in the contract forever
 */

contract DataLabelingPlatform is ReentrancyGuard {
    // Custom errors for better gas efficiency and clarity
    error DataLabelingPlatform__TaskDeadlineNotPassed();
    error DataLabelingPlatform__RewardsAlreadyDistributed();
    error DataLabelingPlatform__NoParticipants();
    error DataLabelingPlatform__RewardTransferFailed();
    error DataLabelingPlatform__TaskExpired();
    error DataLabelingPlatform__TaskOwnerCantPaticipate();
    error DataLabelingPlatform__InsufficientBalance();
    error DataLabelingPlatform__InvalidTokenAddress();
    error DataLabelingPlatform__TokenTransferFromFailed();
    error DataLabelingPlatform__RewardMustBeGreaterThanZero();
    error DataLabelingPlatform__AlreadyParticipated();
    error DataLabelingPlatform__NoRewardToClaim();
    error DataLabelingPlatform__TokenNotAccepted();
    error DataLabelingPlatform__AmountMustBeGreaterThanZero();
    error DataLabelingPlatform__MinimumDeadlineIs3Hours();
    error DataLabelingPlatform__TaskNotFound();
    error DataLabelingPlatform__AddressZero();
    error DataLabelingPlatform__WithdrawFailed();
    /**
     * @dev Struct to store task information
     * @param creator Address of the task creator
     * @param autoDriveCid autoDrive CID containing task data in JSON format
     * @param totalReward Total reward amount in tokens for the task
     * @param deadline Timestamp when the task expires
     * @param participants Array of participant addresses
     * @param hasParticipated Mapping to track if an address has participated
     * @param rewards Mapping of address to their reward amount
     * @param rewardsDistributed Boolean flag indicating if rewards were distributed
     * @param tokenAddress Address of ERC20 token used for reward
     */

    struct Task {
        address creator;
        string autoDriveCid; // Contains task data JSON
        uint256 totalReward; // Total reward amount in tokens
        uint256 deadline;
        address[] participants;
        mapping(address => bool) hasParticipated;
        mapping(address => uint256) rewards;
        bool rewardsDistributed;
        address tokenAddress; // ERC20 token used for reward
    }

    struct TaskResponse {
        address creator;
        string autoDriveCid;
        uint256 totalReward;
        uint256 deadline;
        address[] participants;
        bool rewardsDistributed;
        address tokenAddress;
    }

    // State variables
    uint256 public constant TASK_DEADLINE_BUFFER = 3 hours;
    mapping(uint256 => Task) private s_taskIdToTask;
    mapping(address => uint256) private s_userBalances;
    uint256 private s_taskIdCounter; //@note:this starts from zero index
    address private immutable i_tokenAddress;
    PerformanceNFT public immutable i_performanceNft;

    // Events
    event TaskCreated(
        uint256 indexed taskId,
        address indexed creator,
        string indexed autoDriveCid,
        uint256 totalReward,
        uint256 deadline,
        address tokenAddress
    );
    event TaskPerformed(uint256 indexed taskId, address indexed participant);
    event RewardsDistributed(uint256 indexed taskId, uint256 rewardPerParticipant);
    event TokensDeposited(address indexed user, uint256 indexed amount);
    event TokensReceived(address indexed token, address indexed from, uint256 amount);
    event RewardClaim(uint256 indexed taskId, address indexed user, uint256 indexed amount);
    event Withdraw(address indexed sender, uint256 indexed amount);
    /**
     * @notice Initializes the contract with a specific ERC20 token
     * @param _tokenAddress Address of the ERC20 token to be used for rewards
     * @param _performanceNft Address of the PerformanceNFT contract
     * @dev Reverts if token address is zero address
     */

    constructor(address _tokenAddress, address _performanceNft) {
        if (_tokenAddress == address(0) || _performanceNft == address(0)) {
            revert DataLabelingPlatform__InvalidTokenAddress();
        }
        i_tokenAddress = _tokenAddress;
        i_performanceNft = PerformanceNFT(_performanceNft);
    }

    /**
     * @notice Prevents direct ETH transfers to the contract
     * @dev self-destruct can forcefully send ETH to the contract
     * @dev the eth is forever locked in the contract
     */
    receive() external payable {
        revert("ETH not accepted");
    }

    /**
     * @notice Prevents direct ETH transfers to the contract with data
     * @dev self-destruct can forcefully send ETH to the contract
     * @dev the eth is forever locked in the contract
     */
    fallback() external payable {
        revert("ETH not accepted");
    }

    /**
     * @notice Allows users to deposit tokens to their balance
     * @param amount Amount of tokens to deposit in wei
     */
    function depositTokens(uint256 amount) external nonReentrant {
        if (amount == 0) {
            revert DataLabelingPlatform__AmountMustBeGreaterThanZero();
        }
        IERC20 token = IERC20(i_tokenAddress);
        bool success = token.transferFrom(msg.sender, address(this), amount);
        if (!success) {
            revert DataLabelingPlatform__TokenTransferFromFailed();
        }
        s_userBalances[msg.sender] += amount;
        emit TokensDeposited(msg.sender, amount);
    }

    /**
     * @notice Creates a new data labeling task
     * @param autoDriveCid autoDrive CID containing task data
     * @param totalReward Total reward amount for the task
     * @param deadline Timestamp when the task expires atleast 3 hours from now
     */
    function createTask(string memory autoDriveCid, uint256 totalReward, uint256 deadline) external nonReentrant {
        if (msg.sender == address(0)) {
            revert DataLabelingPlatform__AddressZero();
        }
        if (deadline < block.timestamp + TASK_DEADLINE_BUFFER) {
            revert DataLabelingPlatform__MinimumDeadlineIs3Hours();
        }
        if (totalReward == 0) {
            revert DataLabelingPlatform__RewardMustBeGreaterThanZero();
        }
        if (s_userBalances[msg.sender] < totalReward) {
            revert DataLabelingPlatform__InsufficientBalance();
        }

        s_userBalances[msg.sender] -= totalReward;

        uint256 taskId = s_taskIdCounter++;
        Task storage newTask = s_taskIdToTask[taskId];

        newTask.creator = msg.sender;
        newTask.autoDriveCid = autoDriveCid;
        newTask.totalReward = totalReward;
        newTask.deadline = deadline;
        newTask.tokenAddress = i_tokenAddress;

        emit TaskCreated(taskId, msg.sender, autoDriveCid, totalReward, deadline, i_tokenAddress);
    }

    /**
     * @notice Allows users to participate in a task
     * @param taskId ID of the task to participate in
     */
    function performTask(uint256 taskId) external nonReentrant {
        Task storage task = s_taskIdToTask[taskId];
        if (task.creator == address(0)) {
            revert DataLabelingPlatform__TaskNotFound();
        }
        if (block.timestamp > task.deadline) {
            revert DataLabelingPlatform__TaskExpired();
        }
        if (task.hasParticipated[msg.sender]) {
            revert DataLabelingPlatform__AlreadyParticipated();
        }
        if (task.rewardsDistributed) {
            revert DataLabelingPlatform__RewardsAlreadyDistributed();
        }

        if (task.creator == msg.sender) {
            revert DataLabelingPlatform__TaskOwnerCantPaticipate();
        }

        task.participants.push(msg.sender);
        task.hasParticipated[msg.sender] = true;

        // Mint NFT for first-time participants
        if (getParticipantTaskCount(msg.sender) == 1) {
            i_performanceNft.mintInitialNFT(msg.sender);
        }

        // Update performance NFT with task completion
        i_performanceNft.updatePerformance(msg.sender);

        emit TaskPerformed(taskId, msg.sender);
    }

    /**
     * @notice Distributes rewards for a completed task
     * @dev if there are no participants, the reward is returned to the creator
     * @param taskId ID of the task to distribute rewards for
     */
    function distributeRewards(uint256 taskId) external nonReentrant {
        Task storage task = s_taskIdToTask[taskId];
        if (block.timestamp < task.deadline) {
            revert DataLabelingPlatform__TaskDeadlineNotPassed();
        }
        if (task.rewardsDistributed) {
            revert DataLabelingPlatform__RewardsAlreadyDistributed();
        }
        if (task.participants.length == 0) {
            //return reward to the owner that created task
            task.rewardsDistributed = true;
            s_userBalances[task.creator] += task.totalReward;
            return;
        }

        task.rewardsDistributed = true;
        uint256 participantCount = task.participants.length;
        uint256 rewardPerParticipant = task.totalReward / participantCount;

        for (uint256 i = 0; i < participantCount; i++) {
            task.rewards[task.participants[i]] = rewardPerParticipant;
        }

        emit RewardsDistributed(taskId, rewardPerParticipant);
    }

    /**
     * @notice Allows participants to claim their rewards
     * @param taskId ID of the task to claim rewards from
     */
    function claimReward(uint256 taskId) external nonReentrant {
        Task storage task = s_taskIdToTask[taskId];
        uint256 reward = task.rewards[msg.sender];
        if (reward == 0) {
            revert DataLabelingPlatform__NoRewardToClaim();
        }

        task.rewards[msg.sender] = 0;
        IERC20 token = IERC20(task.tokenAddress);
        bool success = token.transfer(msg.sender, reward);
        if (!success) {
            revert DataLabelingPlatform__RewardTransferFailed();
        }
        emit RewardClaim(taskId, msg.sender, reward);
    }

    /**
     * @notice Allows creator to withdraw their deposit
     * @param _amount the amount of tokens they want to withdraw in wei
     */
    function withdraw(uint256 _amount) external nonReentrant {
        if (_amount == 0) {
            revert DataLabelingPlatform__AmountMustBeGreaterThanZero();
        }
        //@dev this throw error on overflow so user can't withdraw more than they deposit
        s_userBalances[msg.sender] -= _amount;
        IERC20 token = IERC20(i_tokenAddress);
        bool success = token.transfer(msg.sender, _amount);
        if (!success) {
            revert DataLabelingPlatform__WithdrawFailed();
        }
        emit Withdraw(msg.sender, _amount);
    }

    /**
     * @notice Gets task information
     * @param taskId ID of the task
     * @return creator Address of task creator
     * @return autoDriveCid autoDrive CID of task data
     * @return totalReward Total reward amount
     * @return deadline Task deadline
     * @return participantCount Number of participants
     * @return rewardsDistributed Whether rewards were distributed
     * @return tokenAddress Address of reward token
     */
    function getTask(uint256 taskId)
        external
        view
        returns (
            address creator,
            string memory autoDriveCid,
            uint256 totalReward,
            uint256 deadline,
            uint256 participantCount,
            bool rewardsDistributed,
            address tokenAddress
        )
    {
        Task storage task = s_taskIdToTask[taskId];
        return (
            task.creator,
            task.autoDriveCid,
            task.totalReward,
            task.deadline,
            task.participants.length,
            task.rewardsDistributed,
            task.tokenAddress
        );
    }

    /**
     * @notice Gets list of participants for a task
     * @param taskId ID of the task
     * @return Array of participant addresses
     */
    function getParticipants(uint256 taskId) external view returns (address[] memory) {
        return s_taskIdToTask[taskId].participants;
    }

    /**
     * @notice Checks if a user has participated in a task
     * @param taskId ID of the task
     * @param user Address of the user
     * @return Boolean indicating participation status
     */
    function hasParticipated(uint256 taskId, address user) public view returns (bool) {
        return s_taskIdToTask[taskId].hasParticipated[user];
    }

    /**
     * @notice Gets the token balance of a user
     * @param user Address of the user
     * @return Balance amount
     */
    function getUserBalance(address user) external view returns (uint256) {
        return s_userBalances[user];
    }

    function getTokenAddress() external view returns (address) {
        return i_tokenAddress;
    }

    function getTaskDeadlineBuffer() external pure returns (uint256) {
        return TASK_DEADLINE_BUFFER;
    }

    function getTaskIdCounter() external view returns (uint256) {
        return s_taskIdCounter;
    }

    /**
     * @notice gets the TaskResponse for a taskId
     * @param taskId starts from index zero
     * @return TaskResponse
     */
    function getTaskIdToTask(uint256 taskId) external view returns (TaskResponse memory) {
        Task storage task = s_taskIdToTask[taskId];
        return TaskResponse(
            task.creator,
            task.autoDriveCid,
            task.totalReward,
            task.deadline,
            task.participants,
            task.rewardsDistributed,
            task.tokenAddress
        );
    }

    /**
     * @notice Gets the claimable reward amount for a user in a specific task
     * @param taskId ID of the task to check rewards for
     * @param user Address of the user to check rewards for
     * @return Amount of tokens claimable as reward
     */
    function getClaimableReward(uint256 taskId, address user) external view returns (uint256) {
        return s_taskIdToTask[taskId].rewards[user];
    }

    /**
     * @notice Gets all task IDs created by a specific address
     * @param creator Address of the task creator to query
     * @return Array of task IDs created by the given address
     * @dev Returns a dynamically sized array containing only valid task IDs
     */
    function getTasksByCreator(address creator) external view returns (uint256[] memory) {
        uint256 counterCached = s_taskIdCounter;
        uint256[] memory creatorTasks = new uint256[](counterCached);
        uint256 taskCount = 0;

        for (uint256 i = 0; i < counterCached; i++) {
            if (s_taskIdToTask[i].creator == creator) {
                creatorTasks[taskCount] = i;
                taskCount++;
            }
        }

        // Create correctly sized array with only valid task IDs
        uint256[] memory result = new uint256[](taskCount);
        for (uint256 i = 0; i < taskCount; i++) {
            result[i] = creatorTasks[i];
        }

        return result;
    }

    /**
     * @notice Gets all task IDs that a user has participated in
     * @param participant Address of the participant to query
     * @return Array of task IDs the user has participated in
     * @dev Returns a dynamically sized array containing only valid task IDs
     */
    function getTasksByParticipant(address participant) external view returns (uint256[] memory) {
        uint256 counterCached = s_taskIdCounter;
        uint256[] memory participatedTasks = new uint256[](counterCached);
        uint256 taskCount = 0;

        for (uint256 i = 0; i < counterCached; i++) {
            if (hasParticipated(i, participant)) {
                participatedTasks[taskCount] = i;
                taskCount++;
            }
        }

        // Create correctly sized array with only valid task IDs
        uint256[] memory result = new uint256[](taskCount);
        for (uint256 i = 0; i < taskCount; i++) {
            result[i] = participatedTasks[i];
        }

        return result;
    }

    /**
     * @notice Gets all task IDs where the user has unclaimed rewards
     * @param user Address of the user to query rewards for
     * @return Array of task IDs where the user has claimable rewards
     * @dev Returns a dynamically sized array containing only task IDs with non-zero rewards
     * @dev Rewards become claimable after task completion and reward distribution
     */
    function getClaimableRewards(address user) external view returns (uint256[] memory) {
        uint256 counterCached = s_taskIdCounter;
        uint256[] memory claimableTasks = new uint256[](counterCached);
        uint256 taskCount = 0;

        for (uint256 i = 0; i < counterCached; i++) {
            Task storage task = s_taskIdToTask[i];
            if (task.rewards[user] > 0) {
                claimableTasks[taskCount] = i;
                taskCount++;
            }
        }

        // Create correctly sized array with only valid task IDs
        uint256[] memory result = new uint256[](taskCount);
        for (uint256 i = 0; i < taskCount; i++) {
            result[i] = claimableTasks[i];
        }

        return result;
    }

    // Add helper function to get participant's task count
    function getParticipantTaskCount(address participant) public view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < s_taskIdCounter; i++) {
            if (hasParticipated(i, participant)) {
                count++;
            }
        }
        return count;
    }
}
