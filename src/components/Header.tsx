import React, { useState } from 'react';
import { Vault, Wallet, ChevronDown, ExternalLink, LogOut, AlertTriangle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useStore } from '../store/useStore';
import { NEURA_TESTNET, FAUCET_URL } from '../config/constants';

export function Header() {
  const { address, isConnecting, isConnected, isCorrectNetwork, connect, disconnect, switchToNeura } = useWallet();
  const { ankrBalance, activeTab, setActiveTab } = useStore();
  const [showDropdown, setShowDropdown] = useState(false);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    if (isNaN(num)) return '0.0000';
    return num.toFixed(4);
  };

  const handleConnect = async () => {
    if (!isConnecting) {
      await connect();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
                <Vault className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-dark animate-pulse" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold gradient-text">Neura Cash</h1>
              <p className="text-xs text-slate-400">Vault Protocol</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {['invest', 'portfolio'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'invest' | 'portfolio')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-primary/20 text-primary-light border border-primary/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            <a
              href={FAUCET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 flex items-center gap-1"
            >
              Faucet
              <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          {/* Wallet Section */}
          <div className="flex items-center gap-3">
            {/* Network Badge */}
            {isConnected && (
              <button
                onClick={!isCorrectNetwork ? switchToNeura : undefined}
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isCorrectNetwork
                    ? 'bg-success/20 text-success border border-success/30'
                    : 'bg-warning/20 text-warning border border-warning/30 cursor-pointer hover:bg-warning/30'
                }`}
              >
                {isCorrectNetwork ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    Neura Testnet
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    Wrong Network
                  </>
                )}
              </button>
            )}

            {/* Connect/Account Button */}
            {isConnected && address ? (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-elevated border border-dark-border hover:border-primary/50 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white">{formatAddress(address)}</p>
                    <p className="text-xs text-slate-400">{formatBalance(ankrBalance)} ANKR</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {showDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 py-2 rounded-xl glass-strong border border-dark-border z-50">
                      <a
                        href={`${NEURA_TESTNET.blockExplorer}/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View on Explorer
                      </a>
                      <button
                        onClick={() => {
                          disconnect();
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Disconnect
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-dark-border">
        <div className="flex">
          {['invest', 'portfolio'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'invest' | 'portfolio')}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'text-primary-light border-b-2 border-primary'
                  : 'text-slate-400'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
