import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Destination } from '../types/destination';
import { Clock, MapPin, ArrowRight, Gem, Sun } from 'lucide-react';

interface OneDayEscapesProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
}

export const OneDayEscapes: React.FC<OneDayEscapesProps> = ({
  destinations,
  onSelectDestination,
}) => {
  const [activeTab, setActiveTab] = useState<'oneday' | 'hidden'>('oneday');

  const oneDayList = destinations.filter((d) => d.oneDayEscape).slice(0, 6);
  const hiddenGemsList = destinations.filter((d) => d.hiddenGem).slice(0, 6);

  const currentList = activeTab === 'oneday' ? oneDayList : hiddenGemsList;

  return (
    <section className="py-20 bg-charcoal-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Switcher Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-xs font-mono tracking-widest text-gold-400 uppercase flex items-center gap-2">
              <Sun className="w-4 h-4 text-gold-400" />
              Specialized Regional Collections
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-cream-100 mt-1 uppercase tracking-wide">
              {activeTab === 'oneday' ? 'One Day from Shivamogga' : 'Hidden Gems Around Shivamogga'}
            </h2>
            <p className="mt-2 text-sm text-forest-300 font-light">
              {activeTab === 'oneday'
                ? 'Curated destinations ideal for a full-day trip with verified travel times under 3 hours.'
                : 'Lesser-known untouched waterfalls, ancient step-forts, and tranquil hilltops.'}
            </p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex items-center gap-2 bg-charcoal-900/80 p-1.5 rounded-2xl border border-forest-800">
            <button
              onClick={() => setActiveTab('oneday')}
              className={`px-5 py-2.5 rounded-xl font-serif text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'oneday'
                  ? 'bg-forest-800 text-gold-300 border border-gold-500/40 shadow'
                  : 'text-cream-300 hover:text-white'
              }`}
            >
              ☀️ One Day Escapes
            </button>
            <button
              onClick={() => setActiveTab('hidden')}
              className={`px-5 py-2.5 rounded-xl font-serif text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'hidden'
                  ? 'bg-forest-800 text-gold-300 border border-gold-500/40 shadow'
                  : 'text-cream-300 hover:text-white'
              }`}
            >
              💎 Hidden Gems
            </button>
          </div>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentList.map((dest) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              onClick={() => onSelectDestination(dest)}
              className="group cursor-pointer rounded-3xl overflow-hidden glass-card border border-forest-800/40 hover:border-gold-500/50 transition-all shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={dest.images[0]}
                  alt={dest.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/20 to-transparent" />

                {/* Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="px-3 py-1 rounded-full bg-forest-950/90 border border-forest-600/50 text-gold-300 font-semibold text-xs shadow">
                    {dest.district} District
                  </span>
                  {activeTab === 'hidden' && (
                    <span className="px-3 py-1 rounded-full bg-gold-500 text-charcoal-950 font-bold text-xs flex items-center gap-1 shadow">
                      <Gem className="w-3 h-3" />
                      Hidden Gem
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-charcoal-950/90 border border-forest-700/50 text-gold-400 font-mono font-bold text-xs shadow">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{dest.roadDistance || `${dest.distanceFromShivamogga} KM`}</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-cream-100 group-hover:text-gold-300 transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-cream-200/80 mt-2 line-clamp-3 leading-relaxed font-light">
                    {dest.shortDescription}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-forest-800/40 flex items-center justify-between text-xs font-mono">
                  <span className="text-cream-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-forest-300" />
                    {dest.estimatedTravelTime}
                  </span>
                  <span className="font-bold text-gold-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    PLAN THIS TRIP <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
