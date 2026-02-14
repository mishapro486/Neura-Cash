import React from 'react';
import { Wallet, TrendingUp, Clock, ExternalLink, ArrowUpRight, ArrowDownRight, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useWallet } from '../hooks/useWallet';
import { useContract } from '../hooks/useContract';
import { NEURA_TESTNET } from '../config/constants';

export function Portfolio() {
  const { ankrBalance, transactions } = useStore();
  const { address, isConnected, connect } = useWallet();
  const { cashBalance } = useContract();

  const formatNumber = (num: string, decimals = 4) => {
    const parsed = parseFloat(num);
    if (parsed === 0) return '0';
    return parsed.toLocaleString(undefined, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals 
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (!isConnected) {
    return (
      <div className="glass rounded-3xl p-8 sm:p-12 text-center animate-fade-in-up">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <Wallet className="w-10 h-10 text-primary-light" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Connect your wallet to view your portfolio, track your CASH holdings, and see your transaction history.
        </p>
        <button
          onClick={connect}
          className="btn-primary px-8 py-3 rounded-xl text-white font-semibold"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Wallet Summary */}
      <div className="glass rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary-light" />
          Wallet Summary
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* ANKR Balance */}
          <div className="bg-dark-elevated rounded-2xl p-5 border border-dark-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <span className="text-xl font-bold text-white">A</span>
              </div>
              <div>
                <p className="text-sm text-slate-400">Native Token</p>
                <p className="text-lg font-bold text-white">ANKR</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatNumber(ankrBalance)}</p>
            <p className="text-sm text-slate-400">Available Balance</p>
          </div>

          {/* CASH Balance */}
          <div className="bg-dark-elevated rounded-2xl p-5 border border-dark-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-xl font-bold text-white">C</span>
              </div>
              <div>
                <p className="text-sm text-slate-400">Vault Token</p>
                <p className="text-lg font-bold text-white">CASH</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatNumber(cashBalance)}</p>
            <p className="text-sm text-slate-400">Your Position</p>
          </div>
        </div>

        {/* Position Card */}
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary-light" />
              <div>
                <p className="text-sm text-slate-400">Total Position Value</p>
                <p className="text-2xl font-bold text-white">{formatNumber(cashBalance)} CASH</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Equivalent ANKR</p>
              <p className="text-lg font-semibold text-success">{formatNumber(cashBalance)} ANKR</p>
            </div>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="mt-4 flex items-center justify-between p-3 rounded-xl bg-dark border border-dark-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Connected:</span>
            <code className="text-sm font-mono text-white">{address}</code>
          </div>
          <a
            href={`${NEURA_TESTNET.blockExplorer}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-400 hover:text-white" />
          </a>
        </div>
      </div>

      {/* Transaction History */}
      <div className="glass rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-light" />
          Recent Activity
        </h2>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-dark-elevated flex items-center justify-center">
              <Clock className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400">No transactions yet</p>
            <p className="text-sm text-slate-500 mt-1">Your activity will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-xl bg-dark-elevated border border-dark-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tx.type === 'subscribe' 
                      ? 'bg-success/20' 
                      : 'bg-secondary/20'
                  }`}>
                    {tx.type === 'subscribe' ? (
                      <ArrowDownRight className="w-5 h-5 text-success" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-secondary" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white capitalize">{tx.type}</p>
                    <p className="text-sm text-slate-400">{formatTime(tx.timestamp)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-white">
                      {tx.type === 'subscribe' ? '+' : '-'}{tx.amount} {tx.type === 'subscribe' ? 'CASH' : 'ANKR'}
                    </p>
                    <p className="text-sm text-slate-400">
                      {tx.type === 'subscribe' ? `-${tx.amount} ANKR` : `+${tx.amount} ANKR`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {tx.status === 'pending' && (
                      <Loader2 className="w-5 h-5 text-warning animate-spin" />
                    )}
                    {tx.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-success" />
                    )}
                    {tx.status === 'failed' && (
                      <XCircle className="w-5 h-5 text-error" />
                    )}

                    {tx.hash && (
                      <a
                        href={`${NEURA_TESTNET.blockExplorer}/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-400 hover:text-white" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
