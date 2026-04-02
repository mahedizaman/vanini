import { cn } from "@/utils/helpers";

export default function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded bg-neutral-100", className)} />;
}
