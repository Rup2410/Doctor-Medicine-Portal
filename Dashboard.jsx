import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DateFilter from '../components/DateFilter';
import MedicineTable from '../components/MedicineTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import { Pill, Building2, FileText, UploadCloud, ArrowRight, Activity, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentMedicines, setRecentMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const statsRes = await api.get('/dashboard/statistics');
      setStats(statsRes.data);

      let url = '/dashboard/recent?limit=10';
      if (fromDate) url += `&fromDate=${fromDate}`;
      if (toDate) url += `&toDate=${toDate}`;

      const recentRes = await api.get(url);
      setRecentMedicines(recentRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fromDate, toDate]);

  const handleDateChange = (from, to) => {
    setFromDate(from || '');
    setToDate(to || '');
  };

  const handleResetDates = () => {
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              Doctor Information Portal Dashboard <Activity className="w-5 h-5 text-cyan-400" />
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Overview of extracted pharmaceutical records and recent Medical Representative uploads.
            </p>
          </div>

          {/* Quick Action Buttons Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button onClick={() => navigate('/medicines')} className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex flex-col items-center gap-1.5 shadow-sm">
              <Pill className="w-5 h-5 text-medred-600" /> Medicines
            </button>
            <button onClick={() => navigate('/companies')} className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex flex-col items-center gap-1.5 shadow-sm">
              <Building2 className="w-5 h-5 text-blue-500" /> Companies
            </button>
            <button onClick={() => navigate('/favorites')} className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex flex-col items-center gap-1.5 shadow-sm">
              <Activity className="w-5 h-5 text-rose-500" /> Favorites
            </button>
            <button onClick={() => navigate('/documents')} className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all flex flex-col items-center gap-1.5 shadow-sm">
              <FileText className="w-5 h-5 text-emerald-500" /> Archive
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              onClick={() => navigate('/medicines')} 
              className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group cursor-pointer hover:border-medred-600 transition-all hover:scale-[1.02]"
              title="Click to view medicines catalog"
            >
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400 group-hover:text-medred-600 transition-colors">Total Medicines</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                  {stats ? stats.totalMedicines : '—'}
                </h3>
                <p className="text-xs text-medred-600 font-bold mt-1 flex items-center gap-1">Browse Catalog →</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-medred-50 dark:bg-medred-950/60 border border-medred-100 dark:border-medred-900 flex items-center justify-center text-medred-600 shadow-inner">
                <Pill className="w-7 h-7" />
              </div>
            </div>

            <div 
              onClick={() => navigate('/companies')} 
              className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group cursor-pointer hover:border-blue-500 transition-all hover:scale-[1.02]"
              title="Click to view pharma companies & MRs"
            >
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400 group-hover:text-blue-500 transition-colors">Total Companies</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                  {stats ? stats.totalCompanies : '—'}
                </h3>
                <p className="text-xs text-blue-500 font-bold mt-1 flex items-center gap-1">View Companies →</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                <Building2 className="w-7 h-7" />
              </div>
            </div>

            <div 
              onClick={() => navigate('/documents')} 
              className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-between group cursor-pointer hover:border-emerald-500 transition-all hover:scale-[1.02]"
              title="Click to view document archive"
            >
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-slate-400 group-hover:text-emerald-500 transition-colors">Uploaded Documents</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                  {stats ? stats.totalDocuments : '—'}
                </h3>
                <p className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">View Archive →</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
                <FileText className="w-7 h-7" />
              </div>
            </div>
          </div>

          {/* Date Filter & Recently Added Header */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-medred-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recently Added Medicines</h3>
              </div>

              <button
                onClick={() => navigate('/medicines')}
                className="flex items-center gap-1.5 text-xs text-medred-600 hover:text-medred-700 font-bold transition-colors"
              >
                View All Catalog <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Date Filter Bar */}
            <DateFilter
              fromDate={fromDate}
              toDate={toDate}
              onDateChange={handleDateChange}
              onReset={handleResetDates}
            />
          </div>

          {/* Table Content */}
          {loading ? (
            <LoadingSpinner message="Fetching recent medicine records..." />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchDashboardData} />
          ) : recentMedicines.length === 0 ? (
            <EmptyState
              icon={Pill}
              title="No recent medicine records"
              description="No medicines match the selected date range or haven't been added yet."
              actionLabel="Upload First Document"
              onAction={() => navigate('/upload')}
            />
          ) : (
            <MedicineTable medicines={recentMedicines} />
          )}
        </main>
      </div>
    </div>
  );
}
