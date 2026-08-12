import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Settings as SettingsIcon, 
  User, 
  Sun, 
  Moon, 
  Laptop, 
  Bell, 
  ShieldCheck, 
  Sliders, 
  Database, 
  Info, 
  Eye, 
  Lock, 
  Save, 
  AlertTriangle, 
  Trash2, 
  CheckCircle2,
  FileText,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const { user, themeMode, updateTheme, reduceMotion, setReduceMotion, refreshProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('appearance'); // account, appearance, notifications, privacy, preferences, data, about

  // Account Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Preferences State
  const [defaultView, setDefaultView] = useState('GRID');
  const [defaultDateRange, setDefaultDateRange] = useState('7DAYS');
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Notifications Toggle State
  const [notifSettings, setNotifSettings] = useState({
    docProcessing: true,
    extractionReview: true,
    securityAlerts: true,
    newMedicineAdded: false,
    systemUpdates: true
  });

  // Danger Zone Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  // Feedback State
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      if (user.defaultView) setDefaultView(user.defaultView);
      if (user.defaultDateRange) setDefaultDateRange(user.defaultDateRange);
      if (user.itemsPerPage) setItemsPerPage(user.itemsPerPage);
      if (user.notificationsSettings) {
        try {
          setNotifSettings(JSON.parse(user.notificationsSettings));
        } catch (e) {}
      }
    }
  }, [user]);

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    try {
      setSaving(true);
      await api.put('/doctors/me', { name, email, phone });
      await refreshProfile();
      setSuccessMsg('Account details saved successfully.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update account.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    try {
      setSaving(true);
      await api.post('/doctors/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
      });
      setPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg('Password updated successfully.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSuccessMsg('');
    setErrorMsg('');
    try {
      setSaving(true);
      await api.put('/doctors/preferences', {
        defaultView,
        defaultDateRange,
        itemsPerPage,
        notificationsSettings: JSON.stringify(notifSettings),
        reduceMotion
      });
      await refreshProfile();
      setSuccessMsg('Application preferences saved.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleNotif = (key) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setErrorMsg('Please enter your password to confirm deletion.');
      return;
    }
    try {
      setSaving(true);
      await api.post('/doctors/account/delete', { password: deletePassword });
      logout();
      navigate('/login');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Account deletion failed.');
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'data', label: 'Data & Documents', icon: Database },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-w-5xl">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-medred-600" /> Portal Settings
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure system themes, security preferences, notification alerts, and account details.
            </p>
          </div>

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && <ErrorMessage message={errorMsg} />}

          {/* Settings Grid (Sidebar + Content Panel) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Settings Sidebar Tabs */}
            <div className="glass-panel p-3 rounded-3xl border border-slate-200 dark:border-slate-800 h-fit space-y-1">
              {tabs.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setActiveTab(t.id); setSuccessMsg(''); setErrorMsg(''); }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      isActive
                        ? 'bg-medred-600 text-white shadow-md shadow-medred-600/15'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {t.label}
                  </button>
                );
              })}
            </div>

            {/* Content Panel */}
            <div className="md:col-span-3 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
              
              {/* TAB: APPEARANCE */}
              {activeTab === 'appearance' && (
                <div className="space-y-6 text-xs">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <Sun className="w-4 h-4 text-medred-600" /> Appearance & Typography Settings
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Customize interface themes, font size scale, readability, and visual density.</p>
                  </div>

                  {/* 1. Theme Mode Selection */}
                  <div className="space-y-3">
                    <label className="block font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
                      Portal Theme Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Light Theme Card */}
                      <div
                        onClick={() => updateTheme('LIGHT')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                          themeMode === 'LIGHT'
                            ? 'border-medred-600 bg-medred-50/50 dark:bg-medred-950/20 shadow-md ring-2 ring-medred-600/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <div className="h-14 rounded-xl bg-slate-100 p-2 space-y-1.5 border border-slate-200 shadow-inner">
                          <div className="h-2.5 w-1/2 rounded bg-medred-600"></div>
                          <div className="h-2 w-3/4 rounded bg-slate-300"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">☀️ Light Mode</h4>
                            <p className="text-[11px] text-slate-500">Medical Red & Crisp White</p>
                          </div>
                          <input type="radio" checked={themeMode === 'LIGHT'} readOnly className="accent-medred-600 w-4 h-4" />
                        </div>
                      </div>

                      {/* Dark Theme Card */}
                      <div
                        onClick={() => updateTheme('DARK')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                          themeMode === 'DARK'
                            ? 'border-medred-600 bg-medred-950/30 shadow-md ring-2 ring-medred-600/20'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <div className="h-14 rounded-xl bg-slate-950 p-2 space-y-1.5 border border-slate-800 shadow-inner">
                          <div className="h-2.5 w-1/2 rounded bg-medred-600"></div>
                          <div className="h-2 w-3/4 rounded bg-slate-700"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-extrabold text-slate-100 text-sm">🌙 Dark Mode</h4>
                            <p className="text-[11px] text-slate-400">Deep Slate & Glowing Red</p>
                          </div>
                          <input type="radio" checked={themeMode === 'DARK'} readOnly className="accent-medred-600 w-4 h-4" />
                        </div>
                      </div>

                      {/* System Theme Card */}
                      <div
                        onClick={() => updateTheme('SYSTEM')}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                          themeMode === 'SYSTEM'
                            ? 'border-medred-600 bg-medred-50/50 dark:bg-medred-950/20 shadow-md ring-2 ring-medred-600/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <div className="h-14 rounded-xl bg-gradient-to-r from-slate-100 to-slate-950 p-2 border border-slate-300 dark:border-slate-700 shadow-inner flex items-center justify-center">
                          <Laptop className="w-6 h-6 text-slate-500" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">💻 System Default</h4>
                            <p className="text-[11px] text-slate-500">Auto match OS theme</p>
                          </div>
                          <input type="radio" checked={themeMode === 'SYSTEM'} readOnly className="accent-medred-600 w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Global Portal Typography & Text Scale */}
                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'SMALL', label: 'Compact (85%)', desc: 'Dense text view (14px)' },
                        { id: 'NORMAL', label: 'Standard (100%)', desc: 'Default SaaS view (16px)' },
                        { id: 'LARGE', label: 'High Legibility (115%)', desc: 'Clinical high-contrast view (18px)' }
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            const root = document.documentElement;
                            root.classList.remove('font-scale-small', 'font-scale-large');
                            if (f.id === 'SMALL') root.classList.add('font-scale-small');
                            else if (f.id === 'LARGE') root.classList.add('font-scale-large');
                            setSuccessMsg(`Font size scaled to ${f.label}!`);
                            setTimeout(() => setSuccessMsg(''), 2500);
                          }}
                          className="p-3.5 rounded-2xl border text-left transition-all bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-medred-500 hover:bg-medred-50/40 dark:hover:bg-medred-950/30"
                        >
                          <p className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{f.label}</p>
                          <p className="text-[10px] mt-0.5 text-slate-500">{f.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: ACCOUNT */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <User className="w-4 h-4 text-medred-600" /> Account Settings
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Update your doctor credentials and security password.</p>
                  </div>

                  <form onSubmit={handleSaveAccount} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm" required />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">Contact Number</label>
                      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-sm" />
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={() => setPasswordModalOpen(true)}
                        className="flex items-center gap-1.5 text-xs text-medred-600 dark:text-medred-400 font-bold hover:underline"
                      >
                        <Lock className="w-3.5 h-3.5" /> Change Password
                      </button>

                      <button type="submit" disabled={saving} className="bg-medred-600 hover:bg-medred-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-medred-600/15">
                        {saving ? 'Saving...' : 'Save Account'}
                      </button>
                    </div>
                  </form>

                  {/* Danger Zone */}
                  <div className="pt-6 border-t border-rose-200 dark:border-rose-900/30 space-y-2">
                    <h4 className="text-xs font-bold uppercase text-rose-600 tracking-wider">Danger Zone</h4>
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Delete Doctor Account</p>
                        <p className="text-[11px] text-slate-500">Permanently remove doctor profile and records.</p>
                      </div>
                      <button onClick={() => setDeleteModalOpen(true)} className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <Bell className="w-4 h-4 text-medred-600" /> Notification Preferences
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure alerts for document OCR processing and portal events.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'docProcessing', label: 'Document Processing Alerts', desc: 'Notify when file OCR processing finishes.' },
                      { key: 'extractionReview', label: 'Extraction Review Reminders', desc: 'Notify when doctor verification is required.' },
                      { key: 'securityAlerts', label: 'Security Alerts (Recommended)', desc: 'Notify on new sign-ins or password changes.' },
                      { key: 'newMedicineAdded', label: 'New Medicine Added Alerts', desc: 'Notify whenever a new medicine record is created.' },
                      { key: 'systemUpdates', label: 'System Updates', desc: 'Receive portal service maintenance notifications.' }
                    ].map((item) => (
                      <div key={item.key} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.label}</p>
                          <p className="text-[11px] text-slate-500">{item.desc}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleNotif(item.key)}
                          className={`relative w-20 h-9 rounded-full p-1 transition-all duration-300 flex items-center justify-between cursor-pointer select-none shadow-md ${
                            notifSettings[item.key]
                              ? 'bg-emerald-600 shadow-emerald-500/30 ring-2 ring-emerald-500/30'
                              : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          title={notifSettings[item.key] ? "Click to Disable (Turn OFF)" : "Click to Enable (Turn ON)"}
                        >
                          {notifSettings[item.key] ? (
                            <>
                              <span className="text-[11px] font-extrabold text-white pl-2">ON</span>
                              <span className="w-7 h-7 rounded-full bg-white shadow-lg block" />
                            </>
                          ) : (
                            <>
                              <span className="w-7 h-7 rounded-full bg-white shadow-md block" />
                              <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 pr-2">OFF</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button onClick={handleSavePreferences} disabled={saving} className="bg-medred-600 hover:bg-medred-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-medred-600/15">
                      Save Notification Settings
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: PRIVACY & SECURITY */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-medred-600" /> Privacy & Security
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage portal security and session encryption.</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">JWT Token Security</p>
                        <p className="text-slate-500 mt-0.5">Session tokens are encrypted using HMAC-SHA256.</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[11px]">ACTIVE</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">Change Password</p>
                        <p className="text-slate-500 mt-0.5">Regularly update your password to keep doctor data secure.</p>
                      </div>
                      <button onClick={() => setPasswordModalOpen(true)} className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold">
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: PREFERENCES */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-medred-600" /> Portal Preferences
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Customize default catalog layouts and date range presets.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Default Medicine View</label>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setDefaultView('GRID')} className={`px-4 py-2 rounded-xl text-xs font-bold border ${defaultView === 'GRID' ? 'bg-medred-600 text-white border-medred-600' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                          Grid Cards
                        </button>
                        <button onClick={() => setDefaultView('TABLE')} className={`px-4 py-2 rounded-xl text-xs font-bold border ${defaultView === 'TABLE' ? 'bg-medred-600 text-white border-medred-600' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                          Data Table
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Default Dashboard Date Range</label>
                      <select value={defaultDateRange} onChange={(e) => setDefaultDateRange(e.target.value)} className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs">
                        <option value="TODAY">Today</option>
                        <option value="7DAYS">Last 7 Days</option>
                        <option value="30DAYS">Last 30 Days</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Accessibility: Reduce Motion</label>
                      <button onClick={() => setReduceMotion(!reduceMotion)} className={`px-4 py-2 rounded-xl text-xs font-bold border ${reduceMotion ? 'bg-medred-600 text-white border-medred-600' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                        {reduceMotion ? 'Reduce Motion ON' : 'Reduce Motion OFF'}
                      </button>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button onClick={handleSavePreferences} disabled={saving} className="bg-medred-600 hover:bg-medred-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-medred-600/15">
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: DATA & DOCUMENTS */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <Database className="w-4 h-4 text-medred-600" /> Data & Documents
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage protected uploaded document archive and data access.</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">Uploaded Document Archive</p>
                      <p className="text-slate-500 mt-0.5">View and manage original MR document files.</p>
                    </div>
                    <button onClick={() => navigate('/documents')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-medred-600 text-white font-bold">
                      <FileText className="w-3.5 h-3.5" /> View Archive
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: ABOUT */}
              {activeTab === 'about' && (
                <div className="space-y-6 text-xs">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                      <Info className="w-4 h-4 text-medred-600" /> About Portal
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Doctor Medicine Information Portal v1.0.0</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 leading-relaxed text-slate-700 dark:text-slate-300">
                    <p>
                      <strong>Doctor Medicine Information Portal</strong> is designed exclusively for healthcare professionals to digitize and structure medicine-related information received from Medical Representatives (MRs).
                    </p>
                    <p>
                      Features automated OCR text extraction, AI structured data parsing, mandatory doctor verification, case-insensitive company matching, MR favorite management, and protected file storage.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      <Modal isOpen={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} title="Change Security Password">
        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5" required />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5" required />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5" required />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setPasswordModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-medred-600 text-white font-bold">Update Password</button>
          </div>
        </form>
      </Modal>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Account Deletion">
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Warning: This action is permanent and cannot be undone.</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">Please enter your doctor password to confirm account deletion:</p>
          <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} placeholder="Enter password" className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5" />
          <div className="pt-2 flex justify-end gap-2">
            <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 font-bold">Cancel</button>
            <button onClick={handleDeleteAccount} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold">Delete Account</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
