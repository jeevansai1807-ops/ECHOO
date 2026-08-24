import React from 'react';
import { motion } from 'framer-motion';
import { AICore } from './AICore';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-echo-dark overflow-hidden">
      {/* Background Animated Mesh (localized for loader) */}
      <div className="absolute inset-0 z-0 opacity-50">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        
        <AICore scale={1.2} isProcessing={true} />

        {/* Loading Text */}
        <motion.div 
          className="mt-20 flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex gap-1">
            {['I', 'N', 'I', 'T', 'I', 'A', 'L', 'I', 'Z', 'I', 'N', 'G'].map((letter, i) => (
              <motion.span
                key={i}
                className="text-sm font-medium tracking-[0.2em] text-echo-text-muted"
                animate={{ opacity: [0.3, 1, 0.3], color: ["#94a3b8", "#0f172a", "#94a3b8"] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
          <div className="w-48 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-echo-accent to-pink-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

