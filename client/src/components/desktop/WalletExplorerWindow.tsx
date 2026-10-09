import React, { useState } from 'react';
import { RetroTabs, TabItem } from '../retro/RetroTabs';
import { RetroStatusBar } from '../retro/RetroStatusBar';
import { WalletExplorerIcon } from '../retro/RetroIcons';
import { Layers, Database, FileText } from 'lucide-react';

export const WalletExplorerWindow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('schema');

  const tabs: TabItem[] = [
    { id: 'schema', label: 'Model Feature Schema (45)', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'phases', label: 'Ingestion Pipeline Phases', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'storage', label: 'On-Chain Data Storage', icon: <Database className="w-3.5 h-3.5" /> },
  ];

  const FEATURE_GROUPS = [
    {
      category: 'Temporal & Pacing Dynamics (3 features)',
      items: [
        { name: 'Avg min between sent tnx', desc: 'Average time latency between outgoing transactions' },
        { name: 'Avg min between received tnx', desc: 'Average time latency between incoming deposits' },
        { name: 'Time Diff between first and last (Mins)', desc: 'Total active wallet lifespan in minutes' },
      ],
    },
    {
      category: 'Counterparty & Transaction Volume (7 features)',
      items: [
        { name: 'Sent tnx / Received Tnx', desc: 'Total incoming and outgoing transaction counts' },
        { name: 'Number of Created Contracts', desc: 'Smart contracts deployed directly by this address' },
        { name: 'Unique Sent To / Received From Addresses', desc: 'Dispersion of unique counterparties' },
        { name: 'total transactions', desc: 'Lifetime aggregate transaction count' },
      ],
    },
    {
      category: 'Ether Value Distributions (9 features)',
      items: [
        { name: 'min / max / avg val sent', desc: 'Outgoing Ether transfer distribution metrics' },
        { name: 'min / max / avg val received', desc: 'Incoming Ether deposit distribution metrics' },
        { name: 'total Ether sent / total ether received', desc: 'Cumulative volume of ETH turnover' },
        { name: 'total ether balance', desc: 'Closing Ether balance at assessment snapshot' },
      ],
    },
    {
      category: 'ERC-20 Token Activity (26 features)',
      items: [
        { name: 'Total ERC20 tnxs', desc: 'Total count of ERC-20 token contract calls' },
        { name: 'ERC20 total Ether received / sent', desc: 'Cumulative ERC-20 token volume transferred' },
        { name: 'ERC20 uniq sent / rec token name', desc: 'Diversity of interacted token contract symbols' },
        { name: 'ERC20 min / max / avg val sent & received', desc: 'Token contract value metrics' },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Property Sheet Tabs */}
      <RetroTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="-mx-2 -mt-2 bg-[#C0C0C0] pt-1"
      />

      {/* Tab Content Container */}
      <div className="flex-1 win95-field-sunken bg-white p-3 overflow-y-auto">
        {activeTab === 'schema' && (
          <div className="space-y-4 win95-font">
            <div className="flex items-center gap-2 pb-2 border-b border-[#808080]">
              <WalletExplorerIcon className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-[12px] text-black">
                  45 Engineered Input Features for XGBoost Model
                </h3>
                <p className="text-[11px] text-[#555]">
                  These 45 behavioral signals were extracted from 9,841 labeled Ethereum accounts.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {FEATURE_GROUPS.map((group, idx) => (
                <div key={idx} className="win95-window-frame p-2 bg-[#F5F5F5]">
                  <h4 className="font-bold text-[11px] text-[#000080] mb-1.5">{group.category}</h4>
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-[#E0E0E0] border-b border-[#808080]">
                        <th className="p-1 font-semibold text-black w-1/2">Feature Identifier</th>
                        <th className="p-1 font-semibold text-black">Signal Interpretation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((item, itemIdx) => (
                        <tr key={itemIdx} className="border-b border-[#ECECEC] hover:bg-[#EAEAEA]">
                          <td className="p-1 font-bold win95-mono text-black">{item.name}</td>
                          <td className="p-1 text-[#333]">{item.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'phases' && (
          <div className="space-y-3 win95-font">
            <h3 className="font-bold text-[12px] text-black">Live Feature Extraction Architecture</h3>
            <p className="text-[11px] text-[#444]">
              How raw on-chain Ethereum data translates into the model feature vector:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 win95-window-frame bg-[#F5F5F5]">
                <div className="font-bold text-[#000080] mb-0.5">Phase 1: Indexed History Query</div>
                <p className="text-[#333]">
                  Calls Etherscan/Alchemy API (<code>account.txlist</code> and <code>account.tokentx</code>) to ingest
                  the entire chronological sequence of normal transactions and token transfers.
                </p>
              </div>

              <div className="p-2.5 win95-window-frame bg-[#F5F5F5]">
                <div className="font-bold text-[#000080] mb-0.5">Phase 2: Aggregation Engine</div>
                <p className="text-[#333]">
                  Computes lifetime aggregates: standard deviations of timestamps, inter-transaction intervals,
                  volume ratios, and unique counterparty counts.
                </p>
              </div>

              <div className="p-2.5 win95-window-frame bg-[#F5F5F5]">
                <div className="font-bold text-[#000080] mb-0.5">Phase 3: Pipeline Inference</div>
                <p className="text-[#333]">
                  Passes the 45-dimensional vector into the serialized <code>RobustScaler</code> and{' '}
                  <code>XGBClassifier</code>, producing risk probabilities and calibrated classifications.
                </p>
              </div>

              <div className="p-2.5 win95-window-frame bg-[#F5F5F5]">
                <div className="font-bold text-[#000080] mb-0.5">Phase 4: TreeSHAP Attribution</div>
                <p className="text-[#333]">
                  Computes exact Shapley values to identify which of the 45 features contributed most
                  to the benign or fraudulent score.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="p-4 flex flex-col items-center justify-center text-center text-[#555] space-y-2">
            <Database className="w-10 h-10 text-[#808080]" />
            <div className="font-bold text-[12px] text-black">MongoDB Atlas Investigation Dossiers</div>
            <p className="text-[11px] max-w-md">
              Evaluated wallet profiles, extracted feature snapshots, and analyst case notes are
              persisted in the MongoDB <code>investigations</code> collection.
            </p>
            <div className="win95-sunken p-2 bg-[#F9F9F9] text-[10px] win95-mono text-left max-w-sm w-full">
              Collection: investigations<br />
              Indexed Key: targetAddress (0x...)<br />
              Status: Ready for Stage 5 dossier storage
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <RetroStatusBar
        message="Displaying verified 45-feature schema"
        panels={[{ content: <span>45 Input Signals</span>, width: '130px' }]}
        className="-mx-2 -mb-2"
      />
    </div>
  );
};
