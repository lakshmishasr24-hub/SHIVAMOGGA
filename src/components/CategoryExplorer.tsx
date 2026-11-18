import React from 'react';
import { motion } from 'framer-motion';
import type { CategoryType } from '../types/destination';
import { Compass, ArrowRight } from 'lucide-react';

interface CategoryExplorerProps {
  onSelectCategory: (category: CategoryType) => void;
  categoryCounts: Record<string, number>;
}

interface CategoryCardData {
  id: CategoryType;
  title: string;
  tagline: string;
  description: string;
  image: string;
  icon: string;
}

const CATEGORIES_DATA: CategoryCardData[] = [
  {
    id: 'Waterfalls',
    title: 'WATERFALLS',
    tagline: 'Roaring Cascades & Deep Gorges',
    description: 'Discover spectacular waterfalls including Jog Falls, Barkana, Hebbe, and Dabbe surrounded by virgin forests.',
    image: '/photos/jog-falls/1.jpg',
    icon: '💧',
  },
  {
    id: 'Wildlife',
    title: 'WILDLIFE',
    tagline: 'Sanctuaries & Biodiversity',
    description: 'Explore Bhadra Tiger Reserve, Sakrebyle Elephant Camp, and bird sanctuaries at Mandagadde & Gudavi.',
    image: '/photos/bhadra-wildlife-sanctuary/1.jpg',
    icon: '🐘',
  },
  {
    id: 'Trekking',
    title: 'HILLS & TREKKING',
    tagline: 'Misty Mountains & Peaks',
    description: 'Find scenic peaks including Kodachadri, Kemmangundi Z-Point, and Hidlumane forest waterfall trails.',
    image: '/photos/kodachadri-peak/1.jpg',
    icon: '🥾',
  },
  {
    id: 'Temples',
    title: 'TEMPLES',
    tagline: 'Vedic Heritage & Sacred Shrines',
    description: 'Explore historic spiritual centers including Sringeri Sharada Peetham, Varadapura Ashram, and Sanskrit village Mattur.',
    image: '/photos/sringeri-sharada-peetham/1.jpg',
    icon: '🛕',
  },
  {
    id: 'Historical Places',
    title: 'HISTORY',
    tagline: 'Forts & Keladi Monuments',
    description: 'Discover Kavaledurga 7-layered fort, Nagara Shivappa Nayaka fort, and Keladi & Ikkeri granite temples.',
    image: '/photos/kavaledurga-fort/1.jpg',
    icon: '🏛',
  },
  {
    id: 'Adventure',
    title: 'ADVENTURE',
    tagline: 'Kayaking & Outdoor Sports',
    description: 'Find coracle rides & island kayaking at Honnemaradu backwaters and jeep safaris.',
    image: '/photos/honnemaradu/1.jpg',
    icon: '🧗',
  },
  {
    id: 'Nature',
    title: 'NATURE',
    tagline: 'Rivers, Dams & Valleys',
    description: 'Explore Gajanur Dam on Tunga river, Linganamakki reservoir expanse, and lush Western Ghats forest fringes.',
    image: '/photos/gajanur-dam/1.jpg',
    icon: '🌿',
  },
  {
    id: 'Viewpoints',
    title: 'VIEWPOINTS',
    tagline: 'Sunset & Sea of Clouds',
    description: 'Experience Agumbe sunset point, Kundadri Jain hill cloud sea, and panoramic valley decks.',
    image: '/photos/agumbe-sunset-point/1.jpg',
    icon: '📍',
  },
  {
    id: 'Beaches',
    title: 'BEACHES',
    tagline: 'Coastal Gateways',
    description: 'Explore Murudeshwar beach and giant Shiva statue along the Arabian sea within 150 km.',
    image: '/photos/murudeshwar-temple/1.jpg',
    icon: '🌊',
  }
];

export const CategoryExplorer: React.FC<CategoryExplorerProps> = ({
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <section id="categories" className="py-20 bg-charcoal-900/30 border-t border-forest-800/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono tracking-widest text-gold-400 uppercase flex items-center justify-center gap-2 mb-2">
            <Compass className="w-4 h-4 text-gold-400" />
            Tailored Experience Types
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-cream-100 uppercase tracking-wide">
            Explore by Category
          </h2>
          <p className="mt-3 text-base text-forest-300 font-light">
            Select your passion to view matching destinations across Shivamogga and the Malnad region.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES_DATA.map((cat, idx) => {
            const count = categoryCounts[cat.id] || 0;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => onSelectCategory(cat.id)}
                className="group relative rounded-3xl overflow-hidden h-72 cursor-pointer border border-forest-800/40 hover:border-gold-500/60 shadow-xl transition-all duration-500 hover:-translate-y-1.5"
              >
                {/* Image background */}
                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out filter brightness-[0.7]"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl bg-charcoal-950/60 p-2 rounded-2xl border border-forest-700/50 backdrop-blur-md">
                      {cat.icon}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-forest-900/90 border border-gold-500/30 text-gold-300 font-mono font-bold text-xs shadow">
                      {count} {count === 1 ? 'place' : 'places'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold font-serif text-white tracking-wider group-hover:text-gold-300 transition-colors flex items-center justify-between">
                      <span>{cat.title}</span>
                      <ArrowRight className="w-5 h-5 text-gold-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-xs font-semibold text-gold-400 mt-0.5">{cat.tagline}</p>
                    <p className="text-xs text-cream-200/80 mt-2 line-clamp-2 font-light">
                      {cat.description}
                    </p>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
