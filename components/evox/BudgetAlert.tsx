"use client";

import { cn } from "@/lib/utils";

interface BudgetAlertProps {
  current: number;
  budget: number;
  className?: string;
}

/**
 * AGT-200: Budget alert banner
 */
export function BudgetAlert({ current, budget, className }: BudgetAlertProps) {
  const percentage = budget > 0 ? (current / budget) * 100 : 0;
  const remaining = budget - current;

  // No alert if under 70%
  if (percentage < 70) return null;

  const severity =
    percentage >= 100 ? "critical" : percentage >= 90 ? "warning" : "info";

  const colors = {
    critical: "bg-red-500/10 border-red-500/30 text-red-400",
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  };

  const icons = {
    critical: "🚨",
    warning: "⚠️",
    info: "💡",
  };

  const messages = {
    critical: `Budget exceeded! $${current.toFixed(2)} / $${budget.toFixed(2)}`,
    warning: `Budget warning: ${Math.round(percentage)}% used. $${remaining.toFixed(2)} remaining`,
    info: `Approaching budget: ${Math.round(percentage)}% used`,
  };

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        colors[severity],
        className
      )}
    >
      <span className="mr-2">{icons[severity]}</span>
      {messages[severity]}
    </div>
  );
}
