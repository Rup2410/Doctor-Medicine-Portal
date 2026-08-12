import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import { Heart, Building2, Phone, Pill, User, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/favorites');
      setFavorites(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load favorite MR contacts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (mrId) => {
    try {
      await api.delete(`/favorites/${mrId}`);
      setFavorites(prev => prev.filter(f => f.mrId !== mrId));
    } catch (err) {
      alert('Failed to remove favorite.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> Favorite Medical Representatives
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Your saved favorite MR representatives and their associated pharma catalog.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading your favorite MRs..." />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchFavorites} />
          ) : favorites.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No favorite MRs added yet"
              description="Click the favorite heart icon on any Medical Representative card to add them to your priority list."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {favorites.map((fav) => (
                <div key={fav.id} className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> {fav.mrName}
                        </h3>
                        <p className="text-xs text-medred-600 dark:text-medred-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5" /> {fav.companyName}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFavorite(fav.mrId)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Contact: {fav.contactNumber || 'N/A'}</span>
                    {fav.contactNumber && (
                      <a href={`tel:${fav.contactNumber}`} className="text-medred-600 dark:text-medred-400 font-bold hover:underline">
                        Call MR
                      </a>
                    )}
                  </div>

                  {/* Associated Medicines List */}
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5 text-medred-600" /> Associated Medicines
                    </span>

                    {fav.medicines && fav.medicines.length > 0 ? (
                      <ul className="space-y-1.5 pl-2">
                        {fav.medicines.map((med) => (
                          <li
                            key={med.id}
                            onClick={() => navigate(`/medicines/${med.id}`)}
                            className="text-xs text-slate-700 dark:text-slate-300 hover:text-medred-600 dark:hover:text-medred-400 cursor-pointer flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                          >
                            <span className="font-semibold">• {med.medicineName}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No medicines listed yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
