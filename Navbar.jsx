import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Upload, 
  User, 
  Heart, 
  Settings, 
  LogOut, 
  Cross, 
  Bell, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ChevronDown,
  Activity
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Navbar({ onSearchSubmit }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Fetch real notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.read).length);
      } catch (e) {
        // Fallback demo notification
        setNotifications([
          { id: '1', title: 'Portal Protection Active', message: 'Doctor session protected with JWT security.', type: 'SECURITY_ALERT', read: false, timestamp: new Date() }
        ]);
        setUnreadCount(1);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKey = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(searchTerm.trim())}`);
      if (onSearchSubmit) onSearchSubmit(searchTerm.trim());
    }
  };

  const getInitials = (name) => {
    if (!name) return 'DR';
    const parts = name.replace(/^Dr\.\s*/i, '').trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Click Anywhere Outside Overlay */}
      {(profileDropdownOpen || notificationsOpen) && (
        <div 
          className="fixed inset-0 z-40 bg-transparent cursor-default"
          onClick={() => { setProfileDropdownOpen(false); setNotificationsOpen(false); }}
        />
      )}

      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 dark:bg-slate-900/90 dark:border-slate-800 px-6 py-3 transition-colors">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-medred-600 flex items-center justify-center shadow-md shadow-medred-600/20 text-white">
              <Cross className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                MedicPortal <span className="text-[11px] px-2 py-0.5 rounded-full bg-medred-50 text-medred-600 font-semibold border border-medred-100 dark:bg-medred-900/30 dark:text-medred-400 dark:border-medred-800">Doctor Portal</span>
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Medical Representative Information System</p>
            </div>
          </div>

        {/* Quick Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search medicine, company, MR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKey}
              className="w-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-medred-600 focus:ring-1 focus:ring-medred-600 transition-all"
            />
          </div>
        </div>

        {/* Right Actions: Upload, Notifications, Profile Dropdown */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2 bg-medred-600 hover:bg-medred-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md shadow-medred-600/15"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Document</span>
          </button>

          {/* Notifications Drawer */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUnreadCount(0);
              }}
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-medred-600 text-white font-extrabold text-[10px] min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                    <Bell className="w-4 h-4 text-medred-600" /> Notifications ({unreadCount} Unread)
                  </h3>
                  <button onClick={() => setUnreadCount(0)} className="text-xs text-medred-600 hover:text-medred-700 font-bold">Mark all read</button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-4 text-xs space-y-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-medred-50/40 dark:bg-medred-900/10' : ''}`}>
                      <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-200">
                        <span className="flex items-center gap-1.5">
                          {n.type === 'SECURITY_ALERT' ? <ShieldAlert className="w-3.5 h-3.5 text-medred-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                          {n.title}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>

                {/* REDIRECT LINK TO SETTINGS -> NOTIFICATIONS */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/settings?tab=notifications');
                    }}
                    className="w-full text-center py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-medred-50 dark:hover:bg-medred-950/40 text-medred-600 dark:text-medred-400 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Settings className="w-3.5 h-3.5" /> Notification Settings & Preferences →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar & Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              {user?.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-medred-600"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-medred-50 dark:bg-medred-950/60 border-2 border-medred-600 flex items-center justify-center text-medred-600 dark:text-medred-400 font-bold text-xs shadow-sm">
                  {getInitials(user?.name)}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.name || 'Dr. Rahul Sharma'}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{user?.email || 'doctor@example.com'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-fadeIn">
                <div className="px-3.5 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.name || 'Dr. Rahul Sharma'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'doctor@example.com'}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-medred-600 dark:hover:text-medred-400 transition-colors"
                >
                  <User className="w-4 h-4 text-medred-600" /> My Profile
                </Link>

                <Link
                  to="/favorites"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-medred-600 dark:hover:text-medred-400 transition-colors"
                >
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500/10" /> Favorites
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-medred-600 dark:hover:text-medred-400 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-500" /> Settings
                </Link>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => { setProfileDropdownOpen(false); logout(); }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  </>
  );
}
