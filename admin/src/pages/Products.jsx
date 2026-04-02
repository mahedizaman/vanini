import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";

export default function Products() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const search = searchParams.get("search") || "";
  const [localSearch, setLocalSearch] = useState(search);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", "admin", page, search],
    queryFn: async () => {
      const res = await api.get("/products/admin/all", {
        params: { page, limit: 12, search: search || undefined },
      });
      return res.data;
    },
  });

  const products = data?.data || [];
  const pagination = data?.pagination || {};

  const applySearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (localSearch) next.set("search", localSearch);
    next.set("page", "1");
    setSearchParams(next);
  };

  const goPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/products/${deleteId}`);
      toast.success("Product deactivated");
      queryClient.invalidateQueries({ queryKey: ["products", "admin"] });
      setDeleteId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Products</h1>
          <p className="text-sm text-neutral-600">Manage catalog</p>
        </div>
        <Link to="/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      <form onSubmit={applySearch} className="flex max-w-md flex-wrap gap-2">
        <Input
          name="search"
          placeholder="Search title or tags…"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="min-w-[200px] flex-1"
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
            { key: "image", label: "Image" },
            { key: "title", label: "Title", sortable: true },
            { key: "category", label: "Category" },
            { key: "price", label: "Price", sortable: true },
            { key: "stock", label: "Stock", sortable: true },
            { key: "isActive", label: "Status" },
            { key: "actions", label: "Actions" },
          ]}
          rows={products}
          getRowKey={(r) => r._id}
          renderCell={(row, col) => {
            if (col.key === "image") {
              const img = row.images?.[0];
              return img ? (
                <img src={img} alt="" className="h-12 w-12 rounded-md object-cover" />
              ) : (
                <span className="text-neutral-400">—</span>
              );
            }
            if (col.key === "category") return row.category?.name || "—";
            if (col.key === "price") {
              const d = row.discountPrice;
              return d != null ? (
                <span>
                  <span className="text-accent">৳{Number(d).toFixed(0)}</span>{" "}
                  <span className="text-xs text-neutral-500 line-through">৳{Number(row.price).toFixed(0)}</span>
                </span>
              ) : (
                `৳${Number(row.price).toFixed(0)}`
              );
            }
            if (col.key === "stock") return Number(row.stock ?? 0);
            if (col.key === "isActive")
              return <Badge variant={row.isActive ? "success" : "default"}>{row.isActive ? "Active" : "Inactive"}</Badge>;
            if (col.key === "actions") {
              return (
                <div className="flex gap-2">
                  <Link to={`/products/${row._id}/edit`}>
                    <Button type="button" size="sm" variant="outline">
                      Edit
                    </Button>
                  </Link>
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

      {pagination.pages > 1 ? (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => goPage(page - 1)}
          >
            Prev
          </Button>
          <span className="text-sm text-neutral-600">
            Page {page} of {pagination.pages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= pagination.pages}
            onClick={() => goPage(page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}

      <Modal isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} title="Deactivate product?">
        <p className="text-sm text-neutral-700">This will hide the product from the shop (soft delete).</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setDeleteId(null);
            }}
          >
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={onDelete}>
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  );
}
