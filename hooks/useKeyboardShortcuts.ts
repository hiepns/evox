"use client";

import { useHotkeys } from "react-hotkeys-hook";
import { Id } from "@/convex/_generated/dataModel";

interface UseKeyboardShortcutsProps {
  agents: { _id: Id<"agents"> }[];
  onAgentSwitch: (agentId: Id<"agents">) => void;
  onToggleScratchPad: () => void;
  onToggleHelp: () => void;
  onCloseModals: () => void;
}

export function useKeyboardShortcuts({
  agents,
  onAgentSwitch,
  onToggleScratchPad,
  onToggleHelp,
  onCloseModals,
}: UseKeyboardShortcutsProps) {
  // Cmd+1 = switch to agent 1
  useHotkeys(
    "meta+1",
    (e) => {
      e.preventDefault();
      if (agents[0]) onAgentSwitch(agents[0]._id);
    },
    { enableOnFormTags: false }
  );

  // Cmd+2 = switch to agent 2
  useHotkeys(
    "meta+2",
    (e) => {
      e.preventDefault();
      if (agents[1]) onAgentSwitch(agents[1]._id);
    },
    { enableOnFormTags: false }
  );

  // Cmd+3 = switch to agent 3
  useHotkeys(
    "meta+3",
    (e) => {
      e.preventDefault();
      if (agents[2]) onAgentSwitch(agents[2]._id);
    },
    { enableOnFormTags: false }
  );

  // Cmd+Shift+N = toggle scratch pad
  useHotkeys(
    "meta+shift+n",
    (e) => {
      e.preventDefault();
      onToggleScratchPad();
    },
    { enableOnFormTags: false }
  );

  // Cmd+/ = toggle help modal
  useHotkeys(
    "meta+/",
    (e) => {
      e.preventDefault();
      onToggleHelp();
    },
    { enableOnFormTags: false }
  );

  // Esc = close modals
  useHotkeys(
    "escape",
    (e) => {
      e.preventDefault();
      onCloseModals();
    },
    { enableOnFormTags: true }
  );
}
