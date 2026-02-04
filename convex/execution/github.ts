// ============================================================
// EVOX Engine Core — GitHub API Wrapper
// convex/execution/github.ts
//
// All GitHub operations via REST API.
// Reads go to API, writes stage in memory, commit does multi-file atomic push.
// ============================================================

// ---- Types ----

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

export interface FileContent {
  path: string;
  content: string;
  sha: string;
  size: number;
}

export interface TreeEntry {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

export interface SearchResult {
  path: string;
  matchedLines: string[];
}

export interface CommitResult {
  sha: string;
  url: string;
  filesCommitted: string[];
}

// ---- Helpers ----

async function ghFetch(
  config: GitHubConfig,
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = endpoint.startsWith("https://")
    ? endpoint
    : `https://api.github.com${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body}`);
  }

  return res.json();
}

// ---- Read Operations ----

export async function readFile(config: GitHubConfig, path: string): Promise<FileContent> {
  const data = await ghFetch(config, `/repos/${config.owner}/${config.repo}/contents/${path}?ref=${config.branch}`);
  if (data.type !== "file") throw new Error(`${path} is not a file (type: ${data.type})`);
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { path: data.path, content, sha: data.sha, size: data.size };
}

export async function listDirectory(config: GitHubConfig, path: string = ""): Promise<TreeEntry[]> {
  const ref = await ghFetch(config, `/repos/${config.owner}/${config.repo}/git/ref/heads/${config.branch}`);
  const tree = await ghFetch(config, `/repos/${config.owner}/${config.repo}/git/trees/${ref.object.sha}?recursive=1`);
  const prefix = path ? (path.endsWith("/") ? path : `${path}/`) : "";
  return tree.tree
    .filter((entry: any) => !prefix || entry.path.startsWith(prefix))
    .map((entry: any) => ({ path: entry.path, type: entry.type === "tree" ? "tree" : "blob", size: entry.size }));
}

export async function searchCode(config: GitHubConfig, query: string): Promise<SearchResult[]> {
  const encoded = encodeURIComponent(`${query} repo:${config.owner}/${config.repo}`);
  const data = await ghFetch(config, `https://api.github.com/search/code?q=${encoded}&per_page=10`);
  return data.items.map((item: any) => ({
    path: item.path,
    matchedLines: item.text_matches ? item.text_matches.map((m: any) => m.fragment) : [],
  }));
}

// ---- Write Operations (Staged) ----

export function stageFile(stagedChanges: Map<string, string>, path: string, content: string): void {
  stagedChanges.set(path, content);
}

// ---- Commit (Atomic Multi-File) ----

export async function commitChanges(config: GitHubConfig, stagedChanges: Map<string, string>, message: string): Promise<CommitResult> {
  if (stagedChanges.size === 0) throw new Error("No staged changes to commit");

  const ref = await ghFetch(config, `/repos/${config.owner}/${config.repo}/git/ref/heads/${config.branch}`);
  const headSha = ref.object.sha;
  const headCommit = await ghFetch(config, `/repos/${config.owner}/${config.repo}/git/commits/${headSha}`);
  const baseTreeSha = headCommit.tree.sha;

  const treeEntries: any[] = [];
  for (const [path, content] of stagedChanges) {
    const blob = await ghFetch(config, `/repos/${config.owner}/${config.repo}/git/blobs`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, encoding: "utf-8" }),
    });
    treeEntries.push({ path, mode: "100644", type: "blob", sha: blob.sha });
  }

  const newTree = await ghFetch(config, `/repos/${config.owner}/${config.repo}/git/trees`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
  });

  const newCommit = await ghFetch(config, `/repos/${config.owner}/${config.repo}/git/commits`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] }),
  });

  await ghFetch(config, `/repos/${config.owner}/${config.repo}/git/refs/heads/${config.branch}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sha: newCommit.sha, force: false }),
  });

  return { sha: newCommit.sha, url: newCommit.html_url, filesCommitted: Array.from(stagedChanges.keys()) };
}
