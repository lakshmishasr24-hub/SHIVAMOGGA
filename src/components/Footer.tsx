import React from 'react';
import { Compass, Heart, ShieldAlert } from 'lucide-react';

interface FooterProps {
  onNavigateSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateSection }) => {
  return (
    <footer className="bg-charcoal-950 text-cream-200 border-t border-forest-800/60 pt-16 pb-12 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-forest-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-forest-900/60">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-700 to-forest-900 border border-gold-500/40 flex items-center justify-center shadow-lg">
                <Compass className="w-5 h-5 text-gold-400" />
              </div>
              <span className="font-serif text-xl font-bold tracking-wider text-cream-100">
                EXPLORE SHIVAMOGGA
              </span>
            </div>

            <p className="text-sm text-forest-300 max-w-md font-light leading-relaxed">
              Discover the places, stories, and landscapes around Shivamogga and Karnataka's Western Ghats within 150 km radius.
            </p>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-950 border border-gold-500/30 text-gold-300 font-mono text-xs font-semibold shadow">
              <Heart className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
              <span>Made for explorers of Karnataka</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest text-gold-400 uppercase mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              {[
                { id: 'hero', label: 'Home' },
                { id: 'destinations', label: 'Destinations' },
                { id: 'map', label: 'Interactive Map' },
                { id: 'categories', label: 'Categories' },
                { id: 'planner', label: 'Trip Planner' },
                { id: 'stories', label: 'Stories of Shivamogga' },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigateSection(link.id)}
                    className="text-cream-300/80 hover:text-gold-300 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Key Regional Hubs */}
          <div>
            <h4 className="text-xs font-mono font-bold tracking-widest text-gold-400 uppercase mb-4">
              Western Ghats Taluks
            </h4>
            <ul className="space-y-2 text-xs text-forest-300 font-mono">
              <li>📍 Sagara (Jog Falls, Honnemaradu)</li>
              <li>📍 Hosanagara (Kodachadri, Nagara)</li>
              <li>📍 Thirthahalli (Agumbe, Kuppali)</li>
              <li>📍 Soraba (Gudavi Sanctuary)</li>
              <li>📍 Tarikere & Chikkamagaluru</li>
            </ul>
          </div>

        </div>

        {/* Bottom Disclaimers & Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-forest-400 font-mono">
          <div>
            © {new Date().getFullYear()} Explore Shivamogga Guide. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-earth-400" />
              Reliable Tourism Data Disclaimer
            </span>
            <span>Image Credits: Unsplash & Public Heritage Archives</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
