# Neura Cash Vault

A production-ready Web3 DeFi dApp for the Neura testnet that allows users to deposit native ANKR tokens and receive CASH tokens at a 1:1 peg.

## 🚀 Features

- **Subscribe**: Deposit ANKR → Receive CASH (1:1)
- **Redeem**: Burn CASH → Receive ANKR (1:1)
- **Real-time Stats**: View vault TVL, CASH supply, and your balances
- **Transaction History**: Track all your subscribe/redeem actions
- **Wallet Integration**: MetaMask support with auto network switching

## 📋 Smart Contract

**Contract Address**: `[DEPLOY AND UPDATE THIS ADDRESS]`

The `NeuraCashVault` contract is a single Solidity file that implements:
- ERC20-like CASH token (minimal implementation)
- Vault subscribe/redeem logic
- Admin controls (pause, rescue, ownership)
- Reentrancy protection

### Contract Functions

| Function | Description |
|----------|-------------|
| `subscribe()` | Deposit ANKR, receive CASH (payable) |
| `redeem(uint256)` | Burn CASH, receive ANKR |
| `getVaultStats()` | Get total assets and CASH supply |
| `getUserStats(address)` | Get user's CASH balance |
| `previewSubscribe(uint256)` | Preview CASH output |
| `previewRedeem(uint256)` | Preview ANKR output |

## 🔧 Deployment

### 1. Deploy the Contract

Using Remix IDE:
1. Go to [Remix](https://remix.ethereum.org)
2. Create a new file `NeuraCashVault.sol`
3. Copy the contract from `/contracts/NeuraCashVault.sol`
4. Compile with Solidity 0.8.20+
5. Deploy to Neura Testnet:
   - Network: Neura Testnet
   - Chain ID: 267
   - RPC: https://rpc.ankr.com/neura_testnet

### 2. Update Frontend

After deployment, update the contract address in:
```typescript
// src/config/constants.ts
export const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_ADDRESS';
```

## 🌐 Network Configuration

| Parameter | Value |
|-----------|-------|
| Network Name | Neura Testnet |
| Chain ID | 267 |
| RPC URL | https://rpc.ankr.com/neura_testnet |
| Block Explorer | https://explorer.neura-testnet.ankr.com |
| Native Token | ANKR |

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
├── contracts/
│   └── NeuraCashVault.sol    # Smart contract
├── src/
│   ├── components/           # React components
│   ├── config/               # Constants and ABI
│   ├── hooks/                # Custom hooks
│   ├── store/                # Zustand store
│   └── App.tsx               # Main app
└── README.md
```

## ⚠️ Important Notes

- This is a **testnet** application - do not use with real funds
- The 1:1 peg is fixed for simplicity (no yield/interest)
- Get testnet ANKR from the [Neura Faucet](https://neura-testnet.ankr.com/faucet)

## 📜 License

MIT License
