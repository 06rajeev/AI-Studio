import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy init Gemini AI
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Helper to execute Python code via child_process
interface PythonResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  data?: any;
  executionTimeMs: number;
}

function executePython(code: string, inputData?: any, timeoutMs = 20000): Promise<PythonResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const pyProcess = spawn('python3', ['-c', code]);

    let stdout = '';
    let stderr = '';
    let isFinished = false;

    const timer = setTimeout(() => {
      if (!isFinished) {
        isFinished = true;
        pyProcess.kill('SIGKILL');
        resolve({
          stdout,
          stderr: stderr + '\nExecution timed out after ' + timeoutMs + 'ms',
          exitCode: -1,
          executionTimeMs: Date.now() - startTime,
        });
      }
    }, timeoutMs);

    if (inputData !== undefined) {
      try {
        pyProcess.stdin.write(typeof inputData === 'string' ? inputData : JSON.stringify(inputData));
        pyProcess.stdin.end();
      } catch (err: any) {
        stderr += `\nError writing to stdin: ${err?.message}`;
      }
    } else {
      pyProcess.stdin.end();
    }

    pyProcess.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    pyProcess.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    pyProcess.on('close', (code) => {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(timer);
        const executionTimeMs = Date.now() - startTime;
        let parsedData: any = undefined;

        // Try to parse stdout as JSON if it ends or contains a JSON block
        const trimmed = stdout.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try {
            parsedData = JSON.parse(trimmed);
          } catch {
            // might have debug prints before json; look for JSON markers
            const jsonMarker = trimmed.lastIndexOf('---JSON_START---');
            if (jsonMarker !== -1) {
              try {
                const sub = trimmed.substring(jsonMarker + '---JSON_START---'.length).replace('---JSON_END---', '').trim();
                parsedData = JSON.parse(sub);
              } catch {}
            }
          }
        } else {
          const jsonMarker = trimmed.lastIndexOf('---JSON_START---');
          if (jsonMarker !== -1) {
            try {
              const sub = trimmed.substring(jsonMarker + '---JSON_START---'.length).replace('---JSON_END---', '').trim();
              parsedData = JSON.parse(sub);
            } catch {}
          }
        }

        resolve({
          stdout,
          stderr,
          exitCode: code ?? 0,
          data: parsedData,
          executionTimeMs,
        });
      }
    });

    pyProcess.on('error', (err) => {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(timer);
        resolve({
          stdout,
          stderr: `Process error: ${err.message}`,
          exitCode: 1,
          executionTimeMs: Date.now() - startTime,
        });
      }
    });
  });
}

// Built-in Pure Python Data Science Engine for full analysis suite
const PYTHON_FULL_ANALYSIS_SCRIPT = `
import sys
import json
import math
from collections import defaultdict, Counter
from datetime import datetime
from itertools import combinations

def run_analysis():
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print(json.dumps({"error": "Empty input data"}))
            return
        
        orders = json.loads(raw_input)
        if not isinstance(orders, list) or len(orders) == 0:
            print(json.dumps({"error": "Orders must be a non-empty list"}))
            return

        total_orders_count = len(orders)
        total_revenue = 0.0
        total_quantity = 0
        customer_orders = defaultdict(list)
        product_stats = defaultdict(lambda: {
            "name": "", "category": "", "subcategory": "",
            "revenue": 0.0, "quantity": 0, "order_count": 0,
            "unit_price": 0.0, "ratings": []
        })
        category_stats = defaultdict(lambda: {"revenue": 0.0, "orders": 0, "quantity": 0, "customers": set()})
        date_stats = defaultdict(lambda: {"revenue": 0.0, "orders": 0, "quantity": 0})
        baskets = defaultdict(set) # order_id -> set of categories/products
        basket_products = defaultdict(set)

        dates = []

        for o in orders:
            order_id = str(o.get("order_id", ""))
            cust_id = str(o.get("customer_id", ""))
            cust_name = str(o.get("customer_name", f"Customer {cust_id}"))
            cust_email = str(o.get("customer_email", ""))
            city = str(o.get("city", "Unknown"))
            region = str(o.get("region", "Other"))
            channel = str(o.get("channel", "Web"))
            
            prod_id = str(o.get("product_id", "P-000"))
            prod_name = str(o.get("product_name", "Unknown Product"))
            cat = str(o.get("category", "General"))
            subcat = str(o.get("subcategory", "General"))
            
            price = float(o.get("unit_price", 0.0))
            qty = int(o.get("quantity", 1))
            disc = float(o.get("discount", 0.0))
            
            # Line revenue calculation
            line_rev = price * qty * (1.0 - disc)
            total_revenue += line_rev
            total_quantity += qty
            
            date_str = str(o.get("order_date", "2026-01-01"))
            dates.append(date_str)
            
            rating = o.get("rating")
            returned = bool(o.get("returned", False))

            # Record customer order line
            customer_orders[cust_id].append({
                "order_id": order_id,
                "date": date_str,
                "amount": line_rev,
                "quantity": qty,
                "product_id": prod_id,
                "category": cat,
                "name": cust_name,
                "email": cust_email,
                "city": city,
                "region": region,
                "channel": channel,
                "returned": returned
            })

            # Product stats
            ps = product_stats[prod_id]
            ps["id"] = prod_id
            ps["name"] = prod_name
            ps["category"] = cat
            ps["subcategory"] = subcat
            ps["unit_price"] = price
            ps["revenue"] += line_rev
            ps["quantity"] += qty
            ps["order_count"] += 1
            if rating is not None:
                try:
                    ps["ratings"].append(float(rating))
                except:
                    pass

            # Category stats
            cs = category_stats[cat]
            cs["revenue"] += line_rev
            cs["orders"] += 1
            cs["quantity"] += qty
            cs["customers"].add(cust_id)

            # Date stats (YYYY-MM or YYYY-MM-DD)
            month_key = date_str[:7] if len(date_str) >= 7 else date_str
            ds = date_stats[month_key]
            ds["revenue"] += line_rev
            ds["orders"] += 1
            ds["quantity"] += qty

            # Baskets
            baskets[order_id].add(cat)
            basket_products[order_id].add(prod_name)

        # 1. SUMMARY KPIs
        unique_customers = len(customer_orders)
        unique_products = len(product_stats)
        aov = total_revenue / total_orders_count if total_orders_count > 0 else 0.0
        avg_items_per_order = total_quantity / total_orders_count if total_orders_count > 0 else 0.0
        repeat_customers = sum(1 for c in customer_orders.values() if len({item["order_id"] for item in c}) > 1)
        repeat_rate = (repeat_customers / unique_customers * 100) if unique_customers > 0 else 0.0

        # Sort dates to find reference max date for RFM
        sorted_dates = sorted(dates)
        ref_date_str = sorted_dates[-1] if sorted_dates else "2026-08-25"
        try:
            ref_date = datetime.strptime(ref_date_str[:10], "%Y-%m-%d")
        except:
            ref_date = datetime(2026, 8, 25)

        # 2. RFM & CLV CUSTOMER ANALYSIS
        customer_profiles = []
        for cust_id, items in customer_orders.items():
            cust_name = items[0]["name"]
            cust_email = items[0]["email"]
            region = items[0]["region"]
            channel = items[0]["channel"]
            
            distinct_orders = {it["order_id"] for it in items}
            freq = len(distinct_orders)
            monetary = sum(it["amount"] for it in items)
            total_items = sum(it["quantity"] for it in items)
            
            cust_dates = []
            for it in items:
                try:
                    cust_dates.append(datetime.strptime(it["date"][:10], "%Y-%m-%d"))
                except:
                    pass
            
            if cust_dates:
                latest_order_date = max(cust_dates)
                recency_days = (ref_date - latest_order_date).days
                first_order_date = min(cust_dates)
                tenure_days = (ref_date - first_order_date).days + 1
            else:
                recency_days = 30
                tenure_days = 60
            
            # Preferred category
            cat_counts = Counter(it["category"] for it in items)
            preferred_category = cat_counts.most_common(1)[0][0] if cat_counts else "General"

            customer_profiles.append({
                "customer_id": cust_id,
                "name": cust_name,
                "email": cust_email,
                "region": region,
                "channel": channel,
                "recency_days": max(0, recency_days),
                "frequency": freq,
                "monetary": round(monetary, 2),
                "total_items": total_items,
                "aov": round(monetary / freq, 2) if freq > 0 else round(monetary, 2),
                "tenure_days": tenure_days,
                "preferred_category": preferred_category,
                "returned_count": sum(1 for it in items if it.get("returned"))
            })

        # Calculate RFM Scores (1 to 5)
        # Recency: lower is better -> sort ascending
        r_sorted = sorted(customer_profiles, key=lambda x: x["recency_days"])
        f_sorted = sorted(customer_profiles, key=lambda x: x["frequency"])
        m_sorted = sorted(customer_profiles, key=lambda x: x["monetary"])
        
        n_cust = len(customer_profiles)
        r_rank = {c["customer_id"]: int(math.ceil((1.0 - (idx / n_cust)) * 5)) or 1 for idx, c in enumerate(r_sorted)}
        f_rank = {c["customer_id"]: int(math.ceil(((idx + 1) / n_cust) * 5)) or 1 for idx, c in enumerate(f_sorted)}
        m_rank = {c["customer_id"]: int(math.ceil(((idx + 1) / n_cust) * 5)) or 1 for idx, c in enumerate(m_sorted)}

        rfm_segments_count = Counter()
        for c in customer_profiles:
            cid = c["customer_id"]
            r = max(1, min(5, r_rank.get(cid, 3)))
            f = max(1, min(5, f_rank.get(cid, 3)))
            m = max(1, min(5, m_rank.get(cid, 3)))
            c["r_score"] = r
            c["f_score"] = f
            c["m_score"] = m
            c["rfm_score"] = f"{r}{f}{m}"
            
            # Determine Segment
            if r >= 4 and f >= 4 and m >= 4:
                seg = "Champions"
            elif r >= 3 and f >= 3 and m >= 3:
                seg = "Loyal Customers"
            elif r >= 4 and f <= 2:
                seg = "Recent Potential"
            elif r >= 3 and f >= 1 and m >= 4:
                seg = "High Spenders"
            elif r <= 2 and f >= 3 and m >= 3:
                seg = "At Risk"
            elif r <= 2 and f >= 4 and m >= 4:
                seg = "Can't Lose Them"
            elif r <= 2 and f <= 2 and m >= 3:
                seg = "About To Sleep"
            elif r <= 2 and f <= 2 and m <= 2:
                seg = "Hibernating / Lost"
            else:
                seg = "Promising"
                
            c["segment"] = seg
            rfm_segments_count[seg] += 1
            
            # Simple predictive CLV model: historical monetary * (1 + frequency * 0.15) * recency_factor
            recency_decay = math.exp(-0.005 * c["recency_days"])
            predicted_clv = c["monetary"] * (1.0 + (c["frequency"] * 0.25)) * (0.5 + 0.5 * recency_decay)
            c["predicted_clv"] = round(predicted_clv, 2)

        # Sort customers by monetary spend descending to find VIPs
        customer_profiles.sort(key=lambda x: x["monetary"], reverse=True)
        top_vips = customer_profiles[:25]

        # Calculate Pareto 80/20 spend breakdown
        total_cust_spend = sum(c["monetary"] for c in customer_profiles)
        cum_spend = 0.0
        pareto_data = []
        for idx, c in enumerate(customer_profiles):
            cum_spend += c["monetary"]
            if idx % max(1, (n_cust // 20)) == 0 or idx == n_cust - 1:
                pareto_data.append({
                    "customer_percentile": round(((idx + 1) / n_cust) * 100, 1),
                    "revenue_share": round((cum_spend / total_cust_spend) * 100, 1) if total_cust_spend > 0 else 0
                })

        # 3. PRODUCT CLASSIFICATION (ABC Analysis & BCG Matrix)
        all_products = list(product_stats.values())
        all_products.sort(key=lambda x: x["revenue"], reverse=True)
        
        cum_prod_rev = 0.0
        for p in all_products:
            cum_prod_rev += p["revenue"]
            share = (cum_prod_rev / total_revenue * 100) if total_revenue > 0 else 0.0
            
            # ABC Classification based on cumulative revenue
            if share <= 70.0:
                abc = "A (High Value / Velocity)"
            elif share <= 90.0:
                abc = "B (Moderate Value)"
            else:
                abc = "C (Long Tail / Low Velocity)"
            p["abc_class"] = abc
            p["avg_rating"] = round(sum(p["ratings"]) / len(p["ratings"]), 2) if p["ratings"] else 4.2
            
            # Price Tiering
            price = p["unit_price"]
            if price >= 500:
                tier = "Luxury ($500+)"
            elif price >= 150:
                tier = "Premium ($150-$499)"
            elif price >= 50:
                tier = "Mid-Range ($50-$149)"
            else:
                tier = "Budget (<$50)"
            p["price_tier"] = tier

            # Volume vs Velocity classification
            # Estimate gross margin ~ (30% to 65% depending on category/tier)
            margin_pct = 0.55 if tier in ["Luxury ($500+)", "Premium ($150-$499)"] else 0.35
            p["estimated_margin"] = round(p["revenue"] * margin_pct, 2)
            p["revenue"] = round(p["revenue"], 2)

        # 4. CROSS-CATEGORY BUYING PATTERNS & APRIORI BASKET ANALYSIS
        total_baskets = len(baskets)
        category_co_occurrence = defaultdict(lambda: defaultdict(int))
        category_counts = defaultdict(int)

        for order_id, cats in baskets.items():
            for c in cats:
                category_counts[c] += 1
            for c1, c2 in combinations(sorted(cats), 2):
                category_co_occurrence[c1][c2] += 1
                category_co_occurrence[c2][c1] += 1

        # Association Rules for Categories
        rules = []
        all_cats = list(category_counts.keys())
        for c1 in all_cats:
            for c2 in all_cats:
                if c1 == c2:
                    continue
                pair_count = category_co_occurrence[c1][c2]
                if pair_count < 2:
                    continue
                
                support_pair = pair_count / total_baskets if total_baskets > 0 else 0
                support_c1 = category_counts[c1] / total_baskets if total_baskets > 0 else 0
                support_c2 = category_counts[c2] / total_baskets if total_baskets > 0 else 0
                
                if support_c1 == 0 or support_c2 == 0:
                    continue
                
                confidence = support_pair / support_c1
                lift = confidence / support_c2

                if lift > 0.8: # Include meaningful associations
                    rules.append({
                        "antecedent": c1,
                        "consequent": c2,
                        "pair_count": pair_count,
                        "support": round(support_pair * 100, 2),
                        "confidence": round(confidence * 100, 2),
                        "lift": round(lift, 3),
                        "recommendation": f"Customers who purchase {c1} have a {round(confidence*100, 1)}% probability of also buying {c2} ({round(lift, 2)}x baseline)."
                    })

        rules.sort(key=lambda x: x["lift"], reverse=True)

        # Cross-category affinity matrix
        categories_list = sorted(list(category_counts.keys()))
        matrix = []
        for c1 in categories_list:
            row = {"category": c1}
            for c2 in categories_list:
                if c1 == c2:
                    row[c2] = 100.0
                else:
                    pair_count = category_co_occurrence[c1][c2]
                    supp_c1 = category_counts[c1]
                    affinity = round((pair_count / supp_c1 * 100), 1) if supp_c1 > 0 else 0.0
                    row[c2] = affinity
            matrix.append(row)

        # Monthly / Timeline chart data
        timeline_data = []
        for m_key in sorted(date_stats.keys()):
            ds = date_stats[m_key]
            timeline_data.append({
                "period": m_key,
                "revenue": round(ds["revenue"], 2),
                "orders": ds["orders"],
                "units": ds["quantity"],
                "aov": round(ds["revenue"] / ds["orders"], 2) if ds["orders"] > 0 else 0
            })

        # Category summary
        category_summary = []
        for cat, cs in category_stats.items():
            category_summary.append({
                "category": cat,
                "revenue": round(cs["revenue"], 2),
                "orders": cs["orders"],
                "quantity": cs["quantity"],
                "unique_buyers": len(cs["customers"]),
                "revenue_share": round((cs["revenue"] / total_revenue * 100), 2) if total_revenue > 0 else 0
            })
        category_summary.sort(key=lambda x: x["revenue"], reverse=True)

        # Output JSON packet
        result = {
            "kpis": {
                "total_revenue": round(total_revenue, 2),
                "total_orders": total_orders_count,
                "total_units": total_quantity,
                "unique_customers": unique_customers,
                "unique_products": unique_products,
                "aov": round(aov, 2),
                "repeat_rate": round(repeat_rate, 2),
                "avg_items_per_order": round(avg_items_per_order, 2),
                "reference_date": ref_date_str
            },
            "rfm_analysis": {
                "segments": dict(rfm_segments_count),
                "segment_summary": [
                    {"name": seg, "count": count, "percent": round(count / unique_customers * 100, 1)}
                    for seg, count in rfm_segments_count.most_common()
                ],
                "top_vips": top_vips,
                "pareto_curve": pareto_data,
                "customers_sample": customer_profiles[:150]
            },
            "product_classification": {
                "products": all_products,
                "abc_summary": dict(Counter(p["abc_class"] for p in all_products)),
                "price_tier_summary": dict(Counter(p["price_tier"] for p in all_products)),
                "categories": category_summary
            },
            "cross_category_affinity": {
                "rules": rules[:25],
                "matrix": matrix,
                "categories": categories_list
            },
            "timeline": timeline_data
        }

        print("---JSON_START---")
        print(json.dumps(result))
        print("---JSON_END---")

    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        print(json.dumps({"error": str(e), "traceback": err_msg}), file=sys.stderr)

if __name__ == "__main__":
    run_analysis()
`;

// API route: Run full Python analysis suite on dataset
app.post('/api/analytics/run-all', async (req, res) => {
  try {
    const orders = req.body.orders;
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: 'Valid orders array required' });
    }

    const result = await executePython(PYTHON_FULL_ANALYSIS_SCRIPT, orders);
    if (result.exitCode !== 0 || !result.data) {
      return res.status(500).json({
        error: 'Python analysis failed',
        stderr: result.stderr,
        stdout: result.stdout,
      });
    }

    res.json({
      success: true,
      executionTimeMs: result.executionTimeMs,
      data: result.data,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// API route: Execute arbitrary Python code
app.post('/api/python/execute', async (req, res) => {
  try {
    const { code, inputData } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Python code string is required' });
    }

    const result = await executePython(code, inputData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to execute Python script' });
  }
});

// API route: AI Analytics Agent with Gemini + Python Code Generation & Execution
app.post('/api/agent/query', async (req, res) => {
  try {
    const { prompt, dataset, chatHistory } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getAI();
    const model = 'gemini-3.7-flash';

    // Sample dataset schema and sample rows for the prompt
    const sampleRows = Array.isArray(dataset) ? dataset.slice(0, 5) : [];
    const totalCount = Array.isArray(dataset) ? dataset.length : 0;

    const systemPrompt = `You are the Lead Python Data Science & Analytics Agent for an Enterprise E-Commerce and Retail Analytics platform.
Your job is to analyze customer orders, classify products, identify high-value customers, and understand buying patterns across categories.

When given a user analytical question or instruction:
1. Write a clean, self-contained Python 3 script using only standard library modules (json, sys, collections, math, statistics, itertools, datetime, etc.) that reads orders from sys.stdin as JSON, computes the exact analytics, and outputs a structured JSON object enclosed between ---JSON_START--- and ---JSON_END---.
2. In your JSON response, return:
   - "thought_process": Detailed analytical reasoning and methodology.
   - "python_code": The runnable Python 3 script.
   - "explanation": Clear, executive-level natural language summary of findings and strategic business recommendations.
   - "chart_config": Optional recommended chart configuration:
     - type: 'bar' | 'line' | 'pie' | 'scatter' | 'radar' | 'table'
     - title: string
     - xAxisKey: string
     - dataKeys: string[]
     - data: array of objects (if pre-computed or extracted)

Dataset Context:
- Current active dataset contains ${totalCount} records.
- Schema per record: { order_id, order_date, customer_id, customer_name, customer_email, city, region, channel, product_id, product_name, category, subcategory, unit_price, quantity, discount, total_amount, rating, returned }
- Sample records: ${JSON.stringify(sampleRows, null, 2)}

Return your answer strictly in valid JSON matching this schema:
{
  "thought_process": "string",
  "python_code": "string",
  "explanation": "string",
  "chart_config": {
    "type": "bar",
    "title": "string",
    "xAxisKey": "string",
    "dataKeys": ["string"],
    "data": []
  },
  "suggested_followups": ["string", "string"]
}`;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `${systemPrompt}\n\nUser Question: "${prompt}"\n\nChat context: ${JSON.stringify(
              chatHistory || []
            )}`,
          },
        ],
      },
    ];

    const aiResponse = await ai.models.generateContent({
      model,
      contents: contents as any,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const aiText = aiResponse.text || '{}';
    let parsedAgentOutput: any = {};
    try {
      parsedAgentOutput = JSON.parse(aiText);
    } catch {
      parsedAgentOutput = {
        thought_process: 'Analyzed query and formulated Python computation.',
        python_code: `# Python fallback script\nimport sys, json\norders = json.loads(sys.stdin.read())\nprint(json.dumps({"count": len(orders)}))`,
        explanation: aiText,
      };
    }

    // Now, let's actually EXECUTE the generated Python code on the real dataset!
    let pythonExecutionResult: PythonResult = {
      stdout: '',
      stderr: '',
      exitCode: 0,
      executionTimeMs: 0,
    };

    if (parsedAgentOutput.python_code) {
      pythonExecutionResult = await executePython(parsedAgentOutput.python_code, dataset);
    }

    // If Python returned structured data, merge it into the response
    res.json({
      success: true,
      agentOutput: parsedAgentOutput,
      pythonResult: pythonExecutionResult,
    });
  } catch (error: any) {
    console.error('Agent query error:', error);
    res.status(500).json({ error: error.message || 'Failed to process agent query' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Mount Vite middleware or static serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Analytics Agent server running on http://localhost:${PORT}`);
  });
}

start();
