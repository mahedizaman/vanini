import { cn } from "../../utils/cn";

const base =
  "inline-flex items-center justify-center rounded-lg font-medium transition disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary: "bg-primary text-white hover:bg-primary-light",
  outline: "border border-primary text-primary hover:bg-neutral-100",
  ghost: "text-primary hover:bg-neutral-100",
  danger: "bg-accent text-white hover:bg-accent-hover",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  className,
  disabled,
  isLoading,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {isLoading ? (
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : null}
      {children}
    </button>
  );
}
