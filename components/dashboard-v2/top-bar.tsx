"use client";

import { useState, useEffect } from "react";

interface TopBarProps {
  agentsActive?: number;
  tasksInQueue?: number;
}

export function TopBar({ agentsActive = 0, tasksInQueue = 0 }: TopBarProps) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-bold tracking-wider text-zinc-50">EVOX MISSION CONTROL</h1>
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span>{agentsActive} Agents Active</span>
          <span className="text-zinc-600">|</span>
          <span>{tasksInQueue} Tasks in Queue</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right text-xs">
          <div className="font-mono text-zinc-50">{time}</div>
          <div className="text-zinc-500">{date}</div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          ONLINE
        </div>
      </div>
    </header>
  );
}
