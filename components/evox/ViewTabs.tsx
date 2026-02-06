"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

export type MainViewTab = "ceo" | "kanban" | "comms";

interface ViewTabsProps {
  activeTab: MainViewTab;
  onTabChange: (tab: MainViewTab) => void;
  className?: string;
}

const tabs: { id: MainViewTab; label: string }[] = [
  { id: "ceo", label: "Overview" },
  { id: "kanban", label: "Kanban" },
  { id: "comms", label: "Comms" },
];

const externalLinks: { label: string; href: string }[] = [
  { label: "Team", href: "/agents" },
];

/**
 * AGT-206: View Tabs — Vercel-style navigation
 * Clean text tabs with active underline indicator.
 * "Team" links to /agents (Hall of Fame + Career Profiles).
 */
export function ViewTabs({ activeTab, onTabChange, className }: ViewTabsProps) {
  return (
    <div
      className={cn(
        "flex items-center border-b border-zinc-800 bg-zinc-950 px-4 overflow-x-auto scrollbar-hide",
        className
      )}
      role="tablist"
      aria-label="Dashboard views"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative px-3 py-2.5 text-sm transition-colors whitespace-nowrap shrink-0",
            activeTab === tab.id
              ? "text-white"
              : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-px bg-white" />
          )}
        </button>
      ))}

      {externalLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="relative px-3 py-2.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors whitespace-nowrap shrink-0"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
