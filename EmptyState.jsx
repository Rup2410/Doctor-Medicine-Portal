import React from 'react';
import { Pill, SearchX, FilePlus } from 'lucide-react';

export default function EmptyState({ icon: Icon = SearchX, title = "No records found", description = "Try adjusting your search query or date filters.", actionLabel, onAction }) {
  return (
    <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 my-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
        <Icon className="w-8 h-8" />
      </div>
      <div className="max-w-sm">
        <h3 className="font-bold text-slate-200 text-lg">{title}</h3>
        <p className="text-sm text-slate-400 mt-1 leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md shadow-cyan-500/15"
        >
          <FilePlus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
