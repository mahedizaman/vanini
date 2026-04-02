import { cn } from "@/utils/helpers";

const variants = {
  sale: "bg-accent text-white",
  new: "bg-primary text-white",
  featured: "bg-amber-500 text-white",
};

export default function Badge({ children, variant = "new", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
