import * as React from "react";
import * as SeparatorPrimitive from "@silk-hq/components";
import { cn } from "../../lib/utils";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: "horizontal" | "vertical";
    decorative?: boolean;
  }
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "shrink-0 bg-slate-200",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      )}
      {...props}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
    />
  )
);
Separator.displayName = "Separator";

export { Separator }; 