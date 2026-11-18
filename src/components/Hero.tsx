import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Map, ArrowDown, ChevronRight, Sparkles } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onMapClick: () => void;
  destinationCount: number;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onMapClick, destinationCount }) => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Slow Cinematic Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: 'easeOut', repeat: Infinity, repeatType: 'reverse' }}
          className="w-full h-full bg-cover bg-center bg-no-repeat filter brightness-[0.6] contrast-[1.05]"
          style={{
            backgroundImage: `url('/photos/jog-falls/1.jpg')`,
          }}
        />

        {/* Cinematic Multi-Layer Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/50 to-charcoal-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/80 via-transparent to-charcoal-950/80" />
        
        {/* Subtle Mist / Particle Canvas Overlay */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#38836C_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 flex flex-col items-center">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest-900/90 border border-gold-500/40 text-gold-300 text-xs sm:text-sm font-medium backdrop-blur-md mb-6 shadow-xl"
        >
          <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
          <span>Central Hub Reference • Shivamogga City Center (13.9299° N, 75.5681° E)</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-serif tracking-tight text-white uppercase drop-shadow-2xl leading-[1.0]"
        >
          SHIVAMOGGA <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-cream-100">150</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-4 text-xl sm:text-2xl md:text-3xl font-serif text-earth-400 font-semibold tracking-wide"
        >
          Discover Karnataka within 150 KM of Shivamogga
        </motion.p>

        {/* Supporting Text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-6 max-w-3xl text-sm sm:text-lg text-gold-300/90 font-mono tracking-wider uppercase font-semibold drop-shadow"
        >
          Waterfalls. Mountains. Forests. Temples. Wildlife. Coastlines. Adventure. Stories.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto"
        >
          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-forest-700 via-forest-600 to-forest-800 hover:from-forest-600 hover:to-forest-700 text-cream-50 font-bold text-base shadow-2xl shadow-forest-900/60 border border-gold-500/40 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group uppercase font-mono tracking-wider"
          >
            <Compass className="w-5 h-5 text-gold-400 group-hover:rotate-45 transition-transform duration-500" />
            <span>EXPLORE 150 KM</span>
            <ChevronRight className="w-4 h-4 text-cream-300 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onMapClick}
            className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-charcoal-900/80 hover:bg-forest-950/90 text-cream-100 font-bold text-base border border-forest-700/60 backdrop-blur-md flex items-center justify-center gap-3 transition-all duration-300 hover:border-gold-400/60 shadow-xl group uppercase font-mono tracking-wider"
          >
            <Map className="w-5 h-5 text-forest-300 group-hover:text-gold-300 transition-colors" />
            <span>OPEN MAP</span>
          </button>
        </motion.div>

        {/* Stats Pill counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-14 flex items-center gap-6 sm:gap-12 py-3 px-6 rounded-2xl bg-charcoal-900/60 border border-forest-800/40 backdrop-blur-md text-xs sm:text-sm font-mono text-cream-200"
        >
          <div>
            <span className="block text-xl sm:text-2xl font-bold font-sans text-gold-400">{destinationCount}</span>
            <span className="text-forest-300 text-[11px] uppercase tracking-wider">Verified Spots</span>
          </div>
          <div className="w-px h-8 bg-forest-800/60" />
          <div>
            <span className="block text-xl sm:text-2xl font-bold font-sans text-cream-100">150 KM</span>
            <span className="text-forest-300 text-[11px] uppercase tracking-wider">Geographic Boundary</span>
          </div>
          <div className="w-px h-8 bg-forest-800/60" />
          <div>
            <span className="block text-xl sm:text-2xl font-bold font-sans text-gold-400">7</span>
            <span className="text-forest-300 text-[11px] uppercase tracking-wider">Karnataka Districts</span>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.button
          onClick={onExploreClick}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="mt-12 text-forest-300 hover:text-gold-300 transition-colors p-2"
          aria-label="Scroll to content"
        >
          <ArrowDown className="w-6 h-6 opacity-80" />
        </motion.button>
      </div>
    </section>
  );
};
