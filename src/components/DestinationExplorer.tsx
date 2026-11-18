import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Destination } from '../types/destination';
import { InteractiveMap } from './InteractiveMap';
import {
  Compass,
  Search,
  Bookmark,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  Map,
  List,
  X,
} from 'lucide-react';

interface DestinationExplorerProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  savedDestinationIds: string[];
  onToggleSaveDestination: (destId: string) => void;
  userLocation: { lat: number; lng: number } | null;
  onUserLocationChange?: (loc: { lat: number; lng: number }) => void;
  selectedRadius: number;
  onRadiusChange: (radius: number) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CATEGORY_TABS = [
  { id: 'All', label: 'All Spots', icon: '🌟' },
  { id: 'Waterfalls', label: 'Waterfalls', icon: '💧' },
  { id: 'Wildlife', label: 'Wildlife', icon: '🐘' },
  { id: 'Trekking', label: 'Treks & Hills', icon: '🥾' },
  { id: 'Temples', label: 'Temples', icon: '🛕' },
  { id: 'Historical Places', label: 'Forts & History', icon: '🏰' },
  { id: 'Adventure', label: 'Adventure', icon: '🚣' },
  { id: 'Nature', label: 'Nature', icon: '🌿' },
];

export const DestinationExplorer: React.FC<DestinationExplorerProps> = ({
  destinations,
  onSelectDestination,
  savedDestinationIds,
  onToggleSaveDestination,
  userLocation,
  onUserLocationChange,
  selectedRadius,
  onRadiusChange,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}) => {
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'map'>('list');

  // Filter destinations based on user input
  const filtered = destinations.filter((dest) => {
    const withinRadius = dest.distanceFromShivamogga <= selectedRadius;
    const matchesCategory =
      selectedCategory === 'All' ||
      dest.category === selectedCategory ||
      (selectedCategory === 'Trekking' && (dest.category === 'Trekking' || dest.category === 'Mountains & Hills')) ||
      (selectedCategory === 'Historical Places' && (dest.category === 'Historical Places' || dest.category === 'Forts'));

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      dest.name.toLowerCase().includes(q) ||
      dest.district.toLowerCase().includes(q) ||
      dest.category.toLowerCase().includes(q) ||
      dest.shortDescription.toLowerCase().includes(q) ||
      dest.tags.some((t) => t.toLowerCase().includes(q));

    return withinRadius && matchesCategory && matchesSearch;
  });

  // Handle Card Click -> Synchronize to Map
  const handleCardClick = (dest: Destination) => {
    setSelectedDestId(dest.id);
    if (window.innerWidth < 1024) {
      setMobileView('map');
    }
  };

  // Handle Marker Click on Map -> Scroll matching card into view
  const handleMarkerClick = (dest: Destination) => {
    setSelectedDestId(dest.id);
    const cardElement = document.getElementById(`dest-card-${dest.id}`);
    if (cardElement) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <section id="destinations" className="py-12 bg-charcoal-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-950/80 border border-gold-500/30 text-gold-400 text-xs font-mono uppercase tracking-widest mb-2">
              <Compass className="w-3.5 h-3.5 text-gold-400" />
              <span>Interactive 150 KM Gateway</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-cream-100 tracking-tight">
              Places Worth Discovering
            </h2>
            <p className="mt-2 text-sm text-forest-300 font-light max-w-xl">
              Scroll through curated destinations on the left, synchronized in real time with our high-precision Western Ghats map.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="px-3.5 py-1.5 rounded-xl bg-charcoal-900/90 border border-forest-800/60 text-gold-300 shadow">
              Showing <b className="text-white">{filtered.length}</b> of {destinations.length} spots
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-forest-950/80 border border-forest-700/50 text-forest-300">
              Radius: {selectedRadius} KM
            </span>
          </div>
        </div>

        {/* Filter Tabs Bar */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onCategoryChange(tab.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-forest-800 to-forest-700 text-gold-300 border-gold-500/50 shadow-lg shadow-forest-950 scale-[1.02]'
                    : 'bg-charcoal-900/70 hover:bg-forest-950/80 text-cream-300 border-forest-800/40 hover:border-forest-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile View Switcher Pill (Sticky on Mobile) */}
        <div className="lg:hidden sticky top-[72px] z-30 mb-6 flex items-center justify-center">
          <div className="p-1 rounded-2xl bg-charcoal-950/95 border border-forest-700/60 shadow-2xl backdrop-blur-xl flex items-center gap-1">
            <button
              onClick={() => setMobileView('list')}
              className={`px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                mobileView === 'list'
                  ? 'bg-forest-800 text-gold-300 shadow-md'
                  : 'text-cream-300 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List View ({filtered.length})</span>
            </button>
            <button
              onClick={() => setMobileView('map')}
              className={`px-5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                mobileView === 'map'
                  ? 'bg-forest-800 text-gold-300 shadow-md'
                  : 'text-cream-300 hover:text-white'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Interactive Map</span>
            </button>
          </div>
        </div>

        {/* Desktop Split Layout (Grid 12 cols: 7 cols cards, 5 cols sticky map) */}
        <div className="lg:grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Destination Cards List (Hidden on mobile if mobileView === 'map') */}
          <div className={`lg:col-span-7 space-y-6 ${mobileView === 'map' ? 'hidden lg:block' : 'block'}`}>
            
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-forest-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search waterfall, peak, wildlife, fort, temple..."
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-charcoal-900/80 border border-forest-800/60 focus:border-gold-500/60 text-cream-100 placeholder-forest-400/60 text-sm focus:outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-forest-400 hover:text-cream-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Empty State */}
            {filtered.length === 0 ? (
              <div className="py-16 text-center bg-charcoal-900/60 rounded-3xl border border-forest-800/40 px-6">
                <ShieldAlert className="w-12 h-12 text-earth-500 mx-auto mb-4 animate-bounce" />
                <h3 className="text-xl font-bold text-cream-100 font-serif">No Destinations Found</h3>
                <p className="text-sm text-forest-300 mt-2">
                  Try clearing the search query or selecting a different category.
                </p>
                <button
                  onClick={() => {
                    onSearchChange('');
                    onCategoryChange('All');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-forest-800 text-gold-300 text-xs font-mono"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              /* Cards Grid (1 col on small, 2 cols on tablet/desktop) */
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <AnimatePresence>
                  {filtered.map((dest) => {
                    const isSelected = selectedDestId === dest.id;
                    const isSaved = savedDestinationIds.includes(dest.id);

                    return (
                      <DestinationCardItem
                        key={dest.id}
                        dest={dest}
                        isSelected={isSelected}
                        isSaved={isSaved}
                        onCardClick={() => handleCardClick(dest)}
                        onSelectDestination={() => onSelectDestination(dest)}
                        onToggleSave={() => onToggleSaveDestination(dest.id)}
                        userLocation={userLocation}
                        onFlyToMap={() => {
                          setSelectedDestId(dest.id);
                          if (window.innerWidth < 1024) setMobileView('map');
                        }}
                      />
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Right Column: Sticky Map (Hidden on mobile if mobileView === 'list') */}
          <div
            id="map"
            className={`lg:col-span-5 lg:sticky lg:top-[85px] lg:h-[calc(100vh-105px)] ${
              mobileView === 'list' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="w-full h-[55vh] lg:h-full rounded-3xl overflow-hidden border border-forest-800/50 shadow-2xl relative">
              <InteractiveMap
                destinations={destinations}
                selectedRadius={selectedRadius}
                onRadiusChange={onRadiusChange}
                onSelectDestination={onSelectDestination}
                selectedDestinationId={selectedDestId}
                onMarkerClick={handleMarkerClick}
                userLocation={userLocation}
                onUserLocationChange={onUserLocationChange}
                activeCategory={selectedCategory}
                isCompact={true}
              />
            </div>

            {/* Mobile Bottom Quick-Select Carousel when Map View is active */}
            <div className="lg:hidden mt-3 overflow-x-auto flex gap-3 pb-2 scrollbar-none">
              {filtered.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => setSelectedDestId(dest.id)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl border text-xs font-mono flex items-center gap-2 transition-all ${
                    selectedDestId === dest.id
                      ? 'bg-forest-800 border-gold-400 text-gold-300'
                      : 'bg-charcoal-900/90 border-forest-800/60 text-cream-200'
                  }`}
                >
                  <span>{dest.name}</span>
                  <span className="text-[10px] text-forest-400">({dest.distanceFromShivamogga}km)</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------
 * Destination Card with 3D Desktop Tilt, Hover Zoom & Glow
 * ------------------------------------------------------------- */
interface DestinationCardItemProps {
  dest: Destination;
  isSelected: boolean;
  isSaved: boolean;
  onCardClick: () => void;
  onSelectDestination: () => void;
  onToggleSave: () => void;
  userLocation: { lat: number; lng: number } | null;
  onFlyToMap: () => void;
}

const DestinationCardItem: React.FC<DestinationCardItemProps> = ({
  dest,
  isSelected,
  isSaved,
  onCardClick,
  onSelectDestination,
  onToggleSave,
  onFlyToMap,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ rotateX: number; rotateY: number }>({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // max 5.5 degree subtle 3D tilt
    const rotateX = ((y - centerY) / centerY) * -5.5;
    const rotateY = ((x - centerX) / centerX) * 5.5;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  return (
    <motion.div
      id={`dest-card-${dest.id}`}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onCardClick}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
      }}
      className={`group relative rounded-3xl overflow-hidden glass-card border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
        isSelected
          ? 'border-gold-400 ring-2 ring-gold-400/80 bg-forest-950/80 shadow-[0_0_28px_rgba(212,175,55,0.35)] -translate-y-1'
          : 'border-forest-800/40 hover:border-gold-500/50 hover:-translate-y-1.5 shadow-xl'
      }`}
    >
      {/* Top Media Thumbnail Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={dest.images[0]}
          alt={dest.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-forest-950/90 backdrop-blur-md border border-forest-600/40 text-gold-300 font-semibold text-[11px] shadow">
              {dest.category}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-charcoal-950/90 backdrop-blur-md border border-forest-800/60 text-cream-300 font-mono text-[10px] shadow">
              {dest.district}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${
              isSaved
                ? 'bg-gold-500 text-charcoal-950 border-gold-400'
                : 'bg-charcoal-950/70 text-cream-200 border-forest-700/50 hover:text-gold-300'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save to trip'}
          >
            <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Distance Badge Floating Bottom Left of Image */}
        <div className="absolute bottom-2.5 left-3 z-10">
          <span className="px-2.5 py-1 rounded-lg bg-charcoal-950/90 backdrop-blur-md border border-gold-500/30 text-gold-300 font-mono text-[11px] font-bold shadow">
            📍 {dest.distanceFromShivamogga} KM from Center
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif font-bold text-base text-cream-100 group-hover:text-gold-300 transition-colors line-clamp-1">
              {dest.name}
            </h3>
            <span className="text-xs font-mono text-gold-400 font-semibold">
              ★ {dest.rating}
            </span>
          </div>

          <p className="mt-1.5 text-xs text-forest-300 font-light line-clamp-2 leading-relaxed">
            {dest.shortDescription}
          </p>

          <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-cream-300/80">
            <Clock className="w-3 h-3 text-forest-400" />
            <span className="truncate">{dest.bestTimeToVisit}</span>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="mt-4 pt-3 border-t border-forest-800/40 flex items-center justify-between gap-2">
          {/* Fly to Map Pin */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFlyToMap();
            }}
            className="px-3 py-1.5 rounded-xl bg-forest-950/80 hover:bg-forest-900 border border-forest-700/50 text-gold-400 hover:text-gold-300 text-xs font-mono flex items-center gap-1.5 transition-all"
            title="Focus on map"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>

          {/* Explore Details Modal Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectDestination();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-forest-700 to-forest-800 hover:from-forest-600 hover:to-forest-700 text-white font-medium text-xs font-mono flex items-center gap-1 border border-gold-500/30 shadow transition-all hover:scale-102"
          >
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5 text-gold-300 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
