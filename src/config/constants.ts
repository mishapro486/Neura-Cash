// Neura Testnet Configuration
export const NEURA_TESTNET = {
  chainId: 267,
  chainIdHex: '0x10b',
  name: 'Neura Testnet',
  rpcUrl: 'https://rpc.neura-testnet.ankr.com',
  blockExplorer: 'https://explorer.neura-testnet.ankr.com',
  nativeCurrency: {
    name: 'ANKR',
    symbol: 'ANKR',
    decimals: 18,
  },
};

// Faucet URL - Single source of truth
export const FAUCET_URL = 'https://neuraverse.neuraprotocol.io/?section=faucet';

// Contract Address (update after deployment)
export const CONTRACT_ADDRESS = '0xddA245FF69d2630dBB38Df217fc0361849F5ce8a';

// Contract Addresses (to be updated after deployment)
export const CONTRACTS = {
  neuraCashVault: '0xddA245FF69d2630dBB38Df217fc0361849F5ce8a',
};

// Token Decimals
export const DECIMALS = {
  ANKR: 18,
  CASH: 18,
};

// Polling interval for updates (in ms)
export const POLLING_INTERVAL = 10000;

// Toast notification duration (in ms)
export const TOAST_DURATION = 5000;

// Contract ABI for NeuraCashVault
export const CONTRACT_ABI = [
  // Events
  "event Subscribed(address indexed user, uint256 ankrAmount, uint256 cashMinted)",
  "event Redeemed(address indexed user, uint256 cashAmount, uint256 ankrReturned)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event Paused(address account)",
  "event Unpaused(address account)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
  
  // Read Functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function owner() view returns (address)",
  "function paused() view returns (bool)",
  "function getVaultStats() view returns (uint256 totalAssets, uint256 totalCashSupply)",
  "function getUserStats(address user) view returns (uint256 cashBalance)",
  "function checkLiquidity(uint256 cashAmount) view returns (bool)",
  "function previewSubscribe(uint256 ankrAmount) view returns (uint256 cashAmount)",
  "function previewRedeem(uint256 cashAmount) view returns (uint256 ankrAmount)",
  
  // Write Functions
  "function subscribe() payable",
  "function redeem(uint256 cashAmount)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function pause()",
  "function unpause()",
  "function transferOwnership(address newOwner)",
  "function emergencyWithdraw()"
];
