import React from 'react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl mb-4 text-cyan-400">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2 font-mono">404: RESOURCE_NOT_FOUND</h1>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        The requested routing path does not exist on this analytics console.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Security Console</span>
      </Link>
    </div>
  );
};
