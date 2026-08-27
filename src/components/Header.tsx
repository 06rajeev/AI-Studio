import React from 'react';
import { Bot, Terminal, Database, FileSpreadsheet, Download, Sparkles, RefreshCw, Cpu } from 'lucide-react';
import { KPIStats } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  kpis: KPIStats | null;
  datasetCount: number;
  onOpenDatasetModal: () => void;
  onOpenReportModal: () => void;
  onOpenPythonModal: () => void;
  onRunAudit: () => void;
  isAuditing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  kpis,
  datasetCount,
  onOpenDatasetModal,
  onOpenReportModal,
  onOpenPythonModal,
  onRunAudit,
  isAuditing,
}) => {
  const navTabs = [
    { id: 'agent', label: 'AI Analytics Agent', icon: Bot, badge: 'Python + LLM' },
    { id: 'orders', label: 'Orders & Revenue', icon: FileSpreadsheet },
    { id: 'products', label: 'Product Classification', icon: Cpu, badge: 'ABC Matrix' },
    { id: 'rfm', label: 'Customer RFM & Value', icon: Sparkles, badge: 'CLV Engine' },
    { id: 'patterns', label: 'Cross-Category Patterns', icon: Database, badge: 'Apriori Mining' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-sm" id="main-header">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-950/40 text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Analytics Agent
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                    Python 3.10 Engine
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Customer Orders • Product Classification • RFM Segmentation • Cross-Category Affinity
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Active records badge */}
            <button
              onClick={onOpenDatasetModal}
              id="dataset-modal-btn"
              className="flex items-center gap-1.5 text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition"
              title="Inspect or switch dataset"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>{datasetCount.toLocaleString()} Orders Active</span>
            </button>

            {/* Python REPL button */}
            <button
              onClick={onOpenPythonModal}
              id="python-workbench-btn"
              className="flex items-center gap-1.5 text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Python Lab</span>
            </button>

            {/* Run Autonomous Audit */}
            <button
              onClick={onRunAudit}
              disabled={isAuditing}
              id="run-audit-btn"
              className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-3.5 py-1.5 rounded-lg shadow-sm transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
              <span>{isAuditing ? 'Executing Python Suite...' : 'Run Full Python Audit'}</span>
            </button>

            {/* Executive Report */}
            <button
              onClick={onOpenReportModal}
              id="export-report-btn"
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Audit Report</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                id={`nav-tab-${tab.id}`}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
