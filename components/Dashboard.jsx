"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { STATUS_OPTIONS, STATUS_CHART_COLORS } from "../lib/constants";
import { getWeekStart, formatShortDate } from "../lib/utils";

function StatCard({ label, value, accent }) {
  return (
    <div className="p-4 border border-slate-200 rounded-lg bg-white">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent || "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-md px-3 py-2 shadow-sm text-sm">
      <p className="text-slate-500 text-xs mb-0.5">{label}</p>
      <p className="font-semibold text-slate-900">{payload[0].value} lamaran</p>
    </div>
  );
}

export default function Dashboard({ applications }) {
  const weeklyData = useMemo(() => {
    const buckets = {};
    applications.forEach((app) => {
      if (!app.date) return;
      const week = getWeekStart(app.date);
      buckets[week] = (buckets[week] || 0) + 1;
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, count]) => ({ week: formatShortDate(week), count }));
  }, [applications]);

  const statusData = useMemo(
    () =>
      STATUS_OPTIONS.map((status) => ({
        status,
        count: applications.filter((a) => a.status === status).length,
      })),
    [applications]
  );

  const scored = applications.filter((a) => a.matchScore != null);
  const avgScore =
    scored.length > 0
      ? Math.round(scored.reduce((sum, a) => sum + a.matchScore, 0) / scored.length)
      : null;
  const interviewCount = applications.filter((a) => a.status === "Interview").length;
  const offerCount = applications.filter((a) => a.status === "Offer").length;

  if (applications.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-sm">Belum ada data. Tambah lamaran dulu di tab Lacak Lamaran.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Lamaran" value={applications.length} />
        <StatCard label="Interview" value={interviewCount} accent="text-amber-600" />
        <StatCard label="Offer" value={offerCount} accent="text-emerald-600" />
        <StatCard
          label="Rata-rata Skor"
          value={avgScore != null ? `${avgScore}%` : "–"}
          accent="text-teal-700"
        />
      </div>

      <div className="p-4 border border-slate-200 rounded-lg bg-white">
        <p className="text-sm font-semibold text-slate-700 mb-4">Lamaran dari Waktu ke Waktu</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e0" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 12, fill: "#5B5C64" }}
              axisLine={{ stroke: "#e5e4e0" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#5B5C64" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f7f6f3" }} />
            <Bar dataKey="count" fill="#0f766e" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="p-4 border border-slate-200 rounded-lg bg-white">
        <p className="text-sm font-semibold text-slate-700 mb-4">Lamaran per Tahap</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={statusData} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e0" horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#5B5C64" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="status"
              tick={{ fontSize: 12, fill: "#5B5C64" }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f7f6f3" }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {statusData.map((entry) => (
                <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}