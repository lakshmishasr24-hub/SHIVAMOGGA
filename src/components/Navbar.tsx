import React, { useState, useEffect } from 'react';
import { Compass, Search, MapPin, Bookmark, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenNearMe: () => void;
  onNavigateSection: (sectionId: string) => void;
  savedPlacesCount: number;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenNearMe,
  onNavigateSection,
  savedPlacesCount,
  activeSection
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'destinations', label: 'Explore 150 KM' },
    { id: 'map', label: 'Interactive Map' },
    { id: 'categories', label: 'Categories' },
    { id: 'escapes', label: 'Perfect Escapes' },
    { id: 'planner', label: 'Trip Planner' },
    { id: 'stories', label: 'Stories' },
  ];

  const handleNavClick = (id: string) => {
    onNavigateSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-charcoal-950/85 backdrop-blur-md border-b border-forest-800/40 py-3 shadow-xl shadow-black/40'
          : 'bg-gradient-to-b from-charcoal-950/90 via-charcoal-950/40 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('hero')}
          className="flex items-center gap-3 group text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-700 to-forest-900 border border-gold-500/40 flex items-center justify-center shadow-lg group-hover:border-gold-400 transition-all duration-300">
            <Compass className="w-5 h-5 text-gold-400 group-hover:rotate-45 transition-transform duration-500" />
          </div>
          <div>
            <span className="block font-serif text-lg sm:text-xl font-bold tracking-wider text-cream-100 group-hover:text-gold-300 transition-colors">
              SHIVAMOGGA <span className="text-gold-400">150</span>
            </span>
            <span className="block text-[10px] tracking-widest text-forest-300 font-mono uppercase">
              Discover Karnataka within 150 KM
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 bg-charcoal-900/60 backdrop-blur-md border border-forest-800/30 px-3 py-1.5 rounded-full">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-medium transition-all duration-200 ${
                activeSection === link.id
                  ? 'bg-forest-800 text-gold-300 shadow-md border border-gold-500/20'
                  : 'text-cream-200 hover:text-white hover:bg-forest-900/40'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Action Icons & Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Smart Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="p-2.5 rounded-xl bg-charcoal-900/80 hover:bg-forest-900/80 border border-forest-800/50 text-cream-200 hover:text-gold-300 transition-all shadow-md group"
            title="Search destinations"
            aria-label="Search destinations"
          >
            <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          {/* Near Me Feature Button */}
          <button
            onClick={onOpenNearMe}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-forest-900/80 hover:bg-forest-800 border border-gold-500/30 text-cream-100 hover:text-gold-300 text-xs font-medium transition-all shadow-md group"
          >
            <MapPin className="w-4 h-4 text-gold-400 group-hover:animate-bounce" />
            <span>Near Me</span>
          </button>

          {/* Saved Places / Trip Count */}
          <button
            onClick={() => handleNavClick('planner')}
            className="relative p-2.5 rounded-xl bg-charcoal-900/80 hover:bg-forest-900/80 border border-forest-800/50 text-cream-200 hover:text-gold-300 transition-all shadow-md"
            title="My Saved Trip"
            aria-label="My Saved Trip"
          >
            <Bookmark className="w-4 h-4" />
            {savedPlacesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold-500 text-charcoal-950 font-bold text-[10px] flex items-center justify-center animate-pulse">
                {savedPlacesCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-charcoal-900/80 border border-forest-800/50 text-cream-200 hover:text-white"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-full bg-charcoal-950/95 backdrop-blur-xl border-b border-forest-800/60 p-6 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeSection === link.id
                    ? 'bg-forest-900/90 text-gold-300 border border-gold-500/30'
                    : 'text-cream-200 hover:bg-charcoal-900'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-forest-900/60 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenNearMe();
              }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-forest-800 text-gold-300 font-semibold text-sm border border-gold-500/40 shadow-lg"
            >
              <MapPin className="w-4 h-4 text-gold-400" />
              <span>Explore Near Me (GPS)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
