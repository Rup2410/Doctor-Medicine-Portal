import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import { Building2, Pill, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/companies');
      setCompanies(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch pharmaceutical companies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((c) =>
    c.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                Pharmaceutical Companies <Building2 className="w-5 h-5 text-cyan-400" />
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Browse pharmaceutical manufacturers and their designated Medical Representatives.
              </p>
            </div>

            <div className="w-full md:w-72">
              <SearchBar
                value={search}
                onChange={setSearch}
                onClear={() => setSearch('')}
                placeholder="Search company..."
              />
            </div>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading pharmaceutical company directory..." />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchCompanies} />
          ) : filteredCompanies.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No companies found"
              description="No pharmaceutical companies match your search query."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((comp) => (
                <div
                  key={comp.id}
                  onClick={() => navigate(`/companies/${comp.id}`)}
                  className="glass-card p-6 rounded-3xl border border-slate-800 cursor-pointer flex flex-col justify-between group hover:border-cyan-500/40"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                        {comp.medicineCount} Medicines
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-slate-100 group-hover:text-cyan-400 transition-colors">
                      {comp.companyName}
                    </h3>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span>{comp.medicalRepresentatives?.length || 0} MR Contacts</span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-cyan-400 font-medium group-hover:translate-x-1 transition-transform">
                      View Profile <ArrowRight className="w-3.5 h-3.5" />
                    </span>
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
