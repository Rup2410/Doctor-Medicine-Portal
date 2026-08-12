import React from 'react';
import { Pill, Building2, User, Phone, Calendar, ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MedicineCard({ medicine }) {
  const navigate = useNavigate();

  const formattedDate = medicine.createdAt
    ? new Date(medicine.createdAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'N/A';

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between group hover:border-cyan-500/40">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors text-base line-clamp-1">
                {medicine.medicineName}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3 text-cyan-500" />
                {medicine.companyName}
              </p>
            </div>
          </div>
        </div>

        {/* Composition */}
        {medicine.composition && (
          <div className="my-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">Composition</span>
            <p className="text-slate-300 line-clamp-2 leading-relaxed font-mono">{medicine.composition}</p>
          </div>
        )}

        {/* Description / Indications */}
        {medicine.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-4">
            {medicine.description}
          </p>
        )}
      </div>

      <div>
        {/* MR & Metadata */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>{medicine.mrName || 'N/A'}</span>
            </div>
            {medicine.mrContact && medicine.mrContact !== 'N/A' && (
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Phone className="w-3 h-3 text-slate-500" />
                <span>{medicine.mrContact}</span>
              </div>
            )}
          </div>

          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            <button
              onClick={() => navigate(`/medicines/${medicine.id}`)}
              className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              View Details <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
