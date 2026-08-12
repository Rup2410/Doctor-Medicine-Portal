import React, { useState } from 'react';
import { Calendar, Filter, RotateCcw } from 'lucide-react';

export default function DateFilter({ fromDate, toDate, onDateChange, onReset }) {
  const [activePreset, setActivePreset] = useState(null);

  const applyPreset = (preset) => {
    setActivePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'today') {
      onDateChange(todayStr, todayStr);
    } else if (preset === '7days') {
      const past7 = new Date();
      past7.setDate(today.getDate() - 7);
      onDateChange(past7.toISOString().split('T')[0], todayStr);
    } else if (preset === '30days') {
      const past30 = new Date();
      past30.setDate(today.getDate() - 30);
      onDateChange(past30.toISOString().split('T')[0], todayStr);
    } else if (preset === 'thisYear') {
      const startYear = new Date(today.getFullYear(), 0, 1);
      onDateChange(startYear.toISOString().split('T')[0], todayStr);
    }
  };

  const handleReset = () => {
    setActivePreset(null);
    onReset();
  };

  return (
    <div className="flex flex-wrap items-center gap-3 glass-card p-3 rounded-2xl border border-slate-800 text-xs">
      <div className="flex items-center gap-1.5 font-medium text-slate-400">
        <Calendar className="w-4 h-4 text-cyan-400" />
        <span>Date Filter:</span>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => applyPreset('today')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
            activePreset === 'today'
              ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => applyPreset('7days')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
            activePreset === '7days'
              ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => applyPreset('30days')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
            activePreset === '30days'
              ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => applyPreset('thisYear')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
            activePreset === 'thisYear'
              ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          This Year
        </button>
      </div>

      {/* Custom Range Inputs */}
      <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">From</span>
          <input
            type="date"
            value={fromDate || ''}
            onChange={(e) => {
              setActivePreset('custom');
              onDateChange(e.target.value, toDate);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">To</span>
          <input
            type="date"
            value={toDate || ''}
            onChange={(e) => {
              setActivePreset('custom');
              onDateChange(fromDate, e.target.value);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {(fromDate || toDate || activePreset) && (
        <button
          onClick={handleReset}
          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-auto"
          title="Reset date filter"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
