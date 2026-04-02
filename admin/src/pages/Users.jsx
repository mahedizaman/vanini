import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";

export default function Users() {
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const [detailId, setDetailId] = useState(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users", "admin", applied],
    queryFn: async () => (await api.get("/users", { params: applied ? { search: applied } : {} })).data,
  });

  const detailQuery = useQuery({
    queryKey: ["users", detailId],
    queryFn: async () => (await api.get(`/users/${detailId}`)).data,
    enabled: Boolean(detailId),
  });

  const applySearch = (e) => {
    e.preventDefault();
    setApplied(search.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Users</h1>
        <p className="text-sm text-neutral-600">Customer accounts</p>
      </div>

      <form onSubmit={applySearch} className="flex max-w-md gap-2">
        <Input
          name="search"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {isLoading ? (
        <p className="text-sm text-neutral-600">Loading…</p>
      ) : (
        <Table
          columns={[
            { key: "name", label: "Name", sortable: true },
            { key: "email", label: "Email", sortable: true },
            { key: "role", label: "Role" },
            { key: "createdAt", label: "Joined", sortable: true },
            { key: "ordersCount", label: "Orders" },
            { key: "actions", label: "" },
          ]}
          rows={Array.isArray(users) ? users : []}
          getRowKey={(r) => r._id}
          renderCell={(row, col) => {
            if (col.key === "createdAt") return row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—";
            if (col.key === "ordersCount") return row.ordersCount ?? 0;
            if (col.key === "role") return <Badge variant="info">{row.role}</Badge>;
            if (col.key === "actions") {
              return (
                <Button type="button" size="sm" variant="outline" onClick={() => setDetailId(row._id)}>
                  View
                </Button>
              );
            }
            return String(row[col.key] ?? "");
          }}
        />
      )}

      <Modal isOpen={Boolean(detailId)} onClose={() => setDetailId(null)} title="User details" wide>
        {detailQuery.isLoading ? (
          <p className="text-sm text-neutral-600">Loading…</p>
        ) : detailQuery.data ? (
          <div className="space-y-4 text-sm">
            <p>
              <span className="font-medium">Name:</span> {detailQuery.data.user?.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {detailQuery.data.user?.email}
            </p>
            <div>
              <p className="font-medium">Addresses</p>
              <ul className="mt-2 space-y-2">
                {(detailQuery.data.user?.address || []).length === 0 ? (
                  <li className="text-neutral-500">No saved addresses</li>
                ) : (
                  detailQuery.data.user.address.map((a, i) => (
                    <li key={i} className="rounded-lg border border-neutral-100 p-3">
                      {a.fullName} — {a.phone}
                      <br />
                      {[a.street, a.city, a.district, a.postalCode].filter(Boolean).join(", ")}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div>
              <p className="font-medium">Recent orders</p>
              <ul className="mt-2 space-y-1">
                {(detailQuery.data.orders || []).map((o) => (
                  <li key={o._id} className="flex justify-between gap-2">
                    <span className="font-mono text-xs">#{String(o._id).slice(-8)}</span>
                    <span>
                      ৳{Number(o.finalPrice || 0).toFixed(0)} · {o.orderStatus}
                    </span>
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
