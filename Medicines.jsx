import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import DateFilter from '../components/DateFilter';
import MedicineCard from '../components/MedicineCard';
import MedicineTable from '../components/MedicineTable';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import { Pill, LayoutGrid, ListFilter, Building2, RotateCcw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function Medicines() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCompany, setSelectedCompany] = useState(searchParams.get('companyId') || '');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const [companies, setCompanies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch company list for filter dropdown
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/companies');
        setCompanies(res.data);
      } catch (err) {
        console.error('Failed to load companies dropdown', err);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch medicines catalog with filters & pagination
  const fetchMedicines = async (page = 0) => {
    try {
      setLoading(true);
      setError('');

      let url = `/medicines?page=${page}&size=12`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      if (selectedCompany) url += `&companyId=${selectedCompany}`;
      if (fromDate) url += `&fromDate=${fromDate}`;
      if (toDate) url += `&toDate=${toDate}`;

      const res = await api.get(url);
      const data = res.data;

      setMedicines(data.content || []);
      setPageNo(data.pageNo);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch medicine records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines(0);
  }, [search, selectedCompany, fromDate, toDate]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCompany('');
    setFromDate('');
    setToDate('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                Medicine Information Database <Pill className="w-5 h-5 text-cyan-400" />
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Search, filter by company, and inspect verified medicine compositions.
              </p>
            </div>

            {/* View Mode Toggle Buttons */}
            <div className="flex items-center gap-1.5 glass-card p-1 rounded-xl border border-slate-800 self-start md:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'table' ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Table View"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar Panel */}
          <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Search input */}
              <SearchBar
                value={search}
                onChange={setSearch}
                onClear={() => setSearch('')}
                placeholder="Search medicine name, company, or MR..."
              />

              {/* Company Dropdown Filter */}
              <div className="w-full md:w-64">
                <div className="relative">
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 appearance-none"
                  >
                    <option value="">All Pharmaceutical Companies</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.medicineCount})
                      </option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {(search || selectedCompany || fromDate || toDate) && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-xs font-medium transition-colors shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                </button>
              )}
            </div>

            {/* Date Filter Component */}
            <DateFilter
              fromDate={fromDate}
              toDate={toDate}
              onDateChange={(from, to) => {
                setFromDate(from || '');
                setToDate(to || '');
              }}
              onReset={() => {
                setFromDate('');
                setToDate('');
              }}
            />
          </div>

          {/* Results Grid / Table */}
          {loading ? (
            <LoadingSpinner message="Searching medicine database..." />
          ) : error ? (
            <ErrorMessage message={error} onRetry={() => fetchMedicines(pageNo)} />
          ) : medicines.length === 0 ? (
            <EmptyState
              icon={Pill}
              title="No medicines match your criteria"
              description="Try clearing your search query or company filter to see all results."
            />
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {medicines.map((med) => (
                    <MedicineCard key={med.id} medicine={med} />
                  ))}
                </div>
              ) : (
                <MedicineTable medicines={medicines} />
              )}

              {/* Pagination */}
              <Pagination
                pageNo={pageNo}
                totalPages={totalPages}
                totalElements={totalElements}
                onPageChange={(p) => fetchMedicines(p)}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
