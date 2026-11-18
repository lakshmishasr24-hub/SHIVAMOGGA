import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Compass, Map, ArrowDown, ChevronRight, Sparkles } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

interface HeroProps {
  onExploreClick: () => void;
  onMapClick: () => void;
  destinationCount: number;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onMapClick, destinationCount }) => {
  const { scrollY } = useScroll();
  // Subtle parallax translation on hero content
  const contentY = useTransform(scrollY, [0, 600], [0, 90]);
  const contentOpacity = useTransform(scrollY, [0, 450], [1, 0.2]);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image Container with Ken Burns Slow Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat filter brightness-[0.55] contrast-[1.08] kenburns-bg"
          style={{
            backgroundImage: `url('/photos/jog-falls/1.jpg')`,
          }}
        />

        {/* Ambient Dark Forest & Charcoal Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/45 to-charcoal-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/85 via-transparent to-charcoal-950/85" />

        {/* Drifting Mist Layers for Western Ghats Ambience */}
        <div className="absolute inset-0 mist-layer-1 pointer-events-none" />
        <div className="absolute inset-0 mist-layer-2 pointer-events-none" />

        {/* Subtle Fine Mesh Dots */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38836C_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
      </div>

      {/* Hero Foreground Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 flex flex-col items-center"
      >
        {/* Top Hub Reference Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest-950/90 border border-gold-500/40 text-gold-300 text-xs sm:text-sm font-medium backdrop-blur-md mb-6 shadow-2xl"
        >
          <Sparkles className="w-4 h-4 text-gold-400 animate-pulse" />
          <span>Gateway to Karnataka's Western Ghats &bull; Shivamogga Center Hub (13.93° N, 75.57° E)</span>
        </motion.div>

        {/* Main Title with Staggered Reveal */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-serif tracking-tight text-white uppercase drop-shadow-[0_10px_35px_rgba(0,0,0,0.85)] leading-[1.0]"
        >
          SHIVAMOGGA <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-cream-100">150</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="mt-4 text-xl sm:text-2xl md:text-3xl font-serif text-earth-300 font-semibold tracking-wide drop-shadow-md"
        >
          Discover Karnataka Within 150 KM of Shivamogga
        </motion.p>

        {/* Cinematic Keyword Trail */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="mt-5 max-w-3xl text-xs sm:text-sm md:text-base text-gold-300/90 font-mono tracking-widest uppercase font-semibold drop-shadow"
        >
          Waterfalls &bull; Mist Peaks &bull; Wildlife &bull; Forts &bull; Ancient Temples &bull; Trekking &bull; Backwaters
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95 }}
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

        {/* Animated Counter Stats Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.15, duration: 0.6 }}
          className="mt-12 flex items-center gap-6 sm:gap-10 py-3.5 px-7 rounded-2xl bg-charcoal-900/80 border border-forest-800/50 backdrop-blur-md text-xs sm:text-sm font-mono text-cream-200 shadow-2xl"
        >
          <div>
            <span className="block text-xl sm:text-2xl font-bold font-sans text-gold-400">
              <AnimatedCounter target={destinationCount} duration={1.8} />
            </span>
            <span className="text-forest-300 text-[10px] uppercase tracking-wider">Verified Spots</span>
          </div>
          <div className="w-px h-8 bg-forest-800/60" />
          <div>
            <span className="block text-xl sm:text-2xl font-bold font-sans text-cream-100">
              <AnimatedCounter target={150} duration={1.6} suffix=" KM" />
            </span>
            <span className="text-forest-300 text-[10px] uppercase tracking-wider">Radial Bounds</span>
          </div>
          <div className="w-px h-8 bg-forest-800/60" />
          <div>
            <span className="block text-xl sm:text-2xl font-bold font-sans text-gold-400">
              <AnimatedCounter target={7} duration={1.4} />
            </span>
            <span className="text-forest-300 text-[10px] uppercase tracking-wider">Districts</span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-forest-800/60" />
          <div className="hidden sm:block">
            <span className="block text-xl sm:text-2xl font-bold font-sans text-cream-100">
              <AnimatedCounter target={8} duration={1.5} />
            </span>
            <span className="text-forest-300 text-[10px] uppercase tracking-wider">Waterfalls</span>
          </div>
        </motion.div>

        {/* Scroll Indicator with Bouncing Mouse Wheel */}
        <motion.button
          onClick={onExploreClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-10 flex flex-col items-center gap-2 text-forest-300 hover:text-gold-300 transition-colors p-2"
          aria-label="Scroll to discover destinations"
        >
          <div className="w-5 h-8 rounded-full border-2 border-forest-500/60 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-gold-400 scroll-wheel-dot" />
          </div>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </motion.button>
      </motion.div>
    </section>
  );
};
