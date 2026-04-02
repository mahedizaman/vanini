import { forwardRef } from "react";
import { cn } from "../../utils/cn";

const Input = forwardRef(function Input({ label, name, type = "text", error, className, ...props }, ref) {
  return (
    <div className={cn("w-full", className)}>
      {label ? (
        <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-primary">
          {label}
        </label>
      ) : null}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        className={cn(
          "w-full rounded-lg border border-neutral-100 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary",
          error ? "border-accent" : ""
        )}
        {...props}
      />
      {error ? <p className="mt-1 text-sm text-accent">{String(error)}</p> : null}
    </div>
  );
});

export default Input;
