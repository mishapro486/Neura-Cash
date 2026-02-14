import { create } from 'zustand';

export interface Transaction {
  id: string;
  type: 'subscribe' | 'redeem';
  amount: string;
  hash: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'pending';
  title: string;
  message: string;
  txHash?: string;
}

interface AppState {
  // Wallet State
  address: string | null;
  isConnecting: boolean;
  chainId: number | null;
  
  // Balances
  ankrBalance: string;
  cashBalance: string;
  
  // Vault Stats
  totalAssets: string;
  totalCashSupply: string;
  isPaused: boolean;
  
  // UI State
  activeTab: 'invest' | 'portfolio';
  activeAction: 'subscribe' | 'redeem';
  isLoading: boolean;
  
  // Transactions
  transactions: Transaction[];
  
  // Toasts
  toasts: Toast[];
  
  // Actions
  setAddress: (address: string | null) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  setChainId: (chainId: number | null) => void;
  setAnkrBalance: (balance: string) => void;
  setCashBalance: (balance: string) => void;
  setVaultStats: (totalAssets: string, totalCashSupply: string, isPaused: boolean) => void;
  setActiveTab: (tab: 'invest' | 'portfolio') => void;
  setActiveAction: (action: 'subscribe' | 'redeem') => void;
  setIsLoading: (isLoading: boolean) => void;
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  reset: () => void;
}

const initialState = {
  address: null,
  isConnecting: false,
  chainId: null,
  ankrBalance: '0',
  cashBalance: '0',
  totalAssets: '0',
  totalCashSupply: '0',
  isPaused: false,
  activeTab: 'invest' as const,
  activeAction: 'subscribe' as const,
  isLoading: false,
  transactions: [],
  toasts: [],
};

export const useStore = create<AppState>((set) => ({
  ...initialState,
  
  setAddress: (address) => set({ address }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),
  setChainId: (chainId) => set({ chainId }),
  setAnkrBalance: (ankrBalance) => set({ ankrBalance }),
  setCashBalance: (cashBalance) => set({ cashBalance }),
  setVaultStats: (totalAssets, totalCashSupply, isPaused) => 
    set({ totalAssets, totalCashSupply, isPaused }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveAction: (activeAction) => set({ activeAction }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  addTransaction: (tx) => 
    set((state) => ({ 
      transactions: [tx, ...state.transactions].slice(0, 50) 
    })),
  
  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...updates } : tx
      ),
    })),
  
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  
  reset: () => set(initialState),
}));
