import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  color?: "primary" | "success" | "destructive" | "warning";
}

export function StatCard({ title, value, icon: Icon, trend, trendUp, className, color = "primary" }: StatCardProps) {
  const colorStyles = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-600",
    destructive: "bg-red-500/10 text-red-600",
    warning: "bg-amber-500/10 text-amber-600",
  };

  return (
    <div className={cn("bg-card border border-border/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold font-display tracking-tight text-foreground">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-xl", colorStyles[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-xs font-medium">
          <span className={cn(
            "px-2 py-0.5 rounded-full bg-opacity-20", 
            trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend}
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  );
}
