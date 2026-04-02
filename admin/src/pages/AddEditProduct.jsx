import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];

export default function AddEditProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const params = useParams();
  const isNew = location.pathname === "/products/new" || location.pathname.endsWith("/products/new");
  const productId = isNew ? null : params.id;

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: async () => (await api.get("/brands")).data,
  });

  const productQuery = useQuery({
    queryKey: ["product", "admin", productId],
    queryFn: async () => (await api.get(`/products/admin/${productId}`)).data?.data,
    enabled: Boolean(productId),
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [tags, setTags] = useState("");
  const [sku, setSku] = useState("");
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([""]);
  const [stock, setStock] = useState("0");
  const [inventory, setInventory] = useState([{ size: "", color: "", stock: 0 }]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState([]);
  const [imageMeta, setImageMeta] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const p = productQuery.data;
    if (!p) return;
    setTitle(p.title || "");
    setDescription(p.description || "");
    setPrice(String(p.price ?? ""));
    setDiscountPrice(p.discountPrice != null ? String(p.discountPrice) : "");
    setCategory(p.category?._id ? String(p.category._id) : "");
    setBrand(p.brand?._id ? String(p.brand._id) : "");
    setTags(Array.isArray(p.tags) ? p.tags.join(", ") : "");
    setSku(p.sku || "");
    setSizes(Array.isArray(p.sizes) ? p.sizes : []);
    setColors(Array.isArray(p.colors) && p.colors.length ? p.colors : [""]);
    setStock(String(p.stock ?? "0"));
    setInventory(
      Array.isArray(p.inventory) && p.inventory.length ? p.inventory : [{ size: "", color: "", stock: 0 }]
    );
    setIsFeatured(Boolean(p.isFeatured));
    setIsActive(p.isActive !== false);
    setImages(Array.isArray(p.images) ? [...p.images] : []);
    setImageMeta(Array.isArray(p.images) ? p.images.map(() => ({})) : []);
  }, [productQuery.data]);

  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  const brands = Array.isArray(brandsQuery.data) ? brandsQuery.data : [];

  const toggleSize = (s) => {
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append("image", file);
    const res = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
    const { url, public_id } = res.data || {};
    if (url) {
      setImages((prev) => [...prev, url]);
      setImageMeta((prev) => [...prev, { url, public_id }]);
      toast.success("Image uploaded");
    }
  };

  const removeImageAt = async (index) => {
    const meta = imageMeta[index];
    const pub = meta?.public_id;
    if (pub) {
      try {
        await api.delete("/upload", { data: { public_id: pub } });
      } catch {
        /* still remove from list */
      }
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageMeta((prev) => prev.filter((_, i) => i !== index));
  };

  const buildPayload = () => {
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const inv = inventory
      .filter((r) => r.size || r.color || Number(r.stock) > 0)
      .map((r) => ({
        size: r.size || "",
        color: r.color || "",
        stock: Number(r.stock) || 0,
      }));
    const colorList = colors.map((c) => c.trim()).filter(Boolean);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      discountPrice: discountPrice === "" ? undefined : Number(discountPrice),
      category: category || undefined,
      brand: brand || undefined,
      tags: tagList,
      sku: sku.trim() || undefined,
      sizes,
      colors: colorList,
      inventory: inv,
      stock: Number(stock) || 0,
      images,
      isFeatured,
      isActive,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
    return payload;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      if (isNew) {
        await api.post("/products", payload);
        toast.success("Product created");
      } else {
        await api.put(`/products/${productId}`, payload);
        toast.success("Product updated");
      }
      queryClient.invalidateQueries({ queryKey: ["products", "admin"] });
      navigate("/products");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!isNew && productQuery.isLoading) {
    return <p className="text-sm text-neutral-600">Loading product…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">{isNew ? "Add product" : "Edit product"}</h1>
        <p className="text-sm text-neutral-600">All fields required unless marked optional</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8 rounded-xl border border-neutral-100 bg-white p-6 shadow-sm">
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">Basics</h2>
          <Input label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-primary">Description</label>
            <textarea
              className="min-h-[120px] w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Price" name="price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <Input
              label="Discount price (optional)"
              name="discountPrice"
              type="number"
              min="0"
              step="0.01"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary">Category</label>
              <select
                className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select…</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-primary">Brand</label>
              <select
                className="w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="">Select…</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Input label="Tags (comma-separated)" name="tags" value={tags} onChange={(e) => setTags(e.target.value)} />
          <Input label="SKU (optional)" name="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">Sizes</h2>
          <div className="flex flex-wrap gap-2">
            {SIZE_OPTIONS.map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-100 px-3 py-2 text-sm">
                <input type="checkbox" checked={sizes.includes(s)} onChange={() => toggleSize(s)} />
                {s}
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">Colors</h2>
          {colors.map((c, i) => (
            <div key={i} className="flex gap-2">
              <Input
                label={i === 0 ? "Color name" : ""}
                name={`color-${i}`}
                value={c}
                onChange={(e) => {
                  const next = [...colors];
                  next[i] = e.target.value;
                  setColors(next);
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="mt-6"
                onClick={() => setColors((prev) => prev.filter((_, j) => j !== i))}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setColors((prev) => [...prev, ""])}>
            Add color
          </Button>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">Stock</h2>
          <Input label="Total stock" name="stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">Inventory (size + color)</h2>
          {inventory.map((row, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-4">
              <Input label={i === 0 ? "Size" : ""} value={row.size} onChange={(e) => {
                const next = [...inventory];
                next[i] = { ...next[i], size: e.target.value };
                setInventory(next);
              }} />
              <Input label={i === 0 ? "Color" : ""} value={row.color} onChange={(e) => {
                const next = [...inventory];
                next[i] = { ...next[i], color: e.target.value };
                setInventory(next);
              }} />
              <Input
                label={i === 0 ? "Qty" : ""}
                type="number"
                min="0"
                value={row.stock}
                onChange={(e) => {
                  const next = [...inventory];
                  next[i] = { ...next[i], stock: Number(e.target.value) };
                  setInventory(next);
                }}
              />
              <Button type="button" variant="outline" className="mt-6" onClick={() => setInventory((prev) => prev.filter((_, j) => j !== i))}>
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setInventory((prev) => [...prev, { size: "", color: "", stock: 0 }])}
          >
            Add inventory row
          </Button>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">Images</h2>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadImage(f);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt="" className="h-24 w-24 rounded-lg object-cover" />
                <button
                  type="button"
                  className="absolute -right-2 -top-2 rounded-full bg-accent px-2 py-0.5 text-xs text-white"
                  onClick={() => removeImageAt(i)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
        </section>

        <div className="flex gap-3">
          <Button type="submit" isLoading={saving}>
            {isNew ? "Create" : "Save"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/products")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
