import React from 'react';

export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark to-dark-card" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-radial" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
      
      {/* Animated gradient lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <line x1="0" y1="30%" x2="100%" y2="30%" stroke="url(#line-gradient)" strokeWidth="1" className="animate-shimmer" />
        <line x1="0" y1="60%" x2="100%" y2="60%" stroke="url(#line-gradient)" strokeWidth="1" className="animate-shimmer" style={{ animationDelay: '1s' }} />
        <line x1="0" y1="90%" x2="100%" y2="90%" stroke="url(#line-gradient)" strokeWidth="1" className="animate-shimmer" style={{ animationDelay: '2s' }} />
      </svg>
      
      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-primary/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-secondary/5 to-transparent" />
    </div>
  );
}
