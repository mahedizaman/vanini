"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import api from "@/utils/axios";
import ProductGrid from "@/components/product/ProductGrid";
import FilterSidebar from "@/components/shop/FilterSidebar";
import SortDropdown from "@/components/shop/SortDropdown";
import Button from "@/components/ui/Button";
import { slideInLeft } from "@/animations/slideIn";

const buildParams = (filters) => {
  const params = {};
  if (filters.search) params.search = filters.search;
  if (filters.category) params.category = filters.category;
  if (filters.brand) params.brand = filters.brand;
  if (filters.minPrice) params.minPrice = filters.minPrice;
  if (filters.maxPrice) params.maxPrice = filters.maxPrice;
  if (filters.size) params.size = filters.size;
  if (filters.color) params.color = filters.color;
  if (filters.sort) params.sort = filters.sort;
  params.page = filters.page || 1;
  params.limit = 12;
  return params;
};

const fetchProducts = async (filters) => {
  const res = await api.get("/products", { params: buildParams(filters) });
  return res.data; // { success, data, pagination }
};

export default function ShopPage() {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    size: "",
    color: "",
    sort: "newest",
    page: 1,
  });

  const [searchInput, setSearchInput] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // debounce search input -> filters.search
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((s) => ({ ...s, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const queryKey = useMemo(
    () => [
      "products",
      {
        ...filters,
      },
    ],
    [filters]
  );

  const productsQuery = useQuery({
    queryKey,
    queryFn: () => fetchProducts(filters),
    keepPreviousData: true,
  });

  const products = productsQuery.data?.data || [];
  const pagination = productsQuery.data?.pagination;
  const totalPages = pagination?.pages || 1;
  const currentPage = pagination?.page || filters.page || 1;

  const clearFilters = () => {
    setSearchInput("");
    setFilters({
      search: "",
      category: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      size: "",
      color: "",
      sort: "newest",
      page: 1,
    });
  };

  const setFilter = (patch) => setFilters((s) => ({ ...s, ...patch, page: patch.page ?? 1 }));

  const pageNumbers = useMemo(() => {
    const pages = totalPages || 1;
    const p = currentPage || 1;
    const start = Math.max(1, p - 2);
    const end = Math.min(pages, p + 2);
    const nums = [];
    for (let i = start; i <= end; i++) nums.push(i);
    return nums;
  }, [totalPages, currentPage]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Shop</h1>
          <p className="mt-1 text-sm text-neutral-800/70">Browse products and refine with filters.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-72">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-3 outline-none transition duration-200 focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-neutral-100 bg-white px-4 py-3 text-sm font-medium hover:bg-neutral-50 md:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              Filter
            </button>
            <SortDropdown
              value={filters.sort}
              onChange={(value) => setFilter({ sort: value, page: 1 })}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[280px_1fr]">
        <div className="hidden md:block">
          <FilterSidebar
            filters={filters}
            setFilters={setFilter}
            onClear={clearFilters}
          />
        </div>

        <div>
          <ProductGrid products={products} isLoading={productsQuery.isLoading} />

          {/* Pagination */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-neutral-100 bg-white px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
              onClick={() => setFilter({ page: Math.max(1, currentPage - 1) })}
              disabled={currentPage <= 1}
            >
              Previous
            </button>

            {pageNumbers.map((n) => (
              <button
                key={n}
                type="button"
                className={[
                  "h-10 w-10 rounded-lg border text-sm transition",
                  n === currentPage
                    ? "border-primary bg-primary text-white"
                    : "border-neutral-100 bg-white hover:bg-neutral-50",
                ].join(" ")}
                onClick={() => setFilter({ page: n })}
              >
                {n}
              </button>
            ))}

            <button
              type="button"
              className="rounded-lg border border-neutral-100 bg-white px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
              onClick={() => setFilter({ page: Math.min(totalPages, currentPage + 1) })}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFiltersOpen ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-950/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 z-50 h-full w-full max-w-xs bg-white p-4"
              variants={slideInLeft}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <span className="font-display text-lg font-bold text-primary">Filters</span>
                <Button variant="ghost" onClick={() => setMobileFiltersOpen(false)}>
                  Close
                </Button>
              </div>

              <div className="mt-4">
                <FilterSidebar
                  filters={filters}
                  setFilters={(patch) => setFilter(patch)}
                  onClear={clearFilters}
                  onDone={() => setMobileFiltersOpen(false)}
                />
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

