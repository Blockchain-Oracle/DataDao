pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {DataLabelingPlatform} from "../src/DataLabelingPlatform.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {PerformanceNFT} from "../src/PerformanceNft.sol";

contract DataLabelingTest is Test {
    DataLabelingPlatform dataLabelingPlatform;
    ERC20Mock token;
    uint256 private constant DEPOSIT_AMOUNT = 1 ether;
    uint256 private constant TASK_REWARD_AMOUNT = 0.5 ether;
    address NFTPerformance;
    address User1 = makeAddr("User1");
    address User2 = makeAddr("User2");
    string private constant BASE_ENDPOINT="localhost:3000/api/nft/";

    event TokensDeposited(address indexed user, uint256 indexed amount);
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

    modifier mintTokens(address user, uint256 amount) {
        token.mint(user, amount);
        _;
    }

    modifier approveTokens(address user, uint256 amount) {
        vm.prank(user);
        token.approve(address(dataLabelingPlatform), amount);
        _;
    }

    modifier depositTokens(address user, uint256 amount) {
        vm.prank(user);
        dataLabelingPlatform.depositTokens(amount);
        _;
    }

    function setUp() public {
        token = new ERC20Mock();
        NFTPerformance = address(new PerformanceNFT(BASE_ENDPOINT));
        dataLabelingPlatform = new DataLabelingPlatform(address(token),NFTPerformance);
    }

    function test_constructor_revert_if_token_address_is_zero() public {
        vm.expectRevert(DataLabelingPlatform.DataLabelingPlatform__InvalidTokenAddress.selector);
        new DataLabelingPlatform(address(0),NFTPerformance);
    }

    function test_DataLabel_Cant_Receive_ETH() public {
        vm.expectRevert(abi.encodePacked("ETH not accepted"));
        (bool success,) = address(dataLabelingPlatform).call{value: 1 ether}("");
    }

    function test_depositTokens_revert_if_amount_is_zero() public {
        vm.expectRevert(DataLabelingPlatform.DataLabelingPlatform__AmountMustBeGreaterThanZero.selector);
        dataLabelingPlatform.depositTokens(0);
    }

    function test_depositTokens_revert_if_no_approve_happen_before_hand() public {
        //Arrange
        token.mint(User1, DEPOSIT_AMOUNT);
        //NO APPROVE HAPPENED EXPECT REVERT
        vm.expectRevert(
            abi.encodeWithSignature(
                "ERC20InsufficientAllowance(address,uint256,uint256)", address(dataLabelingPlatform), 0, DEPOSIT_AMOUNT
            )
        );
        dataLabelingPlatform.depositTokens(DEPOSIT_AMOUNT);
        //Acts
        //Asserts
    }

    function test_depositTokens_update_state() public {
        //Arrange
        token.mint(User1, DEPOSIT_AMOUNT);
        vm.prank(User1);
        token.approve(address(dataLabelingPlatform), DEPOSIT_AMOUNT);
        //Act
        vm.prank(User1);
        dataLabelingPlatform.depositTokens(DEPOSIT_AMOUNT);
        //Assert
        assertEq(token.balanceOf(address(dataLabelingPlatform)), DEPOSIT_AMOUNT);
        assertEq(dataLabelingPlatform.getUserBalance(User1), DEPOSIT_AMOUNT);
    }

    function test_depositTokens_emit_event() public {
        //Arrange
        token.mint(User1, DEPOSIT_AMOUNT);
        vm.prank(User1);
        token.approve(address(dataLabelingPlatform), DEPOSIT_AMOUNT);

        //Assert
        vm.prank(User1);
        vm.expectEmit(true, true, false, false, address(dataLabelingPlatform));
        emit TokensDeposited(User1, DEPOSIT_AMOUNT);
        //Act
        dataLabelingPlatform.depositTokens(DEPOSIT_AMOUNT);
    }

    function test_createTask_revert_on_address_zero() public {
        uint256 deadline = block.timestamp + 1 hours;
        uint256 totalReward = 1;
        vm.prank(address(0));
        vm.expectRevert(DataLabelingPlatform.DataLabelingPlatform__AddressZero.selector);

        dataLabelingPlatform.createTask("autoDriveCid", totalReward, deadline);
    }

    function test_createTask_revert_if_deadline_is_less_than_3_hours() public {
        vm.expectRevert(DataLabelingPlatform.DataLabelingPlatform__MinimumDeadlineIs3Hours.selector);
        uint256 deadline = block.timestamp + 1 hours;
        uint256 totalReward = 1;
        dataLabelingPlatform.createTask("autoDriveCid", totalReward, deadline);
    }

    function test_createTask_revert_if_total_reward_is_less_than_or_equal_to_zero() public {
        uint256 deadline = block.timestamp + dataLabelingPlatform.getTaskDeadlineBuffer();
        uint256 totalReward = 0;
        vm.expectRevert(DataLabelingPlatform.DataLabelingPlatform__RewardMustBeGreaterThanZero.selector);

        dataLabelingPlatform.createTask("autoDriveCid", totalReward, deadline);
    }

    function test_createTask_revert_if_user_has_insufficient_balance() public {
        uint256 deadline = block.timestamp + dataLabelingPlatform.getTaskDeadlineBuffer();
        uint256 totalReward = 1;
        vm.expectRevert(DataLabelingPlatform.DataLabelingPlatform__InsufficientBalance.selector);
        dataLabelingPlatform.createTask("autoDriveCid", totalReward, deadline);
    }

    function test_createTask_update_state()
        public
        mintTokens(User1, DEPOSIT_AMOUNT)
        approveTokens(User1, DEPOSIT_AMOUNT)
        depositTokens(User1, DEPOSIT_AMOUNT)
    {
        uint256 deadline = block.timestamp + dataLabelingPlatform.getTaskDeadlineBuffer();
        uint256 totalReward = 1;
        vm.prank(User1);
        dataLabelingPlatform.createTask("autoDriveCid", totalReward, deadline);
        assertEq(dataLabelingPlatform.getUserBalance(User1), DEPOSIT_AMOUNT - totalReward);
        assertEq(dataLabelingPlatform.getTaskIdCounter(), 1);
        assertEq(dataLabelingPlatform.getTaskIdToTask(0).totalReward, totalReward);
        assertEq(dataLabelingPlatform.getTaskIdToTask(0).deadline, deadline);
        assertEq(dataLabelingPlatform.getTaskIdToTask(0).autoDriveCid, "autoDriveCid");
        assertEq(dataLabelingPlatform.getTaskIdToTask(0).creator, User1);
        assertEq(dataLabelingPlatform.getTaskIdToTask(0).tokenAddress, address(token));
        assertEq(dataLabelingPlatform.getTaskIdToTask(0).rewardsDistributed, false);
        assertEq(dataLabelingPlatform.getTaskIdToTask(0).participants.length, 0);
    }

    function test_createTask_emit_event()
        public
        mintTokens(User1, DEPOSIT_AMOUNT)
        approveTokens(User1, DEPOSIT_AMOUNT)
        depositTokens(User1, DEPOSIT_AMOUNT)
    {
        //Arrange
        uint256 deadline = block.timestamp + dataLabelingPlatform.getTaskDeadlineBuffer();
        uint256 totalReward = 1;
        uint256 taskId = 0;
        address creator = User1;
        string memory autoDriveCidHash = "autoDriveCid";

        vm.expectEmit(true, true, true, true, address(dataLabelingPlatform));
        emit TaskCreated(taskId, creator, autoDriveCidHash, totalReward, deadline, address(token));
        vm.prank(User1);
        dataLabelingPlatform.createTask("autoDriveCid", totalReward, deadline);
    }

    function test_perform_task_expectRevert_on_invalid_taskId() public {
        //Arrange
        _createTask();
        //Acts
        uint256 taskId = 1; //this task is not yet avalaibe
        vm.expectRevert(DataLabelingPlatform.DataLabelingPlatform__TaskNotFound.selector);
        dataLabelingPlatform.performTask(taskId);
    }

    function test_perform_task_expectRevert_on_deadline_passed() public {
        //Arrange
        _createTask();
        //Acts
        uint256 taskId = 0;
        DataLabelingPlatform.TaskResponse memory taskResponse = dataLabelingPlatform.getTaskIdToTask(taskId);
        vm.warp(block.timestamp + taskResponse.deadline);

        vm.roll(block.timestamp + taskResponse.deadline);

        vm.expectRevert(DataLabelingPlatform.DataLabelingPlatform__TaskExpired.selector);
        dataLabelingPlatform.performTask(taskId);
    }

    function test_peform_task_DataLabelingPlatform__AlreadyParticipated() public {
        //Arrange
        _createTask();
        //Acts
        uint256 taskId = 0;
        //already participated
        dataLabelingPlatform.performTask(taskId);
        //entry with same address should revert
        vm.expectRevert(DataLabelingPlatform.DataLabelingPlatform__AlreadyParticipated.selector);
        dataLabelingPlatform.performTask(taskId);
    }

    function test_perform_task_DataLabelingPlatform__TaskOwnerCantPaticipate() public {
        //Arrange
        _createTask();
        //Acts
        uint256 taskId = 0;
        DataLabelingPlatform.TaskResponse memory taskResponse = dataLabelingPlatform.getTaskIdToTask(taskId);

        vm.prank(taskResponse.creator);
        vm.expectRevert(DataLabelingPlatform.DataLabelingPlatform__TaskOwnerCantPaticipate.selector);
        dataLabelingPlatform.performTask(taskId);
    }

    function test_perform_task_update_states() public {
        //Arrange
        _createTask();
        //Acts
        uint256 taskId = 0;
        dataLabelingPlatform.performTask(taskId);
        DataLabelingPlatform.TaskResponse memory taskResponse = dataLabelingPlatform.getTaskIdToTask(taskId);
        assertEq(taskResponse.participants.length, 1);
        assertEq(dataLabelingPlatform.hasParticipated(taskId, address(this)), true);
    }

    function test_perform_task_emit_TaskPerformed() public {
        _createTask();
        //Acts
        uint256 taskId = 0;
        vm.expectEmit(true, true, true, true, address(dataLabelingPlatform));
        emit TaskPerformed(taskId, address(this));
        dataLabelingPlatform.performTask(taskId);
    }

    function test_distributeRewards_DataLabelingPlatform__TaskDeadlineNotPassed() public {
        //Arrange
        _createTask();
        uint256 taskId = 0;
        _performTask(taskId, address(this));

        //Acts / Assert
        vm.expectRevert(DataLabelingPlatform.DataLabelingPlatform__TaskDeadlineNotPassed.selector);
        dataLabelingPlatform.distributeRewards(taskId);
    }

    function test_distibuteReward_when_paticipant_isZero() public {
        //Arrange
        _createTask();
        uint256 taskId = 0;
        DataLabelingPlatform.TaskResponse memory taskResponse = dataLabelingPlatform.getTaskIdToTask(taskId);
        assert(dataLabelingPlatform.getUserBalance(taskResponse.creator) < DEPOSIT_AMOUNT);
        vm.warp(block.timestamp + taskResponse.deadline);
        vm.roll(block.timestamp + taskResponse.deadline);

        //Acts
        dataLabelingPlatform.distributeRewards(taskId);
        uint256 balanceOfCretor = dataLabelingPlatform.getUserBalance(taskResponse.creator);
        DataLabelingPlatform.TaskResponse memory taskResponseAfter = dataLabelingPlatform.getTaskIdToTask(taskId);

        //Assert
        assertEq(taskResponseAfter.rewardsDistributed, true);
        assert(balanceOfCretor > taskResponseAfter.totalReward);
        assertEq(taskResponseAfter.rewardsDistributed, true);
    }

    function test_distibuteReward_when_paticipant_is_not_zero() public {
        //Arrange
        address[] memory participants = new address[](200);
        _createTask();
        uint256 taskId = 0;
        for (uint256 i = 0; i < participants.length; i++) {
            participants[i] = address(uint160(i + 1));
            _performTask(taskId, participants[i]);
        }

        DataLabelingPlatform.TaskResponse memory taskResponse = dataLabelingPlatform.getTaskIdToTask(taskId);
        vm.warp(block.timestamp + taskResponse.deadline);
        vm.roll(block.timestamp + taskResponse.deadline);

        //Acts
        dataLabelingPlatform.distributeRewards(taskId);
        DataLabelingPlatform.TaskResponse memory taskResponseAfter = dataLabelingPlatform.getTaskIdToTask(taskId);
        //Assert
        assertEq(taskResponseAfter.rewardsDistributed, true);
        assertEq(taskResponseAfter.participants.length, participants.length);
    }

    function test_distribute_reward_emit_RewardsDistributed() public {
        //Arrange
        _createTask();
        uint256 taskId = 0;
        DataLabelingPlatform.TaskResponse memory taskResponse = dataLabelingPlatform.getTaskIdToTask(taskId);
        address[] memory participants = new address[](2000);
        for (uint256 i = 0; i < participants.length; i++) {
            participants[i] = address(uint160(i + 1));
            _performTask(taskId, participants[i]);
        }
        vm.warp(block.timestamp + taskResponse.deadline);
        vm.roll(block.timestamp + taskResponse.deadline);

        //Acts
        vm.expectEmit(true, true, false, false, address(dataLabelingPlatform));
        emit RewardsDistributed(taskId, taskResponse.totalReward / participants.length);
        dataLabelingPlatform.distributeRewards(taskId);
    }

    function test_claim_reward_DataLabelingPlatform__NoRewardToClaim() public {
        //Arrange
        _createTask();
        uint256 taskId = 0;
        _performTask(taskId, address(this));
        vm.expectRevert(DataLabelingPlatform.DataLabelingPlatform__NoRewardToClaim.selector);
        dataLabelingPlatform.claimReward(taskId);
    }

    function test_claimReward_update_states() public {
        //Arrange
        _createTask();
        uint256 taskId = 0;
        DataLabelingPlatform.TaskResponse memory taskResponse = dataLabelingPlatform.getTaskIdToTask(taskId);
        address[] memory participants = new address[](2000);
        for (uint256 i = 0; i < participants.length; i++) {
            participants[i] = address(uint160(i + 1));
            _performTask(taskId, participants[i]);
        }
        vm.warp(block.timestamp + taskResponse.deadline);
        vm.roll(block.timestamp + taskResponse.deadline);

        _distributeRewards(taskId);
        uint256 rewardPerParticipant = TASK_REWARD_AMOUNT / participants.length;
        assertEq(dataLabelingPlatform.getTaskIdToTask(taskId).rewardsDistributed, true);
        //Acts
        vm.prank(participants[0]);
        dataLabelingPlatform.claimReward(taskId);
        //Assert
        assertEq(dataLabelingPlatform.getClaimableReward(taskId, participants[0]), 0);
        assertEq(token.balanceOf(participants[0]), rewardPerParticipant);
    }

    function test_withdraw_DataLabelingPlatform__AmountMustBeGreaterThanZero()
        public
        mintTokens(User1, DEPOSIT_AMOUNT)
        approveTokens(User1, DEPOSIT_AMOUNT)
        depositTokens(User1, DEPOSIT_AMOUNT)
    {
        //Arrange
        vm.expectRevert(DataLabelingPlatform.DataLabelingPlatform__AmountMustBeGreaterThanZero.selector);
        vm.prank(User1);
        dataLabelingPlatform.withdraw(0);
    }

    function test_withdraw_if_can_withdraw_more_than_deposit()
        public
        mintTokens(User1, DEPOSIT_AMOUNT)
        approveTokens(User1, DEPOSIT_AMOUNT)
        depositTokens(User1, DEPOSIT_AMOUNT)
    {
        //Arrange
        vm.expectRevert();
        vm.prank(User1);
        dataLabelingPlatform.withdraw(DEPOSIT_AMOUNT + 1);
    }

    function test_withdraw_update_states() public {
        //Arrange
        _createTask();
        uint256 taskId = 0;
        _performTask(taskId, address(this));
        vm.warp(block.timestamp + dataLabelingPlatform.getTaskDeadlineBuffer());
        vm.roll(block.timestamp + dataLabelingPlatform.getTaskDeadlineBuffer());
        _distributeRewards(taskId);
        //Acts
        vm.prank(User1);
        dataLabelingPlatform.withdraw(DEPOSIT_AMOUNT - TASK_REWARD_AMOUNT);
        //Assert
        assertEq(dataLabelingPlatform.getUserBalance(User1), 0);

        //no one has claim reward yet
        assertEq(token.balanceOf(address(dataLabelingPlatform)), TASK_REWARD_AMOUNT);
        assertEq(token.balanceOf(User1), DEPOSIT_AMOUNT - TASK_REWARD_AMOUNT);
    }

    function _distributeRewards(uint256 _taskId) internal {
        dataLabelingPlatform.distributeRewards(_taskId);
    }

    function _createTask()
        internal
        mintTokens(User1, DEPOSIT_AMOUNT)
        approveTokens(User1, DEPOSIT_AMOUNT)
        depositTokens(User1, DEPOSIT_AMOUNT)
    {
        uint256 deadline = block.timestamp + dataLabelingPlatform.getTaskDeadlineBuffer();
        vm.prank(User1);
        dataLabelingPlatform.createTask("autoDriveCid", TASK_REWARD_AMOUNT, deadline);
    }

    function _performTask(uint256 _taskId, address _taskUser) internal {
        vm.prank(_taskUser);
        dataLabelingPlatform.performTask(_taskId);
    }
}
