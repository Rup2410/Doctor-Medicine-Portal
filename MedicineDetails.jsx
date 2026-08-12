import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import api from '../services/api';
import { 
  Pill, 
  Building2, 
  User, 
  Phone, 
  Calendar, 
  FileText, 
  ExternalLink, 
  ArrowLeft,
  ShieldCheck,
  Download
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

export default function MedicineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/medicines/${id}`);
      setMedicine(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load medicine details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleOpenSecureDocument = (docId) => {
    const token = localStorage.getItem('doctor_token');
    const secureUrl = `/api/documents/${docId}/file?token=${encodeURIComponent(token)}`;
    window.open(secureUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Catalog
          </button>

          {loading ? (
            <LoadingSpinner message="Loading medicine details..." />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchDetails} />
          ) : !medicine ? null : (
            <div className="max-w-4xl space-y-6">
              {/* Main Card */}
              <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
                      <Pill className="w-7 h-7" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-100">{medicine.medicineName}</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-cyan-400">
                          <Building2 className="w-3.5 h-3.5" /> {medicine.companyName}
                        </span>
                        <span className="text-xs text-slate-500">ID: #{medicine.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5 self-start sm:self-auto">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    Added on {new Date(medicine.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                {/* Composition Card */}
                {medicine.composition && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Chemical Composition</h3>
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono text-sm text-cyan-200 leading-relaxed">
                      {medicine.composition}
                    </div>
                  </div>
                )}

                {/* Description */}
                {medicine.description && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Clinical Details & Usage</h3>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
                      {medicine.description}
                    </p>
                  </div>
                )}

                {/* MR Representative Contact Card */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-cyan-400" /> Medical Representative (MR) Contact
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-200">{medicine.mrName || 'Not Specified'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Representative for {medicine.companyName}</p>
                    </div>

                    {medicine.mrContact && medicine.mrContact !== 'N/A' && (
                      <a
                        href={`tel:${medicine.mrContact}`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 text-xs font-semibold transition-colors self-start sm:self-auto"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call MR: {medicine.mrContact}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Source Documents Section */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" /> Associated Source Documents ({medicine.documents?.length || 0})
                </h3>

                {medicine.documents && medicine.documents.length > 0 ? (
                  <div className="space-y-3">
                    {medicine.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200 text-sm">{doc.fileName}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Type: {doc.fileType} • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenSecureDocument(doc.id)}
                          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-md shadow-cyan-500/15 shrink-0"
                        >
                          <ExternalLink className="w-4 h-4" /> View Original Document
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No original document linked to this medicine record.</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
