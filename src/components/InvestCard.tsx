import React, { useState, useMemo } from 'react';
import { ArrowDownUp, ArrowRight, Loader2, AlertCircle, Info } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useWallet } from '../hooks/useWallet';
import { useContract } from '../hooks/useContract';

export function InvestCard() {
  const { ankrBalance, activeAction, setActiveAction, isLoading } = useStore();
  const { isConnected, isCorrectNetwork, connect, switchToNeura } = useWallet();
  const { cashBalance, totalAssets, isPaused, subscribe, redeem } = useContract();

  const [amount, setAmount] = useState('');

  const isSubscribe = activeAction === 'subscribe';
  const inputToken = isSubscribe ? 'ANKR' : 'CASH';
  const outputToken = isSubscribe ? 'CASH' : 'ANKR';
  const inputBalance = isSubscribe ? ankrBalance : cashBalance;
  const outputAmount = amount; // 1:1 peg

  const validationError = useMemo(() => {
    if (!amount || parseFloat(amount) <= 0) return null;
    
    const amountNum = parseFloat(amount);
    const balanceNum = parseFloat(inputBalance);
    
    if (amountNum > balanceNum) {
      return `Insufficient ${inputToken} balance`;
    }
    
    if (!isSubscribe && amountNum > parseFloat(totalAssets)) {
      return 'Insufficient vault liquidity';
    }
    
    return null;
  }, [amount, inputBalance, inputToken, isSubscribe, totalAssets]);

  const canSubmit = useMemo(() => {
    if (!isConnected) return false;
    if (!isCorrectNetwork) return false;
    if (isPaused) return false;
    if (isLoading) return false;
    if (!amount || parseFloat(amount) <= 0) return false;
    if (validationError) return false;
    return true;
  }, [isConnected, isCorrectNetwork, isPaused, isLoading, amount, validationError]);

  const buttonText = useMemo(() => {
    if (!isConnected) return 'Connect Wallet';
    if (!isCorrectNetwork) return 'Switch to Neura';
    if (isPaused) return 'Vault Paused';
    if (isLoading) return 'Processing...';
    if (!amount || parseFloat(amount) <= 0) return 'Enter Amount';
    if (validationError) return validationError;
    return isSubscribe ? 'Subscribe' : 'Redeem';
  }, [isConnected, isCorrectNetwork, isPaused, isLoading, amount, validationError, isSubscribe]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      if (!isConnected) {
        connect();
        return;
      }
      if (!isCorrectNetwork) {
        switchToNeura();
        return;
      }
      return;
    }

    if (isSubscribe) {
      await subscribe(amount);
    } else {
      await redeem(amount);
    }

    setAmount('');
  };

  const handleMaxClick = () => {
    // Leave a small amount for gas if subscribing
    if (isSubscribe) {
      const max = Math.max(0, parseFloat(inputBalance) - 0.01);
      setAmount(max > 0 ? max.toString() : '0');
    } else {
      setAmount(inputBalance);
    }
  };

  const handleSwitch = () => {
    setActiveAction(isSubscribe ? 'redeem' : 'subscribe');
    setAmount('');
  };

  return (
    <div className="glass rounded-3xl p-6 sm:p-8 card-hover animate-fade-in-up">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['subscribe', 'redeem'] as const).map((action) => (
          <button
            key={action}
            onClick={() => {
              setActiveAction(action);
              setAmount('');
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeAction === action
                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-glow'
                : 'bg-dark-elevated text-slate-400 hover:text-white hover:bg-dark-border'
            }`}
          >
            {action === 'subscribe' ? 'Subscribe' : 'Redeem'}
          </button>
        ))}
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        {/* From */}
        <div className="bg-dark-elevated rounded-2xl p-4 border border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">From</span>
            <span className="text-sm text-slate-400">
              Balance: <span className="text-white font-medium">{parseFloat(inputBalance).toFixed(4)}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="flex-1 min-w-0 bg-transparent text-2xl sm:text-3xl font-bold text-white placeholder-slate-600 outline-none"
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleMaxClick}
                className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary-light text-xs font-semibold hover:bg-primary/30 transition-colors whitespace-nowrap"
              >
                MAX
              </button>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark border border-dark-border">
                <div className={`w-6 h-6 rounded-full flex-shrink-0 ${isSubscribe ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-primary to-secondary'}`} />
                <span className="font-semibold text-white whitespace-nowrap">{inputToken}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Switch Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={handleSwitch}
            className="w-12 h-12 rounded-xl bg-dark-elevated border border-dark-border flex items-center justify-center hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 group"
          >
            <ArrowDownUp className="w-5 h-5 text-slate-400 group-hover:text-primary-light transition-colors" />
          </button>
        </div>

        {/* To */}
        <div className="bg-dark-elevated rounded-2xl p-4 border border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">To (estimated)</span>
            <span className="text-sm text-slate-400">
              Balance: <span className="text-white font-medium">{parseFloat(isSubscribe ? cashBalance : ankrBalance).toFixed(4)}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0 text-2xl sm:text-3xl font-bold text-white truncate">
              {outputAmount || '0.0'}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-dark border border-dark-border flex-shrink-0">
              <div className={`w-6 h-6 rounded-full flex-shrink-0 ${!isSubscribe ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-primary to-secondary'}`} />
              <span className="font-semibold text-white whitespace-nowrap">{outputToken}</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Info className="w-5 h-5 text-primary-light flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-300">
            <p className="font-medium text-white mb-1">1:1 Exchange Rate</p>
            <p>
              {isSubscribe
                ? 'Deposit ANKR to receive an equal amount of CASH tokens.'
                : 'Burn CASH tokens to receive an equal amount of ANKR.'}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {validationError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/20">
            <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
            <span className="text-sm text-error">{validationError}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isConnected && isCorrectNetwork && !canSubmit}
          className={`w-full py-4 rounded-xl text-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            canSubmit || !isConnected || !isCorrectNetwork
              ? 'btn-primary text-white'
              : 'bg-dark-border text-slate-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {buttonText}
              {canSubmit && <ArrowRight className="w-5 h-5" />}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
