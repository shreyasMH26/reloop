import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { DoodleCrewFooterDemo } from '@/components/ui/doodle-crew-footer-demo';
import { ClothingRailHeroDemo } from '@/components/ui/product-rail-gallery-demo';
import { Sparkles, Shirt, Palette, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ShowcasePage() {
  const [activeTab, setActiveTab] = useState<'both' | 'rail' | 'footer'>('both');

  return (
    <div className="min-h-screen bg-cream-50 text-charcoal-900 flex flex-col">
      <Navbar />

      {/* Header Banner */}
      <section className="bg-white border-b border-cream-200 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sage-600 mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Interactive Component Showcase</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal-900">
                ReLoop UI Design Lab
              </h1>
              <p className="text-sm text-charcoal-600 mt-1">
                Integrated interactive components styled with ReLoop tokens under{' '}
                <code className="bg-cream-100 text-sage-700 px-1.5 py-0.5 rounded text-xs font-mono">
                  @/components/ui/
                </code>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-charcoal-700 bg-cream-100 hover:bg-cream-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
              </Link>
              <div className="flex bg-cream-100 p-1 rounded-xl border border-cream-200">
                <button
                  onClick={() => setActiveTab('both')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'both' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  All Showcase
                </button>
                <button
                  onClick={() => setActiveTab('rail')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'rail' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  <Shirt className="w-3.5 h-3.5" /> Rail Gallery
                </button>
                <button
                  onClick={() => setActiveTab('footer')}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'footer' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" /> Doodle Footer
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {(activeTab === 'both' || activeTab === 'rail') && (
          <section className="border-b border-cream-200 bg-cream-50 py-10">
            <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
              <span className="text-xs uppercase font-bold tracking-widest text-sage-600">Feature 1</span>
              <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900">
                Physics-Driven Clothing & Gear Rail
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 max-w-xl mx-auto mt-1">
                Slide across the rail to browse garments, rotate pieces 360°, inspect details, and open high-resolution modal previews.
              </p>
            </div>
            <div className="w-full overflow-hidden">
              <ClothingRailHeroDemo autoplay={true} />
            </div>
          </section>
        )}

        {(activeTab === 'both' || activeTab === 'footer') && (
          <section className="bg-cream-100 flex-1">
            <div className="max-w-7xl mx-auto px-4 pt-10 pb-4 text-center">
              <span className="text-xs uppercase font-bold tracking-widest text-sage-600">Feature 2</span>
              <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900">
                Hand-Drawn Sketchbook Animated Footer
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 max-w-xl mx-auto mt-1">
                Interactive sketchbook characters that follow your cursor, blink, hop on click, and speak dialogue. Choose presets like ReLoop, Sunny, Paper, or Night!
              </p>
            </div>
            <DoodleCrewFooterDemo />
          </section>
        )}
      </main>
    </div>
  );
}
