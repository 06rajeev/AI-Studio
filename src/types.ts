export interface CustomerOrder {
  order_id: string;
  order_date: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  city: string;
  region: string;
  channel: 'Web' | 'Mobile App' | 'In-Store' | 'Marketplace';
  product_id: string;
  product_name: string;
  category: string;
  subcategory: string;
  unit_price: number;
  quantity: number;
  discount: number; // 0.0 to 0.5
  total_amount: number;
  rating?: number;
  returned?: boolean;
}

export interface KPIStats {
  total_revenue: number;
  total_orders: number;
  total_units: number;
  unique_customers: number;
  unique_products: number;
  aov: number;
  repeat_rate: number;
  avg_items_per_order: number;
  reference_date: string;
}

export interface CustomerProfile {
  customer_id: string;
  name: string;
  email: string;
  region: string;
  channel: string;
  recency_days: number;
  frequency: number;
  monetary: number;
  total_items: number;
  aov: number;
  tenure_days: number;
  preferred_category: string;
  returned_count: number;
  r_score: number;
  f_score: number;
  m_score: number;
  rfm_score: string;
  segment: string;
  predicted_clv: number;
}

export interface RFMSegmentSummary {
  name: string;
  count: number;
  percent: number;
}

export interface ParetoPoint {
  customer_percentile: number;
  revenue_share: number;
}

export interface ProductClassificationItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  unit_price: number;
  revenue: number;
  quantity: number;
  order_count: number;
  avg_rating: number;
  abc_class: string;
  price_tier: string;
  estimated_margin: number;
}

export interface CategorySummary {
  category: string;
  revenue: number;
  orders: number;
  quantity: number;
  unique_buyers: number;
  revenue_share: number;
}

export interface AssociationRule {
  antecedent: string;
  consequent: string;
  pair_count: number;
  support: number;
  confidence: number;
  lift: number;
  recommendation: string;
}

export interface TimelineDataPoint {
  period: string;
  revenue: number;
  orders: number;
  units: number;
  aov: number;
}

export interface FullAnalysisData {
  kpis: KPIStats;
  rfm_analysis: {
    segments: Record<string, number>;
    segment_summary: RFMSegmentSummary[];
    top_vips: CustomerProfile[];
    pareto_curve: ParetoPoint[];
    customers_sample: CustomerProfile[];
  };
  product_classification: {
    products: ProductClassificationItem[];
    abc_summary: Record<string, number>;
    price_tier_summary: Record<string, number>;
    categories: CategorySummary[];
  };
  cross_category_affinity: {
    rules: AssociationRule[];
    matrix: Array<Record<string, any>>;
    categories: string[];
  };
  timeline: TimelineDataPoint[];
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  text?: string;
  thought_process?: string;
  python_code?: string;
  python_result?: {
    stdout: string;
    stderr: string;
    exitCode: number;
    data?: any;
    executionTimeMs: number;
  };
  chart_config?: {
    type: 'bar' | 'line' | 'pie' | 'scatter' | 'radar' | 'table';
    title: string;
    xAxisKey: string;
    dataKeys: string[];
    data: any[];
  };
  suggested_followups?: string[];
  isLoading?: boolean;
}

export interface DatasetPreset {
  id: string;
  name: string;
  description: string;
  industry: string;
  recordCount: number;
}
