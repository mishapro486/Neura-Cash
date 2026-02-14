// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NeuraCashVault
 * @notice A vault contract that allows users to deposit native ANKR and receive CASH tokens (1:1 peg)
 * @dev Single file implementation with ERC20-like CASH token, vault logic, and admin controls
 */
contract NeuraCashVault {
    // ============ ERC20 Token State ============
    string public constant name = "Neura Cash";
    string public constant symbol = "CASH";
    uint8 public constant decimals = 18;
    
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    // ============ Vault State ============
    address public owner;
    bool public paused;
    uint256 public maxSubscribePerTx; // 0 = unlimited
    bool private _locked;
    
    // ============ Events ============
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Subscribed(address indexed user, uint256 ankrIn, uint256 cashOut);
    event Redeemed(address indexed user, uint256 cashIn, uint256 ankrOut);
    event Paused(bool value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event MaxSubscribeUpdated(uint256 newMax);
    event RescueETH(address indexed to, uint256 amount);
    
    // ============ Modifiers ============
    modifier onlyOwner() {
        require(msg.sender == owner, "NeuraCashVault: caller is not owner");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "NeuraCashVault: contract is paused");
        _;
    }
    
    modifier nonReentrant() {
        require(!_locked, "NeuraCashVault: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }
    
    // ============ Constructor ============
    constructor() {
        owner = msg.sender;
        paused = false;
        maxSubscribePerTx = 0; // unlimited by default
        _locked = false;
    }
    
    // ============ ERC20 View Functions ============
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }
    
    function allowance(address tokenOwner, address spender) external view returns (uint256) {
        return _allowances[tokenOwner][spender];
    }
    
    // ============ ERC20 Transfer Functions ============
    function transfer(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "NeuraCashVault: transfer to zero address");
        require(_balances[msg.sender] >= amount, "NeuraCashVault: insufficient balance");
        
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        require(spender != address(0), "NeuraCashVault: approve to zero address");
        
        _allowances[msg.sender][spender] = amount;
        
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(from != address(0), "NeuraCashVault: transfer from zero address");
        require(to != address(0), "NeuraCashVault: transfer to zero address");
        require(_balances[from] >= amount, "NeuraCashVault: insufficient balance");
        require(_allowances[from][msg.sender] >= amount, "NeuraCashVault: insufficient allowance");
        
        _balances[from] -= amount;
        _balances[to] += amount;
        _allowances[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    // ============ Internal Mint/Burn ============
    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "NeuraCashVault: mint to zero address");
        
        _totalSupply += amount;
        _balances[to] += amount;
        
        emit Transfer(address(0), to, amount);
    }
    
    function _burn(address from, uint256 amount) internal {
        require(from != address(0), "NeuraCashVault: burn from zero address");
        require(_balances[from] >= amount, "NeuraCashVault: burn exceeds balance");
        
        _balances[from] -= amount;
        _totalSupply -= amount;
        
        emit Transfer(from, address(0), amount);
    }
    
    // ============ Vault Core Functions ============
    
    /**
     * @notice Deposit native ANKR and receive CASH tokens (1:1)
     */
    function subscribe() external payable whenNotPaused nonReentrant {
        require(msg.value > 0, "NeuraCashVault: must send ANKR");
        
        if (maxSubscribePerTx > 0) {
            require(msg.value <= maxSubscribePerTx, "NeuraCashVault: exceeds max subscribe per tx");
        }
        
        uint256 cashToMint = msg.value; // 1:1 peg
        _mint(msg.sender, cashToMint);
        
        emit Subscribed(msg.sender, msg.value, cashToMint);
    }
    
    /**
     * @notice Burn CASH tokens and receive native ANKR (1:1)
     * @param cashAmount Amount of CASH to redeem
     */
    function redeem(uint256 cashAmount) external whenNotPaused nonReentrant {
        require(cashAmount > 0, "NeuraCashVault: amount must be greater than 0");
        require(_balances[msg.sender] >= cashAmount, "NeuraCashVault: insufficient CASH balance");
        require(address(this).balance >= cashAmount, "NeuraCashVault: insufficient vault liquidity");
        
        uint256 ankrToSend = cashAmount; // 1:1 peg
        
        _burn(msg.sender, cashAmount);
        
        (bool success, ) = payable(msg.sender).call{value: ankrToSend}("");
        require(success, "NeuraCashVault: ANKR transfer failed");
        
        emit Redeemed(msg.sender, cashAmount, ankrToSend);
    }
    
    // ============ View Helpers ============
    
    /**
     * @notice Get vault statistics
     * @return totalAssets Total ANKR in vault
     * @return totalCashSupply Total CASH minted
     */
    function getVaultStats() external view returns (uint256 totalAssets, uint256 totalCashSupply) {
        totalAssets = address(this).balance;
        totalCashSupply = _totalSupply;
    }
    
    /**
     * @notice Get user's CASH balance
     * @param user Address to query
     * @return cashBalance User's CASH balance
     */
    function getUserStats(address user) external view returns (uint256 cashBalance) {
        cashBalance = _balances[user];
    }
    
    /**
     * @notice Preview CASH output for a given ANKR input
     * @param ankrIn Amount of ANKR to subscribe
     * @return cashOut Amount of CASH to receive (1:1)
     */
    function previewSubscribe(uint256 ankrIn) external pure returns (uint256 cashOut) {
        cashOut = ankrIn; // 1:1 peg
    }
    
    /**
     * @notice Preview ANKR output for a given CASH input
     * @param cashIn Amount of CASH to redeem
     * @return ankrOut Amount of ANKR to receive (1:1)
     */
    function previewRedeem(uint256 cashIn) external pure returns (uint256 ankrOut) {
        ankrOut = cashIn; // 1:1 peg
    }
    
    /**
     * @notice Check if vault has sufficient liquidity for redemption
     * @param amount Amount to check
     * @return hasLiquidity True if vault can fulfill redemption
     */
    function checkLiquidity(uint256 amount) external view returns (bool hasLiquidity) {
        hasLiquidity = address(this).balance >= amount;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Pause or unpause the contract
     * @param _paused New paused state
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit Paused(_paused);
    }
    
    /**
     * @notice Set maximum subscribe amount per transaction
     * @param _max New maximum (0 = unlimited)
     */
    function setMaxSubscribePerTx(uint256 _max) external onlyOwner {
        maxSubscribePerTx = _max;
        emit MaxSubscribeUpdated(_max);
    }
    
    /**
     * @notice Rescue ETH from contract (emergency only)
     * @param amount Amount to rescue
     */
    function rescueETH(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "NeuraCashVault: insufficient balance");
        
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "NeuraCashVault: rescue transfer failed");
        
        emit RescueETH(owner, amount);
    }
    
    /**
     * @notice Transfer ownership to a new address
     * @param newOwner Address of new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "NeuraCashVault: new owner is zero address");
        
        address oldOwner = owner;
        owner = newOwner;
        
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    // ============ Receive Function ============
    receive() external payable {
        // Allow direct ANKR deposits (will not mint CASH)
    }
}
