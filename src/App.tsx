import React from 'react';
import { Header } from './components/Header';
import { VaultStats } from './components/VaultStats';
import { InvestCard } from './components/InvestCard';
import { Portfolio } from './components/Portfolio';
import { ToastContainer } from './components/Toast';
import { Background } from './components/Background';
import { useStore } from './store/useStore';
import { Vault, Shield, Zap, ArrowRight, ExternalLink } from 'lucide-react';
import { FAUCET_URL } from './config/constants';

function App() {
  const { activeTab } = useStore();

  return (
    <div className="min-h-screen text-white">
      <Background />
      <Header />
      <ToastContainer />

      <main className="pt-24 sm:pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'invest' ? (
            <>
              {/* Hero Section */}
              <div className="text-center mb-12 animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium text-slate-300">Live on Neura Testnet</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                  <span className="gradient-text">Neura Cash</span>
                  <br />
                  <span className="text-white">Vault Protocol</span>
                </h1>
                
                <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                  Deposit ANKR, receive CASH. A secure 1:1 pegged vault for the Neura ecosystem.
                </p>

                {/* Feature Pills */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {[
                    { icon: Shield, text: '1:1 Peg' },
                    { icon: Zap, text: 'Instant Redemption' },
                    { icon: Vault, text: 'Non-Custodial' },
                  ].map((feature) => (
                    <div
                      key={feature.text}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-elevated border border-dark-border"
                    >
                      <feature.icon className="w-4 h-4 text-primary-light" />
                      <span className="text-sm font-medium text-slate-300">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="mb-8">
                <VaultStats />
              </div>

              {/* Main Content */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Invest Card */}
                <InvestCard />

                {/* Info Panel */}
                <div className="space-y-6">
                  {/* How It Works */}
                  <div className="glass rounded-3xl p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <h3 className="text-xl font-bold text-white mb-6">How It Works</h3>
                    
                    <div className="space-y-4">
                      {[
                        {
                          step: '1',
                          title: 'Subscribe',
                          desc: 'Deposit native ANKR tokens into the vault',
                        },
                        {
                          step: '2',
                          title: 'Receive CASH',
                          desc: 'Get CASH tokens at a 1:1 ratio instantly',
                        },
                        {
                          step: '3',
                          title: 'Redeem Anytime',
                          desc: 'Burn CASH to withdraw your ANKR',
                        },
                      ].map((item, index) => (
                        <div key={item.step} className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-bold text-white">{item.step}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.title}</p>
                            <p className="text-sm text-slate-400">{item.desc}</p>
                          </div>
                          {index < 2 && (
                            <ArrowRight className="w-4 h-4 text-slate-600 ml-auto hidden sm:block" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="glass rounded-3xl p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
                    
                    <div className="space-y-2">
                      <a
                        href={FAUCET_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl bg-dark-elevated border border-dark-border hover:border-primary/30 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="text-white font-medium group-hover:text-primary-light transition-colors">Get Testnet ANKR</span>
                            <p className="text-xs text-slate-500">Claim free tokens from the faucet</p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-primary-light transition-colors" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Portfolio />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Vault className="w-5 h-5 text-primary-light" />
            <span className="text-sm text-slate-400">Neura Cash Vault</span>
          </div>
          <p className="text-sm text-slate-500">
            Built for Neura Testnet • Not for production use
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
