import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";

const STATUS_OPTIONS = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

function orderStatusVariant(s) {
  const k = String(s || "").toLowerCase();
  if (k === "delivered") return "success";
  if (k === "cancelled") return "danger";
  if (k === "pending") return "warning";
  return "info";
}

export default function Orders() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [rowDraft, setRowDraft] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["orders", "admin", page, status, startDate, endDate],
    queryFn: async () => {
      const res = await api.get("/orders", {
        params: {
          page,
          limit: 20,
          ...(status !== "all" ? { status } : {}),
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
        },
      });
      return res.data;
    },
  });

  const orders = data?.data || [];
  const pagination = data?.pagination || {};

  const applyFilters = () => {
    setPage(1);
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  const updateStatus = async (id, orderStatus) => {
    try {
      await api.put(`/orders/${id}/status`, { orderStatus });
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["orders", "admin"] });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  const saveTracking = async (id) => {
    const val = rowDraft[id] ?? "";
    try {
      await api.put(`/orders/${id}/tracking`, { trackingNumber: val });
      toast.success("Tracking saved");
      queryClient.invalidateQueries({ queryKey: ["orders", "admin"] });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
    }
  };

  const openDetail = (order) => setDetail(order);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Orders</h1>
        <p className="text-sm text-neutral-600">All store orders</p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-neutral-100 bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Order status</label>
          <select
            className="rounded-lg border border-neutral-100 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <Input label="From" name="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="To" name="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <Button type="button" onClick={applyFilters}>
          Apply
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-600">Loading…</p>
      ) : (
        <Table
          columns={[
            { key: "id", label: "Order ID" },
            { key: "customer", label: "Customer" },
            { key: "items", label: "Items" },
            { key: "total", label: "Total" },
            { key: "pay", label: "Payment" },
            { key: "orderStatus", label: "Status" },
            { key: "date", label: "Date" },
            { key: "actions", label: "Actions" },
          ]}
          rows={orders}
          getRowKey={(r) => r._id}
          renderCell={(row, col) => {
            if (col.key === "id") {
              return (
                <button type="button" className="font-mono text-xs text-primary underline" onClick={() => openDetail(row)}>
                  #{String(row._id).slice(-8)}
                </button>
              );
            }
            if (col.key === "customer") {
              const u = row.user;
              if (u && typeof u === "object") {
                return (
                  <span>
                    {u.name}
                    <br />
                    <span className="text-xs text-neutral-500">{u.email}</span>
                  </span>
                );
              }
              return "—";
            }
            if (col.key === "items") {
              const n = Array.isArray(row.items) ? row.items.length : 0;
              const qty = Array.isArray(row.items)
                ? row.items.reduce((a, l) => a + Number(l.quantity || 0), 0)
                : 0;
              return `${n} lines (${qty} pcs)`;
            }
            if (col.key === "total") return `৳${Number(row.finalPrice || 0).toFixed(0)}`;
            if (col.key === "pay") return <Badge variant={row.paymentStatus === "paid" ? "success" : "warning"}>{row.paymentStatus}</Badge>;
            if (col.key === "orderStatus") {
              return (
                <select
                  className="rounded border border-neutral-100 px-2 py-1 text-sm"
                  value={row.orderStatus}
                  onChange={(e) => updateStatus(row._id, e.target.value)}
                >
                  {STATUS_OPTIONS.filter((s) => s !== "all").map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              );
            }
            if (col.key === "date") return row.createdAt ? new Date(row.createdAt).toLocaleString() : "—";
            if (col.key === "actions") {
              return (
                <div className="flex gap-2">
                  <Input
                    name={`tr-${row._id}`}
                    placeholder="Tracking #"
                    value={rowDraft[row._id] ?? row.trackingNumber ?? ""}
                    onChange={(e) => setRowDraft((d) => ({ ...d, [row._id]: e.target.value }))}
                    className="min-w-[120px]"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={() => saveTracking(row._id)}>
                    Save
                  </Button>
                </div>
              );
            }
            return String(row[col.key] ?? "");
          }}
        />
      )}

      {pagination.pages > 1 ? (
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span className="text-sm text-neutral-600">
            Page {page} / {pagination.pages || 1}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= (pagination.pages || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}

      <Modal isOpen={Boolean(detail)} onClose={() => setDetail(null)} title="Order details" wide>
        {detail ? (
          <div className="space-y-4 text-sm">
            <p>
              <span className="font-medium">Order:</span> {String(detail._id)}
            </p>
            <p>
              <span className="font-medium">Status:</span> <Badge variant={orderStatusVariant(detail.orderStatus)}>{detail.orderStatus}</Badge>
            </p>
            <p>
              <span className="font-medium">Payment:</span> {detail.paymentStatus} · {detail.paymentMethod}
            </p>
            <p>
              <span className="font-medium">Total:</span> ৳{Number(detail.finalPrice || 0).toFixed(0)}
            </p>
            <div>
              <p className="font-medium">Shipping</p>
              <p className="text-neutral-700">
                {detail.shippingAddress?.fullName}, {detail.shippingAddress?.phone}
                <br />
                {[detail.shippingAddress?.street, detail.shippingAddress?.city, detail.shippingAddress?.district, detail.shippingAddress?.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
            <div>
              <p className="font-medium">Items</p>
              <ul className="mt-2 space-y-1">
                {(detail.items || []).map((line, i) => (
                  <li key={i}>
                    {line.title} × {line.quantity} — ৳{(Number(line.price) * Number(line.quantity)).toFixed(0)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
