// ============================================================
// EVOX Engine Core — Tool Definitions
// convex/execution/tools.ts
// ============================================================

import { GitHubConfig, readFile, listDirectory, searchCode, stageFile } from "./github";

export const GITHUB_TOOLS = [
  {
    name: "read_file",
    description: "Read a file from the repository. Returns the full content as UTF-8. Use this to understand existing code before making changes.",
    input_schema: {
      type: "object" as const,
      properties: { path: { type: "string", description: "File path relative to repo root" } },
      required: ["path"],
    },
  },
  {
    name: "write_file",
    description: "Write or update a file. Entire content replaced. Changes staged in memory, committed together at end. Always read first.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: { type: "string", description: "File path relative to repo root" },
        content: { type: "string", description: "Complete new content of the file" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "list_directory",
    description: "List all files and directories in a given path.",
    input_schema: {
      type: "object" as const,
      properties: { path: { type: "string", description: "Directory path. Empty string for root." } },
      required: ["path"],
    },
  },
  {
    name: "search_code",
    description: "Search for code patterns across the repository.",
    input_schema: {
      type: "object" as const,
      properties: { query: { type: "string", description: "Search query — code snippet, function name, or pattern" } },
      required: ["query"],
    },
  },
  {
    name: "task_complete",
    description: "Signal that the task is complete. Call when all changes are staged.",
    input_schema: {
      type: "object" as const,
      properties: {
        summary: { type: "string", description: "Brief summary of changes" },
        files_changed: { type: "array", items: { type: "string" }, description: "List of file paths modified/created" },
      },
      required: ["summary", "files_changed"],
    },
  },
];

// ---- Tool Execution ----

export interface ToolCallBlock { type: "tool_use"; id: string; name: string; input: Record<string, any>; }
export interface ToolResult { type: "tool_result"; tool_use_id: string; content: string; is_error?: boolean; }

export async function executeTool(
  toolCall: ToolCallBlock, ghConfig: GitHubConfig, stagedChanges: Map<string, string>
): Promise<ToolResult> {
  const { id, name, input } = toolCall;
  try {
    switch (name) {
      case "read_file": {
        if (stagedChanges.has(input.path)) {
          return { type: "tool_result", tool_use_id: id, content: stagedChanges.get(input.path)! };
        }
        const file = await readFile(ghConfig, input.path);
        return { type: "tool_result", tool_use_id: id, content: file.content };
      }
      case "write_file": {
        stageFile(stagedChanges, input.path, input.content);
        return { type: "tool_result", tool_use_id: id, content: `✅ Staged: ${input.path} (${input.content.length} chars)` };
      }
      case "list_directory": {
        const entries = await listDirectory(ghConfig, input.path || "");
        const formatted = entries.slice(0, 100)
          .map((e) => `${e.type === "tree" ? "📁" : "📄"} ${e.path}${e.size ? ` (${e.size}b)` : ""}`)
          .join("\n");
        return { type: "tool_result", tool_use_id: id, content: formatted + (entries.length > 100 ? `\n... and ${entries.length - 100} more` : "") };
      }
      case "search_code": {
        const results = await searchCode(ghConfig, input.query);
        if (!results.length) return { type: "tool_result", tool_use_id: id, content: `No results for: "${input.query}"` };
        return { type: "tool_result", tool_use_id: id, content: results.map((r) => `📄 ${r.path}\n${r.matchedLines.map((l) => `  > ${l}`).join("\n")}`).join("\n\n") };
      }
      case "task_complete": {
        return { type: "tool_result", tool_use_id: id, content: `✅ Task complete. Summary: ${input.summary}. Files: ${(input.files_changed || []).join(", ")}` };
      }
      default:
        return { type: "tool_result", tool_use_id: id, content: `Unknown tool: ${name}`, is_error: true };
    }
  } catch (error: any) {
    return { type: "tool_result", tool_use_id: id, content: `Error in ${name}: ${error.message}`, is_error: true };
  }
}
