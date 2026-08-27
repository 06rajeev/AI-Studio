import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  TrendingUp,
  Filter,
  Search,
  CheckCircle,
  Tag,
  DollarSign,
  Star,
  Cpu,
  BarChart2,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from 'recharts';
import { FullAnalysisData, ProductClassificationItem } from '../types';

interface ProductClassificationTabProps {
  analysis: FullAnalysisData;
  onOpenPythonWorkbenchWithCode?: (code: string) => void;
}

const ABC_COLORS: Record<string, string> = {
  'A (High Value / Velocity)': '#10b981',
  'B (Moderate Value)': '#6366f1',
  'C (Long Tail / Low Velocity)': '#f59e0b',
};

export const ProductClassificationTab: React.FC<ProductClassificationTabProps> = ({
  analysis,
  onOpenPythonWorkbenchWithCode,
}) => {
  const { product_classification } = analysis;
  const { products, abc_summary, price_tier_summary, categories } = product_classification;

  const [selectedAbc, setSelectedAbc] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProducts = products.filter((p) => {
    if (selectedAbc !== 'All' && p.abc_class !== selectedAbc) return false;
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (selectedTier !== 'All' && p.price_tier !== selectedTier) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Scatter chart data for Volume (Quantity) vs Revenue / Margin
  const scatterData = products.map((p) => ({
    name: p.name,
    quantity: p.quantity,
    revenue: p.revenue,
    margin: p.estimated_margin,
    abc: p.abc_class,
    price: p.unit_price,
  }));

  // Python ABC code snippet
  const pythonAbcCode = `# Python ABC Inventory Classification Engine
import sys, json

def classify_products(orders):
    product_rev = {}
    for o in orders:
        pid = o['product_id']
        line_rev = o['unit_price'] * o['quantity'] * (1.0 - o.get('discount', 0))
        product_rev[pid] = product_rev.get(pid, 0.0) + line_rev

    total_revenue = sum(product_rev.values())
    sorted_products = sorted(product_rev.items(), key=lambda x: x[1], reverse=True)
    
    cum_rev = 0.0
    classification = {}
    for pid, rev in sorted_products:
        cum_rev += rev
        share = (cum_rev / total_revenue) * 100
        if share <= 70.0:
            tier = "Class A (Top 70% Revenue Driver)"
        elif share <= 90.0:
            tier = "Class B (Core 70-90%)"
        else:
            tier = "Class C (Long Tail 90-100%)"
        classification[pid] = {"revenue": round(rev, 2), "abc_tier": tier}
        
    return classification
`;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-200">
      {/* Top Banner & Strategy Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Cpu className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">Product Classification & Portfolio Hierarchy</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Python automated ABC inventory classification, margin quadrant mapping, and price tier segmentation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPythonWorkbenchWithCode && (
              <button
                onClick={() => onOpenPythonWorkbenchWithCode(pythonAbcCode)}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>View Python Classification Algorithm</span>
              </button>
            )}
          </div>
        </div>

        {/* ABC Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                Class A: High Velocity
              </span>
              <p className="text-lg font-bold text-white mt-0.5">
                {abc_summary['A (High Value / Velocity)'] || 0} Products
              </p>
              <p className="text-[11px] text-slate-400">Generates ~70% of total revenue</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold font-mono">
              A
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/50 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                Class B: Core Steady
              </span>
              <p className="text-lg font-bold text-white mt-0.5">
                {abc_summary['B (Moderate Value)'] || 0} Products
              </p>
              <p className="text-[11px] text-slate-400">Generates next 20% of revenue</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold font-mono">
              B
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                Class C: Long Tail
              </span>
              <p className="text-lg font-bold text-white mt-0.5">
                {abc_summary['C (Long Tail / Low Velocity)'] || 0} Products
              </p>
              <p className="text-[11px] text-slate-400">Long-tail catalog inventory</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold font-mono">
              C
            </div>
          </div>
        </div>
      </div>

      {/* Visual Matrices: Volume vs Revenue Scatter & Price Tier Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scatter Volume vs Revenue */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <span>Product Revenue vs Quantity Matrix (ABC Color Coded)</span>
              </h3>
              <p className="text-xs text-slate-400">Identify high-margin star items and high-volume staples</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  type="number"
                  dataKey="quantity"
                  name="Units Sold"
                  stroke="#94a3b8"
                  fontSize={11}
                  label={{ value: 'Units Sold (Volume)', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="revenue"
                  name="Gross Revenue"
                  stroke="#94a3b8"
                  fontSize={11}
                  label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="price" range={[60, 400]} name="Unit Price" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs shadow-lg">
                          <p className="font-bold text-white">{data.name}</p>
                          <p className="text-cyan-400 font-mono">Revenue: ${data.revenue.toLocaleString()}</p>
                          <p className="text-slate-300 font-mono">Units: {data.quantity} | Price: ${data.price}</p>
                          <p className="text-emerald-400 font-mono">Est. Margin: ${data.margin.toLocaleString()}</p>
                          <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-800 text-slate-200">
                            {data.abc}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Products" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={ABC_COLORS[entry.abc] || '#6366f1'}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Price Tier Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Tag className="w-4 h-4 text-emerald-400" />
              <span>Price Tier Distribution</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">SKU count across market price bands</p>

            <div className="space-y-3">
              {Object.entries(price_tier_summary).map(([tier, countVal]) => {
                const count = Number(countVal) || 0;
                const total = products.length;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={tier} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{tier}</span>
                      <span className="font-mono text-cyan-400 font-semibold">{count} SKUs ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs text-slate-400 mt-4">
            <p className="font-semibold text-slate-300 mb-1">Classification Rule:</p>
            <p className="text-[11px] leading-relaxed">
              Price tiers automate margin calculation and dynamic promotional discounting thresholds.
            </p>
          </div>
        </div>
      </div>

      {/* Filterable Product Catalog Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Classified Product Catalog</span>
            </h3>
            <p className="text-xs text-slate-400">
              Showing {filteredProducts.length} of {products.length} classified SKUs
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={selectedAbc}
              onChange={(e) => setSelectedAbc(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All ABC Tiers</option>
              <option value="A (High Value / Velocity)">Class A</option>
              <option value="B (Moderate Value)">Class B</option>
              <option value="C (Long Tail / Low Velocity)">Class C</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">SKU ID</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">ABC Class</th>
                <th className="p-3">Price Tier</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Units Sold</th>
                <th className="p-3 text-right">Revenue ($)</th>
                <th className="p-3 text-right">Est. Margin</th>
                <th className="p-3 text-center">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredProducts.map((p) => {
                const abcColor =
                  p.abc_class.startsWith('A')
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
                    : p.abc_class.startsWith('B')
                    ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800/80'
                    : 'bg-amber-950/80 text-amber-300 border-amber-800/80';

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 text-slate-300">
                    <td className="p-3 text-cyan-400 font-semibold">{p.id}</td>
                    <td className="p-3 font-sans font-medium text-white max-w-[240px] truncate" title={p.name}>
                      {p.name}
                    </td>
                    <td className="p-3 font-sans text-slate-300">{p.category}</td>
                    <td className="p-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${abcColor}`}>
                        {p.abc_class.split(' ')[0]}
                      </span>
                    </td>
                    <td className="p-3 font-sans text-slate-400">{p.price_tier}</td>
                    <td className="p-3 text-right text-slate-200">${p.unit_price.toFixed(2)}</td>
                    <td className="p-3 text-right text-slate-300">{p.quantity}</td>
                    <td className="p-3 text-right text-emerald-400 font-bold">${p.revenue.toLocaleString()}</td>
                    <td className="p-3 text-right text-cyan-400">${p.estimated_margin.toLocaleString()}</td>
                    <td className="p-3 text-center font-sans text-amber-400 flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{p.avg_rating}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
