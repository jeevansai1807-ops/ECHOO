import React from 'react';
import { motion } from 'framer-motion';

interface AICoreProps {
  scale?: number;
  isProcessing?: boolean;
}

export function AICore({ scale = 1, isProcessing = false }: AICoreProps) {
  return (
    <div className="relative flex items-center justify-center" style={{ transform: `scale(${scale})` }}>
      {/* Outer Ring */}
      <motion.div
        className="absolute inset-[-4rem] rounded-full border-2 border-t-echo-accent border-r-transparent border-b-emerald-400/50 border-l-transparent shadow-[0_0_30px_rgba(99,102,241,0.2)]"
        animate={{ rotate: 360 }}
        transition={{ duration: isProcessing ? 2 : 8, ease: "linear", repeat: Infinity }}
      />
      
      {/* Middle Ring */}
      <motion.div
        className="absolute inset-[-3rem] rounded-full border-2 border-t-pink-500 border-r-transparent border-b-transparent border-l-cyan-400/50"
        animate={{ rotate: -360 }}
        transition={{ duration: isProcessing ? 1.5 : 6, ease: "linear", repeat: Infinity }}
      />

      {/* Inner Ring */}
      <motion.div
        className="absolute inset-[-2rem] rounded-full border border-white/20 border-t-white/80"
        animate={{ rotate: 360 }}
        transition={{ duration: isProcessing ? 1 : 4, ease: "linear", repeat: Infinity }}
      />

      {/* Central Glass Orb */}
      <motion.div 
        className="w-32 h-32 rounded-full glass-panel flex flex-col items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.3)] border border-white/20 relative z-10"
        animate={{ 
          scale: isProcessing ? [1, 1.15, 1] : [1, 1.05, 1], 
          boxShadow: isProcessing 
            ? ["0 0 60px rgba(236,72,153,0.6)", "0 0 80px rgba(99,102,241,0.7)", "0 0 60px rgba(236,72,153,0.6)"]
            : ["0 0 40px rgba(99,102,241,0.3)", "0 0 60px rgba(236,72,153,0.4)", "0 0 40px rgba(99,102,241,0.3)"]
        }}
        transition={{ duration: isProcessing ? 1 : 3, ease: "easeInOut", repeat: Infinity }}
      >
        <div className={`w-12 h-12 mb-1 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-xl shadow-inner blur-[2px] opacity-80 ${isProcessing ? 'animate-ping' : 'animate-pulse'}`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-xl tracking-widest text-echo-text drop-shadow-sm">ECHO</span>
        </div>
      </motion.div>
    </div>
  );
}
