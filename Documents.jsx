import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import { FileText, ExternalLink, UploadCloud, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Documents() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDocuments = async (page = 0) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/documents?page=${page}&size=10`);
      const data = res.data;
      setDocuments(data.content || []);
      setPageNo(data.pageNo);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch uploaded document archive.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(0);
  }, []);

  const handleOpenSecureFile = (docId) => {
    const token = localStorage.getItem('doctor_token');
    const secureUrl = `/api/documents/${docId}/file?token=${encodeURIComponent(token)}`;
    window.open(secureUrl, '_blank');
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed & Saved
          </span>
        );
      case 'VERIFICATION_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
            <Clock className="w-3.5 h-3.5" /> Review Pending
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
            <Clock className="w-3.5 h-3.5 animate-spin" /> Processing OCR
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> Extraction Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                Uploaded Document Archive <FileText className="w-5 h-5 text-cyan-400" />
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Protected history of uploaded MR brochures, PDFs, and scanned medicine images.
              </p>
            </div>

            <button
              onClick={() => navigate('/upload')}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md shadow-cyan-500/15 shrink-0"
            >
              <UploadCloud className="w-4 h-4" /> Upload Document
            </button>
          </div>

          {loading ? (
            <LoadingSpinner message="Fetching document archive..." />
          ) : error ? (
            <ErrorMessage message={error} onRetry={() => fetchDocuments(pageNo)} />
          ) : documents.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No documents uploaded yet"
              description="Upload your first Medical Representative document or medicine brochure to get started."
              actionLabel="Upload First Document"
              onAction={() => navigate('/upload')}
            />
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-3xl border border-slate-800 glass-panel">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th scope="col" className="px-6 py-4">File Name</th>
                      <th scope="col" className="px-6 py-4">Upload Date</th>
                      <th scope="col" className="px-6 py-4">Processing Status</th>
                      <th scope="col" className="px-6 py-4">Type & Size</th>
                      <th scope="col" className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="truncate max-w-xs">{doc.fileName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                          {new Date(doc.uploadDate).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          {renderStatusBadge(doc.processingStatus)}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          <div>
                            <p className="font-mono">{doc.fileType}</p>
                            <p className="text-[11px] text-slate-500">{formatFileSize(doc.fileSize)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenSecureFile(doc.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 text-xs font-medium transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View Secure File
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                pageNo={pageNo}
                totalPages={totalPages}
                totalElements={totalElements}
                onPageChange={(p) => fetchDocuments(p)}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
