import { useCallback, useEffect, useRef } from 'react';
import { BrowserProvider, formatEther } from 'ethers';
import { useStore } from '../store/useStore';
import { NEURA_TESTNET } from '../config/constants';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export function useWallet() {
  const {
    address,
    isConnecting,
    chainId,
    setAddress,
    setIsConnecting,
    setChainId,
    setAnkrBalance,
    addToast,
    reset,
  } = useStore();

  const isCorrectNetwork = chainId === NEURA_TESTNET.chainId;
  const hasCheckedConnection = useRef(false);

  const getProvider = useCallback(() => {
    if (typeof window === 'undefined' || !window.ethereum) return null;
    try {
      return new BrowserProvider(window.ethereum);
    } catch (error) {
      console.error('Error creating provider:', error);
      return null;
    }
  }, []);

  const fetchBalance = useCallback(async (addr: string) => {
    const provider = getProvider();
    if (!provider) return;
    
    try {
      const balance = await provider.getBalance(addr);
      setAnkrBalance(formatEther(balance));
    } catch (error) {
      console.error('Error fetching balance:', error);
      setAnkrBalance('0');
    }
  }, [getProvider, setAnkrBalance]);

  const switchToNeura = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      addToast({
        type: 'error',
        title: 'Wallet Not Found',
        message: 'Please install MetaMask or another Web3 wallet',
      });
      return false;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NEURA_TESTNET.chainIdHex }],
      });
      return true;
    } catch (switchError: unknown) {
      const error = switchError as { code?: number };
      // Chain not added, try to add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: NEURA_TESTNET.chainIdHex,
              chainName: NEURA_TESTNET.name,
              nativeCurrency: NEURA_TESTNET.nativeCurrency,
              rpcUrls: [NEURA_TESTNET.rpcUrl],
              blockExplorerUrls: [NEURA_TESTNET.blockExplorer],
            }],
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          addToast({
            type: 'error',
            title: 'Network Error',
            message: 'Failed to add Neura Testnet to your wallet',
          });
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      return false;
    }
  }, [addToast]);

  const connect = useCallback(async () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Check if MetaMask is installed
    if (!window.ethereum) {
      addToast({
        type: 'error',
        title: 'Wallet Not Found',
        message: 'Please install MetaMask or another Web3 wallet',
      });
      return;
    }

    // Prevent multiple connection attempts
    if (isConnecting) {
      return;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts && accounts.length > 0) {
        const addr = accounts[0];
        setAddress(addr);
        
        // Get current chain ID
        const chainIdHex = await window.ethereum.request({
          method: 'eth_chainId',
        }) as string;
        const currentChainId = parseInt(chainIdHex, 16);
        setChainId(currentChainId);

        // Auto-switch to Neura if not on correct network
        if (currentChainId !== NEURA_TESTNET.chainId) {
          await switchToNeura();
        }

        // Fetch balance
        await fetchBalance(addr);

        addToast({
          type: 'success',
          title: 'Wallet Connected',
          message: `Connected to ${addr.slice(0, 6)}...${addr.slice(-4)}`,
        });
      }
    } catch (error: unknown) {
      const err = error as { code?: number; message?: string };
      console.error('Error connecting wallet:', error);
      
      // User rejected the request
      if (err.code === 4001) {
        addToast({
          type: 'info',
          title: 'Connection Cancelled',
          message: 'You cancelled the connection request',
        });
      } else {
        addToast({
          type: 'error',
          title: 'Connection Failed',
          message: err.message || 'Failed to connect wallet. Please try again.',
        });
      }
    } finally {
      setIsConnecting(false);
    }
  }, [addToast, fetchBalance, isConnecting, setAddress, setChainId, setIsConnecting, switchToNeura]);

  const disconnect = useCallback(() => {
    reset();
    addToast({
      type: 'info',
      title: 'Wallet Disconnected',
      message: 'Your wallet has been disconnected',
    });
  }, [addToast, reset]);

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs.length === 0) {
        disconnect();
      } else if (accs[0] !== address) {
        setAddress(accs[0]);
        fetchBalance(accs[0]);
      }
    };

    const handleChainChanged = (chainIdHex: unknown) => {
      const newChainId = parseInt(chainIdHex as string, 16);
      setChainId(newChainId);
      if (address) {
        fetchBalance(address);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [address, disconnect, fetchBalance, setAddress, setChainId]);

  // Check if already connected on mount (passive check only)
  useEffect(() => {
    // Only run once and only in browser
    if (hasCheckedConnection.current || typeof window === 'undefined' || !window.ethereum) {
      return;
    }
    
    hasCheckedConnection.current = true;

    const checkConnection = async () => {
      try {
        // Use eth_accounts (passive) instead of eth_requestAccounts (active)
        // This won't trigger a popup, just checks if already connected
        const accounts = await window.ethereum!.request({
          method: 'eth_accounts',
        }) as string[];

        if (accounts && accounts.length > 0) {
          const addr = accounts[0];
          setAddress(addr);
          
          const chainIdHex = await window.ethereum!.request({
            method: 'eth_chainId',
          }) as string;
          setChainId(parseInt(chainIdHex, 16));
          
          await fetchBalance(addr);
        }
      } catch (error) {
        // Silently fail - user just isn't connected yet
        console.debug('No existing wallet connection found');
      }
    };

    // Small delay to ensure MetaMask is fully initialized
    const timeoutId = setTimeout(checkConnection, 100);
    
    return () => clearTimeout(timeoutId);
  }, [fetchBalance, setAddress, setChainId]);

  return {
    address,
    isConnecting,
    chainId,
    isCorrectNetwork,
    isConnected: !!address,
    connect,
    disconnect,
    switchToNeura,
    getProvider,
    fetchBalance,
  };
}
