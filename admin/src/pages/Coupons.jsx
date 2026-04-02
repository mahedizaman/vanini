import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";

export default function Coupons() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["coupons", "admin"],
    queryFn: async () => (await api.get("/coupons")).data?.data,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [code, setCode] = useState("");
  const [type, setType] = useState("percentage");
  const [discount, setDiscount] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("0");
  const [usageLimit, setUsageLimit] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const openNew = () => {
    setEditing(null);
    setCode("");
    setType("percentage");
    setDiscount("");
    setMinOrderAmount("0");
    setUsageLimit("");
    setExpiryDate("");
    setIsActive(true);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setCode(c.code || "");
    setType(c.type || "percentage");
    setDiscount(String(c.discount ?? ""));
    setMinOrderAmount(String(c.minOrderAmount ?? 0));
    setUsageLimit(c.usageLimit != null ? String(c.usageLimit) : "");
    setExpiryDate(c.expiryDate ? new Date(c.expiryDate).toISOString().slice(0, 10) : "");
    setIsActive(c.isActive !== false);
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        code: code.toUpperCase(),
        type,
        discount: Number(discount),
        minOrderAmount: Number(minOrderAmount) || 0,
        usageLimit: usageLimit === "" ? undefined : Number(usageLimit),
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        isActive,
      };
      if (editing) {
        await api.put(`/coupons/${editing._id}`, payload);
        toast.success("Coupon updated");
      } else {
        await api.post("/coupons", payload);
        toast.success("Coupon created");
      }
      queryClient.invalidateQueries({ queryKey: ["coupons", "admin"] });
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/coupons/${deleteId}`);
      toast.success("Deleted");
      queryClient.invalidateQueries({ queryKey: ["coupons", "admin"] });
      setDeleteId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const list = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Coupons</h1>
          <p className="text-sm text-neutral-600">Discount codes</p>
        </div>
        <Button type="button" onClick={openNew}>
          Add Coupon
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-600">Loading…</p>
      ) : (
        <Table
          columns={[
            { key: "code", label: "Code", sortable: true },
            { key: "type", label: "Type" },
            { key: "discount", label: "Discount" },
            { key: "minOrderAmount", label: "Min" },
            { key: "usage", label: "Usage" },
            { key: "expiryDate", label: "Expiry" },
            { key: "isActive", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={list}
          getRowKey={(r) => r._id}
          renderCell={(row, col) => {
            if (col.key === "discount")
              return row.type === "percentage" ? `${row.discount}%` : `৳${row.discount}`;
            if (col.key === "minOrderAmount") return `৳${Number(row.minOrderAmount || 0)}`;
            if (col.key === "usage")
              return `${row.usedCount ?? 0}${row.usageLimit != null ? ` / ${row.usageLimit}` : ""}`;
            if (col.key === "expiryDate") return row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : "—";
            if (col.key === "isActive")
              return <Badge variant={row.isActive ? "success" : "default"}>{row.isActive ? "Active" : "Inactive"}</Badge>;
            if (col.key === "actions") {
              return (
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => openEdit(row)}>
                    Edit
                  </Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => setDeleteId(row._id)}>
                    Delete
                  </Button>
                </div>
              );
            }
            return String(row[col.key] ?? "");
          }}
        />
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit coupon" : "Add coupon"} wide>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          <Input label="Code" name="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary">Type</label>
            <select
              className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
          </div>
          <Input label="Discount amount" name="discount" type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} required />
          <Input label="Min order amount" name="min" type="number" min="0" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} />
          <Input label="Usage limit (optional)" name="limit" type="number" min="0" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} />
          <Input label="Expiry date" name="exp" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} title="Delete coupon?">
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={remove}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
