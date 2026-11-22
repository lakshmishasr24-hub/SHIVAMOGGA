import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Destination } from '../types/destination';
import { Navigation, X, Loader2, ShieldCheck } from 'lucide-react';

interface NearMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (loc: { lat: number; lng: number }) => void;
}

// Haversine formula to compute distance in km between two lat/lng pairs
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const NearMeModal: React.FC<NearMeModalProps> = ({
  isOpen,
  onClose,
  destinations,
  onSelectDestination,
  userLocation,
  setUserLocation,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      () => {
        setLoading(false);
        // Fallback default: set user to Shivamogga City center
        setUserLocation({ lat: 13.9299, lng: 75.5681 });
        setErrorMsg('Location access denied. Displaying distances relative to Shivamogga City Center.');
      },
      { timeout: 10000 }
    );
  }, [setUserLocation]);

  useEffect(() => {
    if (isOpen && !userLocation) {
      const timer = setTimeout(() => {
        requestLocation();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, userLocation, requestLocation]);

  if (!isOpen) return null;

  // Calculate user relative distances if userLocation is available
  const sortedDestinations = userLocation
    ? [...destinations]
        .map((dest) => ({
          ...dest,
          userDistance: haversineDistance(userLocation.lat, userLocation.lng, dest.latitude, dest.longitude),
        }))
        .sort((a, b) => a.userDistance - b.userDistance)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-charcoal-900 border border-forest-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden relative max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-forest-800">
          <div>
            <span className="text-xs font-mono tracking-widest text-gold-400 uppercase flex items-center gap-1.5 mb-1">
              <Navigation className="w-3.5 h-3.5 text-gold-400" />
              Proximity Discovery
            </span>
            <h3 className="text-2xl font-serif font-bold text-cream-100">
              Explore Destinations Near Me
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-charcoal-950 text-forest-300 hover:text-white border border-forest-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location Status Notice */}
        {loading && (
          <div className="py-12 flex flex-col items-center text-center">
            <Loader2 className="w-10 h-10 text-gold-400 animate-spin mb-4" />
            <p className="text-sm text-cream-200 font-medium">Acquiring current GPS coordinates...</p>
          </div>
        )}

        {errorMsg && (
          <div className="my-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sorted List */}
        {!loading && userLocation && (
          <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-2">
            {sortedDestinations.map((dest) => (
              <div
                key={dest.id}
                onClick={() => {
                  onSelectDestination(dest);
                  onClose();
                }}
                className="flex items-center justify-between p-4 rounded-2xl bg-charcoal-950 border border-forest-800 hover:border-gold-500/40 cursor-pointer transition-all shadow-md group"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={dest.images[0]}
                    alt={dest.name}
                    className="w-16 h-16 rounded-xl object-cover border border-forest-700"
                  />
                  <div>
                    <h4 className="text-base font-serif font-bold text-cream-100 group-hover:text-gold-300 transition-colors">
                      {dest.name}
                    </h4>
                    <span className="text-xs text-forest-300">{dest.category}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-sm font-mono font-bold text-gold-400">
                    ~{dest.userDistance} KM
                  </span>
                  <span className="text-[10px] text-cream-300/80 font-mono">from your position</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </motion.div>
    </div>
  );
};
