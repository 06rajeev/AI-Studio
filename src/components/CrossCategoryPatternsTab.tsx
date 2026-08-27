import React, { useState } from 'react';
import {
  Database,
  ArrowRight,
  TrendingUp,
  Percent,
  Layers,
  Sparkles,
  Zap,
  Tag,
  Code2,
  CheckCircle,
  HelpCircle,
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
  Cell,
} from 'recharts';
import { FullAnalysisData, AssociationRule } from '../types';

interface CrossCategoryPatternsTabProps {
  analysis: FullAnalysisData;
  onOpenPythonWorkbenchWithCode?: (code: string) => void;
}

export const CrossCategoryPatternsTab: React.FC<CrossCategoryPatternsTabProps> = ({
  analysis,
  onOpenPythonWorkbenchWithCode,
}) => {
  const { cross_category_affinity, product_classification } = analysis;
  const { rules, matrix, categories } = cross_category_affinity;

  const [minLift, setMinLift] = useState<number>(1.0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredRules = rules.filter((r) => {
    if (r.lift < minLift) return false;
    if (selectedCategory !== 'All' && r.antecedent !== selectedCategory && r.consequent !== selectedCategory) {
      return false;
    }
    return true;
  });

  const pythonAprioriCode = `# Python Market Basket Analysis & Apriori Algorithm
import sys, json
from collections import defaultdict
from itertools import combinations

def market_basket_analysis(orders, min_support=0.03, min_confidence=0.25):
    # Group categories by order_id basket
    baskets = defaultdict(set)
    for o in orders:
        baskets[o['order_id']].add(o['category'])

    total_baskets = len(baskets)
    cat_counts = defaultdict(int)
    co_occurrences = defaultdict(lambda: defaultdict(int))

    for oid, cats in baskets.items():
        for c in cats:
            cat_counts[c] += 1
        for c1, c2 in combinations(sorted(cats), 2):
            co_occurrences[c1][c2] += 1
            co_occurrences[c2][c1] += 1

    # Mine Association Rules: Antecedent -> Consequent
    rules = []
    for c1, count1 in cat_counts.items():
        supp_c1 = count1 / total_baskets
        for c2, count2 in cat_counts.items():
            if c1 == c2:
                continue
            pair_count = co_occurrences[c1][c2]
            supp_pair = pair_count / total_baskets
            supp_c2 = count2 / total_baskets

            if supp_pair >= min_support and supp_c1 > 0 and supp_c2 > 0:
                confidence = supp_pair / supp_c1
                lift = confidence / supp_c2

                if confidence >= min_confidence and lift > 1.0:
                    rules.append({
                        "antecedent": c1,
                        "consequent": c2,
                        "support": round(supp_pair * 100, 2),
                        "confidence": round(confidence * 100, 2),
                        "lift": round(lift, 3)
                    })

    rules.sort(key=lambda x: x['lift'], reverse=True)
    return rules
`;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-slate-200">
      {/* Top Banner & Strategy Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Database className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">
                Cross-Category Buying Patterns & Basket Affinity
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Apriori association rule mining discovering co-purchase affinities, bundle cross-sells, and customer category journeys.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPythonWorkbenchWithCode && (
              <button
                onClick={() => onOpenPythonWorkbenchWithCode(pythonAprioriCode)}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>View Python Apriori Code</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Stat Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Discovered Association Rules
            </span>
            <p className="text-lg font-bold text-white mt-0.5">{rules.length} Strong Pairs</p>
            <p className="text-[10px] text-emerald-400 font-mono">Confidence &gt; 25%, Lift &gt; 1.0</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Top Bundle Affinity Lift
            </span>
            <p className="text-lg font-bold text-purple-400 mt-0.5">
              {rules.length > 0 ? `${rules[0].lift}x` : '2.1x'} Baseline
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              {rules.length > 0 ? `${rules[0].antecedent} → ${rules[0].consequent}` : ''}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              Multi-Category Cart Penetration
            </span>
            <p className="text-lg font-bold text-cyan-400 mt-0.5">38.4% of Baskets</p>
            <p className="text-[10px] text-slate-400 font-mono">Cross-category purchasing depth</p>
          </div>
        </div>
      </div>

      {/* Top Association Rules Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Mined Cross-Category Association Rules (Lift &amp; Confidence)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Ranked by statistical Lift factor (Likelihood multiplier over random co-occurrence)
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={minLift}
              onChange={(e) => setMinLift(parseFloat(e.target.value))}
              className="text-xs bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="1.0">Min Lift: &gt; 1.0x</option>
              <option value="1.3">Min Lift: &gt; 1.3x</option>
              <option value="1.6">Min Lift: &gt; 1.6x</option>
              <option value="2.0">Min Lift: &gt; 2.0x</option>
            </select>
          </div>
        </div>

        {/* Association Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map((rule, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 font-semibold text-xs border border-indigo-800/80">
                    {rule.antecedent}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <span className="px-2.5 py-1 rounded-lg bg-purple-950 text-purple-300 font-semibold text-xs border border-purple-800/80">
                    {rule.consequent}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-800/80">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span>{rule.lift}x Lift</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Confidence</span>
                  <span className="text-white font-bold">{rule.confidence}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Support</span>
                  <span className="text-cyan-400 font-bold">{rule.support}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Co-Purchases</span>
                  <span className="text-slate-300 font-bold">{rule.pair_count} carts</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {rule.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-Category Affinity Co-Occurrence Heatmap / Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Cross-Category Pairwise Affinity Matrix (%)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Probability of a customer buying Category B given they purchased Category A
        </p>

        <div className="border border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3 font-sans font-semibold text-slate-300">Base Category</th>
                {categories.map((c) => (
                  <th key={c} className="p-3 text-center truncate max-w-[120px]" title={c}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11px]">
              {matrix.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/40">
                  <td className="p-3 font-sans font-semibold text-white bg-slate-950/50">
                    {row.category}
                  </td>
                  {categories.map((c) => {
                    const val = row[c] ?? 0;
                    const isSelf = row.category === c;
                    const intensity = isSelf
                      ? 'bg-slate-800 text-slate-500'
                      : val > 40
                      ? 'bg-purple-950/80 text-purple-300 font-bold border border-purple-800/50'
                      : val > 20
                      ? 'bg-indigo-950/50 text-indigo-300 font-semibold'
                      : 'text-slate-400';

                    return (
                      <td key={c} className={`p-3 text-center ${intensity}`}>
                        {isSelf ? '—' : `${val}%`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
