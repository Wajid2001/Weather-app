import React from "react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  title,
  icon,
  children,
  className,
  action,
}: {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20", className)}>
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-xl sm:text-2xl">{icon}</span>
          <h2 className="text-foreground text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
