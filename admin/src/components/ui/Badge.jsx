import { cn } from "../../utils/cn";

const variants = {
  default: "bg-neutral-100 text-neutral-800",
  success: "bg-green-100 text-green-900",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-red-100 text-red-900",
  info: "bg-blue-100 text-blue-900",
};

export default function Badge({ children, variant = "default", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
