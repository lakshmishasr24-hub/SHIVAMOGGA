import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Destination, EscapeTag } from '../types/destination';
import { Sparkles, MapPin, ArrowRight } from 'lucide-react';

interface SmartRecommendationsProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
}

interface EscapeOption {
  tag: EscapeTag;
  label: string;
  icon: string;
  description: string;
}

const ESCAPE_OPTIONS: EscapeOption[] = [
  { tag: 'Water', label: 'Water', icon: '🌊', description: 'Waterfalls & Backwater Lakes' },
  { tag: 'Nature', label: 'Nature', icon: '🌿', description: 'Evergreen Ghats & Forests' },
  { tag: 'Adventure', label: 'Adventure', icon: '🥾', description: 'Peak Treks & Kayaking' },
  { tag: 'Culture', label: 'Culture', icon: '🛕', description: 'Forts, Temples & Heritage' },
  { tag: 'Wildlife', label: 'Wildlife', icon: '🐘', description: 'Tiger Reserves & Bird Sanctuaries' },
  { tag: 'Photography', label: 'Photography', icon: '📸', description: 'Misty Horizons & Sunsets' },
  { tag: 'Relaxation', label: 'Relaxation', icon: '🏖️', description: 'Quiet Hills & Coastal Breezes' },
  { tag: 'Family', label: 'Family', icon: '👨‍👩‍👧', description: 'Easy Drives & Scenic Spots' },
];

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  destinations,
  onSelectDestination,
}) => {
  const [selectedTag, setSelectedTag] = useState<EscapeTag>('Water');

  const matchingDestinations = destinations.filter(
    (dest) => dest.escapeTag && dest.escapeTag.includes(selectedTag)
  ).slice(0, 6);

  return (
    <section className="py-20 bg-charcoal-900/40 border-t border-forest-800/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono tracking-widest text-gold-400 uppercase flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-gold-400" />
            Curated Interest Engine
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-cream-100 uppercase tracking-wide">
            Find Your Perfect Escape
          </h2>
          <p className="mt-3 text-base text-forest-300 font-light">
            Select what you are looking for to uncover matching destinations within 150 KM of Shivamogga.
          </p>
        </div>

        {/* Interest Selection Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-12">
          {ESCAPE_OPTIONS.map((opt) => {
            const isActive = selectedTag === opt.tag;

            return (
              <button
                key={opt.tag}
                onClick={() => setSelectedTag(opt.tag)}
                className={`p-3.5 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 border shadow ${
                  isActive
                    ? 'bg-gradient-to-b from-forest-800 to-forest-900 border-gold-400 text-gold-300 scale-105 shadow-xl shadow-forest-900/60'
                    : 'bg-charcoal-900/80 border-forest-800/60 text-cream-200 hover:bg-forest-950/60 hover:text-white'
                }`}
              >
                <span className="text-2xl mb-1">{opt.icon}</span>
                <span className="text-xs font-bold font-serif uppercase tracking-wider">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Matching Recommendation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchingDestinations.map((dest) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => onSelectDestination(dest)}
              className="group cursor-pointer rounded-2xl overflow-hidden glass-card border border-forest-800/50 hover:border-gold-500/50 shadow-lg transition-all hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={dest.images[0]}
                  alt={dest.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-transparent" />
                
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-charcoal-950/90 border border-gold-500/30 text-gold-300 font-mono text-xs font-bold flex items-center gap-1 shadow">
                  <MapPin className="w-3 h-3 text-gold-400" />
                  {dest.distanceFromShivamogga} KM ({dest.district})
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono text-forest-300 uppercase tracking-wider">
                    {dest.category}
                  </span>
                  <h4 className="text-lg font-bold font-serif text-cream-100 group-hover:text-gold-300 transition-colors mt-0.5">
                    {dest.name}
                  </h4>
                  <p className="text-xs text-cream-200/80 mt-2 line-clamp-2 font-light">
                    {dest.shortDescription}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-forest-800/40 flex items-center justify-between text-xs font-bold text-gold-400">
                  <span>Explore Destination</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
