import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TIME_OF_DAY_SLOTS } from '../data/timeOfDay';
import type { Destination, TimeOfDay } from '../types/destination';
import { Sun, Clock, MapPin, ArrowRight } from 'lucide-react';

interface SunriseSunsetSectionProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
}

export const SunriseSunsetSection: React.FC<SunriseSunsetSectionProps> = ({
  destinations,
  onSelectDestination,
}) => {
  const [activeSlot, setActiveSlot] = useState<TimeOfDay>('Morning');

  const currentSlotData = TIME_OF_DAY_SLOTS.find((s) => s.timeOfDay === activeSlot) || TIME_OF_DAY_SLOTS[0];

  // Filter destinations matching slot destinationIds
  const matchingDestinations = destinations.filter((dest) =>
    currentSlotData.destinationIds.includes(dest.id)
  );

  return (
    <section id="timeofday" className="py-20 bg-charcoal-900/40 border-t border-forest-800/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono tracking-widest text-gold-400 uppercase flex items-center justify-center gap-2 mb-2">
            <Sun className="w-4 h-4 text-gold-400" />
            Diurnal Itinerary Recommendations
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-cream-100 uppercase tracking-wide">
            Sunrise to Sunset Experience
          </h2>
          <p className="mt-3 text-base text-forest-300 font-light">
            Plan your day according to optimal lighting, wildlife activity, and verified opening hours.
          </p>
        </div>

        {/* Time Slots Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {TIME_OF_DAY_SLOTS.map((slot) => {
            const isActive = activeSlot === slot.timeOfDay;

            return (
              <button
                key={slot.timeOfDay}
                onClick={() => setActiveSlot(slot.timeOfDay)}
                className={`px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-3 transition-all duration-300 border shadow-lg ${
                  isActive
                    ? 'bg-gradient-to-r from-forest-800 to-forest-700 text-gold-300 border-gold-500/50 scale-105'
                    : 'bg-charcoal-900/80 text-cream-200 border-forest-800 hover:bg-forest-900/50 hover:text-white'
                }`}
              >
                <span className="text-lg">{slot.icon}</span>
                <span className="font-serif tracking-wider uppercase">{slot.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Time Slot Banner */}
        <div className="bg-gradient-to-r from-forest-950/80 via-charcoal-900/90 to-forest-950/80 border border-forest-700/50 p-6 sm:p-8 rounded-3xl mb-10 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900 border border-gold-500/30 text-gold-300 font-mono text-xs font-bold mb-3">
                <Clock className="w-3.5 h-3.5" />
                <span>Optimal Window: {currentSlotData.recommendedHours}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-cream-100">
                {currentSlotData.tagline}
              </h3>
              <p className="mt-2 text-sm text-cream-200/90 max-w-2xl font-light">
                {currentSlotData.description}
              </p>
            </div>

            <div className="text-4xl text-gold-400 p-4 rounded-2xl bg-charcoal-950/60 border border-forest-800 self-start md:self-auto">
              {currentSlotData.icon}
            </div>
          </div>
        </div>

        {/* Matching Spots Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchingDestinations.map((dest) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              onClick={() => onSelectDestination(dest)}
              className="group cursor-pointer rounded-2xl overflow-hidden glass-card border border-forest-800/40 hover:border-gold-500/50 transition-all shadow-lg hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={dest.images[0]}
                  alt={dest.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-transparent" />
                
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-charcoal-950/80 border border-forest-700 text-gold-300 font-mono text-xs font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gold-400" />
                  {dest.distanceFromShivamogga} KM
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
                  <p className="text-xs text-cream-200/80 mt-2 line-clamp-2">
                    {dest.shortDescription}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-forest-800/40 flex items-center justify-between text-xs font-bold text-gold-400">
                  <span>View Timings & Tips</span>
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
