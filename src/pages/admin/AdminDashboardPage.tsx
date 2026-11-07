import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Users, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Activity, 
  FileText, 
  Search,
  Filter,
  Eye,
  Slash,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'users' | 'listings' | 'logs'>('overview');
  const [metrics, setMetrics] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const isAdmin = profile?.role === 'admin';

  const loadData = async () => {
    setLoading(true);
    try {
      const [mRes, rRes, uRes, lRes, logRes] = await Promise.all([
        api.admin.getMetrics().catch(() => ({ metrics: null })),
        api.admin.getReports().catch(() => ({ reports: [] })),
        api.admin.getUsers().catch(() => ({ users: [] })),
        api.admin.getListings().catch(() => ({ listings: [] })),
        api.admin.getLogs().catch(() => ({ logs: [] })),
      ]);

      if (mRes.metrics) setMetrics(mRes.metrics);
      if (rRes.reports) setReports(rRes.reports);
      if (uRes.users) setUsers(uRes.users);
      if (lRes.listings) setListings(lRes.listings);
      if (logRes.logs) setLogs(logRes.logs);
    } catch (err: any) {
      toast('Failed to load administrative data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-cream-200 shadow-modal text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-charcoal-900">Restricted Admin Access</h2>
          <p className="text-xs text-charcoal-600">
            This dashboard is reserved for authorized platform administrators and community moderators of ReLoop.
          </p>
          <div className="pt-2">
            <Link to="/">
              <Button variant="primary" fullWidth size="md">
                Return to Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle User Status toggle
  const handleToggleUserSuspension = async (userId: string, currentSuspended: boolean) => {
    try {
      await api.admin.updateUserStatus(userId, {
        is_suspended: !currentSuspended,
        reason: !currentSuspended ? 'Account suspended by admin' : 'Account restored by admin',
      });
      toast(`User account ${!currentSuspended ? 'suspended' : 're-activated'}`, 'success');
      loadData();
    } catch (err: any) {
      toast(err.message || 'Action failed', 'error');
    }
  };

  // Handle Report Action
  const handleReportAction = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await api.admin.actionReport(reportId, {
        status,
        moderator_notes: `Marked as ${status} by ${profile?.full_name || 'Admin'}`,
      });
      toast(`Report marked as ${status}`, 'success');
      loadData();
    } catch (err: any) {
      toast(err.message || 'Failed to update report', 'error');
    }
  };

  // Handle Listing Status
  const handleListingStatus = async (listingId: string, status: string) => {
    try {
      await api.admin.updateListingStatus(listingId, {
        status,
        reason: `Admin updated status to ${status}`,
      });
      toast(`Listing status updated to ${status}`, 'success');
      loadData();
    } catch (err: any) {
      toast(err.message || 'Failed to update listing', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-charcoal-900 tracking-tight">
                  Admin & Moderation Console
                </h1>
                <Badge variant="amber" size="sm">System Admin</Badge>
              </div>
              <p className="text-xs text-charcoal-500 mt-0.5">
                ReLoop Davanagere Circular Marketplace • Active Node: MCC B Block
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
              onClick={loadData}
            >
              Refresh Data
            </Button>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                User Dashboard →
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-cream-200 pb-3">
          {[
            { id: 'overview', label: 'Overview Metrics', icon: Activity },
            { id: 'reports', label: `Reports (${reports.filter(r => r.status === 'pending').length} pending)`, icon: AlertTriangle },
            { id: 'users', label: `Users (${users.length})`, icon: Users },
            { id: 'listings', label: `Listings (${listings.length})`, icon: Package },
            { id: 'logs', label: 'Audit Trail', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-charcoal-600 border border-cream-200 hover:bg-cream-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-xs">
                <div className="flex items-center justify-between text-charcoal-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Members</span>
                  <Users className="w-4 h-4 text-sage-600" />
                </div>
                <div className="text-3xl font-black text-charcoal-900">{metrics?.total_users || users.length}</div>
                <p className="text-[11px] text-charcoal-500 mt-1">{metrics?.active_users || users.length} active community accounts</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-xs">
                <div className="flex items-center justify-between text-charcoal-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Marketplace Items</span>
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-3xl font-black text-charcoal-900">{metrics?.total_listings || listings.length}</div>
                <p className="text-[11px] text-charcoal-500 mt-1">{metrics?.active_listings || listings.length} active available for reuse</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-xs">
                <div className="flex items-center justify-between text-charcoal-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Completed Handovers</span>
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-charcoal-900">{metrics?.completed_transactions || 1}</div>
                <p className="text-[11px] text-emerald-700 mt-1">Verified circular loops in Davanagere</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-cream-200 shadow-xs">
                <div className="flex items-center justify-between text-charcoal-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Reports Queue</span>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-3xl font-black text-amber-600">{metrics?.pending_reports || reports.filter(r => r.status === 'pending').length}</div>
                <p className="text-[11px] text-charcoal-500 mt-1">Pending community safety reviews</p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-charcoal-900 text-base">Community Safety Rules & Guidelines</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-charcoal-600">
                <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
                  <p className="font-bold text-charcoal-900">Zero Commercial Spam</p>
                  <p>Bulk retailers or drop-shippers are strictly disallowed. Only genuine pre-owned items from neighbors are permitted.</p>
                </div>
                <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
                  <p className="font-bold text-charcoal-900">Safe Public Handovers</p>
                  <p>Recommend meeting at high-visibility landmarks (BIET Main Gate, MCC B Block Park, Bapuji Hospital circle).</p>
                </div>
                <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
                  <p className="font-bold text-charcoal-900">Verified Reviews</p>
                  <p>Reviews can only be posted after confirmed purchase/rental/exchange transactions to prevent manipulation.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REPORTS QUEUE */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-3xl border border-cream-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-cream-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-charcoal-900 text-base">Community Reports</h3>
                <p className="text-xs text-charcoal-500">Flags submitted by community members regarding listings or profiles</p>
              </div>
              <Badge variant="amber" size="sm">
                {reports.filter(r => r.status === 'pending').length} Unresolved
              </Badge>
            </div>

            {reports.length === 0 ? (
              <div className="p-12 text-center text-xs text-charcoal-400">
                No reports submitted. Community is in healthy standing!
              </div>
            ) : (
              <div className="divide-y divide-cream-100">
                {reports.map((report) => (
                  <div key={report.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-cream-50/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          report.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {report.status}
                        </span>
                        <span className="text-xs font-bold text-charcoal-800 capitalize">
                          Type: {report.reported_type}
                        </span>
                        <span className="text-xs text-charcoal-400">• ID: {report.reported_id}</span>
                      </div>
                      <p className="text-sm font-semibold text-charcoal-900">
                        Reason: {report.reason}
                      </p>
                      {report.details && (
                        <p className="text-xs text-charcoal-600 bg-cream-100 p-2.5 rounded-xl font-mono">
                          "{report.details}"
                        </p>
                      )}
                      <p className="text-[10px] text-charcoal-400">
                        Submitted: {new Date(report.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {report.status === 'pending' ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={<CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                            onClick={() => handleReportAction(report.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReportAction(report.id, 'dismissed')}
                          >
                            Dismiss
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-charcoal-400 font-medium">
                          Handled ({report.status})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USERS MODERATION */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl border border-cream-200 shadow-xs overflow-hidden space-y-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-charcoal-900 text-base">User Accounts</h3>
                <p className="text-xs text-charcoal-500">Manage user standing, suspension, and verification status</p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl border border-cream-300 text-xs text-charcoal-900 outline-none focus:ring-2 focus:ring-amber-500 w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100 text-charcoal-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100">
                  {users
                    .filter((u) => !searchTerm || u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((usr) => (
                      <tr key={usr.id} className="hover:bg-cream-50/50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-charcoal-900">{usr.full_name}</div>
                          <div className="text-charcoal-400 text-[11px] font-mono">{usr.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                            usr.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-cream-200 text-charcoal-700'
                          }`}>
                            {usr.role || 'user'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-amber-600">
                          {usr.rating ? `${usr.rating} ★` : 'No reviews'}
                        </td>
                        <td className="py-3 px-4">
                          {usr.is_suspended ? (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px]">
                              Suspended
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {usr.role !== 'admin' && (
                            <Button
                              variant={usr.is_suspended ? 'secondary' : 'ghost'}
                              size="sm"
                              className={usr.is_suspended ? 'text-emerald-700' : 'text-rose-600 hover:bg-rose-50'}
                              onClick={() => handleToggleUserSuspension(usr.id, usr.is_suspended)}
                            >
                              {usr.is_suspended ? 'Reactivate' : 'Suspend'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: LISTINGS MODERATION */}
        {activeTab === 'listings' && (
          <div className="bg-white rounded-3xl border border-cream-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-charcoal-900 text-base">Marketplace Listings</h3>
                <p className="text-xs text-charcoal-500">Audit listings, flag spam, or archive obsolete items</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border border-cream-200 bg-cream-50/50 space-y-3">
                  <div className="flex gap-3">
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=120'}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover border border-cream-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-sage-700 block">{item.area}</span>
                      <h4 className="font-bold text-charcoal-900 text-xs truncate">{item.title}</h4>
                      <p className="text-xs font-black text-charcoal-900 mt-1">₹{item.price}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-cream-200">
                    <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                      item.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-cream-200 text-charcoal-700'
                    }`}>
                      {item.status}
                    </span>

                    <div className="flex gap-1.5">
                      <Link to={`/listings/${item.id}`} target="_blank">
                        <Button variant="ghost" size="sm" icon={<Eye className="w-3 h-3" />}>
                          View
                        </Button>
                      </Link>
                      {item.status === 'active' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-700 hover:bg-amber-50"
                          onClick={() => handleListingStatus(item.id, 'flagged')}
                        >
                          Flag
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleListingStatus(item.id, 'active')}
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-3xl border border-cream-200 shadow-xs p-5 space-y-4">
            <div>
              <h3 className="font-extrabold text-charcoal-900 text-base">Administrative Audit Trail</h3>
              <p className="text-xs text-charcoal-500">Immutable ledger of moderation actions taken across the ReLoop platform</p>
            </div>

            {logs.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-400">
                No moderation logs recorded yet. Actions taken will appear here.
              </div>
            ) : (
              <div className="divide-y divide-cream-100 font-mono text-xs">
                {logs.map((log) => (
                  <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-amber-700 uppercase">{log.action}</span>
                      <span className="text-charcoal-600 ml-2">[{log.target_type}: {log.target_id}]</span>
                      {log.notes && <p className="text-charcoal-500 font-sans text-xs mt-0.5">{log.notes}</p>}
                    </div>
                    <span className="text-[11px] text-charcoal-400 shrink-0">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboardPage;
