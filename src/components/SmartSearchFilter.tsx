import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, Compass, SlidersHorizontal } from 'lucide-react';

interface SmartSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  selectedDistanceRange: string;
  onDistanceRangeChange: (range: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  selectedTravelType: string;
  onTravelTypeChange: (type: string) => void;
  onResetFilters: () => void;
  suggestions: string[];
}

export const SmartSearchFilter: React.FC<SmartSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedDistrict,
  onDistrictChange,
  selectedDistanceRange,
  onDistanceRangeChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedTravelType,
  onTravelTypeChange,
  onResetFilters,
  suggestions,
}) => {
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const categories: string[] = [
    'All',
    'Waterfalls',
    'Mountains & Hills',
    'Nature',
    'Wildlife',
    'Trekking',
    'Temples',
    'Historical Places',
    'Forts',
    'Viewpoints',
    'Adventure',
    'Beaches',
    'Forests',
    'Dams & Reservoirs',
    'Heritage & Culture',
  ];

  const districts: string[] = [
    'All',
    'Shivamogga',
    'Chikkamagaluru',
    'Udupi',
    'Uttara Kannada',
    'Dakshina Kannada',
    'Davanagere',
    'Haveri',
  ];

  const distanceRanges = ['All', '0–25 KM', '25–50 KM', '50–75 KM', '75–100 KM', '100–125 KM', '125–150 KM'];
  const difficulties = ['All', 'Easy', 'Moderate', 'Difficult'];
  const travelTypes = ['All', 'Family', 'Couple', 'Friends', 'Solo', 'Adventure'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeFiltersCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedDistrict !== 'All' ? 1 : 0) +
    (selectedDistanceRange !== 'All' ? 1 : 0) +
    (selectedDifficulty !== 'All' ? 1 : 0) +
    (selectedTravelType !== 'All' ? 1 : 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-12">
      {/* Search Bar & Filter Button */}
      <div className="relative z-30" ref={searchRef}>
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-charcoal-900/90 border border-forest-700/50 p-3 rounded-2xl shadow-2xl backdrop-blur-xl">
          {/* Main Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gold-400" />
            <input
              type="text"
              placeholder="Search waterfalls, temples, beaches, trekking, districts..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-charcoal-950/80 border border-forest-800 text-sm text-cream-100 placeholder-forest-400 focus:outline-none focus:border-gold-400 font-medium"
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

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
            className={`w-full sm:w-auto px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border shadow ${
              activeFiltersCount > 0 || showFiltersDrawer
                ? 'bg-forest-800 text-gold-300 border-gold-500/40'
                : 'bg-charcoal-950/80 text-cream-200 border-forest-800 hover:border-gold-500/30'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-gold-400" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-gold-400 text-charcoal-950 text-xs font-mono font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && searchQuery.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-charcoal-900 border border-forest-700/60 rounded-2xl shadow-2xl p-2 z-50 max-h-64 overflow-y-auto backdrop-blur-xl">
            <div className="px-3 py-1.5 text-[11px] font-mono tracking-widest text-gold-400 uppercase">
              Instant Search Matches
            </div>
            {suggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSearchChange(item);
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-cream-100 hover:bg-forest-900/60 hover:text-gold-300 transition-colors flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-forest-300" />
                  {item}
                </span>
                <span className="text-[10px] text-forest-400">Select</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Collapsible Filters Drawer */}
      {showFiltersDrawer && (
        <div className="mt-4 p-6 bg-charcoal-900/95 border border-forest-700/50 rounded-3xl shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-forest-800/60 mb-6">
            <h4 className="text-base font-serif font-bold text-cream-100 flex items-center gap-2">
              <Filter className="w-4 h-4 text-gold-400" />
              Refine Exploration Parameters (150 KM Boundary)
            </h4>
            <button
              onClick={onResetFilters}
              className="text-xs font-semibold text-earth-400 hover:text-gold-300 underline"
            >
              Reset All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-forest-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-forest-800 text-xs text-cream-100 focus:outline-none focus:border-gold-400"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-gold-400 font-bold mb-2">
                District Filter
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => onDistrictChange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-gold-500/40 text-xs text-gold-300 font-bold focus:outline-none focus:border-gold-400"
              >
                {districts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist === 'All' ? 'All Districts' : `${dist} District`}
                  </option>
                ))}
              </select>
            </div>

            {/* Distance Filter */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-forest-300 mb-2">
                Distance Range
              </label>
              <select
                value={selectedDistanceRange}
                onChange={(e) => onDistanceRangeChange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-forest-800 text-xs text-cream-100 focus:outline-none focus:border-gold-400"
              >
                {distanceRanges.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-forest-300 mb-2">
                Difficulty Level
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => onDifficultyChange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-forest-800 text-xs text-cream-100 focus:outline-none focus:border-gold-400"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>

            {/* Travel Type Filter */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-forest-300 mb-2">
                Companion Style
              </label>
              <select
                value={selectedTravelType}
                onChange={(e) => onTravelTypeChange(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-charcoal-950 border border-forest-800 text-xs text-cream-100 focus:outline-none focus:border-gold-400"
              >
                {travelTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
