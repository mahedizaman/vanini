import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function Brands() {
  const queryClient = useQueryClient();
  const { data: brands, isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => (await api.get("/brands")).data,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [slugPreview, setSlugPreview] = useState("");
  const [logo, setLogo] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    setSlugPreview(slugify(name));
  }, [name]);

  const openNew = () => {
    setEditing(null);
    setName("");
    setLogo("");
    setModalOpen(true);
  };

  const openEdit = (b) => {
    setEditing(b);
    setName(b.name || "");
    setLogo(b.logo || "");
    setModalOpen(true);
  };

  const uploadFile = async (file) => {
    const fd = new FormData();
    fd.append("image", file);
    const res = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
    if (res.data?.url) {
      setLogo(res.data.url);
      toast.success("Logo uploaded");
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/brands/${editing._id}`, { name, logo });
        toast.success("Brand updated");
      } else {
        await api.post("/brands", { name, logo });
        toast.success("Brand created");
      }
      queryClient.invalidateQueries({ queryKey: ["brands"] });
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
      await api.delete(`/brands/${deleteId}`);
      toast.success("Deleted");
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setDeleteId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const list = Array.isArray(brands) ? brands : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Brands</h1>
          <p className="text-sm text-neutral-600">Product brands</p>
        </div>
        <Button type="button" onClick={openNew}>
          Add Brand
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-600">Loading…</p>
      ) : (
        <Table
          columns={[
            { key: "name", label: "Name", sortable: true },
            { key: "slug", label: "Slug" },
            { key: "logo", label: "Logo" },
            { key: "actions", label: "Actions" },
          ]}
          rows={list}
          getRowKey={(r) => r._id}
          renderCell={(row, col) => {
            if (col.key === "logo") {
              return row.logo ? <img src={row.logo} alt="" className="h-10 w-10 rounded object-cover" /> : "—";
            }
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit brand" : "Add brand"}>
        <form onSubmit={save} className="space-y-4">
          <Input label="Name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <p className="text-xs text-neutral-600">
            Slug: <span className="font-mono text-primary">{slugPreview}</span>
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary">Logo URL</label>
            <Input name="logo" value={logo} onChange={(e) => setLogo(e.target.value)} />
            <input
              type="file"
              accept="image/*"
              className="mt-2 text-sm"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile(f);
                e.target.value = "";
              }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Save
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(deleteId)} onClose={() => setDeleteId(null)} title="Delete brand?">
        <p className="text-sm text-neutral-700">This cannot be undone.</p>
        <div className="mt-4 flex justify-end gap-2">
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
