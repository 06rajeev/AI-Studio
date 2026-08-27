import React from 'react';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  RotateCcw,
  Users,
  Layers,
  Calendar,
  Sparkles,
  BarChart2,
  PieChart as PieIcon,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FullAnalysisData, CustomerOrder } from '../types';

interface OrdersOverviewTabProps {
  analysis: FullAnalysisData;
  orders: CustomerOrder[];
}

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

export const OrdersOverviewTab: React.FC<OrdersOverviewTabProps> = ({ analysis, orders }) => {
  const { kpis, timeline, product_classification } = analysis;

  // Channel distribution calculation
  const channelCounts: Record<string, { revenue: number; count: number }> = {};
  orders.forEach((o) => {
    const ch = o.channel || 'Web';
    if (!channelCounts[ch]) channelCounts[ch] = { revenue: 0, count: 0 };
    channelCounts[ch].revenue += o.total_amount || 0;
    channelCounts[ch].count += 1;
  });

  const channelData = Object.entries(channelCounts).map(([name, data]) => ({
    name,
    revenue: Math.round(data.revenue),
    orders: data.count,
  }));

  // Regional breakdown
  const regionCounts: Record<string, number> = {};
  orders.forEach((o) => {
    const reg = o.region || 'Other';
    regionCounts[reg] = (regionCounts[reg] || 0) + (o.total_amount || 0);
  });
  const regionData = Object.entries(regionCounts).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-200">
      {/* 4 Core Financial & Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gross Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              ${kpis.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Python verified line-item gross total</span>
          </div>
        </div>

        {/* Total Orders & Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Processed Orders</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {kpis.total_orders.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">({kpis.total_units} units)</span>
          </div>
          <div className="mt-2 text-[11px] text-cyan-400 flex items-center gap-1 font-mono">
            <Layers className="w-3.5 h-3.5" />
            <span>Avg {kpis.avg_items_per_order} items per transaction</span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Order Value (AOV)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              ${kpis.aov.toFixed(2)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-indigo-400 flex items-center gap-1 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-ticket basket expansion healthy</span>
          </div>
        </div>

        {/* Repeat Customer Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer Repeat Rate</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-white">
              {kpis.repeat_rate}%
            </span>
            <span className="text-xs text-slate-400 font-mono">({kpis.unique_customers} total buyers)</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-400 flex items-center gap-1 font-mono">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Multi-purchase customer cohort ratio</span>
          </div>
        </div>
      </div>

      {/* Main Timeline Charts: Monthly Revenue Trend & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Monthly Revenue Trajectory & Order Volume</span>
              </h3>
              <p className="text-xs text-slate-400">Python time-series decomposition over 12 rolling months</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800/80">
              12 Periods
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revGrad)"
                  name="Gross Revenue ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Share Donut */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <PieIcon className="w-4 h-4 text-indigo-400" />
              <span>Geographic Revenue Share</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Customer order dispersion by regional territory</p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {regionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            {regionData.map((reg, idx) => (
              <div key={reg.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-300 truncate">{reg.name}:</span>
                <span className="font-mono text-white font-semibold">${reg.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales Channel & Category Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Channels */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>Sales Channel Performance & Volume</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Omnichannel revenue vs distinct transaction volume</p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} name="Order Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Product Category Contribution</span>
          </h3>
          <p className="text-xs text-slate-400 mb-3">Top categories ranked by total financial contribution</p>

          <div className="space-y-3">
            {product_classification.categories.slice(0, 5).map((cat, idx) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{cat.category}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono">{cat.orders} orders</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      ${cat.revenue.toLocaleString()} ({cat.revenue_share}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, cat.revenue_share * 2.5)}%`,
                      backgroundColor: COLORS[idx % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
