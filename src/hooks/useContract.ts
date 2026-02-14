import { useCallback, useEffect } from 'react';
import { Contract, formatEther, parseEther } from 'ethers';
import { useStore } from '../store/useStore';
import { useWallet } from './useWallet';
import { CONTRACT_ADDRESS, CONTRACT_ABI, NEURA_TESTNET, POLLING_INTERVAL } from '../config/constants';

export function useContract() {
  const {
    address,
    cashBalance,
    totalAssets,
    totalCashSupply,
    isPaused,
    setCashBalance,
    setVaultStats,
    addTransaction,
    updateTransaction,
    addToast,
    setIsLoading,
  } = useStore();

  const { getProvider, isCorrectNetwork, fetchBalance } = useWallet();

  const getContract = useCallback(async (withSigner = false) => {
    const provider = getProvider();
    if (!provider) return null;

    if (withSigner) {
      const signer = await provider.getSigner();
      return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }

    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }, [getProvider]);

  const fetchVaultStats = useCallback(async () => {
    try {
      const contract = await getContract();
      if (!contract) return;

      const [stats, paused] = await Promise.all([
        contract.getVaultStats(),
        contract.paused(),
      ]);

      setVaultStats(
        formatEther(stats.totalAssets),
        formatEther(stats.totalCashSupply),
        paused
      );
    } catch (error) {
      console.error('Error fetching vault stats:', error);
    }
  }, [getContract, setVaultStats]);

  const fetchUserStats = useCallback(async () => {
    if (!address) return;

    try {
      const contract = await getContract();
      if (!contract) return;

      const balance = await contract.getUserStats(address);
      setCashBalance(formatEther(balance));
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  }, [address, getContract, setCashBalance]);

  const subscribe = useCallback(async (amount: string) => {
    if (!address || !isCorrectNetwork) return;

    const txId = crypto.randomUUID();
    setIsLoading(true);

    try {
      const contract = await getContract(true);
      if (!contract) throw new Error('Contract not available');

      const amountWei = parseEther(amount);

      addToast({
        type: 'pending',
        title: 'Transaction Pending',
        message: `Subscribing ${amount} ANKR...`,
      });

      addTransaction({
        id: txId,
        type: 'subscribe',
        amount,
        hash: '',
        status: 'pending',
        timestamp: Date.now(),
      });

      const tx = await contract.subscribe({ value: amountWei });
      
      updateTransaction(txId, { hash: tx.hash });

      addToast({
        type: 'info',
        title: 'Transaction Submitted',
        message: 'Waiting for confirmation...',
        txHash: tx.hash,
      });

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        updateTransaction(txId, { status: 'success' });
        addToast({
          type: 'success',
          title: 'Subscribe Successful!',
          message: `Received ${amount} CASH`,
          txHash: tx.hash,
        });

        // Refresh balances
        await Promise.all([
          fetchBalance(address),
          fetchUserStats(),
          fetchVaultStats(),
        ]);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: unknown) {
      console.error('Subscribe error:', error);
      updateTransaction(txId, { status: 'failed' });
      
      const err = error as { reason?: string; message?: string };
      addToast({
        type: 'error',
        title: 'Subscribe Failed',
        message: err.reason || err.message || 'Transaction failed',
      });
    } finally {
      setIsLoading(false);
    }
  }, [address, isCorrectNetwork, getContract, addToast, addTransaction, updateTransaction, fetchBalance, fetchUserStats, fetchVaultStats, setIsLoading]);

  const redeem = useCallback(async (amount: string) => {
    if (!address || !isCorrectNetwork) return;

    const txId = crypto.randomUUID();
    setIsLoading(true);

    try {
      const contract = await getContract(true);
      if (!contract) throw new Error('Contract not available');

      const amountWei = parseEther(amount);

      // Check liquidity first
      const hasLiquidity = await contract.checkLiquidity(amountWei);
      if (!hasLiquidity) {
        throw new Error('Insufficient vault liquidity');
      }

      addToast({
        type: 'pending',
        title: 'Transaction Pending',
        message: `Redeeming ${amount} CASH...`,
      });

      addTransaction({
        id: txId,
        type: 'redeem',
        amount,
        hash: '',
        status: 'pending',
        timestamp: Date.now(),
      });

      const tx = await contract.redeem(amountWei);
      
      updateTransaction(txId, { hash: tx.hash });

      addToast({
        type: 'info',
        title: 'Transaction Submitted',
        message: 'Waiting for confirmation...',
        txHash: tx.hash,
      });

      const receipt = await tx.wait();

      if (receipt.status === 1) {
        updateTransaction(txId, { status: 'success' });
        addToast({
          type: 'success',
          title: 'Redeem Successful!',
          message: `Received ${amount} ANKR`,
          txHash: tx.hash,
        });

        // Refresh balances
        await Promise.all([
          fetchBalance(address),
          fetchUserStats(),
          fetchVaultStats(),
        ]);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: unknown) {
      console.error('Redeem error:', error);
      updateTransaction(txId, { status: 'failed' });
      
      const err = error as { reason?: string; message?: string };
      addToast({
        type: 'error',
        title: 'Redeem Failed',
        message: err.reason || err.message || 'Transaction failed',
      });
    } finally {
      setIsLoading(false);
    }
  }, [address, isCorrectNetwork, getContract, addToast, addTransaction, updateTransaction, fetchBalance, fetchUserStats, fetchVaultStats, setIsLoading]);

  // Poll for updates
  useEffect(() => {
    if (!isCorrectNetwork) return;

    fetchVaultStats();
    fetchUserStats();

    const interval = setInterval(() => {
      fetchVaultStats();
      if (address) fetchUserStats();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [address, isCorrectNetwork, fetchVaultStats, fetchUserStats]);

  return {
    cashBalance,
    totalAssets,
    totalCashSupply,
    isPaused,
    subscribe,
    redeem,
    fetchVaultStats,
    fetchUserStats,
  };
}
