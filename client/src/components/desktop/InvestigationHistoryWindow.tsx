import React, { useState } from 'react';
import { RetroStatusBar } from '../retro/RetroStatusBar';
import { RetroButton } from '../retro/RetroButton';
import { Filter, FolderLock } from 'lucide-react';

export const InvestigationHistoryWindow: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'high' | 'reviewed'>('all');

  return (
    <div className="flex flex-col h-full gap-2 win95-font">
      {/* Filter Toolbar */}
      <div className="flex items-center justify-between p-1 bg-[#C0C0C0] win95-raised-sm -mx-2 -mt-2 px-2 text-[11px]">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-black mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <RetroButton
            size="sm"
            pressed={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All Dossiers (0)
          </RetroButton>
          <RetroButton
            size="sm"
            pressed={filter === 'high'}
            onClick={() => setFilter('high')}
          >
            High Risk (0)
          </RetroButton>
          <RetroButton
            size="sm"
            pressed={filter === 'reviewed'}
            onClick={() => setFilter('reviewed')}
          >
            Reviewed (0)
          </RetroButton>
        </div>

        <div className="text-[10px] text-[#555] win95-mono">
          Collection: investigations
        </div>
      </div>

      {/* Case Table Area */}
      <div className="flex-1 win95-field-sunken bg-white p-2 overflow-y-auto">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-[#DFDFDF] border-b border-[#808080]">
              <th className="p-1.5 font-bold text-black border-r border-[#C0C0C0]">Target Address</th>
              <th className="p-1.5 font-bold text-black border-r border-[#C0C0C0]">Risk Tier</th>
              <th className="p-1.5 font-bold text-black border-r border-[#C0C0C0]">Classification</th>
              <th className="p-1.5 font-bold text-black border-r border-[#C0C0C0]">Primary SHAP Driver</th>
              <th className="p-1.5 font-bold text-black border-r border-[#C0C0C0]">Timestamp</th>
              <th className="p-1.5 font-bold text-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="p-8 text-center text-[#555]">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <FolderLock className="w-10 h-10 text-[#808080]" />
                  <div className="font-bold text-[12px] text-black">
                    Zero Investigation Dossiers in MongoDB
                  </div>
                  <p className="text-[11px] max-w-sm text-[#444]">
                    No fabricated investigation records are displayed. Forensic cases will
                    automatically populate when analysts commit assessments to MongoDB Atlas
                    in subsequent stages.
                  </p>
                  <div className="text-[10px] text-[#000080] font-mono mt-2">
                    MongoDB Model: <code>WalletInvestigationSchema</code> (Configured)
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Status Bar */}
      <RetroStatusBar
        message="Dossier collection: 0 records loaded"
        panels={[{ content: <span>MongoDB Ready</span>, width: '130px' }]}
        className="-mx-2 -mb-2"
      />
    </div>
  );
};
