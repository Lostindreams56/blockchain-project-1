import React from 'react';
import { Server, Database, RefreshCw, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApiHealth } from '../../hooks/useApiHealth';
import { useReadiness } from '../../hooks/useReadiness';
import { Badge } from '../common/Badge';

function formatUptime(seconds?: number): string {
  if (seconds === undefined) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export const ApiHealthStatus: React.FC = () => {
  const {
    data: health,
    isLoading: isHealthLoading,
    isError: isHealthError,
    error: healthError,
    refetch: refetchHealth,
    isFetching: isHealthFetching,
  } = useApiHealth(15000);

  const {
    data: readiness,
    isLoading: isReadinessLoading,
    refetch: refetchReadiness,
  } = useReadiness(15000);

  const handleRefresh = () => {
    void refetchHealth();
    void refetchReadiness();
  };

  const isOnline = !isHealthError && health?.status === 'ok';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Title and main liveness indicator */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-wide text-slate-200">
                Backend API Telemetry
              </h3>
              {isOnline ? (
                <Badge variant="emerald" dot>
                  ONLINE
                </Badge>
              ) : isHealthLoading ? (
                <Badge variant="amber" dot>
                  PROBING
                </Badge>
              ) : (
                <Badge variant="rose" dot>
                  OFFLINE
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Target:{' '}
              <span className="text-slate-300">
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'}
              </span>
            </p>
          </div>
        </div>

        {/* Telemetry metrics pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Node.js Service Info */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Node API:</span>
            <span className="font-mono text-slate-200">
              {health ? `v${health.version}` : isHealthLoading ? '...' : 'Unreachable'}
            </span>
            {health && (
              <span className="text-slate-500 font-mono">
                ({formatUptime(health.uptimeSeconds)})
              </span>
            )}
          </div>

          {/* Database Readiness Info */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/60 border border-slate-800/80 rounded-lg text-xs">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">MongoDB:</span>
            {isReadinessLoading ? (
              <span className="font-mono text-slate-400">checking...</span>
            ) : readiness?.database?.status === 'connected' ? (
              <span className="font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            ) : (
              <span className="font-mono text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Standby (Local/Atlas)
              </span>
            )}
          </div>

          {/* Manual Refresh Trigger */}
          <button
            onClick={handleRefresh}
            disabled={isHealthFetching}
            className="p-2 text-slate-400 hover:text-cyan-400 bg-slate-950 border border-slate-800 hover:border-cyan-800 rounded-lg transition-colors disabled:opacity-50"
            title="Poll API Health Now"
          >
            <RefreshCw
              className={`w-4 h-4 ${isHealthFetching ? 'animate-spin text-cyan-400' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Error Banner when Backend is completely disconnected */}
      {isHealthError && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-xs text-rose-400 font-mono">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            API unreachable: {healthError?.message || 'Connection refused'}. Start the server via{' '}
            <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">npm run dev:server</code>.
          </span>
        </div>
      )}
    </div>
  );
};
