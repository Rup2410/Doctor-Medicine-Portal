import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import api from '../services/api';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Pill, 
  Building2, 
  User, 
  Phone, 
  Plus, 
  Trash2, 
  Save, 
  Edit3, 
  ArrowLeft,
  Sparkles,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UploadDocument() {
  const navigate = useNavigate();

  // Workflow steps: 'UPLOAD' -> 'PROCESSING' -> 'VERIFY' -> 'SUCCESS'
  const [step, setStep] = useState('UPLOAD');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState('');

  // Extracted & Doctor Editable State
  const [documentId, setDocumentId] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [mrName, setMrName] = useState('');
  const [mrContact, setMrContact] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [rawText, setRawText] = useState('');

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setError('');
  };

  const handleUploadAndProcess = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    try {
      setLoading(true);
      setStep('PROCESSING');
      setProcessingStatus('Uploading document file to secure storage...');

      const formData = new FormData();
      formData.append('file', file);

      setTimeout(() => setProcessingStatus('Running OCR text extraction pipeline...'), 800);
      setTimeout(() => setProcessingStatus('Analyzing pharmaceutical fields with AI model...'), 1800);

      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const data = response.data;
      setDocumentId(data.documentId);
      setRawText(data.rawText || '');

      // Parse company
      setCompanyName(data.company?.value || '');

      // Parse MR
      setMrName(data.mr?.name || '');
      setMrContact(data.mr?.contactNumber || '');

      // Parse Medicines
      if (data.medicines && data.medicines.length > 0) {
        setMedicines(data.medicines.map((m, idx) => ({
          id: idx,
          medicineName: m.medicineName || '',
          composition: m.composition || '',
          description: m.description || '',
          confidence: m.confidence || 0.8
        })));
      } else {
        // Fallback default item
        setMedicines([{
          id: 0,
          medicineName: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
          composition: '',
          description: '',
          confidence: 0.5
        }]);
      }

      setStep('VERIFY');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Extraction failed. You can enter details manually.');
      setStep('UPLOAD');
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntryFallback = () => {
    setDocumentId(null);
    setCompanyName('');
    setMrName('');
    setMrContact('');
    setMedicines([{
      id: 0,
      medicineName: '',
      composition: '',
      description: '',
      confidence: 1.0
    }]);
    setStep('VERIFY');
  };

  const handleMedicineChange = (id, field, value) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleAddMedicineRow = () => {
    setMedicines(prev => [
      ...prev,
      {
        id: Date.now(),
        medicineName: '',
        composition: '',
        description: '',
        confidence: 1.0
      }
    ]);
  };

  const handleRemoveMedicineRow = (id) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const handleConfirmAndSave = async () => {
    if (!companyName.trim()) {
      setError('Pharmaceutical company name is required.');
      return;
    }

    if (medicines.length === 0 || medicines.some(m => !m.medicineName.trim())) {
      setError('Please provide a valid medicine name for all entries.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        documentId: documentId,
        companyName: companyName.trim(),
        mrName: mrName.trim(),
        mrContact: mrContact.trim(),
        medicines: medicines.map(m => ({
          medicineName: m.medicineName.trim(),
          composition: m.composition.trim(),
          description: m.description.trim()
        }))
      };

      await api.post('/medicines/verify-and-save', payload);
      setStep('SUCCESS');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save confirmed medicine data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                Upload & Process MR Document <Sparkles className="w-5 h-5 text-cyan-400" />
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                OCR text extraction & AI structured field identification with Doctor Verification.
              </p>
            </div>

            {step !== 'UPLOAD' && step !== 'SUCCESS' && (
              <button
                onClick={() => setStep('UPLOAD')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Change File
              </button>
            )}
          </div>

          {error && <ErrorMessage message={error} />}

          {/* STEP 1: UPLOAD FILE */}
          {step === 'UPLOAD' && (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 max-w-3xl mx-auto">
              <FileUpload
                onFileSelect={handleFileSelect}
                isProcessing={loading}
                errorMessage=""
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleManualEntryFallback}
                  className="text-xs text-slate-400 hover:text-cyan-400 font-medium transition-colors"
                >
                  Skip OCR & Enter Information Manually →
                </button>

                <button
                  onClick={handleUploadAndProcess}
                  disabled={!file || loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <UploadCloud className="w-5 h-5" /> Start AI Extraction Process
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PROCESSING STATE */}
          {step === 'PROCESSING' && (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center max-w-2xl mx-auto space-y-6">
              <LoadingSpinner message={processingStatus} />
              <p className="text-xs text-slate-500">
                Note: Doctor verification is mandatory before saving records into the portal database.
              </p>
            </div>
          )}

          {/* STEP 3: DOCTOR REVIEW & VERIFICATION SCREEN */}
          {step === 'VERIFY' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    <strong>Doctor Verification Required:</strong> Please review and correct any extracted fields below before saving.
                  </span>
                </div>
              </div>

              {/* Company & MR Card */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="font-bold text-slate-100 text-base flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Building2 className="w-4 h-4 text-cyan-400" /> Company & MR Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Pharma Company <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Sun Pharma"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      MR Representative Name
                    </label>
                    <input
                      type="text"
                      value={mrName}
                      onChange={(e) => setMrName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      MR Contact Phone
                    </label>
                    <input
                      type="text"
                      value={mrContact}
                      onChange={(e) => setMrContact(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Medicines List Section */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                    <Pill className="w-4 h-4 text-cyan-400" /> Extracted Medicines ({medicines.length})
                  </h3>

                  <button
                    type="button"
                    onClick={handleAddMedicineRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 text-xs font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Another Medicine
                  </button>
                </div>

                <div className="space-y-6 divide-y divide-slate-800/80">
                  {medicines.map((med, idx) => (
                    <div key={med.id} className="pt-4 first:pt-0 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-400 font-bold text-xs flex items-center justify-center border border-slate-700">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Medicine Entry</span>
                          {med.confidence < 0.7 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-medium">
                              <AlertTriangle className="w-3 h-3" /> Please verify field
                            </span>
                          )}
                        </div>

                        {medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicineRow(med.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Remove medicine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Medicine Name <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={med.medicineName}
                            onChange={(e) => handleMedicineChange(med.id, 'medicineName', e.target.value)}
                            placeholder="e.g. Volini Gel 50g"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                            Chemical Composition
                          </label>
                          <input
                            type="text"
                            value={med.composition}
                            onChange={(e) => handleMedicineChange(med.id, 'composition', e.target.value)}
                            placeholder="e.g. Diclofenac Diethylamine 1.16% w/w"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                          Description / Clinical Usage
                        </label>
                        <textarea
                          rows={2}
                          value={med.description}
                          onChange={(e) => handleMedicineChange(med.id, 'description', e.target.value)}
                          placeholder="Indication details from document..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Action */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep('UPLOAD')}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmAndSave}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" /> Confirm & Save Information
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 'SUCCESS' && (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-100">Information Confirmed & Saved!</h3>
                <p className="text-sm text-slate-400 mt-2">
                  The verified medicine record and original document association have been stored in the database.
                </p>
              </div>
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => {
                    setStep('UPLOAD');
                    setFile(null);
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-cyan-500/15"
                >
                  Upload Another Document
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
