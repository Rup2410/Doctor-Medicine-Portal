import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  Upload, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  ShieldCheck,
  Camera,
  Loader2
} from 'lucide-react';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      if (user.profilePictureUrl) {
        setPreviewUrl(user.profilePictureUrl);
      }
    }
  }, [user]);

  const getInitials = (fullName) => {
    if (!fullName) return 'DR';
    const parts = fullName.replace(/^Dr\.\s*/i, '').trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const handleFileChange = (e) => {
    setError('');
    setMessage('');
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowed.includes(file.type) && !['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      setError('Unsupported file type. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadPicture = async () => {
    if (!selectedFile) return;
    try {
      setSaving(true);
      setError('');
      const formData = new FormData();
      formData.append('file', selectedFile);

      await api.post('/doctors/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await refreshProfile();
      setSelectedFile(null);
      setMessage('Profile picture updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload profile picture.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePicture = async () => {
    try {
      setSaving(true);
      setError('');
      await api.delete('/doctors/profile-picture');
      await refreshProfile();
      setPreviewUrl(null);
      setSelectedFile(null);
      setMessage('Profile picture removed.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove profile picture.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required.');
      return;
    }

    try {
      setSaving(true);
      await api.put('/doctors/me', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim()
      });
      await refreshProfile();
      setMessage('Doctor profile information saved successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update doctor profile.');
    } finally {
      setSaving(false);
    }
  };

  const [zoomModalOpen, setZoomModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto max-w-4xl">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-6 h-6 text-medred-600" /> Doctor Profile
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your personal credentials, contact info, and profile avatar.
            </p>
          </div>

          {message && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && <ErrorMessage message={error} />}

          {/* Profile Header Box */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              {/* Profile Avatar Click -> ZOOM FORMAT MODAL */}
              <div 
                className="cursor-pointer group-hover:opacity-90 transition-opacity"
                onClick={() => setZoomModalOpen(true)}
                title="Click to view zoomed profile picture"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-medred-600 shadow-xl"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-medred-50 dark:bg-medred-950/80 border-4 border-medred-600 flex items-center justify-center text-medred-600 dark:text-medred-400 font-extrabold text-3xl shadow-xl">
                    {getInitials(name)}
                  </div>
                )}
              </div>

              {/* Camera Icon Click -> FILE SELECTOR ONLY */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="w-9 h-9 rounded-full bg-medred-600 hover:bg-medred-700 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 absolute bottom-0 right-0 transition-transform hover:scale-110"
                title="Upload / Change Profile Picture"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left space-y-1 flex-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{name || 'Dr. Rahul Sharma'}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3.5 h-3.5 text-medred-600" /> {email || 'doctor@example.com'}
              </p>
              {phone && (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {phone}
                </p>
              )}

              <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {selectedFile && (
                  <button
                    onClick={handleUploadPicture}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-medred-600 hover:bg-medred-700 text-white text-xs font-semibold transition-all shadow-md shadow-medred-600/15"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Save Avatar
                  </button>
                )}
                {user?.profilePictureUrl && (
                  <button
                    onClick={handleRemovePicture}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Picture
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Zoomed Profile Picture Lightbox Modal */}
          <Modal isOpen={zoomModalOpen} onClose={() => setZoomModalOpen(false)} title={`${name || 'Doctor'} — Profile Picture`}>
            <div className="flex flex-col items-center justify-center space-y-4 py-2">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={name}
                  className="w-72 h-72 rounded-3xl object-cover border-4 border-medred-600 shadow-2xl"
                />
              ) : (
                <div className="w-72 h-72 rounded-3xl bg-medred-50 dark:bg-medred-950 border-4 border-medred-600 flex items-center justify-center text-medred-600 dark:text-medred-400 font-extrabold text-6xl shadow-2xl">
                  {getInitials(name)}
                </div>
              )}

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setZoomModalOpen(false); fileInputRef.current?.click(); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-medred-600 hover:bg-medred-700 text-white text-xs font-semibold shadow-md"
                >
                  <Camera className="w-4 h-4" /> Change Photo
                </button>
                <button
                  type="button"
                  onClick={() => setZoomModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>

          {/* Personal Information Edit Form */}
          <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <User className="w-4 h-4 text-medred-600" /> Personal Information
            </h3>

            <form onSubmit={handleSaveInfo} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-medred-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-medred-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Contact Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-medred-600"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-medred-600 hover:bg-medred-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-medred-600/15 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
