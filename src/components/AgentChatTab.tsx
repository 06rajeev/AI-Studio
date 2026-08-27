import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Terminal,
  Play,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Code2,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CustomerOrder, AgentChatMessage } from '../types';
import { queryAnalyticsAgent, executeCustomPython } from '../services/api';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

interface AgentChatTabProps {
  dataset: CustomerOrder[];
  onOpenPythonWorkbenchWithCode?: (code: string) => void;
}

const PRESET_PROMPTS = [
  {
    category: 'Customer RFM & Value',
    prompt: 'Identify our top 10 highest-value customers using RFM analysis, calculate their predicted CLV, and highlight any churn risks.',
    icon: Sparkles,
  },
  {
    category: 'Product Classification',
    prompt: 'Run ABC inventory classification on all products. Identify Class A revenue drivers versus Class C long-tail items, and calculate estimated margins.',
    icon: BarChart2,
  },
  {
    category: 'Cross-Category Affinity',
    prompt: 'Perform market basket analysis to uncover cross-category buying patterns. Which product categories are most frequently bought together with Lift > 1.5?',
    icon: TrendingUp,
  },
  {
    category: 'Order Revenue & Trends',
    prompt: 'Analyze monthly order velocity and average order value (AOV) across sales channels, and evaluate whether discounts increase total order sizes.',
    icon: Lightbulb,
  },
];

export const AgentChatTab: React.FC<AgentChatTabProps> = ({ dataset, onOpenPythonWorkbenchWithCode }) => {
  const [messages, setMessages] = useState<AgentChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Hello! I am your **Python Analytics Agent**. I write and execute custom Python 3 data science pipelines to analyze customer orders, classify product portfolios, identify high-value customer segments (RFM & CLV), and uncover cross-category basket affinity patterns.

Ask me any business analytical question, or click one of the suggested analytical pipelines below to start!`,
      suggested_followups: [
        'Identify our top high-value customers with RFM segmentation',
        'Classify products into ABC tiers & margin quadrants',
        'Find cross-category market basket association rules',
        'Analyze discount impact on order revenue by channel',
      ],
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [expandedCodeIds, setExpandedCodeIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputPrompt).trim();
    if (!textToSend || isLoading) return;

    const userMessage: AgentChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend,
    };

    const tempAssistantMessageId = `msg-agent-${Date.now()}`;
    const placeholderAssistantMessage: AgentChatMessage = {
      id: tempAssistantMessageId,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage, placeholderAssistantMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await queryAnalyticsAgent(textToSend, dataset, messages);

      const agentData = response.agentOutput;
      const pythonRes = response.pythonResult;

      const finalAssistantMessage: AgentChatMessage = {
        id: tempAssistantMessageId,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: agentData.explanation || 'Analytics analysis completed.',
        thought_process: agentData.thought_process,
        python_code: agentData.python_code,
        python_result: pythonRes,
        chart_config: agentData.chart_config,
        suggested_followups: agentData.suggested_followups,
        isLoading: false,
      };

      setMessages((prev) =>
        prev.map((m) => (m.id === tempAssistantMessageId ? finalAssistantMessage : m))
      );

      // Auto expand code for this message
      setExpandedCodeIds((prev) => ({ ...prev, [tempAssistantMessageId]: true }));
    } catch (err: any) {
      const errorMessage: AgentChatMessage = {
        id: tempAssistantMessageId,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `**Python Analytics Agent execution encountered an error:**\n${err?.message || 'Server timeout or API failure.'}\n\nPlease check server logs or re-try with a more specific query.`,
        isLoading: false,
      };
      setMessages((prev) =>
        prev.map((m) => (m.id === tempAssistantMessageId ? errorMessage : m))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleReRunPython = async (msgId: string, code: string) => {
    try {
      const result = await executeCustomPython(code, dataset);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === msgId) {
            return {
              ...m,
              python_result: result,
            };
          }
          return m;
        })
      );
    } catch (err: any) {
      console.error('Re-run error:', err);
    }
  };

  const toggleCodeExpand = (id: string) => {
    setExpandedCodeIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to render dynamic AI generated charts
  const renderAgentChart = (chartConfig: any) => {
    if (!chartConfig || !chartConfig.data || !Array.isArray(chartConfig.data) || chartConfig.data.length === 0) {
      return null;
    }

    const { type, title, xAxisKey, dataKeys, data } = chartConfig;

    return (
      <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
        {title && <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
          <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>{title}</span>
        </h4>}

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'line' ? (
              <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey={xAxisKey || 'name'} stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                {(dataKeys || ['value']).map((key: string, idx: number) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            ) : type === 'pie' ? (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey={dataKeys?.[0] || 'value'}
                  nameKey={xAxisKey || 'name'}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            ) : (
              // Default to Bar Chart
              <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey={xAxisKey || 'name'} stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                {(dataKeys || ['value']).map((key: string, idx: number) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={COLORS[idx % COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-7xl mx-auto p-4 sm:p-6 text-slate-200">
      {/* Top Banner / Presets */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Interactive Python Analytical Queries
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Powered by Python 3.10 & Gemini</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_PROMPTS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(p.prompt)}
                disabled={isLoading}
                className="flex flex-col text-left p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 transition shadow-sm group disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
                  <Icon className="w-3.5 h-3.5 group-hover:scale-110 transition" />
                  <span>{p.category}</span>
                </div>
                <p className="text-[11px] text-slate-400 group-hover:text-slate-200 line-clamp-2 leading-relaxed">
                  {p.prompt}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4 sm:p-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isCodeExpanded = expandedCodeIds[msg.id] ?? false;

          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-indigo-950/50">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-3xl rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-sm w-full'
                }`}
              >
                {/* User Prompt */}
                {isUser && <p className="text-sm font-medium whitespace-pre-wrap">{msg.text}</p>}

                {/* Assistant Loading State */}
                {!isUser && msg.isLoading && (
                  <div className="flex items-center gap-3 py-3 text-slate-400">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-300">
                        Writing Python analysis script & executing on dataset...
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Executing Python 3 standard library pipelines • JSON stdio parsing
                      </p>
                    </div>
                  </div>
                )}

                {/* Assistant Completed Response */}
                {!isUser && !msg.isLoading && (
                  <div className="space-y-3">
                    {/* Thought Process (Collapsible) */}
                    {msg.thought_process && (
                      <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-900/50 text-[11px] text-indigo-200">
                        <div className="flex items-center gap-1.5 font-semibold text-indigo-300 mb-1">
                          <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Analytical Methodology & Logic</span>
                        </div>
                        <p className="text-slate-300 leading-normal">{msg.thought_process}</p>
                      </div>
                    )}

                    {/* Natural Language Explanation */}
                    {msg.text && (
                      <div className="prose prose-invert max-w-none text-xs text-slate-200 space-y-2 leading-relaxed">
                        {msg.text.split('\n\n').map((paragraph, pIdx) => {
                          // Support bold headers
                          if (paragraph.startsWith('**') && paragraph.includes('**')) {
                            return (
                              <p key={pIdx} className="font-normal">
                                <span className="font-bold text-indigo-300">
                                  {paragraph.replace(/\*\*/g, '')}
                                </span>
                              </p>
                            );
                          }
                          return <p key={pIdx}>{paragraph}</p>;
                        })}
                      </div>
                    )}

                    {/* Interactive Generated Chart */}
                    {msg.chart_config && renderAgentChart(msg.chart_config)}

                    {/* Python Code Accordion */}
                    {msg.python_code && (
                      <div className="mt-3 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                        <div
                          onClick={() => toggleCodeExpand(msg.id)}
                          className="px-3.5 py-2 bg-slate-900 flex items-center justify-between cursor-pointer hover:bg-slate-850 transition"
                        >
                          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Python 3.10 Analysis Pipeline</span>
                            {msg.python_result?.executionTimeMs !== undefined && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                                {msg.python_result.executionTimeMs}ms
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyCode(msg.python_code!, msg.id);
                              }}
                              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                              title="Copy Code"
                            >
                              {copiedCodeId === msg.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReRunPython(msg.id, msg.python_code!);
                              }}
                              className="p-1 text-slate-400 hover:text-emerald-400 rounded hover:bg-slate-800 transition"
                              title="Re-run Python Script"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>

                            {onOpenPythonWorkbenchWithCode && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenPythonWorkbenchWithCode(msg.python_code!);
                                }}
                                className="text-[10px] text-slate-400 hover:text-cyan-300 font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition"
                              >
                                Edit in Lab
                              </button>
                            )}

                            {isCodeExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {isCodeExpanded && (
                          <div className="p-3 bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-72 overflow-y-auto border-t border-slate-800">
                            <pre className="text-emerald-400 whitespace-pre">
                              {msg.python_code}
                            </pre>
                          </div>
                        )}

                        {/* Python stdout & execution logs */}
                        {isCodeExpanded && msg.python_result && (
                          <div className="p-3 bg-slate-900/90 border-t border-slate-800 text-[11px] font-mono">
                            <div className="flex items-center justify-between text-slate-400 mb-1">
                              <span className="flex items-center gap-1.5 text-xs text-amber-400">
                                <Terminal className="w-3 h-3" />
                                <span>Standard Output / Log</span>
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Exit Code: {msg.python_result.exitCode}
                              </span>
                            </div>
                            <pre className="text-slate-300 max-h-40 overflow-y-auto whitespace-pre-wrap bg-slate-950 p-2 rounded border border-slate-800">
                              {msg.python_result.stdout || '(No stdout output)'}
                              {msg.python_result.stderr ? `\nSTDERR:\n${msg.python_result.stderr}` : ''}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Suggested follow-up prompt pills */}
                    {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block mb-1.5">
                          Suggested Investigations:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggested_followups.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSend(sug)}
                              className="text-[11px] bg-slate-800/80 hover:bg-slate-700/80 hover:text-cyan-300 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition flex items-center gap-1"
                            >
                              <HelpCircle className="w-3 h-3 text-cyan-400" />
                              <span>{sug}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Box */}
      <div className="mt-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask the Analytics Agent (e.g. 'Calculate customer retention rate by acquisition channel and find high-margin cross-sell opportunities')..."
            disabled={isLoading}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 pr-28 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 shadow-inner"
          />

          <div className="absolute right-2 flex items-center gap-1">
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Run</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
