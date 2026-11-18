import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Destination } from '../types/destination';
import { ChevronLeft, ChevronRight, Compass, MapPin, Sparkles, ArrowRight } from 'lucide-react';

interface FeaturedCarouselProps {
  featuredDestinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  featuredDestinations,
  onSelectDestination,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide every 6 seconds
  useEffect(() => {
    if (featuredDestinations.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredDestinations.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredDestinations.length]);

  if (featuredDestinations.length === 0) return null;

  const currentDest = featuredDestinations[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredDestinations.length) % featuredDestinations.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredDestinations.length);
  };

  return (
    <section className="py-16 bg-charcoal-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-mono tracking-widest text-gold-400 uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              Cinematic Spotlight
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-cream-100 mt-1">
              Featured Crown Jewels
            </h2>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-3 rounded-xl bg-charcoal-900 border border-forest-800 text-cream-200 hover:text-gold-300 hover:border-gold-500/50 transition-all shadow"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-xl bg-charcoal-900 border border-forest-800 text-cream-200 hover:text-gold-300 hover:border-gold-500/50 transition-all shadow"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Canvas Slide Container */}
        <div className="relative rounded-3xl overflow-hidden h-[480px] sm:h-[540px] border border-forest-700/40 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDest.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat flex flex-col justify-end p-6 sm:p-12"
              style={{ backgroundImage: `url(${currentDest.images[0]})` }}
            >
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/80 via-charcoal-950/30 to-transparent" />

              {/* Slide Content Overlay */}
              <div className="relative z-10 max-w-2xl">
                {/* Distance & Category Badges */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-gold-500 text-charcoal-950 font-bold text-xs uppercase tracking-wider">
                    Featured Spot
                  </span>
                  <span className="px-3 py-1 rounded-full bg-forest-950/90 border border-forest-600/50 text-gold-300 font-mono font-bold text-xs flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gold-400" />
                    {currentDest.distanceFromShivamogga} KM from Shivamogga
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-wide leading-tight">
                  {currentDest.name}
                </h3>

                {/* Short Story */}
                <p className="mt-3 text-sm sm:text-base text-cream-200/90 line-clamp-3 leading-relaxed font-light">
                  {currentDest.longDescription}
                </p>

                {/* Discover CTA Button */}
                <div className="mt-6 flex items-center gap-4">
                  <button
                    onClick={() => onSelectDestination(currentDest)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-forest-700 to-forest-800 hover:from-forest-600 hover:to-forest-700 border border-gold-500/40 text-cream-50 font-bold text-sm flex items-center gap-2 shadow-xl hover:scale-105 transition-all group"
                  >
                    <Compass className="w-4 h-4 text-gold-400 group-hover:rotate-45 transition-transform" />
                    <span>Discover This Place</span>
                    <ArrowRight className="w-4 h-4 text-cream-200 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Slide Dot Indicators */}
              <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-12 z-10 flex items-center gap-2">
                {featuredDestinations.map((dest, idx) => (
                  <button
                    key={dest.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? 'w-8 bg-gold-400' : 'w-2 bg-cream-100/30 hover:bg-cream-100/60'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};
