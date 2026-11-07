import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Repeat, 
  PlusCircle, 
  Compass, 
  Leaf, 
  ShoppingBag, 
  LogOut, 
  Menu, 
  X,
  Layers,
  MessageSquare,
  Heart,
  Calendar,
  Bell,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { api } from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Load unread notifications when logged in
  const loadNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.notifications.list();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    } catch {
      // ignore in offline/auth failure
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      try {
        await api.notifications.markAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // ignore
      }
    }
    setNotifDropdownOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Explore', path: '/explore', icon: ShoppingBag },
    { label: 'Explore Map', path: '/map', icon: Compass },
    { label: 'Impact', path: '/sustainability', icon: Leaf },
    { label: 'Design Lab', path: '/showcase', icon: Layers },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isAdmin = profile?.role === 'admin';

  return (
    <nav className="sticky top-0 z-40 bg-cream-50/90 backdrop-blur-md border-b border-cream-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-sage-500 text-white flex items-center justify-center shadow-sm group-hover:bg-sage-600 transition-colors">
              <Repeat className="w-5 h-5 transition-transform group-hover:rotate-180 duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-charcoal-900 group-hover:text-sage-600 transition-colors">
                ReLoop
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-charcoal-400 -mt-1 hidden sm:inline">
                Davanagere
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? 'text-sage-700 bg-sage-100/60 font-semibold shadow-xs'
                      : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-sage-600" />
                  {link.label}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  location.pathname.startsWith('/admin')
                    ? 'text-amber-800 bg-amber-100/80 font-semibold shadow-xs'
                    : 'text-amber-700 hover:text-amber-900 hover:bg-amber-50'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                Admin
              </Link>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/listings/new">
              <Button
                variant="primary"
                size="sm"
                icon={<PlusCircle className="w-4 h-4" />}
                className="shadow-sm"
              >
                List Item
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="p-2 rounded-xl border border-cream-300 hover:border-sage-300 hover:bg-cream-100 transition-all text-charcoal-600 relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notifDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-modal border border-cream-200 py-3 z-50 animate-fade-in"
                      onMouseLeave={() => setNotifDropdownOpen(false)}
                    >
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-cream-100">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-charcoal-900">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-100 text-sage-800">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="text-xs text-sage-600 hover:text-sage-800 font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-cream-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-charcoal-400">
                            No notifications yet. Activity will appear here!
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3.5 hover:bg-cream-50 cursor-pointer transition-colors flex gap-3 text-left ${
                                !notif.is_read ? 'bg-sage-50/40' : ''
                              }`}
                            >
                              <div className="mt-0.5">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                    notif.is_read
                                      ? 'bg-cream-200 text-charcoal-500'
                                      : 'bg-sage-200 text-sage-800'
                                  }`}
                                >
                                  <Bell className="w-3.5 h-3.5" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-charcoal-800 leading-tight">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-charcoal-600 line-clamp-2 mt-0.5">
                                  {notif.message}
                                </p>
                                <p className="text-[10px] text-charcoal-400 mt-1">
                                  {new Date(notif.created_at).toLocaleDateString([], {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                              {!notif.is_read && (
                                <div className="w-2 h-2 rounded-full bg-sage-500 self-center" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar & Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-cream-300 hover:border-sage-300 hover:bg-cream-100 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sage-200 text-sage-800 flex items-center justify-center font-bold text-sm">
                      {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="hidden lg:block text-xs pr-1">
                      <p className="font-semibold text-charcoal-800 truncate max-w-[100px]">
                        {profile?.full_name || 'Member'}
                      </p>
                      <p className="text-charcoal-400 capitalize">{profile?.role || 'User'}</p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-modal border border-cream-200 py-2 z-50 animate-fade-in"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-cream-100">
                        <p className="text-xs text-charcoal-400">Signed in as</p>
                        <p className="text-sm font-bold text-charcoal-900 truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 font-bold bg-amber-50 hover:bg-amber-100 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-amber-600" />
                            Admin Console
                          </Link>
                        )}
                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-charcoal-700 hover:bg-cream-50 hover:text-sage-600 transition-colors"
                        >
                          <Layers className="w-4 h-4 text-charcoal-400" />
                          Dashboard
                        </Link>
                        <Link
                          to="/dashboard/listings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-charcoal-700 hover:bg-cream-50 hover:text-sage-600 transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-charcoal-400" />
                          My Listings
                        </Link>
                        <Link
                          to="/dashboard/requests"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-charcoal-700 hover:bg-cream-50 hover:text-sage-600 transition-colors"
                        >
                          <Repeat className="w-4 h-4 text-charcoal-400" />
                          Purchase Requests
                        </Link>
                        <Link
                          to="/dashboard/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-charcoal-700 hover:bg-cream-50 hover:text-sage-600 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-charcoal-400" />
                          Order History
                        </Link>
                        <Link
                          to="/dashboard/messages"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-charcoal-700 hover:bg-cream-50 hover:text-sage-600 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 text-charcoal-400" />
                          Messages
                        </Link>
                        <Link
                          to="/dashboard/wishlist"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-charcoal-700 hover:bg-cream-50 hover:text-sage-600 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-charcoal-400" />
                          Wishlist
                        </Link>
                      </div>

                      <div className="border-t border-cream-100 pt-1">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/login?signup=true">
                  <Button variant="secondary" size="sm">
                    Join
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/listings/new">
              <Button variant="primary" size="sm" className="px-3 py-1.5 text-xs">
                List
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-charcoal-700 hover:bg-cream-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cream-200 bg-cream-50 px-4 pt-3 pb-6 space-y-3 animate-slide-up">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium ${
                    isActive(link.path)
                      ? 'text-sage-700 bg-sage-100/70 font-semibold'
                      : 'text-charcoal-700 hover:bg-cream-100'
                  }`}
                >
                  <Icon className="w-5 h-5 text-sage-600" />
                  {link.label}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-bold text-amber-800 bg-amber-100/80"
              >
                <Shield className="w-5 h-5 text-amber-600" />
                Admin Console
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-cream-200">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-charcoal-800">
                    {profile?.full_name || user.email}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-sage-100 text-sage-800 font-medium">
                    {profile?.role || 'Member'}
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-charcoal-700 hover:bg-cream-100 rounded-xl"
                >
                  <Layers className="w-4 h-4 text-charcoal-400" />
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/listings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-charcoal-700 hover:bg-cream-100 rounded-xl"
                >
                  <ShoppingBag className="w-4 h-4 text-charcoal-400" />
                  My Listings
                </Link>
                <Link
                  to="/dashboard/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-charcoal-700 hover:bg-cream-100 rounded-xl"
                >
                  <MessageSquare className="w-4 h-4 text-charcoal-400" />
                  Messages
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" fullWidth size="md">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/login?signup=true" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth size="md">
                    Create an Account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
