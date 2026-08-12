import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import MedicineCard from '../components/MedicineCard';
import MedicineTable from '../components/MedicineTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import { 
  Building2, 
  User, 
  Phone, 
  Pill, 
  ArrowLeft,
  Users
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError('');

      const compRes = await api.get(`/companies/${id}`);
      setCompany(compRes.data);

      const medRes = await api.get(`/companies/${id}/medicines?size=50`);
      setMedicines(medRes.data.content || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch company profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [id]);

  const filteredMedicines = medicines.filter((m) =>
    m.medicineName.toLowerCase().includes(search.toLowerCase()) ||
    (m.composition && m.composition.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* Back button */}
          <button
            onClick={() => navigate('/companies')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Companies
          </button>

          {loading ? (
            <LoadingSpinner message="Loading company profile and MR directory..." />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchCompanyData} />
          ) : !company ? null : (
            <div className="space-y-8">
              {/* Header Banner */}
              <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-100">{company.companyName}</h1>
                    <p className="text-sm text-slate-400 mt-1">Pharmaceutical Manufacturer Profile</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="glass-card px-5 py-3 rounded-2xl text-center border border-slate-800">
                    <p className="text-2xl font-extrabold text-cyan-400">{company.medicineCount}</p>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Medicines</p>
                  </div>
                  <div className="glass-card px-5 py-3 rounded-2xl text-center border border-slate-800">
                    <p className="text-2xl font-extrabold text-slate-200">{company.medicalRepresentatives?.length || 0}</p>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">MR Representatives</p>
                  </div>
                </div>
              </div>

              {/* Medical Representatives Contacts */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Users className="w-5 h-5 text-cyan-400" /> Designated Medical Representatives (MRs)
                </h3>

                {company.medicalRepresentatives && company.medicalRepresentatives.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {company.medicalRepresentatives.map((mr) => (
                      <div key={mr.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-sm">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200 text-sm">{mr.mrName}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{mr.contactNumber || 'No phone provided'}</p>
                          </div>
                        </div>

                        {mr.contactNumber && (
                          <a
                            href={`tel:${mr.contactNumber}`}
                            className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                            title="Call MR"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No medical representative contacts registered yet.</p>
                )}
              </div>

              {/* Medicines List Section */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                    <Pill className="w-5 h-5 text-cyan-400" /> Medicines Manufactured by {company.companyName}
                  </h3>

                  <div className="w-full md:w-72">
                    <SearchBar
                      value={search}
                      onChange={setSearch}
                      onClear={() => setSearch('')}
                      placeholder="Search company medicines..."
                    />
                  </div>
                </div>

                {filteredMedicines.length === 0 ? (
                  <EmptyState
                    icon={Pill}
                    title="No medicines found for this company"
                    description="No medicine records matching your search query are stored for this company."
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMedicines.map((med) => (
                      <MedicineCard key={med.id} medicine={med} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
