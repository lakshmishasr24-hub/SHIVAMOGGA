import React from 'react';
import { motion } from 'framer-motion';
import type { Destination } from '../types/destination';
import { Star, MapPin, Clock, ArrowRight, Compass, Bookmark, ShieldAlert } from 'lucide-react';

interface DestinationGridProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  savedDestinationIds: string[];
  onToggleSaveDestination: (destId: string) => void;
}

export const DestinationGrid: React.FC<DestinationGridProps> = ({
  destinations,
  onSelectDestination,
  savedDestinationIds,
  onToggleSaveDestination,
}) => {
  return (
    <section id="destinations" className="py-20 bg-charcoal-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest text-gold-400 uppercase flex items-center justify-center gap-2 mb-2">
            <Compass className="w-4 h-4 text-gold-400" />
            Curated Discovery Catalog
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-cream-100 uppercase tracking-wide">
            Places Worth Discovering
          </h2>
          <p className="mt-3 text-base text-forest-300 font-light leading-relaxed">
            Authentic heritage, roaring waterfalls, misty peaks, and wildlife sanctuaries within 150 km of Shivamogga city.
          </p>
        </div>

        {/* Empty State Fallback */}
        {destinations.length === 0 ? (
          <div className="py-16 text-center bg-charcoal-900/60 rounded-3xl border border-forest-800/40 max-w-xl mx-auto px-6">
            <ShieldAlert className="w-12 h-12 text-earth-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-cream-100 font-serif">No Destinations Found</h3>
            <p className="text-sm text-forest-300 mt-2">
              Try adjusting your distance radius or search filter options above.
            </p>
          </div>
        ) : (
          /* Grid of Visual Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest, index) => {
              const isSaved = savedDestinationIds.includes(dest.id);

              return (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                  className="group relative rounded-3xl overflow-hidden glass-card border border-forest-800/40 hover:border-gold-500/50 transition-all duration-500 flex flex-col justify-between shadow-xl hover:-translate-y-2"
                >
                  {/* Card Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={dest.images[0]}
                      alt={dest.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />

                    {/* Gradient Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      {/* Category & District Badge */}
                      <div className="flex items-center gap-1.5">
                        <span className="px-3 py-1 rounded-full bg-forest-950/90 backdrop-blur-md border border-forest-600/40 text-gold-300 font-semibold text-xs shadow-md">
                          {dest.category}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-charcoal-950/90 backdrop-blur-md border border-gold-500/30 text-cream-200 font-mono text-[11px] shadow-md">
                          {dest.district}
                        </span>
                      </div>

                      {/* Bookmark Save Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSaveDestination(dest.id);
                        }}
                        className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                          isSaved
                            ? 'bg-gold-500 text-charcoal-950 border-gold-400'
                            : 'bg-charcoal-950/70 text-cream-200 border-forest-700/50 hover:text-gold-300'
                        }`}
                        title={isSaved ? 'Remove from Trip' : 'Save to Trip'}
                      >
                        <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Distance Badge at Bottom Left of Image */}
                    <div className="absolute bottom-3 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-charcoal-950/90 border border-forest-700/50 text-gold-400 font-mono font-bold text-xs shadow">
                      <MapPin className="w-3.5 h-3.5 text-gold-400" />
                      <span>{dest.roadDistance || `${dest.distanceFromShivamogga} KM from Shivamogga`}</span>
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Name & Rating */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-xl font-bold font-serif text-cream-100 group-hover:text-gold-300 transition-colors">
                          {dest.name}
                        </h3>

                        <div className="flex items-center gap-1 text-gold-400 text-xs font-bold font-mono bg-forest-950/60 px-2 py-0.5 rounded border border-gold-500/20">
                          <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                          <span>{dest.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Short Description */}
                      <p className="text-xs sm:text-sm text-cream-200/80 line-clamp-3 leading-relaxed mb-4 font-light">
                        {dest.shortDescription}
                      </p>
                    </div>

                    {/* Card Footer Action */}
                    <div className="pt-4 border-t border-forest-800/40 flex items-center justify-between text-xs font-medium text-forest-300">
                      <div className="flex items-center gap-1 text-cream-300/80 font-mono">
                        <Clock className="w-3.5 h-3.5 text-forest-400" />
                        <span>{dest.estimatedTravelTime}</span>
                      </div>

                      <button
                        onClick={() => onSelectDestination(dest)}
                        className="inline-flex items-center gap-1.5 font-bold text-gold-400 hover:text-gold-300 transition-colors group/btn"
                      >
                        <span>EXPLORE</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
