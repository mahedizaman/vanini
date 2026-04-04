"use client";

import { useQuery } from "@tanstack/react-query";

import api from "@/utils/axios";
import Button from "@/components/ui/Button";

const sizes = ["S", "M", "L", "XL", "XXL"];
const colorValues = {
  black: "#000000",
  white: "#ffffff",
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#facc15",
};
const colorKeys = Object.keys(colorValues);

const fetchCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
};

export default function FilterSidebar({ filters, setFilters, onClear, onDone }) {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];

  return (
    <aside className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-primary">Filters</h3>
        <button
          type="button"
          className="rounded-md bg-black px-2 py-1 text-xs font-medium text-white hover:bg-neutral-900"
          onClick={onClear}
        >
          Clear Filters
        </button>
      </div>

      {/* Categories */}
      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-800/70">
          Categories
        </p>
        <div className="grid gap-1.5">
          <button
            type="button"
            onClick={() => setFilters({ category: "", page: 1 })}
            className={[
              "w-full rounded-lg px-3 py-2 text-left text-sm transition",
              !filters.category
                ? "bg-black text-white ring-2 ring-white"
                : "bg-black text-white hover:bg-neutral-900",
            ].join(" ")}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id || c.slug}
              type="button"
              onClick={() => setFilters({ category: c.slug, page: 1 })}
              className={[
                "w-full rounded-lg px-3 py-2 text-left text-sm transition",
                filters.category === c.slug
                  ? "bg-black text-white ring-2 ring-white"
                  : "bg-black text-white hover:bg-neutral-900",
              ].join(" ")}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-800/70">
          Price Range
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => setFilters({ minPrice: e.target.value, page: 1 })}
            placeholder="Min"
            className="w-full rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ maxPrice: e.target.value, page: 1 })}
            placeholder="Max"
            className="w-full rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Sizes */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-800/70">
          Size
        </p>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((s) => (
            <label key={s} className="flex items-center gap-2 rounded-lg border border-neutral-100 bg-white px-2 py-2">
              <input
                type="checkbox"
                checked={filters.size === s}
                onChange={(e) => setFilters({ size: e.target.checked ? s : "", page: 1 })}
              />
              <span className="text-sm">{s}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-800/70">
          Color
        </p>
        <div className="flex flex-wrap gap-2">
          {colorKeys.map((key) => {
            const active = filters.color === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilters({ color: active ? "" : key, page: 1 })}
                style={{ backgroundColor: colorValues[key] }}
                className={[
                  "h-8 w-8 rounded-full border border-neutral-600 bg-black transition",
                  active ? "ring-2 ring-primary ring-offset-2" : "hover:ring-2 hover:ring-primary/40 hover:ring-offset-2",
                ].join(" ")}
                aria-label={`Color ${key}`}
              />
            );
          })}
        </div>
      </div>

      {onDone ? (
        <div className="mt-6">
          <Button className="w-full" onClick={onDone}>
            Apply Filters
          </Button>
        </div>
      ) : null}
    </aside>
  );
}
