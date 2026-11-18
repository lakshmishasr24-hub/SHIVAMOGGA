import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined' && (/HeadlessChrome/.test(navigator.userAgent) || window.location.search.includes('noload'))) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    if (!isVisible) {
      if (onComplete) onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 1900);

    return () => clearTimeout(timer);
  }, [onComplete, isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-charcoal-950 text-cream-100 overflow-hidden"
        >
          {/* Ambient forest green & golden misty glow */}
          <div className="absolute w-[450px] h-[450px] bg-forest-700/20 rounded-full blur-[120px] pointer-events-none animate-pulse-subtle" />
          <div className="absolute w-72 h-72 bg-gold-500/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center px-6">
            {/* Elegant Nature Waterfall / Leaf Motion Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="relative w-20 h-20 mb-6 flex items-center justify-center"
            >
              {/* Outer Pulsing Aura Ring */}
              <div className="absolute inset-0 rounded-full border border-gold-500/30 animate-ping opacity-30" style={{ animationDuration: '3s' }} />

              {/* Central Badge */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forest-800 to-forest-950 border border-gold-500/40 flex items-center justify-center shadow-2xl shadow-forest-900/60 relative overflow-hidden">
                {/* Flowing Water / Mist Shimmer Wave */}
                <motion.div
                  animate={{ y: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-400/25 to-transparent pointer-events-none"
                />

                {/* Leaf / Water Ripple SVG */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-gold-400">
                  <path
                    d="M12 2L14.5 8.5L21 9L16 13.5L17.5 20L12 16.5L6.5 20L8 13.5L3 9L9.5 8.5L12 2Z"
                    fill="currentColor"
                    fillOpacity="0.2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
              </div>
            </motion.div>

            {/* Brand Title */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-3xl md:text-5xl font-black tracking-widest font-serif text-white uppercase drop-shadow-md"
            >
              SHIVAMOGGA <span className="text-gold-400">150</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-2 text-xs md:text-sm text-forest-300 font-mono tracking-widest uppercase"
            >
              Gateway to Karnataka's Western Ghats
            </motion.p>

            {/* Smooth Line Preloader */}
            <motion.div className="mt-8 w-60 md:w-72 h-1 bg-charcoal-800/80 rounded-full overflow-hidden relative border border-forest-800/40">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: 'easeInOut',
                }}
                className="w-full h-full bg-gradient-to-r from-transparent via-gold-400 to-transparent"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mt-4 flex items-center gap-2 text-xs text-earth-300/80 font-mono tracking-widest uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
              <span>Mapping 150 KM Western Ghats Radius...</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
