import React from 'react';
import { motion } from 'framer-motion';
import { STORIES } from '../data/stories';
import { BookOpen, Quote, Compass } from 'lucide-react';

export const StoriesSection: React.FC = () => {
  return (
    <section id="stories" className="py-24 bg-charcoal-950 relative overflow-hidden">
      
      {/* Background ambient forest glow */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-forest-800/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-mono tracking-widest text-gold-400 uppercase flex items-center justify-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-gold-400" />
            Digital Travel Magazine
          </span>
          <h2 className="text-4xl sm:text-6xl font-serif font-bold text-cream-100 uppercase tracking-tight">
            Stories of Shivamogga
          </h2>
          <p className="mt-3 text-base sm:text-lg text-forest-300 font-light leading-relaxed">
            Beyond tourist details lie centuries of legend, ancient forest lore, and timeless natural grandeur.
          </p>
        </div>

        {/* Stories Vertical Timeline Layout */}
        <div className="space-y-24">
          {STORIES.map((story, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8 }}
                className={`flex flex-col lg:flex-row items-center gap-10 sm:gap-14 ${
                  isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Visual Image */}
                <div className="w-full lg:w-1/2 relative rounded-3xl overflow-hidden shadow-2xl group border border-forest-700/40">
                  <div className="h-[380px] sm:h-[460px] overflow-hidden">
                    <img
                      src={story.image}
                      alt={story.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-[0.85]"
                    />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent" />

                  {/* Destination Badge */}
                  <div className="absolute bottom-6 left-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charcoal-950/90 border border-gold-500/30 text-gold-300 font-mono text-xs font-bold shadow">
                    <Compass className="w-3.5 h-3.5" />
                    <span>{story.destinationName}</span>
                  </div>
                </div>

                {/* Editorial Content */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                  <span className="text-xs font-mono font-bold tracking-widest text-gold-400 uppercase mb-2">
                    {story.subtitle}
                  </span>

                  <h3 className="text-2xl sm:text-4xl font-serif font-extrabold text-cream-100 tracking-tight leading-snug">
                    {story.title}
                  </h3>

                  <div className="mt-6 space-y-4 text-sm sm:text-base text-cream-200/90 font-light leading-relaxed">
                    {story.content.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Quote Banner */}
                  <div className="mt-8 p-4 rounded-2xl bg-charcoal-900/80 border-l-4 border-gold-400 border-r border-t border-b border-forest-800/40">
                    <div className="flex items-start gap-3">
                      <Quote className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs sm:text-sm font-serif italic text-cream-100">
                          "{story.quote}"
                        </p>
                        <span className="block text-[11px] font-mono text-forest-300 mt-1 uppercase tracking-wider">
                          — {story.quoteAuthor}
                        </span>
                      </div>
                    </div>
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
