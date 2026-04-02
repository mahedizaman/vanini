"use client";

import { cn } from "@/utils/helpers";

export default function Input({
  label,
  name,
  type = "text",
  placeholder,
  register,
  error,
  className,
}) {
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-primary">
          {label}
        </label>
      ) : null}

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-lg border border-neutral-100 bg-neutral-50 px-4 py-3 outline-none transition duration-200 focus:ring-2 focus:ring-primary",
          error ? "border-accent" : ""
        )}
        {...(register && name ? register(name) : {})}
      />

      {error ? (
        <p className="mt-1.5 text-sm text-accent">{String(error?.message || error)}</p>
      ) : null}
    </div>
  );
}
