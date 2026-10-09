import React from 'react';
import { Cpu, BarChart3, LineChart, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';

export const ModelPerformanceSection: React.FC = () => {
  return (
    <section id="model-performance" className="scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Machine Learning Model Telemetry
            </h2>
            <Badge variant="emerald">STAGE 2 ARCHITECTURE</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Supervised fraud classification benchmarks and TreeSHAP explainability pipeline.
          </p>
        </div>
      </div>

      {/* Model Specifications and Metrics Cards (Placeholders without fake scores) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-slate-900/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>MODEL ALGORITHM</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white">XGBoost + TreeSHAP</div>
          <div className="text-xs text-slate-400 mt-1">Extreme Gradient Boosting</div>
          <div className="mt-3">
            <Badge variant="cyan">Target Architecture</Badge>
          </div>
        </Card>

        <Card className="bg-slate-900/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>ROC-AUC BENCHMARK</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-slate-400 font-mono">--.--- %</div>
          <div className="text-xs text-slate-500 mt-1">Pending Stage 2 Training</div>
          <div className="mt-3">
            <Badge variant="slate">Awaiting Dataset</Badge>
          </div>
        </Card>

        <Card className="bg-slate-900/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>FEATURE DIMENSIONS</span>
            <FileCode className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">42 Features</div>
          <div className="text-xs text-slate-400 mt-1">Engineered on-chain signals</div>
          <div className="mt-3">
            <Badge variant="amber">Defined in Schema</Badge>
          </div>
        </Card>

        <Card className="bg-slate-900/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>TARGET LATENCY</span>
            <LineChart className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">&lt; 150 ms</div>
          <div className="text-xs text-slate-400 mt-1">FastAPI asynchronous runtime</div>
          <div className="mt-3">
            <Badge variant="emerald">SLA Goal</Badge>
          </div>
        </Card>
      </div>

      <Card
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-200 font-semibold">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Model Evaluation Curves & Feature Importance</span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Service: <code>ml-service (FastAPI)</code>
            </div>
          </div>
        }
      >
        {/* Placeholder visualization container */}
        <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl mb-4">
          <EmptyState
            icon={BarChart3}
            badgeText="Pending Model Artifacts"
            title="Model Evaluation Plots Uninitialized"
            description="Per Stage 1 specifications, no synthetic ROC curves or fabricated SHAP feature importances are rendered. Live metrics will stream from FastAPI once the XGBoost pipeline is trained in Stage 2."
            action={
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Microservice skeleton initialized
                </span>
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Model training scheduled for Stage 2
                </span>
              </div>
            }
          />
        </div>

        {/* Feature Attribution Pipeline Explanation */}
        <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-lg">
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Planned XAI Feature Signals (TreeSHAP)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400">
            <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/60">
              <span className="text-cyan-400 font-mono font-semibold">1. Temporal Signals:</span>
              <p className="mt-1 text-[11px] text-slate-400">
                Avg time between sent transactions, burst frequency, lifespan velocity.
              </p>
            </div>
            <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/60">
              <span className="text-cyan-400 font-mono font-semibold">2. Value & Dispersion:</span>
              <p className="mt-1 text-[11px] text-slate-400">
                Ratio of received to sent Ether, standard deviation of transfer amounts, liquidation churn.
              </p>
            </div>
            <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/60">
              <span className="text-cyan-400 font-mono font-semibold">3. Smart Contract Churn:</span>
              <p className="mt-1 text-[11px] text-slate-400">
                Number of ERC-20 contract interactions, unverified bytecode deployment count.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};
