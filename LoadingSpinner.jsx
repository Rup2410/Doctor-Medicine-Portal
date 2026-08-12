import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading details...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      <p className="text-sm font-medium text-slate-400">{message}</p>
    </div>
  );
}
