"use client";

import { useEffect, useState } from "react";
import { TimeRangeSelector } from "./_components/time-range-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, Activity, CheckCircle, TrendingUp, AlertCircle, Clock, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type TimeRange = "today" | "7d" | "30d" | "custom";

interface MetricData {
  started: number;
  completed: number;
  approved: number;
  rejected: number;
  pendingReview: number;
  escalated: number;
  expired: number;
  conversionRate: number;
  manualReviewRate: number;
  avgCompletionTimeMs: number;
  byType: { KYC: number; KYB: number; KYI: number };
  recentEvents: Array<{ eventType: string; timestamp: string }>;
}

interface FunnelData {
  stages: Array<{ name: string; count: number; drop: string | number }>;
}

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  sparkline,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: { value: number; direction: "up" | "down" };
  sparkline?: number[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
        {trend && (
          <div className="flex items-center text-xs">
            {trend.direction === "up" ? (
              <ArrowUpIcon className="h-3 w-3 text-emerald-600 mr-1" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 text-red-600 mr-1" />
            )}
            <span
              className={trend.direction === "up" ? "text-emerald-600" : "text-red-600"}
            >
              {Math.abs(trend.value)}% vs last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [metricsRes, funnelRes] = await Promise.all([
          fetch(`/api/client/verifications/stats?timeRange=${timeRange}`),
          fetch(`/api/client/verifications/funnel?timeRange=${timeRange}`),
        ]);

        if (metricsRes.ok) {
          setMetrics(await metricsRes.json());
        }
        if (funnelRes.ok) {
          setFunnel(await funnelRes.json());
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [timeRange]);

  function formatTime(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Verification Dashboard
          </h1>
          <TimeRangeSelector onChange={setTimeRange} />
        </div>

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Total Started"
              value={metrics.started}
              icon={Activity}
              trend={{ value: 12, direction: "up" }}
            />
            <MetricCard
              title="Approved"
              value={metrics.approved}
              icon={CheckCircle}
              trend={{ value: 8, direction: "up" }}
            />
            <MetricCard
              title="Conversion Rate"
              value={`${metrics.conversionRate.toFixed(1)}%`}
              icon={TrendingUp}
              trend={{ value: 5, direction: "up" }}
            />
            <MetricCard
              title="Manual Review Rate"
              value={`${metrics.manualReviewRate.toFixed(1)}%`}
              icon={AlertCircle}
              trend={{ value: 2, direction: "down" }}
            />
            <MetricCard
              title="Avg. Completion Time"
              value={formatTime(metrics.avgCompletionTimeMs)}
              icon={Clock}
            />
            <MetricCard
              title="Rejected"
              value={metrics.rejected}
              icon={XCircle}
              trend={{ value: 1, direction: "up" }}
            />
          </div>
        )}

        {/* Funnel Chart */}
        {funnel && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
              Verification Funnel
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={funnel.stages}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={190} />
                <Tooltip />
                <Bar dataKey="count" fill="#000000" radius={[0, 8, 8, 0]}>
                  {funnel.stages.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={["#000000", "#6366f1", "#f97316", "#10b981"][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Activity Feed */}
        {metrics && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {metrics.recentEvents.slice(0, 10).map((event, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {event.eventType}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
