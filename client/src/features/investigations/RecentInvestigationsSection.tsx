import React from 'react';
import { FolderLock, Filter, Database } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';

export const RecentInvestigationsSection: React.FC = () => {
  return (
    <section id="investigations" className="scroll-mt-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Recent Forensic Investigations
            </h2>
            <Badge variant="amber">STAGE 3 PLANNED</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Auditable case management and flagged address tracking persisted in MongoDB Atlas.
          </p>
        </div>
      </div>

      <Card
        header={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <FolderLock className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">Case Repository (MongoDB Atlas)</span>
            </div>

            {/* Filter controls preview */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs font-mono">
                <button
                  type="button"
                  className="px-2 py-1 bg-slate-800 text-cyan-400 rounded cursor-default"
                >
                  All Cases (0)
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  High Risk
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Under Review
                </button>
              </div>

              <button
                type="button"
                disabled
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-500 cursor-not-allowed opacity-60"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        }
      >
        {/* Table Schema Preview */}
        <div className="overflow-x-auto border border-slate-800/80 rounded-lg mb-6">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Target Address</th>
                <th className="px-4 py-3 font-semibold">Risk Tier</th>
                <th className="px-4 py-3 font-semibold">Classification Type</th>
                <th className="px-4 py-3 font-semibold">SHAP Key Driver</th>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Zero fake data injected - Clean Empty State */}
              <tr>
                <td colSpan={6} className="p-0">
                  <EmptyState
                    icon={FolderLock}
                    badgeText="Database Empty"
                    title="No Investigation Cases Found"
                    description="The investigations collection in MongoDB currently contains zero records. Forensic cases will automatically populate when analysts save target assessments in subsequent stages."
                    action={
                      <div className="flex items-center gap-2 mt-2 text-xs font-mono text-slate-500">
                        <Database className="w-3.5 h-3.5 text-amber-400" />
                        <span>Collection: <code>investigations</code> • Stage 1 Clean Baseline</span>
                      </div>
                    }
                    className="border-none py-10"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Informative Note */}
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Schema: <code>WalletInvestigationSchema</code> (Mongoose)</span>
          <span className="text-slate-500">Persistence ready once Stage 2 models connect</span>
        </div>
      </Card>
    </section>
  );
};
