import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
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
  activeSection,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollYRef = useRef(0);

  // Framer Motion scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  // Track scroll direction for smart hide/show header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      // Hide navbar when scrolling down fast past 120px; show when scrolling up
      if (currentScrollY > 120 && currentScrollY > lastScrollYRef.current + 6) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollYRef.current - 6 || currentScrollY <= 60) {
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
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
    <>
      {/* Scroll Progress Bar at the Top Edge */}
      <motion.div
        style={{ scaleX }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-forest-500 via-gold-400 to-forest-300 z-[100] origin-left shadow-[0_0_12px_rgba(212,175,55,0.7)]"
      />

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full pointer-events-none'
        } ${
          isScrolled
            ? 'bg-charcoal-950/85 backdrop-blur-xl border-b border-forest-800/40 py-3 shadow-2xl shadow-black/50'
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
                Gateway to Western Ghats
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 bg-charcoal-900/60 backdrop-blur-md border border-forest-800/40 px-3.5 py-1.5 rounded-full shadow-inner">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs xl:text-sm font-medium transition-all duration-200 hover-underline-animation ${
                  activeSection === link.id
                    ? 'bg-forest-800 text-gold-300 shadow-md border border-gold-500/30'
                    : 'text-cream-200 hover:text-white hover:bg-forest-900/40'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2.5 rounded-xl bg-charcoal-900/80 hover:bg-forest-900/80 border border-forest-800/50 text-cream-200 hover:text-gold-300 transition-all shadow-md group"
              title="Search destinations"
              aria-label="Search destinations"
            >
              <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>

            {/* Near Me GPS Trigger */}
            <button
              onClick={onOpenNearMe}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-charcoal-900/80 hover:bg-forest-900/80 border border-forest-800/50 text-cream-200 hover:text-gold-300 transition-all text-xs font-mono shadow-md group"
              title="Find attractions near my location"
            >
              <MapPin className="w-3.5 h-3.5 text-gold-400 group-hover:animate-bounce" />
              <span>Near Me</span>
            </button>

            {/* Saved Places Trip Drawer Trigger */}
            <button
              onClick={() => handleNavClick('planner')}
              className="p-2.5 rounded-xl bg-charcoal-900/80 hover:bg-forest-900/80 border border-forest-800/50 text-cream-200 hover:text-gold-300 transition-all shadow-md relative"
              title="Saved Trip Destinations"
              aria-label="Saved Destinations"
            >
              <Bookmark className="w-4 h-4" />
              {savedPlacesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold-500 text-charcoal-950 font-bold text-[10px] flex items-center justify-center shadow">
                  {savedPlacesCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-charcoal-900/80 hover:bg-forest-900/80 border border-forest-800/50 text-cream-200 hover:text-gold-300 transition-all"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-charcoal-950/95 backdrop-blur-2xl border-b border-forest-800/50 px-4 pt-3 pb-6 flex flex-col gap-2 shadow-2xl"
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`py-2.5 px-4 rounded-xl text-left text-sm font-medium transition-all ${
                  activeSection === link.id
                    ? 'bg-forest-800 text-gold-300 font-bold border border-gold-500/30'
                    : 'text-cream-200 hover:bg-forest-900/50'
                }`}
              >
                {link.label}
              </button>
            ))}

            <button
              onClick={() => {
                onOpenNearMe();
                setMobileMenuOpen(false);
              }}
              className="mt-2 py-2.5 px-4 rounded-xl bg-forest-900/70 text-gold-300 text-left text-sm font-mono flex items-center gap-2 border border-forest-700/60"
            >
              <MapPin className="w-4 h-4 text-gold-400" />
              <span>Attractions Near Me (GPS)</span>
            </button>
          </motion.div>
        )}
      </header>
    </>
  );
};
