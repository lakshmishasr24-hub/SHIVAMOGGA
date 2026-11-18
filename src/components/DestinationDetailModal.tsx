import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Destination } from '../types/destination';
import {
  X,
  MapPin,
  Clock,
  Calendar,
  Ticket,
  Navigation,
  Bookmark,
  Share2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Bus,
  Train,
  Plane,
  Car,
  ShieldAlert,
  Compass,
  Building2,
} from 'lucide-react';
import { buildGoogleMapsDirectionsUrl } from '../utils/maps';

interface DestinationDetailModalProps {
  destination: Destination | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (destId: string) => void;
  allDestinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  onClose,
  isSaved,
  onToggleSave,
  allDestinations,
  onSelectDestination,
  userLocation,
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'gallery' | 'travel' | 'nearby'>('about');
  const [selectedLightboxIndex, setSelectedLightboxIndex] = useState<number | null>(null);

  if (!destination) return null;

  // Filter nearby places objects
  const nearbyObjects = allDestinations.filter(
    (d) => destination.nearbyPlaces.includes(d.id) && d.id !== destination.id
  );

  const googleMapsUrl = buildGoogleMapsDirectionsUrl(destination, userLocation);

  const handleShare = async () => {
    const text = `Explore ${destination.name} in ${destination.district} District on SHIVAMOGGA 150 guide!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: destination.name,
          text: text,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-5xl bg-charcoal-950 border border-forest-700/60 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        
        {/* Hero Header */}
        <div className="relative h-72 sm:h-96 w-full shrink-0 overflow-hidden">
          <img
            src={destination.images[0]}
            alt={destination.name}
            className="w-full h-full object-cover filter brightness-[0.75]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent" />

          {/* Close Button Top Right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-3 rounded-full bg-charcoal-950/80 text-cream-100 hover:text-gold-300 border border-forest-700/60 shadow-xl backdrop-blur-md"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Hero Content Overlay */}
          <div className="absolute bottom-6 left-6 right-6 z-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-forest-900/90 border border-forest-600/50 text-gold-300 font-semibold text-xs shadow">
                {destination.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-charcoal-950/90 border border-gold-500/40 text-cream-100 font-mono font-bold text-xs flex items-center gap-1 shadow">
                <Building2 className="w-3.5 h-3.5 text-gold-400" />
                {destination.district} District, Karnataka
              </span>
              <span className="px-3 py-1 rounded-full bg-charcoal-950/90 border border-forest-700/50 text-gold-400 font-mono font-bold text-xs flex items-center gap-1 shadow">
                <MapPin className="w-3.5 h-3.5" />
                {destination.distanceFromShivamogga} KM from Shivamogga
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-white tracking-tight">
              {destination.name}
            </h1>

            {/* CTA Buttons Header */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-forest-700 to-forest-800 border border-gold-500/40 text-cream-50 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
              >
                <Navigation className="w-4 h-4 text-gold-400" />
                <span>GET DIRECTIONS</span>
              </a>

              <button
                onClick={() => onToggleSave(destination.id)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all border shadow ${
                  isSaved
                    ? 'bg-gold-500 text-charcoal-950 border-gold-400'
                    : 'bg-charcoal-900/90 text-cream-100 border-forest-700 hover:text-gold-300'
                }`}
              >
                <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                <span>{isSaved ? 'SAVED TO TRIP' : 'SAVE PLACE'}</span>
              </button>

              <button
                onClick={handleShare}
                className="px-4 py-2.5 rounded-xl bg-charcoal-900/90 text-cream-200 border border-forest-700 hover:text-gold-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow"
              >
                <Share2 className="w-4 h-4 text-gold-400" />
                <span>SHARE</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-forest-800/60 bg-charcoal-950 overflow-x-auto">
          {[
            { id: 'about', label: 'Overview & Story' },
            { id: 'gallery', label: `Photo Gallery (${destination.images.length})` },
            { id: 'travel', label: 'Travel Guide & Access' },
            { id: 'nearby', label: `More Places Nearby (${nearbyObjects.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 text-xs sm:text-sm font-bold tracking-wider border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-gold-400 text-gold-300'
                  : 'border-transparent text-cream-300/80 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-10">
          
          {/* TAB 1: OVERVIEW & ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-10">
              
              {/* Quick Information Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                <div className="p-3.5 rounded-2xl bg-charcoal-900 border border-forest-800 text-center">
                  <Building2 className="w-4 h-4 text-gold-400 mx-auto mb-1" />
                  <span className="block text-[10px] font-mono text-forest-300 uppercase">District</span>
                  <span className="text-xs font-bold text-cream-100 font-mono">{destination.district}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-charcoal-900 border border-forest-800 text-center">
                  <MapPin className="w-4 h-4 text-gold-400 mx-auto mb-1" />
                  <span className="block text-[10px] font-mono text-forest-300 uppercase">Straight Radial</span>
                  <span className="text-xs font-bold text-cream-100 font-mono">{destination.distanceFromShivamogga} KM</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-charcoal-900 border border-forest-800 text-center">
                  <Car className="w-4 h-4 text-gold-400 mx-auto mb-1" />
                  <span className="block text-[10px] font-mono text-forest-300 uppercase">Road Distance</span>
                  <span className="text-[11px] font-bold text-cream-100 line-clamp-1">{destination.roadDistance || `${destination.distanceFromShivamogga} KM`}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-charcoal-900 border border-forest-800 text-center">
                  <Clock className="w-4 h-4 text-gold-400 mx-auto mb-1" />
                  <span className="block text-[10px] font-mono text-forest-300 uppercase">Travel Time</span>
                  <span className="text-xs font-bold text-cream-100 font-mono">{destination.estimatedTravelTime}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-charcoal-900 border border-forest-800 text-center">
                  <Calendar className="w-4 h-4 text-gold-400 mx-auto mb-1" />
                  <span className="block text-[10px] font-mono text-forest-300 uppercase">Best Time</span>
                  <span className="text-[11px] font-bold text-cream-100 line-clamp-1">{destination.bestTimeToVisit}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-charcoal-900 border border-forest-800 text-center">
                  <Ticket className="w-4 h-4 text-gold-400 mx-auto mb-1" />
                  <span className="block text-[10px] font-mono text-forest-300 uppercase">Entry Fee</span>
                  <span className="text-[11px] font-bold text-cream-100 line-clamp-1">{destination.entryFee}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-charcoal-900 border border-forest-800 text-center">
                  <Clock className="w-4 h-4 text-gold-400 mx-auto mb-1" />
                  <span className="block text-[10px] font-mono text-forest-300 uppercase">Opening Hours</span>
                  <span className="text-[11px] font-bold text-cream-100 line-clamp-1">{destination.openingHours}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-charcoal-900 border border-forest-800 text-center">
                  <Compass className="w-4 h-4 text-gold-400 mx-auto mb-1" />
                  <span className="block text-[10px] font-mono text-forest-300 uppercase">Difficulty</span>
                  <span className="text-xs font-bold text-cream-100 font-mono">{destination.difficulty}</span>
                </div>
              </div>

              {/* Detailed Long Description & History */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-cream-100 mb-3">
                      About {destination.name}
                    </h3>
                    <p className="text-sm sm:text-base text-cream-200/90 font-light leading-relaxed">
                      {destination.longDescription}
                    </p>
                  </div>

                  {destination.history && (
                    <div className="p-5 rounded-2xl bg-charcoal-900/60 border border-forest-800/60">
                      <h4 className="text-sm font-mono font-bold text-gold-400 uppercase tracking-wider mb-2">
                        Historical & Cultural Significance
                      </h4>
                      <p className="text-xs sm:text-sm text-cream-200/90 leading-relaxed font-light">
                        {destination.history}
                      </p>
                    </div>
                  )}

                  {destination.geography && (
                    <div>
                      <h4 className="text-sm font-mono font-bold text-forest-300 uppercase tracking-wider mb-2">
                        Geography & Environment
                      </h4>
                      <p className="text-xs sm:text-sm text-cream-200/80 leading-relaxed font-light">
                        {destination.geography}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column: Things To Do & Safety Tips */}
                <div className="space-y-6">
                  {/* Things To Do */}
                  <div className="p-6 rounded-3xl bg-charcoal-900 border border-forest-800">
                    <h4 className="text-base font-serif font-bold text-cream-100 mb-4 pb-2 border-b border-forest-800">
                      Things to Do
                    </h4>
                    <ul className="space-y-2.5">
                      {destination.thingsToDo.map((act, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-cream-200">
                          <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Safety Information */}
                  {destination.safetyTips && destination.safetyTips.length > 0 && (
                    <div className="p-5 rounded-3xl bg-amber-950/30 border border-amber-500/30">
                      <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" />
                        Visitor Safety Tips
                      </h4>
                      <ul className="space-y-2 text-xs text-amber-200/90 font-light">
                        {destination.safetyTips.map((tip, i) => (
                          <li key={i}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PHOTO GALLERY WITH LIGHTBOX */}
          {activeTab === 'gallery' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {destination.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedLightboxIndex(idx)}
                    className="group relative h-56 rounded-2xl overflow-hidden cursor-pointer border border-forest-800 shadow"
                  >
                    <img
                      src={img}
                      alt={`${destination.name} ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-gold-400" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Lightbox Popup */}
              {selectedLightboxIndex !== null && (
                <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
                  <button
                    onClick={() => setSelectedLightboxIndex(null)}
                    className="absolute top-6 right-6 p-3 text-white hover:text-gold-400"
                  >
                    <X className="w-8 h-8" />
                  </button>

                  <img
                    src={destination.images[selectedLightboxIndex]}
                    alt="Lightbox"
                    className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                  />

                  {destination.images.length > 1 && (
                    <div className="absolute bottom-6 flex items-center gap-4">
                      <button
                        onClick={() =>
                          setSelectedLightboxIndex(
                            (selectedLightboxIndex - 1 + destination.images.length) % destination.images.length
                          )
                        }
                        className="p-3 rounded-full bg-charcoal-900 border border-forest-700 text-white hover:text-gold-400"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <span className="font-mono text-xs text-cream-200">
                        {selectedLightboxIndex + 1} / {destination.images.length}
                      </span>
                      <button
                        onClick={() =>
                          setSelectedLightboxIndex((selectedLightboxIndex + 1) % destination.images.length)
                        }
                        className="p-3 rounded-full bg-charcoal-900 border border-forest-700 text-white hover:text-gold-400"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRAVEL GUIDE & HOW TO REACH */}
          {activeTab === 'travel' && (
            <div className="space-y-6">
              <h3 className="text-xl font-serif font-bold text-cream-100">
                How to Reach {destination.name} ({destination.district} District)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {destination.howToReach.road && (
                  <div className="p-5 rounded-2xl bg-charcoal-900 border border-forest-800 flex items-start gap-4">
                    <Car className="w-6 h-6 text-gold-400 shrink-0 mt-1" />
                    <div>
                      <h4 className="text-sm font-bold text-cream-100">By Personal Vehicle / Taxi</h4>
                      <p className="text-xs text-cream-200/80 mt-1 leading-relaxed">
                        {destination.howToReach.road}
                      </p>
                    </div>
                  </div>
                )}

                {destination.howToReach.bus && (
                  <div className="p-5 rounded-2xl bg-charcoal-900 border border-forest-800 flex items-start gap-4">
                    <Bus className="w-6 h-6 text-gold-400 shrink-0 mt-1" />
                    <div>
                      <h4 className="text-sm font-bold text-cream-100">By Bus Services</h4>
                      <p className="text-xs text-cream-200/80 mt-1 leading-relaxed">
                        {destination.howToReach.bus}
                      </p>
                    </div>
                  </div>
                )}

                {destination.howToReach.train && (
                  <div className="p-5 rounded-2xl bg-charcoal-900 border border-forest-800 flex items-start gap-4">
                    <Train className="w-6 h-6 text-gold-400 shrink-0 mt-1" />
                    <div>
                      <h4 className="text-sm font-bold text-cream-100">By Train</h4>
                      <p className="text-xs text-cream-200/80 mt-1 leading-relaxed">
                        {destination.howToReach.train}
                      </p>
                    </div>
                  </div>
                )}

                {destination.howToReach.air && (
                  <div className="p-5 rounded-2xl bg-charcoal-900 border border-forest-800 flex items-start gap-4">
                    <Plane className="w-6 h-6 text-gold-400 shrink-0 mt-1" />
                    <div>
                      <h4 className="text-sm font-bold text-cream-100">By Air</h4>
                      <p className="text-xs text-cream-200/80 mt-1 leading-relaxed">
                        {destination.howToReach.air}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: NEARBY PLACES */}
          {activeTab === 'nearby' && (
            <div>
              <h3 className="text-xl font-serif font-bold text-cream-100 mb-6">
                More Places Nearby
              </h3>

              {nearbyObjects.length === 0 ? (
                <p className="text-xs text-forest-300 font-mono">No specific nearby suggestions configured.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {nearbyObjects.map((nearby) => (
                    <div
                      key={nearby.id}
                      onClick={() => {
                        onSelectDestination(nearby);
                        setActiveTab('about');
                      }}
                      className="group cursor-pointer rounded-2xl overflow-hidden glass-card border border-forest-800 hover:border-gold-500/50 shadow"
                    >
                      <div className="h-36 overflow-hidden">
                        <img
                          src={nearby.images[0]}
                          alt={nearby.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] font-mono text-gold-400 uppercase">{nearby.district} • {nearby.category}</span>
                        <h4 className="text-sm font-serif font-bold text-cream-100 group-hover:text-gold-300 transition-colors">
                          {nearby.name}
                        </h4>
                        <p className="text-[11px] text-forest-300 mt-1">
                          {nearby.distanceFromShivamogga} KM from Shivamogga
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </motion.div>
    </div>
  );
};
