import { cn } from "@/utils/helpers";

const statusStyles = {
  pending: "bg-amber-100 text-amber-900",
  processing: "bg-blue-100 text-blue-900",
  shipped: "bg-indigo-100 text-indigo-900",
  delivered: "bg-green-100 text-green-900",
  cancelled: "bg-red-100 text-red-900",
};

export default function OrderStatusBadge({ status, className }) {
  const key = String(status || "")
    .toLowerCase()
    .trim();
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        statusStyles[key] || "bg-neutral-100 text-neutral-800",
        className
      )}
    >
      {status || "—"}
    </span>
  );
}
