import React, { useState } from 'react';
import { Search, ShieldAlert, ArrowRight, Info, Layers } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';

export const WalletAnalysisSection: React.FC = () => {
  const [addressInput, setAddressInput] = useState('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const handleTestAddress = () => {
    setAddressInput('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
    setValidationMessage(
      'Address format valid (Vitalik.eth). Live blockchain ingestion will activate in Stage 2.'
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput) {
      setValidationMessage('Please enter an Ethereum address.');
      return;
    }
    const isValid = /^0x[a-fA-F0-9]{40}$/.test(addressInput.trim());
    if (!isValid) {
      setValidationMessage('Invalid Ethereum address format (must be 0x followed by 40 hex characters).');
    } else {
      setValidationMessage(
        'Address validated. Live on-chain analysis and XGBoost inference are scheduled for Stage 2 & 3.'
      );
    }
  };

  return (
    <section id="wallet-analysis" className="scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Wallet Risk Analysis & Forensics
            </h2>
            <Badge variant="cyan">STAGE 2 PLANNED</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time on-chain risk scoring, behavioral anomaly detection, and counterparty exposure analysis.
          </p>
        </div>
      </div>

      <Card
        className="mb-6"
        header={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" /> Query Target Address
            </span>
            <button
              onClick={handleTestAddress}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline cursor-pointer text-left sm:text-right"
            >
              Fill Sample Address (0xd8dA...6045)
            </button>
          </div>
        }
      >
        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <span className="font-mono text-sm font-bold text-slate-400">0x</span>
            </div>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => {
                setAddressInput(e.target.value);
                setValidationMessage(null);
              }}
              placeholder="Enter 42-character Ethereum wallet address (e.g., 0x71C...3972)"
              className="w-full pl-11 pr-32 py-3 bg-slate-950 border border-slate-800 rounded-lg text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-4 bg-cyan-600/90 hover:bg-cyan-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Scan Address</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {validationMessage && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>{validationMessage}</span>
            </div>
          )}
        </form>

        {/* Planned Ingestion Pipeline Roadmap */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="text-xs font-mono uppercase text-slate-400 mb-3 tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Analysis Pipeline Execution Flow
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-950/60 border border-slate-800/70 rounded-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                <span>Phase 01</span>
                <span className="text-cyan-400">Indexed API</span>
              </div>
              <p className="text-xs font-semibold text-slate-200">Historical Ingestion</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Extracts complete tx list, token movements, and internal contract calls via Etherscan/Alchemy.
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800/70 rounded-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                <span>Phase 02</span>
                <span className="text-cyan-400">Engine</span>
              </div>
              <p className="text-xs font-semibold text-slate-200">Feature Extraction</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Computes 42 behavioral metrics (turnover velocity, time delta variance, token dispersion).
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800/70 rounded-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                <span>Phase 03</span>
                <span className="text-cyan-400">FastAPI</span>
              </div>
              <p className="text-xs font-semibold text-slate-200">ML Classification</p>
              <p className="text-[11px] text-slate-500 mt-1">
                XGBoost classifier predicts illicit probability and calculates local SHAP feature attribution.
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800/70 rounded-lg">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                <span>Phase 04</span>
                <span className="text-cyan-400">Atlas</span>
              </div>
              <p className="text-xs font-semibold text-slate-200">Persistence & Dossier</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Caches assessment in MongoDB, generates audit trace, and renders interactive risk visualizer.
              </p>
            </div>
          </div>
        </div>

        {/* Empty state container - no fake data */}
        <div className="mt-6">
          <EmptyState
            icon={ShieldAlert}
            badgeText="Awaiting Live Analysis"
            title="No Active Address Under Inspection"
            description="Submit an Ethereum address to inspect risk levels. In Stage 1, all pipeline interfaces and API foundations are established; real model scoring activates in Stage 2."
          />
        </div>
      </Card>
    </section>
  );
};
