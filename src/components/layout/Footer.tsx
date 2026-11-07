import React from 'react';
import { Link } from 'react-router-dom';
import { Repeat, Heart, MapPin, Globe, ShieldCheck, Mail, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-cream-100 border-t border-cream-300 text-charcoal-700 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-cream-300">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sage-500 text-white flex items-center justify-center shadow-xs">
                <Repeat className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-charcoal-900">
                ReLoop
              </span>
            </Link>
            
            <p className="text-sm text-charcoal-600 max-w-sm leading-relaxed">
              Give Things a Second Life. A community marketplace for buying, selling, renting, 
              and exchanging pre-owned items within local neighborhoods.
            </p>

            <div className="flex items-center gap-2 text-xs font-medium text-sage-800 bg-sage-50 border border-sage-200/80 px-3 py-1.5 rounded-lg w-fit">
              <MapPin className="w-3.5 h-3.5 text-sage-600" />
              <span>Pilot Launch: Davanagere, Karnataka</span>
            </div>

            <p className="text-xs text-charcoal-500 leading-normal">
              VTU 2025 Community / Societal Project (Course 1BCP308) • Circular Economy Initiative
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
              Marketplace
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/marketplace" className="text-charcoal-600 hover:text-sage-600 transition-colors">
                  All Listings
                </Link>
              </li>
              <li>
                <Link to="/marketplace?type=sell" className="text-charcoal-600 hover:text-sage-600 transition-colors">
                  Buy Pre-owned
                </Link>
              </li>
              <li>
                <Link to="/marketplace?type=rent" className="text-charcoal-600 hover:text-sage-600 transition-colors">
                  Rent Equipment
                </Link>
              </li>
              <li>
                <Link to="/marketplace?type=exchange" className="text-charcoal-600 hover:text-sage-600 transition-colors">
                  Item Exchange
                </Link>
              </li>
              <li>
                <Link to="/listings/new" className="text-charcoal-600 hover:text-sage-600 transition-colors flex items-center gap-1">
                  List Your Item <ArrowUpRight className="w-3 h-3 text-sage-500" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Impact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
              Community
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/map" className="text-charcoal-600 hover:text-sage-600 transition-colors">
                  Neighborhood Map
                </Link>
              </li>
              <li>
                <Link to="/sustainability" className="text-charcoal-600 hover:text-sage-600 transition-colors">
                  Sustainability Metric
                </Link>
              </li>
              <li>
                <Link to="/showcase" className="text-charcoal-600 hover:text-sage-600 transition-colors">
                  Interactive Showcase
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="text-charcoal-600 hover:text-sage-600 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <span className="text-xs text-charcoal-500">
                  College Communities
                </span>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
              Safety & Trust
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-1.5 text-charcoal-600">
                <ShieldCheck className="w-4 h-4 text-sage-600" />
                <span>Verified Handover</span>
              </li>
              <li className="text-xs text-charcoal-500">
                Addresses are never publicly broadcasted. Only approximate neighborhood clusters are shown.
              </li>
              <li className="pt-2">
                <span className="text-xs font-medium text-charcoal-600 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-sage-600" /> support@reloop.in
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
          <p>© {new Date().getFullYear()} ReLoop. Crafted for sustainable local circular communities.</p>
          <div className="flex items-center gap-2">
            <span>Built with care for a cleaner future</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>

      </div>
    </footer>
  );
};
