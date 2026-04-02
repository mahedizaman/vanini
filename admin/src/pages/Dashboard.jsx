import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  HiOutlineCurrencyDollar,
  HiOutlineShoppingBag,
  HiOutlineUsers,
  HiOutlineCube,
  HiOutlineClock,
} from "react-icons/hi2";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import api from "../api/axios";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";

function useCountUp(end, duration = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setV(Math.round(from + (end - from) * t));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration]);
  return v;
}

function StatCard({ icon, label, value, prefix = "", suffix = "" }) {
  const display = useCountUp(typeof value === "number" ? value : 0);
  const Icon = icon;
  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 text-primary">
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <p className="text-2xl font-bold tabular-nums text-primary">
            {prefix}
            {display}
            {suffix}
          </p>
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-600">{label}</p>
        </div>
      </div>
    </div>
  );
}

function orderStatusVariant(s) {
  const k = String(s || "").toLowerCase();
  if (k === "delivered") return "success";
  if (k === "cancelled") return "danger";
  if (k === "pending") return "warning";
  return "info";
}

export default function Dashboard() {
  const statsQuery = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => (await api.get("/admin/stats")).data,
  });

  const chartQuery = useQuery({
    queryKey: ["admin", "sales-chart"],
    queryFn: async () => (await api.get("/admin/sales-chart")).data?.data,
  });

  const recentQuery = useQuery({
    queryKey: ["admin", "recent-orders"],
    queryFn: async () => (await api.get("/admin/recent-orders")).data?.data,
  });

  const s = statsQuery.data || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Dashboard</h1>
        <p className="text-sm text-neutral-600">Overview of your store</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={HiOutlineCurrencyDollar} label="Total Revenue" value={Number(s.totalRevenue || 0)} prefix="৳" />
        <StatCard icon={HiOutlineShoppingBag} label="Total Orders" value={Number(s.totalOrders || 0)} />
        <StatCard icon={HiOutlineUsers} label="Total Users" value={Number(s.totalUsers || 0)} />
        <StatCard icon={HiOutlineCube} label="Active Products" value={Number(s.totalProducts || 0)} />
        <StatCard icon={HiOutlineClock} label="Pending Orders" value={Number(s.pendingOrders || 0)} />
      </div>

      <div className="rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-primary">Monthly Sales</h2>
        <p className="text-sm text-neutral-600">Revenue (৳) and order count (last 12 months)</p>
        <div className="mt-4 h-80 w-full">
          {chartQuery.isLoading ? (
            <p className="text-sm text-neutral-600">Loading chart…</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartQuery.data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (৳)" stroke="#111111" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#dc2626" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-primary">Recent Orders</h2>
        <p className="text-sm text-neutral-600">Last 10 orders</p>
        <div className="mt-4">
          <Table
            columns={[
              { key: "_id", label: "Order ID" },
              { key: "customer", label: "Customer" },
              { key: "finalPrice", label: "Amount" },
              { key: "orderStatus", label: "Status" },
              { key: "createdAt", label: "Date" },
            ]}
            rows={recentQuery.data || []}
            getRowKey={(r) => r._id}
            renderCell={(row, col) => {
              if (col.key === "_id") return <span className="font-mono text-xs">#{String(row._id).slice(-8)}</span>;
              if (col.key === "customer") {
                const u = row.user;
                if (u && typeof u === "object") {
                  return (
                    <span>
                      {u.name} <span className="text-neutral-500">({u.email})</span>
                    </span>
                  );
                }
                return "—";
              }
              if (col.key === "finalPrice") return `৳${Number(row.finalPrice || 0).toFixed(0)}`;
              if (col.key === "orderStatus")
                return <Badge variant={orderStatusVariant(row.orderStatus)}>{row.orderStatus}</Badge>;
              if (col.key === "createdAt") return row.createdAt ? new Date(row.createdAt).toLocaleString() : "—";
              return String(row[col.key] ?? "");
            }}
          />
        </div>
      </div>
    </div>
  );
}
