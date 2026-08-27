import React, { useState } from 'react';
import {
  Users,
  Sparkles,
  Award,
  AlertTriangle,
  TrendingUp,
  Search,
  ChevronRight,
  ShieldCheck,
  Mail,
  MapPin,
  Calendar,
  X,
  Star,
  ExternalLink,
  Code2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { FullAnalysisData, CustomerProfile } from '../types';

interface CustomerRFMTabProps {
  analysis: FullAnalysisData;
  onOpenPythonWorkbenchWithCode?: (code: string) => void;
}

const SEGMENT_COLORS: Record<string, string> = {
  Champions: '#10b981',
  'Loyal Customers': '#06b6d4',
  'Recent Potential': '#3b82f6',
  'High Spenders': '#8b5cf6',
  'At Risk': '#f59e0b',
  "Can't Lose Them": '#ef4444',
  'About To Sleep': '#d97706',
  'Hibernating / Lost': '#64748b',
  Promising: '#ec4899',
};

export const CustomerRFMTab: React.FC<CustomerRFMTabProps> = ({
  analysis,
  onOpenPythonWorkbenchWithCode,
}) => {
  const { rfm_analysis } = analysis;
  const { segment_summary, top_vips, pareto_curve, customers_sample } = rfm_analysis;

  const [selectedSegment, setSelectedSegment] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCustomerModal, setActiveCustomerModal] = useState<CustomerProfile | null>(null);

  const filteredCustomers = customers_sample.filter((c) => {
    if (selectedSegment !== 'All' && c.segment !== selectedSegment) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.customer_id.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pythonRfmCode = `# Python RFM & CLV Customer Intelligence Engine
import sys, json, math
from datetime import datetime

def compute_rfm(orders):
    customer_data = {}
    ref_date = datetime(2026, 8, 25)

    for o in orders:
        cid = o['customer_id']
        if cid not in customer_data:
            customer_data[cid] = {'orders': set(), 'spend': 0.0, 'dates': []}
        customer_data[cid]['orders'].add(o['order_id'])
        line_spend = o['unit_price'] * o['quantity'] * (1 - o.get('discount', 0))
        customer_data[cid]['spend'] += line_spend
        customer_data[cid]['dates'].append(datetime.strptime(o['order_date'][:10], '%Y-%m-%d'))

    profiles = []
    for cid, d in customer_data.items():
        latest = max(d['dates'])
        recency = (ref_date - latest).days
        frequency = len(d['orders'])
        monetary = round(d['spend'], 2)
        
        # Segment logic
        if recency < 30 and frequency >= 4 and monetary > 1000:
            seg = "Champions"
        elif frequency >= 3 and monetary > 600:
            seg = "Loyal Customers"
        elif recency > 90 and monetary > 800:
            seg = "At Risk VIP"
        else:
            seg = "Standard"

        profiles.append({
            'customer_id': cid,
            'recency_days': recency,
            'frequency': frequency,
            'monetary': monetary,
            'segment': seg,
            'predicted_clv': round(monetary * (1.0 + frequency * 0.2), 2)
        })

    profiles.sort(key=lambda x: x['monetary'], reverse=True)
    return profiles
`;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-200">
      {/* Top Banner & Strategy Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Award className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">
                High-Value Customer Identification & RFM Segmentation
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Recency, Frequency, Monetary (RFM) scoring matrix and predictive Customer Lifetime Value (CLV) ranking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPythonWorkbenchWithCode && (
              <button
                onClick={() => onOpenPythonWorkbenchWithCode(pythonRfmCode)}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>View Python RFM Scoring Code</span>
              </button>
            )}
          </div>
        </div>

        {/* Segment Quick Summary Chips */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800">
          <button
            onClick={() => setSelectedSegment('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedSegment === 'All'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            All Customers ({customers_sample.length})
          </button>

          {segment_summary.map((seg) => {
            const isSelected = selectedSegment === seg.name;
            const color = SEGMENT_COLORS[seg.name] || '#6366f1';
            return (
              <button
                key={seg.name}
                onClick={() => setSelectedSegment(seg.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-800 text-white border-2'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
                style={{ borderColor: isSelected ? color : undefined }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span>{seg.name}</span>
                <span className="font-mono text-[10px] text-slate-400">({seg.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Analytics: RFM Segment Breakdown & Pareto 80/20 Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RFM Segment Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Customer RFM Segment Distribution</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Customer population count by behavioral tier</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segment_summary} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${val} Customers`, 'Count']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {segment_summary.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SEGMENT_COLORS[entry.name] || '#6366f1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pareto 80/20 Spend Concentration Curve */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Pareto 80/20 Customer Spend Curve</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
              High Concentration
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Cumulative % of revenue driven by top customer percentiles
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pareto_curve} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="paretoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="customer_percentile"
                  stroke="#94a3b8"
                  fontSize={11}
                  label={{ value: '% Top Customers', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  domain={[0, 100]}
                  label={{ value: '% Cumulative Revenue', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Cumulative Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue_share"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#paretoGrad)"
                  name="Cumulative Revenue %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* High-Value VIP Customer Dossier Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>High-Value Customer VIP Directory</span>
            </h3>
            <p className="text-xs text-slate-400">
              Ranked by total historical spend and predictive CLV (Showing {filteredCustomers.length} profiles)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search customer name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Customer ID</th>
                <th className="p-3">Customer Name</th>
                <th className="p-3">Segment</th>
                <th className="p-3 text-center">RFM Score</th>
                <th className="p-3 text-right">Recency (Days)</th>
                <th className="p-3 text-right">Orders (Freq)</th>
                <th className="p-3 text-right">Total Spend ($)</th>
                <th className="p-3 text-right">Predicted CLV</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredCustomers.slice(0, 50).map((c) => {
                const segColor = SEGMENT_COLORS[c.segment] || '#6366f1';
                return (
                  <tr key={c.customer_id} className="hover:bg-slate-800/40 text-slate-300">
                    <td className="p-3 text-cyan-400 font-semibold">{c.customer_id}</td>
                    <td className="p-3 font-sans font-medium text-white">
                      <div>{c.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{c.email}</div>
                    </td>
                    <td className="p-3 font-sans">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold border"
                        style={{
                          backgroundColor: `${segColor}20`,
                          color: segColor,
                          borderColor: `${segColor}50`,
                        }}
                      >
                        {c.segment}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-200 font-bold">
                        {c.rfm_score || `${c.r_score}${c.f_score}${c.m_score}`}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-300">{c.recency_days}d ago</td>
                    <td className="p-3 text-right text-slate-200">{c.frequency}</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">
                      ${c.monetary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right text-indigo-400 font-bold">
                      ${c.predicted_clv.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setActiveCustomerModal(c)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] transition"
                      >
                        Dossier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Dossier Modal */}
      {activeCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {activeCustomerModal.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{activeCustomerModal.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{activeCustomerModal.customer_id} • {activeCustomerModal.email}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveCustomerModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">RFM Segment</span>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">{activeCustomerModal.segment}</p>
                  <p className="text-[10px] text-slate-500 font-mono">Score: {activeCustomerModal.rfm_score}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Predicted CLV</span>
                  <p className="text-sm font-bold text-indigo-400 mt-0.5">
                    ${activeCustomerModal.predicted_clv.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">Lifetime Model</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Total Historical Spend:</span>
                  <span className="font-mono font-bold text-white">${activeCustomerModal.monetary.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Order Frequency:</span>
                  <span className="font-mono text-white">{activeCustomerModal.frequency} distinct orders</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Average Order Value (AOV):</span>
                  <span className="font-mono text-white">${activeCustomerModal.aov.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Last Purchased (Recency):</span>
                  <span className="font-mono text-white">{activeCustomerModal.recency_days} days ago</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Preferred Category:</span>
                  <span className="text-cyan-300 font-semibold">{activeCustomerModal.preferred_category}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Geographic Territory:</span>
                  <span className="text-slate-300">{activeCustomerModal.region}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/50">
                <span className="font-semibold text-indigo-300 block mb-1">Recommended Engagement Strategy:</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {activeCustomerModal.segment === 'Champions'
                    ? 'Enroll in exclusive VIP concierge program, provide early product launch previews, and no-discount high-touch rewards.'
                    : activeCustomerModal.segment === 'At Risk'
                    ? 'Trigger automated win-back campaign with 15% personalized re-activation incentive on their preferred category.'
                    : 'Target with tailored cross-category recommendations based on high-affinity product pairs.'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setActiveCustomerModal(null)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
