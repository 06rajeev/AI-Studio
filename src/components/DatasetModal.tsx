import React, { useState } from 'react';
import { X, Upload, FileText, Database, Check, AlertCircle, Download, RefreshCw } from 'lucide-react';
import { CustomerOrder } from '../types';
import { generateDefaultDataset } from '../data/sampleDatasets';

interface DatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: CustomerOrder[];
  onUpdateDataset: (newDataset: CustomerOrder[]) => void;
}

export const DatasetModal: React.FC<DatasetModalProps> = ({
  isOpen,
  onClose,
  dataset,
  onUpdateDataset,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    setUploadSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            onUpdateDataset(parsed);
            setUploadSuccess(`Successfully loaded ${parsed.length} records from JSON file.`);
          } else {
            setUploadError('JSON file must contain an array of order objects.');
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          if (lines.length < 2) {
            setUploadError('CSV file is empty or has no data rows.');
            return;
          }
          const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
          const parsedRows: CustomerOrder[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
            const row: any = {};
            headers.forEach((h, idx) => {
              row[h] = values[idx] || '';
            });

            parsedRows.push({
              order_id: row.order_id || `ORD-${10000 + i}`,
              order_date: row.order_date || '2026-01-01',
              customer_id: row.customer_id || `CUST-${i}`,
              customer_name: row.customer_name || 'Customer ' + i,
              customer_email: row.customer_email || '',
              city: row.city || 'Unknown',
              region: row.region || 'North America',
              channel: row.channel || 'Web',
              product_id: row.product_id || `P-${i}`,
              product_name: row.product_name || 'Product ' + i,
              category: row.category || 'General',
              subcategory: row.subcategory || 'General',
              unit_price: parseFloat(row.unit_price) || 50.0,
              quantity: parseInt(row.quantity) || 1,
              discount: parseFloat(row.discount) || 0.0,
              total_amount: parseFloat(row.total_amount) || 50.0,
              rating: row.rating ? parseFloat(row.rating) : undefined,
              returned: row.returned === 'true' || row.returned === '1',
            });
          }

          onUpdateDataset(parsedRows);
          setUploadSuccess(`Successfully imported ${parsedRows.length} rows from CSV.`);
        }
      } catch (err: any) {
        setUploadError(`Failed to parse file: ${err?.message || 'Unknown format'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    if (dataset.length === 0) return;
    const headers = Object.keys(dataset[0]).join(',');
    const rows = dataset.map((o) =>
      Object.values(o)
        .map((v) => `"${v !== undefined ? String(v).replace(/"/g, '""') : ''}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer_orders_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDataset = dataset.filter((d) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.order_id.toLowerCase().includes(q) ||
      d.customer_name.toLowerCase().includes(q) ||
      d.product_name.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Customer Orders Dataset Manager</h2>
              <p className="text-xs text-slate-400">Inspect schema, preview active records, or import custom orders data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer transition">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import CSV / JSON</span>
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={() => {
                const refreshed = generateDefaultDataset();
                onUpdateDataset(refreshed);
                setUploadSuccess('Reset to default synthetic 600+ multi-category e-commerce dataset.');
              }}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Default Dataset</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by order, customer, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Notifications */}
        {uploadSuccess && (
          <div className="px-6 py-2 bg-emerald-950/60 border-b border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}
        {uploadError && (
          <div className="px-6 py-2 bg-rose-950/60 border-b border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Data Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Showing {Math.min(filteredDataset.length, 100)} of {dataset.length} records</span>
            <span>Schema: 16 analytical attributes</span>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Order ID</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5">Product Name</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Price</th>
                  <th className="p-2.5">Qty</th>
                  <th className="p-2.5">Disc%</th>
                  <th className="p-2.5">Total ($)</th>
                  <th className="p-2.5">Region</th>
                  <th className="p-2.5">Channel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filteredDataset.slice(0, 100).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 text-slate-300">
                    <td className="p-2.5 text-cyan-400 font-semibold">{row.order_id}</td>
                    <td className="p-2.5 text-slate-400">{row.order_date}</td>
                    <td className="p-2.5 font-sans text-slate-200">{row.customer_name}</td>
                    <td className="p-2.5 font-sans max-w-[200px] truncate text-slate-300" title={row.product_name}>
                      {row.product_name}
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {row.category}
                      </span>
                    </td>
                    <td className="p-2.5">${row.unit_price.toFixed(2)}</td>
                    <td className="p-2.5">{row.quantity}</td>
                    <td className="p-2.5 text-slate-400">{(row.discount * 100).toFixed(0)}%</td>
                    <td className="p-2.5 text-emerald-400 font-semibold">${row.total_amount.toFixed(2)}</td>
                    <td className="p-2.5 text-slate-400">{row.region}</td>
                    <td className="p-2.5 text-slate-400">{row.channel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span>Python Pandas / Pure JSON Ready</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
