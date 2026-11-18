import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Navigation } from 'lucide-react';

interface DistanceExplorerProps {
  selectedRadius: number;
  onRadiusChange: (radius: number) => void;
  filteredCount: number;
}

export const DistanceExplorer: React.FC<DistanceExplorerProps> = ({
  selectedRadius,
  onRadiusChange,
  filteredCount,
}) => {
  const radiusOptions = [25, 50, 75, 100, 125, 150];

  return (
    <section className="py-12 bg-charcoal-900/40 border-y border-forest-800/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-r from-forest-950/80 via-charcoal-900/90 to-forest-950/80 p-6 sm:p-8 rounded-3xl border border-forest-700/40 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          {/* Subtle Background Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-forest-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left Text & Counter */}
          <div className="text-center lg:text-left z-10">
            <span className="text-xs font-mono tracking-widest text-gold-400 uppercase flex items-center justify-center lg:justify-start gap-2 mb-2">
              <Navigation className="w-4 h-4 text-gold-400" />
              Radius Distance Explorer
            </span>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-cream-100">
              How far do you want to explore?
            </h2>

            <div className="mt-2 flex items-center justify-center lg:justify-start gap-3">
              <p className="text-base text-cream-200">
                Exploring within <span className="font-bold text-gold-300 font-mono">{selectedRadius} KM</span> of Shivamogga
              </p>
              <span className="w-1.5 h-1.5 rounded-full bg-forest-400" />
              <motion.span
                key={filteredCount}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-800/90 border border-gold-500/30 text-gold-300 font-semibold text-xs shadow"
              >
                <Compass className="w-3.5 h-3.5" />
                {filteredCount} {filteredCount === 1 ? 'destination' : 'destinations'} discovered
              </motion.span>
            </div>
          </div>

          {/* Radius Selector Buttons */}
          <div className="w-full lg:w-auto z-10">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 bg-charcoal-950/70 p-2 rounded-2xl border border-forest-800/60 shadow-inner">
              {radiusOptions.map((radius) => {
                const isActive = selectedRadius === radius;
                return (
                  <button
                    key={radius}
                    onClick={() => onRadiusChange(radius)}
                    className={`relative py-3 px-4 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all duration-300 flex flex-col items-center justify-center ${
                      isActive
                        ? 'text-charcoal-950 shadow-lg shadow-gold-500/20'
                        : 'text-cream-200 hover:text-white hover:bg-forest-900/50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeRadiusBg"
                        className="absolute inset-0 bg-gradient-to-r from-gold-400 to-gold-300 rounded-xl z-0"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{radius} KM</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
