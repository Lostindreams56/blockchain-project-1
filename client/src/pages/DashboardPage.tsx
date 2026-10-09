import React from 'react';
import { ShieldCheck, Cpu, Terminal, ArrowUpRight } from 'lucide-react';
import { ApiHealthStatus } from '../components/health/ApiHealthStatus';
import { WalletAnalysisSection } from '../features/wallet-analysis/WalletAnalysisSection';
import { RecentInvestigationsSection } from '../features/investigations/RecentInvestigationsSection';
import { ModelPerformanceSection } from '../features/model-performance/ModelPerformanceSection';
import { Badge } from '../components/common/Badge';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-10">
      {/* Hero / Overview Banner */}
      <section id="overview" className="relative pt-2 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="cyan" dot>
                SYSTEM ONLINE
              </Badge>
              <Badge variant="slate">MAINNET ETHEREUM MONITOR</Badge>
              <Badge variant="emerald">STAGE 1 DEPLOYED</Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ethereum Fraud Detection &amp; <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                Risk Intelligence Platform
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              A production-minded, full-stack risk intelligence architecture designed to detect
              illicit activity, Ponzi mechanisms, phishing rings, and abnormal transaction patterns
              across the Ethereum blockchain using machine learning and Explainable AI (SHAP).
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#wallet-analysis"
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-sm transition-colors shadow-lg shadow-cyan-500/20"
              >
                Inspect Architecture
              </a>
              <a
                href="#model-performance"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>ML Roadmap</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Quick architectural feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 shrink-0 lg:w-80">
            <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Fake Metrics</span>
              </div>
              <p className="text-xs text-slate-400">
                Stage 1 establishes the verified runtime baseline. Predictions activate in Stage 2.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
                <Cpu className="w-4 h-4" />
                <span>Microservice Decoupling</span>
              </div>
              <p className="text-xs text-slate-400">
                Express API Gateway connects independently to MongoDB, Ethereum RPC, and FastAPI.
              </p>
            </div>

            <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
                <Terminal className="w-4 h-4" />
                <span>Indexed Data Pipeline</span>
              </div>
              <p className="text-xs text-slate-400">
                Reverse-address transaction lookups architected for high-speed feature generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Backend API Telemetry Component */}
      <ApiHealthStatus />

      {/* Feature 1: Wallet Analysis Section */}
      <WalletAnalysisSection />

      {/* Feature 2: Recent Investigations Section */}
      <RecentInvestigationsSection />

      {/* Feature 3: Model Performance Section */}
      <ModelPerformanceSection />
    </div>
  );
};
