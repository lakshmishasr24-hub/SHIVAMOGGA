import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-charcoal-950 text-cream-100 overflow-hidden"
        >
          {/* Ambient forest green glow behind logo */}
          <div className="absolute w-96 h-96 bg-forest-700/20 rounded-full blur-[100px] pointer-events-none animate-pulse-subtle" />

          <div className="relative z-10 flex flex-col items-center text-center px-6">
            {/* Animated Compass Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forest-800 to-forest-950 border border-gold-500/30 flex items-center justify-center mb-6 shadow-2xl shadow-forest-900/50"
            >
              <Compass className="w-8 h-8 text-gold-400 animate-spin" style={{ animationDuration: '12s' }} />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-6xl font-black tracking-widest font-serif text-white uppercase"
            >
              SHIVAMOGGA <span className="text-gold-400">150</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-2 text-xs md:text-sm text-forest-300 font-mono tracking-widest uppercase"
            >
              DISCOVER • EXPLORE • EXPERIENCE
            </motion.p>

            {/* Animated Route Line Trace */}
            <motion.div className="mt-8 w-64 md:w-80 h-1 bg-charcoal-800 rounded-full overflow-hidden relative border border-forest-800/40">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 1.6,
                  ease: 'easeInOut',
                }}
                className="w-full h-full bg-gradient-to-r from-transparent via-gold-400 to-transparent"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 flex items-center gap-2 text-xs text-earth-400 font-mono tracking-widest uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
              <span>Mapping 150 KM Karnataka Radius...</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
