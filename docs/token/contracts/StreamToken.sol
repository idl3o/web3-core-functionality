// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title StreamToken
 * @dev STREAM utility token for the Web3 Streaming platform with elastic supply
 * capabilities to scale with platform growth.
 */
contract StreamToken is ERC20Burnable, ERC20Votes, AccessControl {
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant ECOSYSTEM_ROLE = keccak256("ECOSYSTEM_ROLE"); // New role for the ecosystem contract

    // Growth scaling parameters
    uint256 public maxAnnualInflation; // In basis points (e.g., 200 = 2%)
    uint256 public lastInflationTimestamp;
    uint256 public immutable initialSupply;

    // Fee structure
    uint256 public baseFee = 1000; // 10.00% (basis points)
    uint256 public minFee = 500;   // 5.00%
    uint256 public maxFee = 1500;  // 15.00%

    // Network utilization tracking
    uint256 public dailyActiveUsers;
    uint256 public totalUsers;

    // Homeostatic parameters
    uint256 public adaptiveFeeUpdateCooldown = 12 hours;
    uint256 public lastFeeUpdateTimestamp;

    // Events
    event SupplyInflationExecuted(uint256 amount, uint256 timestamp);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event NetworkMetricsUpdated(uint256 dailyActiveUsers, uint256 totalUsers);
    event EcosystemContractAdded(address ecosystemContract);

    /**
     * @dev Constructor initializes the STREAM token with an initial supply
     * and sets up scaling parameters.
     */
    constructor(
        uint256 _initialSupply,
        uint256 _maxAnnualInflation,
        address _treasuryAddress,
        address _governanceAddress
    ) ERC20("Streaming Credits", "STREAM") ERC20Permit("Streaming Credits") {
        initialSupply = _initialSupply;
        maxAnnualInflation = _maxAnnualInflation;
        lastInflationTimestamp = block.timestamp;
        lastFeeUpdateTimestamp = block.timestamp;

        // Set up roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, _treasuryAddress);
        _setupRole(GOVERNANCE_ROLE, _governanceAddress);

        // Mint initial supply to treasury
        _mint(_treasuryAddress, _initialSupply * (10 ** decimals()));
    }

    /**
     * @dev Add ecosystem contract to control homeostasis
     */
    function addEcosystemContract(address ecosystemContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(ecosystemContract != address(0), "Invalid ecosystem address");
        _setupRole(ECOSYSTEM_ROLE, ecosystemContract);
        emit EcosystemContractAdded(ecosystemContract);
    }

    /**
     * @dev Allows minting of new tokens within inflation constraints.
     * Can only be called through governance with proper voting.
     * @param amount The amount of tokens to mint
     * @param recipient The address receiving the tokens
     */
    function mintInflation(uint256 amount, address recipient)
        external
        onlyRole(GOVERNANCE_ROLE)
    {
        // Calculate maximum allowed inflation since last mint
        uint256 elapsedTime = block.timestamp - lastInflationTimestamp;
        uint256 maxAllowedInflation = (totalSupply() * maxAnnualInflation * elapsedTime) / (10000 * 365 days);

        require(amount <= maxAllowedInflation, "Exceeds allowed inflation rate");

        _mint(recipient, amount);
        lastInflationTimestamp = block.timestamp;

        emit SupplyInflationExecuted(amount, block.timestamp);
    }

    /**
     * @dev Updates the platform fee based on network metrics
     * Extended to support the homeostatic ecosystem
     * @param newFee The new fee in basis points
     */
    function updateFee(uint256 newFee)
        external
    {
        // Allow either governance role or ecosystem role to update the fee
        require(
            hasRole(GOVERNANCE_ROLE, msg.sender) || hasRole(ECOSYSTEM_ROLE, msg.sender),
            "Caller cannot update fee"
        );

        // Apply safety checks
        require(newFee >= minFee && newFee <= maxFee, "Fee outside allowed range");

        // Apply rate limiting unless called from the ecosystem contract
        if (!hasRole(ECOSYSTEM_ROLE, msg.sender)) {
            require(
                block.timestamp >= lastFeeUpdateTimestamp + adaptiveFeeUpdateCooldown,
                "Fee update too frequent"
            );
        }

        emit FeeUpdated(baseFee, newFee);
        baseFee = newFee;
        lastFeeUpdateTimestamp = block.timestamp;
    }

    /**
     * @dev Set the allowed fee range (min and max)
     * @param _minFee Minimum fee in basis points
     * @param _maxFee Maximum fee in basis points
     */
    function setFeeRange(uint256 _minFee, uint256 _maxFee)
        external
        onlyRole(GOVERNANCE_ROLE)
    {
        require(_minFee < _maxFee, "Min fee must be less than max fee");
        require(_minFee >= 100, "Min fee too low"); // Min 1%
        require(_maxFee <= 2000, "Max fee too high"); // Max 20%

        minFee = _minFee;
        maxFee = _maxFee;
    }

    /**
     * @dev Execute an emergency supply burn (defensive mechanism)
     * @param amount Amount to burn from caller's balance
     */
    function emergencyBurn(uint256 amount)
        external
        onlyRole(GOVERNANCE_ROLE)
    {
        require(amount > 0, "Amount must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        _burn(msg.sender, amount);
    }

    /**
     * @dev Executes a content purchase transaction
     * @param creator The content creator address
     * @param contentId The content identifier
     * @param creatorAmount Amount going to creator
     * @param platformFee Amount for platform fee
     */
    function contentPurchase(
        address creator,
        bytes32 contentId,
        uint256 creatorAmount,
        uint256 platformFee
    ) external returns (bool) {
        address treasury = getRoleMember(MINTER_ROLE, 0); // Use treasury address

        // Transfer creator's share
        _transfer(msg.sender, creator, creatorAmount);

        // Transfer platform fee
        _transfer(msg.sender, treasury, platformFee);

        return true;
    }

    /**
     * @dev Update network metrics for scaling calculations
     * @param _dailyActiveUsers Number of daily active users
     * @param _totalUsers Total registered users
     */
    function updateNetworkMetrics(uint256 _dailyActiveUsers, uint256 _totalUsers)
        external
        onlyRole(ECOSYSTEM_ROLE)
    {
        dailyActiveUsers = _dailyActiveUsers;
        totalUsers = _totalUsers;

        emit NetworkMetricsUpdated(_dailyActiveUsers, _totalUsers);
    }

    /**
     * @dev Override _beforeTokenTransfer for any pre-transfer logic
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC20) {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Returns the current network utilization for scaling calculations
     */
    function getNetworkUtilization() public view returns (uint256) {
        if (totalUsers == 0) return 0;
        // Return utilization as a percentage (with 2 decimal precision)
        return (dailyActiveUsers * 10000) / totalUsers;
    }

    // Required overrides for compatibility between inherited contracts
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._burn(account, amount);
    }
}
