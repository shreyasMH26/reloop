import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Layers, 
  ShoppingBag, 
  Calendar, 
  ArrowRightLeft, 
  Heart, 
  MessageSquare, 
  Settings, 
  PlusCircle, 
  LogOut,
  User
} from 'lucide-react';
import { Layout } from './Layout';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: Layers },
    { label: 'My Listings', path: '/dashboard/listings', icon: ShoppingBag },
    { label: 'Requests', path: '/dashboard/requests', icon: ArrowRightLeft },
    { label: 'Orders & Sales', path: '/dashboard/orders', icon: Calendar },
    { label: 'Saved Wishlist', path: '/dashboard/wishlist', icon: Heart },
    { label: 'Messages', path: '/dashboard/messages', icon: MessageSquare },
    { label: 'Profile Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Layout>
      <div className="bg-cream-50 min-h-[calc(100vh-80px)] py-8 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sidebar */}
            <aside className="lg:col-span-3 bg-white rounded-3xl p-6 border border-cream-200 shadow-card space-y-6">
              
              {/* User Mini Profile */}
              <div className="flex items-center gap-3 pb-6 border-b border-cream-200">
                <div className="w-12 h-12 rounded-2xl bg-sage-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-charcoal-900 text-sm truncate">
                    {profile?.full_name || 'Member'}
                  </h3>
                  <p className="text-xs text-charcoal-400 truncate">
                    {user?.email || 'member@reloop.in'}
                  </p>
                  <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider text-sage-700 bg-sage-50 px-2 py-0.5 rounded-full border border-sage-200">
                    {profile?.role || 'User'}
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                        active
                          ? 'bg-sage-600 text-white shadow-xs'
                          : 'text-charcoal-700 hover:bg-cream-100 hover:text-charcoal-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-sage-600'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Post Item Action */}
              <div className="pt-4 border-t border-cream-200 space-y-2">
                <Link to="/listings/new">
                  <Button variant="primary" fullWidth size="sm" icon={<PlusCircle className="w-4 h-4" />}>
                    List New Item
                  </Button>
                </Link>

                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>

            </aside>

            {/* Right Main Content */}
            <main className="lg:col-span-9 bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card min-h-[500px]">
              {children}
            </main>

          </div>

        </div>
      </div>
    </Layout>
  );
};
