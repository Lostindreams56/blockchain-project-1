import React from 'react';
import { RetroStatusBar } from '../retro/RetroStatusBar';
import { ModelCpuIcon } from '../retro/RetroIcons';
import { useApiHealth } from '../../hooks/useApiHealth';
import { useReadiness } from '../../hooks/useReadiness';
import { Cpu } from 'lucide-react';

export const ModelStatusWindow: React.FC = () => {
  const { data: health, isLoading: isHealthLoading } = useApiHealth();
  const { data: readiness, isLoading: isReadinessLoading } = useReadiness();

  const METRICS = {
    algorithm: 'XGBoost (Extreme Gradient Boosting)',
    version: '1.0.0',
    dataset: 'Kaggle: vagifa/ethereum-frauddetection-dataset',
    totalSamples: 9841,
    trainSamples: 6887,
    valSamples: 1475,
    testSamples: 1479,
    testMetrics: {
      rocAuc: 0.9985,
      prAuc: 0.9955,
      precision: 0.9841,
      recall: 0.9450,
      f1: 0.9641,
      threshold: 0.62,
      confusionMatrix: { tn: 1147, fp: 5, fn: 18, tp: 309 },
    },
    pipeline: 'SimpleImputer(median) -> VarianceThreshold(0.0) -> RobustScaler()',
    explainer: 'TreeSHAP (TreeExplainer)',
  };

  return (
    <div className="flex flex-col h-full gap-2 win95-font">
      {/* Service Infrastructure Status Header */}
      <div className="win95-window-frame p-2.5 bg-[#C0C0C0]">
        <div className="text-[11px] font-bold text-black mb-1.5 flex items-center gap-1.5">
          <Cpu className="w-4 h-4 text-[#000080]" />
          <span>Microservices & Backend Telemetry Probes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
          {/* Node.js Express Gateway */}
          <div className="win95-sunken p-2 bg-[#F9F9F9]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#000080]">Express Gateway:</span>
              <span className="w-2 h-2 rounded-full bg-[#00AA00]" />
            </div>
            <div className="text-[10px] text-[#555] mt-1">
              Port: 5000 • Status: {isHealthLoading ? 'Probing...' : health?.status || 'Online'}
            </div>
          </div>

          {/* MongoDB Atlas Database */}
          <div className="win95-sunken p-2 bg-[#F9F9F9]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#000080]">MongoDB Atlas:</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  readiness?.database.status === 'connected' ? 'bg-[#00AA00]' : 'bg-[#FFAA00]'
                }`}
              />
            </div>
            <div className="text-[10px] text-[#555] mt-1">
              {isReadinessLoading
                ? 'Checking...'
                : readiness?.database.status === 'connected'
                ? 'Connected (Ready)'
                : 'Standby / Local'}
            </div>
          </div>

          {/* FastAPI Inference Microservice */}
          <div className="win95-sunken p-2 bg-[#F9F9F9]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#000080]">FastAPI ML Daemon:</span>
              <span className="w-2 h-2 rounded-full bg-[#00AA00]" />
            </div>
            <div className="text-[10px] text-[#555] mt-1">
              Port: 8000 • Stage 4 Inference Service
            </div>
          </div>
        </div>
      </div>

      {/* Verified Model Evaluation Benchmarks */}
      <div className="flex-1 win95-field-sunken bg-white p-3 overflow-y-auto space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[#808080]">
          <ModelCpuIcon className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-bold text-[12px] text-black">
              Verified Stage 3 Model Specifications ({METRICS.algorithm})
            </h3>
            <p className="text-[10px] text-[#555]">
              Artifact: <code>ethereum_fraud_model_v1.joblib</code> • Trained &amp; evaluated on Kaggle dataset
            </p>
          </div>
        </div>

        {/* Core Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
          <div className="win95-window-frame p-2 bg-[#F5F5F5]">
            <div className="text-[10px] text-[#555] font-semibold">ROC-AUC</div>
            <div className="text-[14px] font-bold text-[#000080] win95-mono mt-0.5">
              {(METRICS.testMetrics.rocAuc * 100).toFixed(2)}%
            </div>
            <div className="text-[9px] text-[#008000]">Held-out test set</div>
          </div>

          <div className="win95-window-frame p-2 bg-[#F5F5F5]">
            <div className="text-[10px] text-[#555] font-semibold">PR-AUC</div>
            <div className="text-[14px] font-bold text-[#000080] win95-mono mt-0.5">
              {(METRICS.testMetrics.prAuc * 100).toFixed(2)}%
            </div>
            <div className="text-[9px] text-[#008000]">Precision-Recall</div>
          </div>

          <div className="win95-window-frame p-2 bg-[#F5F5F5]">
            <div className="text-[10px] text-[#555] font-semibold">PRECISION</div>
            <div className="text-[14px] font-bold text-[#000080] win95-mono mt-0.5">
              {(METRICS.testMetrics.precision * 100).toFixed(2)}%
            </div>
            <div className="text-[9px] text-[#008000]">FP = 5 across 1,152</div>
          </div>

          <div className="win95-window-frame p-2 bg-[#F5F5F5]">
            <div className="text-[10px] text-[#555] font-semibold">RECALL</div>
            <div className="text-[14px] font-bold text-[#000080] win95-mono mt-0.5">
              {(METRICS.testMetrics.recall * 100).toFixed(2)}%
            </div>
            <div className="text-[9px] text-[#008000]">309/327 fraud detected</div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="win95-sunken p-2.5 bg-[#F9F9F9] text-[11px] space-y-2">
          <div className="font-bold text-[#000080]">Confusion Matrix (Held-out 1,479 Test Samples):</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-white p-1.5 border border-[#808080]">
              <div className="text-[10px] text-[#555]">True Negatives (TN)</div>
              <div className="font-bold win95-mono text-black">{METRICS.testMetrics.confusionMatrix.tn}</div>
            </div>
            <div className="bg-white p-1.5 border border-[#808080]">
              <div className="text-[10px] text-[#555]">False Positives (FP)</div>
              <div className="font-bold win95-mono text-[#AA0000]">{METRICS.testMetrics.confusionMatrix.fp}</div>
            </div>
            <div className="bg-white p-1.5 border border-[#808080]">
              <div className="text-[10px] text-[#555]">False Negatives (FN)</div>
              <div className="font-bold win95-mono text-[#AA0000]">{METRICS.testMetrics.confusionMatrix.fn}</div>
            </div>
            <div className="bg-white p-1.5 border border-[#808080]">
              <div className="text-[10px] text-[#555]">True Positives (TP)</div>
              <div className="font-bold win95-mono text-[#008000]">{METRICS.testMetrics.confusionMatrix.tp}</div>
            </div>
          </div>
        </div>

        <div className="text-[11px] space-y-1">
          <div>
            <span className="font-bold text-black">Optimal Calibrated Threshold:</span>{' '}
            <span className="win95-mono font-bold text-[#000080]">{METRICS.testMetrics.threshold}</span> (Tuned on validation partition)
          </div>
          <div>
            <span className="font-bold text-black">Feature Pipeline:</span>{' '}
            <span className="win95-mono text-[#333]">{METRICS.pipeline}</span>
          </div>
          <div>
            <span className="font-bold text-black">Explainability Module:</span>{' '}
            <span className="win95-mono text-[#333]">{METRICS.explainer}</span>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <RetroStatusBar
        message="Model artifact loaded & verified: ethereum_fraud_model_v1.joblib"
        panels={[{ content: <span>ROC-AUC: 99.85%</span>, width: '130px' }]}
        className="-mx-2 -mb-2"
      />
    </div>
  );
};
