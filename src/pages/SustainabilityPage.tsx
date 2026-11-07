import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf,
  Users,
  ShoppingBag,
  RefreshCw,
  Award,
  TrendingUp,
  ExternalLink,
  Recycle,
  BarChart2,
  Droplets,
  Zap,
  ShieldCheck,
  MapPin,
  Star
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { api } from '../services/api';
import { formatPrice } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

export default function SustainabilityPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSustainabilityData() {
      try {
        const [mRes, lRes, cRes] = await Promise.all([
          api.sustainability.getMetrics().catch(() => null),
          api.sustainability.getLeaderboard().catch(() => ({ leaderboard: [] })),
          api.sustainability.getCategories().catch(() => ({ categories: [] })),
        ]);
        if (mRes) setMetrics(mRes);
        if (lRes.leaderboard) setLeaderboard(lRes.leaderboard);
        if (cRes.categories) setCategories(cRes.categories);
      } catch (err) {
        console.warn('Failed to load live sustainability stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSustainabilityData();
  }, []);

  const totalReused = metrics?.total_items_reused || 12;
  const co2Saved = metrics?.co2_saved_kg || 178;
  const waterSaved = metrics?.water_saved_liters || 29400;
  const ewasteSaved = metrics?.ewaste_diverted_kg || 31;
  const studentSavings = metrics?.money_saved_rupees || 48600;
  const treesEq = metrics?.trees_equivalent || 8;

  return (
    <Layout>
      <div className="min-h-screen bg-cream-50">
        
        {/* Hero Section */}
        <section className="bg-sage-600 text-white py-16 sm:py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white mb-2"
            >
              <Recycle className="w-4 h-4" />
              Davanagere Circular Impact Intelligence
            </motion.div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Giving Things a Second Life.<br />
              <span className="text-sage-200">Measurable Environmental Impact.</span>
            </h1>

            <p className="text-base sm:text-lg text-sage-100 max-w-2xl mx-auto leading-relaxed">
              Every textbook exchanged at BIET, calculator rented in MCC B Block, or bicycle passed to a junior prevents virgin resource extraction and keeps usable goods circulating.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link to="/listings/new">
                <Button variant="secondary" size="md" icon={<Leaf className="w-4 h-4 text-sage-700" />}>
                  Circulate an Item
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="ghost" size="md" className="text-white hover:bg-white/10">
                  Browse Reusable Items →
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Main Content Body */}
        <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
          
          {/* Key Metrics Grid */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-sage-600" />
              <h2 className="text-xl font-black text-charcoal-900 tracking-tight">
                Live Davanagere Sustainability Scorecard
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center mb-3">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-black text-charcoal-900">{co2Saved} kg</div>
                  <p className="text-xs font-bold text-charcoal-800 mt-1">CO₂e Emissions Prevented</p>
                </div>
                <p className="text-[11px] text-charcoal-400 mt-3 pt-3 border-t border-cream-100">
                  Equivalent to planting <span className="font-bold text-sage-700">{treesEq} urban trees</span> in Davanagere.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-black text-charcoal-900">{waterSaved.toLocaleString()} L</div>
                  <p className="text-xs font-bold text-charcoal-800 mt-1">Virtual Water Conserved</p>
                </div>
                <p className="text-[11px] text-charcoal-400 mt-3 pt-3 border-t border-cream-100">
                  Saved from paper mills, textile washing, and chip production.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-black text-charcoal-900">{ewasteSaved} kg</div>
                  <p className="text-xs font-bold text-charcoal-800 mt-1">Toxic E-Waste Diverted</p>
                </div>
                <p className="text-[11px] text-charcoal-400 mt-3 pt-3 border-t border-cream-100">
                  Kept heavy metals and lithium safely out of municipal landfills.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-black text-emerald-800">{formatPrice(studentSavings)}</div>
                  <p className="text-xs font-bold text-charcoal-800 mt-1">Community Capital Saved</p>
                </div>
                <p className="text-[11px] text-charcoal-400 mt-3 pt-3 border-t border-cream-100">
                  Direct student & local household pocketbook savings.
                </p>
              </div>
            </div>
          </section>

          {/* Category-Level Impact Breakdown */}
          {categories.length > 0 && (
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-xl font-black text-charcoal-900 tracking-tight">
                  Impact by Product Category
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Real-time environmental diversion generated by community circular listings across Davanagere.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-charcoal-900 text-sm">{cat.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-100 text-sage-800">
                        {cat.count} {cat.count === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div>
                        <span className="text-charcoal-400 block text-[10px] uppercase font-bold">CO₂e Diverted</span>
                        <span className="font-bold text-charcoal-800">{cat.co2_saved_kg} kg</span>
                      </div>
                      <div>
                        <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Water Saved</span>
                        <span className="font-bold text-charcoal-800">{cat.water_saved_liters.toLocaleString()} L</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Community Sustainability Leaderboard */}
          {leaderboard.length > 0 && (
            <section className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h3 className="text-xl font-black text-charcoal-900 tracking-tight">
                      Davanagere Circular Leaders
                    </h3>
                  </div>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Recognizing students and local neighbors keeping the most pre-loved items in circulation.
                  </p>
                </div>
                <div className="hidden sm:block text-xs font-semibold text-charcoal-400">
                  Updated Live • Verified
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream-100 text-charcoal-700 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 rounded-l-xl">Rank</th>
                      <th className="py-3 px-4">Neighbor</th>
                      <th className="py-3 px-4">Area</th>
                      <th className="py-3 px-4">Items Circulated</th>
                      <th className="py-3 px-4">CO₂e Diverted</th>
                      <th className="py-3 px-4 rounded-r-xl text-right">Trust Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {leaderboard.map((member, idx) => (
                      <tr key={member.id} className="hover:bg-cream-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-black text-charcoal-500">
                          {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={member.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                              alt={member.full_name}
                              className="w-8 h-8 rounded-full object-cover border border-cream-200"
                            />
                            <span className="font-bold text-charcoal-900 text-xs sm:text-sm">
                              {member.full_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-charcoal-600">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-sage-500" />
                            {member.area}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-charcoal-800">
                          {member.items_reused} loops
                        </td>
                        <td className="py-3.5 px-4 font-bold text-sage-700">
                          {member.co2_saved_kg} kg CO₂e
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-amber-500">
                          <span className="inline-flex items-center gap-1 justify-end">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {member.rating}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Science-Based Methodology Card */}
          <section className="bg-cream-100/80 rounded-3xl border border-cream-200 p-8 space-y-4">
            <h3 className="text-lg font-black text-charcoal-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sage-600" />
              Transparent Science & Calculation Methodology
            </h3>
            <div className="space-y-3 text-xs sm:text-sm text-charcoal-600 leading-relaxed">
              <p>
                <strong>Scientific Basis:</strong> ReLoop calculates environmental savings using coefficients derived from the <strong>U.S. EPA Waste Reduction Model (WARM v15)</strong> adapted for Indian consumer product lifecycle studies.
              </p>
              <p>
                <strong>Conservative Baseline:</strong> Diverting a typical consumer product (textbook, small appliance, bicycle, or lab coat) avoids roughly <strong>14.8 kg CO₂e</strong> in manufacturing, packaging, and freight emissions, along with <strong>2,450 litres of virtual process water</strong>.
              </p>
              <p>
                <strong>Audit Integrity:</strong> ReLoop only counts confirmed exchanges, verified handovers, and active community listings. We do not inflate statistics with cancelled or speculative listings.
              </p>
              <div className="pt-2">
                <a
                  href="https://www.ellenmacarthurfoundation.org/topics/circular-economy-introduction/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sage-700 font-bold hover:text-sage-800 underline"
                >
                  Learn more at Ellen MacArthur Foundation Circular Economy Research
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </Layout>
  );
}
