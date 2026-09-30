import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type OsButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  label?: string;
};

export function OsButton({ children, className, label, ...props }: OsButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center border-0 bg-transparent p-0 text-inherit outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}