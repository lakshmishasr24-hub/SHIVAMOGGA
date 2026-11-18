import React, { useState, useEffect, useCallback } from 'react';
import { DESTINATIONS } from './data/destinations';
import type { Destination } from './types/destination';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { DistanceExplorer } from './components/DistanceExplorer';
import { InteractiveMap } from './components/InteractiveMap';
import { DestinationGrid } from './components/DestinationGrid';
import { FeaturedCarousel } from './components/FeaturedCarousel';
import { CategoryExplorer } from './components/CategoryExplorer';
import { SmartSearchFilter } from './components/SmartSearchFilter';
import { SmartRecommendations } from './components/SmartRecommendations';
import { OneDayEscapes } from './components/OneDayEscapes';
import { StoriesSection } from './components/StoriesSection';
import { SunriseSunsetSection } from './components/SunriseSunsetSection';
import { TripPlanner } from './components/TripPlanner';
import { NearMeModal } from './components/NearMeModal';
import { DestinationDetailModal } from './components/DestinationDetailModal';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [selectedRadius, setSelectedRadius] = useState<number>(150);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedDistanceRange, setSelectedDistanceRange] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedTravelType, setSelectedTravelType] = useState<string>('All');
  
  const [savedDestinationIds, setSavedDestinationIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('shivamogga_150_trip');
      return stored ? JSON.parse(stored) : ['jog-falls', 'kodachadri-peak', 'agumbe-sunset-point', 'sringeri-sharada-peetham'];
    } catch (e) {
      return ['jog-falls', 'kodachadri-peak', 'agumbe-sunset-point', 'sringeri-sharada-peetham'];
    }
  });

  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isNearMeOpen, setIsNearMeOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Save trip to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shivamogga_150_trip', JSON.stringify(savedDestinationIds));
    } catch (e) {}
  }, [savedDestinationIds]);

  // Handle URL hashtag navigation / deep linking (e.g. #destination/jog-falls)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#destination/')) {
        const slug = hash.replace('#destination/', '');
        const found = DESTINATIONS.find((d) => d.slug === slug || d.id === slug);
        if (found) {
          setSelectedDestination(found);
        }
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when opening destination detail
  const handleSelectDestination = useCallback((dest: Destination) => {
    setSelectedDestination(dest);
    window.history.pushState(null, '', `#destination/${dest.slug}`);
  }, []);

  const handleCloseDestinationModal = () => {
    setSelectedDestination(null);
    window.history.pushState(null, '', window.location.pathname);
  };

  // Toggle bookmark save destination
  const handleToggleSaveDestination = (destId: string) => {
    setSavedDestinationIds((prev) =>
      prev.includes(destId) ? prev.filter((id) => id !== destId) : [...prev, destId]
    );
  };

  const handleRemoveFromTrip = (destId: string) => {
    setSavedDestinationIds((prev) => prev.filter((id) => id !== destId));
  };

  const handleClearTrip = () => {
    setSavedDestinationIds([]);
  };

  // Scroll to section helper
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered Destinations Logic
  const filteredDestinations = DESTINATIONS.filter((dest) => {
    // Radial distance filter
    const matchesRadius = dest.distanceFromShivamogga <= selectedRadius;

    // Distance Range dropdown filter
    let matchesDistanceRange = true;
    if (selectedDistanceRange === '0–25 KM') matchesDistanceRange = dest.distanceFromShivamogga <= 25;
    else if (selectedDistanceRange === '25–50 KM') matchesDistanceRange = dest.distanceFromShivamogga > 25 && dest.distanceFromShivamogga <= 50;
    else if (selectedDistanceRange === '50–75 KM') matchesDistanceRange = dest.distanceFromShivamogga > 50 && dest.distanceFromShivamogga <= 75;
    else if (selectedDistanceRange === '75–100 KM') matchesDistanceRange = dest.distanceFromShivamogga > 75 && dest.distanceFromShivamogga <= 100;
    else if (selectedDistanceRange === '100–125 KM') matchesDistanceRange = dest.distanceFromShivamogga > 100 && dest.distanceFromShivamogga <= 125;
    else if (selectedDistanceRange === '125–150 KM') matchesDistanceRange = dest.distanceFromShivamogga > 125 && dest.distanceFromShivamogga <= 150;

    // Category filter
    const matchesCategory = selectedCategory === 'All' || dest.category === selectedCategory;

    // District filter
    const matchesDistrict = selectedDistrict === 'All' || dest.district === selectedDistrict;

    // Difficulty filter
    const matchesDifficulty = selectedDifficulty === 'All' || dest.difficulty === selectedDifficulty;

    // Travel Type filter
    const matchesTravelType = selectedTravelType === 'All' || dest.travelType.includes(selectedTravelType as any);

    // Search query filter
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      dest.name.toLowerCase().includes(q) ||
      dest.district.toLowerCase().includes(q) ||
      dest.category.toLowerCase().includes(q) ||
      dest.shortDescription.toLowerCase().includes(q) ||
      dest.tags.some((t) => t.toLowerCase().includes(q)) ||
      (dest.history && dest.history.toLowerCase().includes(q));

    return (
      matchesRadius &&
      matchesDistanceRange &&
      matchesCategory &&
      matchesDistrict &&
      matchesDifficulty &&
      matchesTravelType &&
      matchesSearch
    );
  });

  // Category counts map
  const categoryCounts = DESTINATIONS.reduce((acc, dest) => {
    if (dest.distanceFromShivamogga <= selectedRadius) {
      acc[dest.category] = (acc[dest.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Instant search suggestions list
  const searchSuggestions = Array.from(
    new Set(
      DESTINATIONS.flatMap((d) => [d.name, d.district, d.category, ...d.tags])
    )
  ).filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase().trim())).slice(0, 6);

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setSelectedDistrict('All');
    setSelectedDistanceRange('All');
    setSelectedDifficulty('All');
    setSelectedTravelType('All');
    setSearchQuery('');
  };

  const featuredDestinations = DESTINATIONS.filter((d) => d.featured);

  return (
    <div className="min-h-screen bg-charcoal-950 text-cream-100 selection:bg-forest-600 selection:text-white relative">
      
      {/* Initial Loading Screen */}
      <LoadingScreen />

      {/* Navigation Header */}
      <Navbar
        onOpenSearch={() => scrollToSection('destinations')}
        onOpenNearMe={() => setIsNearMeOpen(true)}
        onNavigateSection={scrollToSection}
        savedPlacesCount={savedDestinationIds.length}
        activeSection={activeSection}
      />

      {/* Main Page Layout */}
      <main>
        {/* Section 6: Hero */}
        <Hero
          onExploreClick={() => scrollToSection('destinations')}
          onMapClick={() => scrollToSection('map')}
          destinationCount={DESTINATIONS.length}
        />

        {/* Section 7: Interactive 150 KM Radius */}
        <DistanceExplorer
          selectedRadius={selectedRadius}
          onRadiusChange={(radius) => setSelectedRadius(radius)}
          filteredCount={filteredDestinations.length}
        />

        {/* Section 11: Featured Crown Jewels Carousel */}
        <FeaturedCarousel
          featuredDestinations={featuredDestinations}
          onSelectDestination={handleSelectDestination}
        />

        {/* Section 19 & 20: Smart Search & Multi-District Filter Drawer */}
        <div className="pt-10">
          <SmartSearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedDistrict={selectedDistrict}
            onDistrictChange={setSelectedDistrict}
            selectedDistanceRange={selectedDistanceRange}
            onDistanceRangeChange={setSelectedDistanceRange}
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={setSelectedDifficulty}
            selectedTravelType={selectedTravelType}
            onTravelTypeChange={setSelectedTravelType}
            onResetFilters={resetAllFilters}
            suggestions={searchSuggestions}
          />
        </div>

        {/* Section 10: Places Worth Discovering (Destination Grid) */}
        <DestinationGrid
          destinations={filteredDestinations}
          onSelectDestination={handleSelectDestination}
          savedDestinationIds={savedDestinationIds}
          onToggleSaveDestination={handleToggleSaveDestination}
        />

        {/* Section 8 & 9: Main Interactive 150 KM Map */}
        <InteractiveMap
          destinations={DESTINATIONS}
          selectedRadius={selectedRadius}
          onRadiusChange={setSelectedRadius}
          onSelectDestination={handleSelectDestination}
          userLocation={userLocation}
          onUserLocationChange={setUserLocation}
        />

        {/* Section 4: Destination Category Explorer */}
        <CategoryExplorer
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            scrollToSection('destinations');
          }}
          categoryCounts={categoryCounts}
        />

        {/* Section 23: Smart Recommendations (Find Your Perfect Escape) */}
        <div id="escapes">
          <SmartRecommendations
            destinations={DESTINATIONS}
            onSelectDestination={handleSelectDestination}
          />
        </div>

        {/* Section 25 & 26: One Day Escapes & Hidden Gems */}
        <OneDayEscapes
          destinations={DESTINATIONS}
          onSelectDestination={handleSelectDestination}
        />

        {/* Section 27: Sunrise to Sunset Experience */}
        <SunriseSunsetSection
          destinations={DESTINATIONS}
          onSelectDestination={handleSelectDestination}
        />

        {/* Section 24: Shivamogga 150 Stories (Stories from the Western Ghats) */}
        <StoriesSection />

        {/* Section 22: Plan Your Shivamogga 150 Trip */}
        <TripPlanner
          destinations={DESTINATIONS}
          savedDestinationIds={savedDestinationIds}
          onRemoveFromTrip={handleRemoveFromTrip}
          onClearTrip={handleClearTrip}
          onSelectDestination={handleSelectDestination}
          userLocation={userLocation}
        />
      </main>

      {/* Section 29: Footer */}
      <Footer onNavigateSection={scrollToSection} />

      {/* Section 21: Near Me Geolocation Modal */}
      <NearMeModal
        isOpen={isNearMeOpen}
        onClose={() => setIsNearMeOpen(false)}
        destinations={DESTINATIONS}
        onSelectDestination={handleSelectDestination}
        userLocation={userLocation}
        setUserLocation={setUserLocation}
      />

      {/* Section 12: Destination Detail Page Modal */}
      <DestinationDetailModal
        destination={selectedDestination}
        onClose={handleCloseDestinationModal}
        isSaved={selectedDestination ? savedDestinationIds.includes(selectedDestination.id) : false}
        onToggleSave={handleToggleSaveDestination}
        allDestinations={DESTINATIONS}
        onSelectDestination={handleSelectDestination}
        userLocation={userLocation}
      />

    </div>
  );
};
