import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Destination } from '../types/destination';
import { Navigation, Trash2, ArrowDown, Share2, ExternalLink, Calendar, Compass } from 'lucide-react';
import { SHIVAMOGGA_CENTER } from '../utils/maps';

interface TripPlannerProps {
  destinations: Destination[];
  savedDestinationIds: string[];
  onRemoveFromTrip: (destId: string) => void;
  onClearTrip: () => void;
  onSelectDestination: (dest: Destination) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export const TripPlanner: React.FC<TripPlannerProps> = ({
  destinations,
  savedDestinationIds,
  onRemoveFromTrip,
  onClearTrip,
  onSelectDestination,
  userLocation,
}) => {
  // Saved destinations list in sequence
  const savedDestinations = savedDestinationIds
    .map((id) => destinations.find((d) => d.id === id))
    .filter((d): d is Destination => d !== undefined);

  // Total Distance Calculation
  const totalDistance = savedDestinations.reduce((acc, curr) => acc + curr.distanceFromShivamogga, 0);

  // Approximate total travel time (rough sum in hours)
  const totalHours = Math.round((totalDistance / 45) * 10) / 10; // assuming average 45km/h speed on ghat roads

  // Generate Multi-Stop Google Maps Route URL
  const generateGoogleMapsRouteUrl = () => {
    if (savedDestinations.length === 0) return '#';
    const origin = userLocation
      ? `${userLocation.lat},${userLocation.lng}`
      : `${SHIVAMOGGA_CENTER.lat},${SHIVAMOGGA_CENTER.lng}`;
    const waypoints = savedDestinations
      .map((d) => `${d.latitude},${d.longitude}`)
      .join('/');
    return `https://www.google.com/maps/dir/${origin}/${waypoints}`;
  };

  // Handle Share Trip Link
  const handleShareTrip = async () => {
    const text = `Explore my Shivamogga Trip Itinerary (${savedDestinations.length} places, ~${totalDistance} km):\n` +
      savedDestinations.map((d, i) => `${i + 1}. ${d.name} (${d.distanceFromShivamogga} km)`).join('\n');

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Shivamogga Trip Itinerary',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        // user cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Trip Itinerary copied to clipboard!');
    }
  };

  return (
    <section id="planner" className="py-20 bg-charcoal-950 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest text-gold-400 uppercase flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-gold-400" />
            Interactive Custom Route Creator
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-cream-100 uppercase tracking-wide">
            Plan Your Shivamogga Trip
          </h2>
          <p className="mt-3 text-base text-forest-300 font-light">
            Bookmark spots while exploring the catalog and build your custom Western Ghats itinerary.
          </p>
        </div>

        {/* Empty Trip State */}
        {savedDestinations.length === 0 ? (
          <div className="text-center py-16 px-6 bg-charcoal-900/60 rounded-3xl border border-forest-800/40 max-w-xl mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-full bg-forest-900/80 border border-gold-500/30 flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8 text-gold-400" />
            </div>
            <h3 className="text-xl font-bold font-serif text-cream-100">Your Trip Itinerary is Empty</h3>
            <p className="text-sm text-forest-300 mt-2 font-light">
              Click the bookmark icon on any destination card to add it to your custom itinerary!
            </p>
          </div>
        ) : (
          /* Active Itinerary Container */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Timeline Itinerary List (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Origin Hub Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gold-500/20 to-forest-900/40 border border-gold-500/40 shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-gold-500 text-charcoal-950 font-bold text-xl flex items-center justify-center shadow">
                  👑
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-gold-400 uppercase tracking-wider">
                    Start & Base Hub
                  </span>
                  <h4 className="text-lg font-serif font-bold text-cream-100">Shivamogga Central City</h4>
                  <p className="text-xs text-forest-300">Central starting point for all regional routes</p>
                </div>
              </div>

              {/* Timeline Items */}
              <AnimatePresence>
                {savedDestinations.map((dest, idx) => (
                  <React.Fragment key={dest.id}>
                    
                    {/* Connecting Route Arrow */}
                    <div className="flex items-center justify-center py-1 text-gold-400 opacity-60">
                      <ArrowDown className="w-5 h-5 animate-bounce" />
                    </div>

                    {/* Destination Card */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-charcoal-900 border border-forest-800 hover:border-gold-500/40 transition-all shadow-md group"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={dest.images[0]}
                          alt={dest.name}
                          className="w-16 h-16 rounded-xl object-cover border border-forest-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-forest-800 text-gold-300 font-mono text-xs font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-xs font-mono text-gold-400 font-semibold">
                              {dest.distanceFromShivamogga} KM from Shivamogga
                            </span>
                          </div>
                          <h4
                            onClick={() => onSelectDestination(dest)}
                            className="text-lg font-serif font-bold text-cream-100 group-hover:text-gold-300 cursor-pointer transition-colors mt-0.5"
                          >
                            {dest.name}
                          </h4>
                          <p className="text-xs text-forest-300">{dest.category} • {dest.bestTimeToVisit}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveFromTrip(dest.id)}
                        className="p-2.5 rounded-xl bg-charcoal-950 text-earth-400 hover:text-red-400 hover:bg-red-950/40 border border-forest-800/80 transition-colors"
                        title="Remove spot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>

                  </React.Fragment>
                ))}
              </AnimatePresence>

            </div>

            {/* Right Column: Trip Summary & Route Actions (1 Col) */}
            <div className="bg-charcoal-900/90 border border-forest-700/50 p-6 rounded-3xl shadow-2xl backdrop-blur-xl h-fit sticky top-24">
              <h3 className="text-xl font-serif font-bold text-cream-100 mb-4 pb-3 border-b border-forest-800 flex items-center justify-between">
                <span>My Trip Summary</span>
                <span className="px-3 py-1 rounded-full bg-forest-800 text-gold-300 font-mono text-xs font-bold">
                  {savedDestinations.length} Places
                </span>
              </h3>

              {/* Metrics */}
              <div className="space-y-4 font-mono text-xs mb-6">
                <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-950 border border-forest-800">
                  <span className="text-forest-300">Total Destinations:</span>
                  <span className="font-bold text-cream-100 text-sm">{savedDestinations.length}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-950 border border-forest-800">
                  <span className="text-forest-300">Approx Cumulative Distance:</span>
                  <span className="font-bold text-gold-400 text-sm">~{totalDistance} KM</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-charcoal-950 border border-forest-800">
                  <span className="text-forest-300">Estimated Travel Time:</span>
                  <span className="font-bold text-cream-100 text-sm">~{totalHours} Hours</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href={generateGoogleMapsRouteUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-forest-700 to-forest-800 hover:from-forest-600 hover:to-forest-700 border border-gold-500/40 text-cream-50 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition-all"
                >
                  <Navigation className="w-4 h-4 text-gold-400" />
                  <span>Open Multi-Stop Google Maps Route</span>
                  <ExternalLink className="w-3.5 h-3.5 text-cream-300" />
                </a>

                <button
                  onClick={handleShareTrip}
                  className="w-full py-3 px-4 rounded-xl bg-charcoal-950 hover:bg-forest-950 border border-forest-700/60 text-cream-100 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow transition-all"
                >
                  <Share2 className="w-4 h-4 text-gold-400" />
                  <span>Share Itinerary</span>
                </button>

                <button
                  onClick={onClearTrip}
                  className="w-full py-2 px-4 rounded-xl text-earth-400 hover:text-red-400 text-xs font-medium transition-colors text-center"
                >
                  Clear Entire Trip
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </section>
  );
};
