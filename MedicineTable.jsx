import React from 'react';
import { Pill, Building2, User, Calendar, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MedicineTable({ medicines, onViewDetails }) {
  const navigate = useNavigate();

  if (!medicines || medicines.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 glass-panel">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th scope="col" className="px-6 py-4">Medicine Name</th>
            <th scope="col" className="px-6 py-4">Pharma Company</th>
            <th scope="col" className="px-6 py-4">Composition</th>
            <th scope="col" className="px-6 py-4">MR Representative</th>
            <th scope="col" className="px-6 py-4">Added Date</th>
            <th scope="col" className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {medicines.map((med) => {
            const dateStr = med.createdAt
              ? new Date(med.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : 'N/A';

            return (
              <tr key={med.id} className="hover:bg-slate-900/40 transition-colors group">
                <td className="px-6 py-4 font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Pill className="w-3.5 h-3.5" />
                    </div>
                    <span>{med.medicineName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
                    <Building2 className="w-3 h-3 text-cyan-400" />
                    {med.companyName}
                  </span>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <p className="text-xs text-slate-400 truncate font-mono">{med.composition || '—'}</p>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-xs font-medium text-slate-200">{med.mrName || '—'}</p>
                    <p className="text-[11px] text-slate-400">{med.mrContact || ''}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                  {dateStr}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onViewDetails ? onViewDetails(med.id) : navigate(`/medicines/${med.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 text-xs font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
