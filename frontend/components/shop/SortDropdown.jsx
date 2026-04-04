"use client";

import { Listbox } from "@headlessui/react";
import { HiChevronUpDown } from "react-icons/hi2";

const options = [
  { label: "Newest", value: "newest" },
  { label: "Price Low-High", value: "price_asc" },
  { label: "Price High-Low", value: "price_desc" },
  { label: "Most Popular", value: "popular" },
];

export default function SortDropdown({ value, onChange }) {
  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <Listbox value={selected.value} onChange={onChange}>
      <div className="relative w-56">
        <Listbox.Button className="flex w-full items-center justify-between rounded-lg border border-neutral-600 bg-black px-4 py-3 text-sm font-medium text-white hover:bg-neutral-900">
          <span>{selected.label}</span>
          <HiChevronUpDown className="h-5 w-5 text-white/70" />
        </Listbox.Button>

        <Listbox.Options className="absolute right-0 mt-2 w-full overflow-hidden rounded-xl border border-neutral-100 bg-white py-1 shadow-lg">
          {options.map((o) => (
            <Listbox.Option
              key={o.value}
              value={o.value}
              className={({ active, selected }) =>
                [
                  "cursor-pointer px-4 py-2 text-sm",
                  active ? "bg-neutral-100" : "",
                  selected ? "font-semibold text-primary" : "text-neutral-800",
                ].join(" ")
              }
            >
              {o.label}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}
