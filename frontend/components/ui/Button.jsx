"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/helpers";

const base =
  "inline-flex items-center justify-center rounded-lg font-poppins font-medium transition duration-200 disabled:opacity-60 disabled:pointer-events-none";

const variants = {
  primary: "bg-black text-white hover:bg-neutral-900",
  outline: "border border-neutral-600 bg-black text-white hover:bg-neutral-900",
  ghost: "bg-black text-white hover:bg-neutral-900",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

function Spinner() {
  return (
    <span
      className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
      aria-hidden="true"
    />
  );
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  onClick,
  type = "button",
  className,
  disabled,
}) {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.01 }}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      {isLoading ? <Spinner /> : null}
      {children}
    </motion.button>
  );
}
