import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AgentChatTab } from './components/AgentChatTab';
import { OrdersOverviewTab } from './components/OrdersOverviewTab';
import { ProductClassificationTab } from './components/ProductClassificationTab';
import { CustomerRFMTab } from './components/CustomerRFMTab';
import { CrossCategoryPatternsTab } from './components/CrossCategoryPatternsTab';
import { DatasetModal } from './components/DatasetModal';
import { PythonWorkbenchModal } from './components/PythonWorkbenchModal';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { generateDefaultDataset } from './data/sampleDatasets';
import { runFullPythonAnalysis, computeClientFallbackAnalytics } from './services/api';
import { CustomerOrder, FullAnalysisData } from './types';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function App() {
  const [dataset, setDataset] = useState<CustomerOrder[]>(() => generateDefaultDataset());
  const [analysis, setAnalysis] = useState<FullAnalysisData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('agent');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  // Modals
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState<boolean>(false);
  const [workbenchInitialCode, setWorkbenchInitialCode] = useState<string | undefined>(undefined);

  // Run full Python analysis on dataset change or initial mount
  const runAnalysisSuite = async (currentDataset: CustomerOrder[]) => {
    setIsAuditing(true);
    setAuditError(null);
    try {
      const res = await runFullPythonAnalysis(currentDataset);
      if (res.data) {
        setAnalysis(res.data);
      }
    } catch (err: any) {
      console.error('Python audit execution failed:', err);
      setAuditError(err?.message || 'Failed to complete Python audit');
      // Set client-computed fallback so UI is immediately interactive
      setAnalysis(computeClientFallbackAnalytics(currentDataset));
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    runAnalysisSuite(dataset);
  }, []);

  const handleUpdateDataset = (newDataset: CustomerOrder[]) => {
    setDataset(newDataset);
    runAnalysisSuite(newDataset);
  };

  const handleOpenWorkbenchWithCode = (code: string) => {
    setWorkbenchInitialCode(code);
    setIsPythonModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white" id="analytics-app-root">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        kpis={analysis?.kpis || null}
        datasetCount={dataset.length}
        onOpenDatasetModal={() => setIsDatasetModalOpen(true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenPythonModal={() => {
          setWorkbenchInitialCode(undefined);
          setIsPythonModalOpen(true);
        }}
        onRunAudit={() => runAnalysisSuite(dataset)}
        isAuditing={isAuditing}
      />

      {/* Audit error notice if any */}
      {auditError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 w-full">
          <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-xl text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{auditError} (Using client-side accelerated analytical compute)</span>
            </div>
            <button
              onClick={() => runAnalysisSuite(dataset)}
              className="px-2 py-0.5 rounded bg-amber-900/80 hover:bg-amber-800 text-white font-mono text-[11px]"
            >
              Retry Python Engine
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full" id="main-content-area">
        {!analysis ? (
          <div className="flex flex-col items-center justify-center h-[70vh] space-y-4 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-sm font-medium text-slate-300">
              Initializing Python 3.10 analytics container & running baseline data pipelines...
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Computing RFM scores, ABC inventory classes, and Apriori association rules
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'agent' && (
              <AgentChatTab
                dataset={dataset}
                onOpenPythonWorkbenchWithCode={handleOpenWorkbenchWithCode}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersOverviewTab analysis={analysis} orders={dataset} />
            )}

            {activeTab === 'products' && (
              <ProductClassificationTab
                analysis={analysis}
                onOpenPythonWorkbenchWithCode={handleOpenWorkbenchWithCode}
              />
            )}

            {activeTab === 'rfm' && (
              <CustomerRFMTab
                analysis={analysis}
                onOpenPythonWorkbenchWithCode={handleOpenWorkbenchWithCode}
              />
            )}

            {activeTab === 'patterns' && (
              <CrossCategoryPatternsTab
                analysis={analysis}
                onOpenPythonWorkbenchWithCode={handleOpenWorkbenchWithCode}
              />
            )}
          </>
        )}
      </main>

      {/* Dataset Inspector Modal */}
      <DatasetModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
        dataset={dataset}
        onUpdateDataset={handleUpdateDataset}
      />

      {/* Python Workbench REPL Modal */}
      <PythonWorkbenchModal
        isOpen={isPythonModalOpen}
        onClose={() => setIsPythonModalOpen(false)}
        dataset={dataset}
        initialCode={workbenchInitialCode}
      />

      {/* Executive Report Modal */}
      {analysis && (
        <ExecutiveReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          analysis={analysis}
        />
      )}
    </div>
  );
}
