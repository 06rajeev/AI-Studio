import React, { useState } from 'react';
import {
  X,
  Play,
  Terminal,
  Copy,
  Check,
  Download,
  RotateCcw,
  Code2,
  FileCode,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CustomerOrder } from '../types';
import { executeCustomPython } from '../services/api';

interface PythonWorkbenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: CustomerOrder[];
  initialCode?: string;
}

const TEMPLATES = [
  {
    name: '1. RFM & VIP Customer Scoring',
    code: `import sys, json, math
from datetime import datetime
from collections import defaultdict

orders = json.loads(sys.stdin.read())
print(f"Loaded {len(orders)} order records for analysis.")

customer_spend = defaultdict(float)
customer_orders = defaultdict(set)
customer_dates = defaultdict(list)
ref_date = datetime(2026, 8, 25)

for o in orders:
    cid = o['customer_id']
    line_total = o['unit_price'] * o['quantity'] * (1.0 - o.get('discount', 0))
    customer_spend[cid] += line_total
    customer_orders[cid].add(o['order_id'])
    customer_dates[cid].append(datetime.strptime(o['order_date'][:10], '%Y-%m-%d'))

print("\\n--- TOP 5 HIGH-VALUE CUSTOMERS ---")
sorted_customers = sorted(customer_spend.items(), key=lambda x: x[1], reverse=True)
for rank, (cid, spend) in enumerate(sorted_customers[:5], 1):
    freq = len(customer_orders[cid])
    latest = max(customer_dates[cid])
    recency = (ref_date - latest).days
    clv = round(spend * (1.0 + freq * 0.25), 2)
    print(f"#{rank} {cid} | Total Spend: \${spend:,.2f} | Orders: {freq} | Recency: {recency}d | Pred. CLV: \${clv:,.2f}")
`,
  },
  {
    name: '2. ABC Product Inventory Classification',
    code: `import sys, json
from collections import defaultdict

orders = json.loads(sys.stdin.read())
product_revenue = defaultdict(float)
product_names = {}
product_categories = {}

for o in orders:
    pid = o['product_id']
    rev = o['unit_price'] * o['quantity'] * (1.0 - o.get('discount', 0))
    product_revenue[pid] += rev
    product_names[pid] = o['product_name']
    product_categories[pid] = o['category']

total_rev = sum(product_revenue.values())
sorted_prods = sorted(product_revenue.items(), key=lambda x: x[1], reverse=True)

print(f"Total Portfolio Revenue: \${total_rev:,.2f}")
print("\\n--- ABC CLASSIFICATION BREAKDOWN ---")

cum_rev = 0.0
counts = {"Class A (70%)": 0, "Class B (20%)": 0, "Class C (10%)": 0}

for pid, rev in sorted_prods:
    cum_rev += rev
    share = (cum_rev / total_rev) * 100
    if share <= 70.0:
        tier = "Class A (70%)"
    elif share <= 90.0:
        tier = "Class B (20%)"
    else:
        tier = "Class C (10%)"
    counts[tier] += 1

for tier, count in counts.items():
    print(f"{tier}: {count} SKUs")

print("\\nTop 3 Velocity Drivers:")
for pid, rev in sorted_prods[:3]:
    print(f"- {product_names[pid]} ({product_categories[pid]}): \${rev:,.2f}")
`,
  },
  {
    name: '3. Cross-Category Market Basket Apriori',
    code: `import sys, json
from collections import defaultdict
from itertools import combinations

orders = json.loads(sys.stdin.read())
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

print(f"Total Analyzed Baskets: {total_baskets}")
print("\\n--- TOP CROSS-CATEGORY ASSOCIATION RULES ---")

rules = []
for c1, count1 in cat_counts.items():
    supp_c1 = count1 / total_baskets
    for c2, count2 in cat_counts.items():
        if c1 == c2: continue
        pair_cnt = co_occurrences[c1][c2]
        supp_pair = pair_cnt / total_baskets
        supp_c2 = count2 / total_baskets
        if supp_pair >= 0.03 and supp_c1 > 0 and supp_c2 > 0:
            confidence = (supp_pair / supp_c1) * 100
            lift = (supp_pair / (supp_c1 * supp_c2))
            if lift > 1.2:
                rules.append((c1, c2, confidence, lift, pair_cnt))

rules.sort(key=lambda x: x[3], reverse=True)
for c1, c2, conf, lift, cnt in rules[:6]:
    print(f"[{c1}] -> [{c2}] | Lift: {lift:.2f}x | Confidence: {conf:.1f}% ({cnt} carts)")
`,
  },
];

export const PythonWorkbenchModal: React.FC<PythonWorkbenchModalProps> = ({
  isOpen,
  onClose,
  dataset,
  initialCode,
}) => {
  const [code, setCode] = useState<string>(initialCode || TEMPLATES[0].code);
  const [output, setOutput] = useState<{ stdout: string; stderr: string; executionTimeMs: number } | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await executeCustomPython(code, dataset);
      setOutput({
        stdout: res.stdout || '(Script executed successfully with no stdout)',
        stderr: res.stderr || '',
        executionTimeMs: res.executionTimeMs || 0,
      });
    } catch (err: any) {
      setOutput({
        stdout: '',
        stderr: `Execution error: ${err?.message || 'Failed to reach Python engine'}`,
        executionTimeMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_script_${Date.now()}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Python 3.10 Analytics Workbench & REPL</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                  Live Container Stdio
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Execute custom Python scripts against {dataset.length} loaded orders with real-time stdout
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Template Selector */}
        <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recipes:</span>
            </span>
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.name}
                onClick={() => setCode(tmpl.code)}
                className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition"
              >
                {tmpl.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download .py</span>
            </button>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-4 py-1.5 rounded-lg shadow-sm transition"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Running...' : 'Execute Script'}</span>
            </button>
          </div>
        </div>

        {/* Code Editor & Console Output split */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-hidden">
          {/* Code Editor */}
          <div className="flex flex-col h-full bg-slate-950 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <Code2 className="w-3.5 h-3.5" />
                <span>analytics_pipeline.py</span>
              </span>
              <span>Python 3.10 Standard Library</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full bg-slate-950 font-mono text-xs text-emerald-400 placeholder-slate-600 focus:outline-none resize-none p-2 border border-slate-800/80 rounded-xl leading-relaxed"
            />
          </div>

          {/* Terminal Output */}
          <div className="flex flex-col h-full bg-slate-900/90 p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>Standard Output (stdout / stderr)</span>
              </span>
              {output?.executionTimeMs !== undefined && (
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                  {output.executionTimeMs}ms
                </span>
              )}
            </div>

            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 overflow-auto font-mono text-xs text-slate-200">
              {output ? (
                <>
                  <pre className="text-slate-100 whitespace-pre-wrap">{output.stdout}</pre>
                  {output.stderr && (
                    <pre className="text-rose-400 whitespace-pre-wrap mt-2 pt-2 border-t border-slate-800">
                      {output.stderr}
                    </pre>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Play className="w-6 h-6 text-slate-600" />
                  <p>Click "Execute Script" to run Python on the active dataset</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
