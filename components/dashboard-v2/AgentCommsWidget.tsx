"use client";

/**
 * AgentCommsWidget - Agent-to-agent communication feed
 * Shows channel messages with extracted keywords
 * Format: 'LEO → #dev: shipped, AGT-314, components'
 */

interface ChannelMessage {
  _id: string;
  agentName?: string;
  description?: string;
  title?: string;
  timestamp: number;
  eventType?: string;
}

interface AgentCommsWidgetProps {
  messages: ChannelMessage[];
  limit?: number;
}

// Keywords to prioritize in extraction
const PRIORITY_KEYWORDS = [
  // Actions
  "shipped", "completed", "done", "fixed", "merged", "deployed", "created", "updated",
  "building", "working", "testing", "reviewing", "blocked", "waiting",
  // Tickets
  /AGT-\d+/i,
  // Components/features
  "dashboard", "widget", "component", "api", "endpoint", "ui", "mobile",
  // Status
  "online", "offline", "ready", "progress",
];

// Noise words to filter out
const NOISE_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "must", "shall", "can", "to", "of", "in",
  "for", "on", "with", "at", "by", "from", "as", "into", "through",
  "and", "or", "but", "if", "then", "else", "when", "where", "why",
  "how", "all", "each", "every", "both", "few", "more", "most", "other",
  "some", "such", "no", "nor", "not", "only", "own", "same", "so",
  "than", "too", "very", "just", "also", "now", "here", "there", "this",
  "that", "these", "those", "i", "you", "he", "she", "it", "we", "they",
  "my", "your", "his", "her", "its", "our", "their", "what", "which",
]);

function extractKeywords(text: string, maxKeywords: number = 5): string[] {
  if (!text) return [];

  const keywords: string[] = [];
  const textLower = text.toLowerCase();

  // First, extract AGT-XXX tickets
  const ticketMatches = text.match(/AGT-\d+/gi) || [];
  keywords.push(...ticketMatches.slice(0, 2));

  // Extract priority keywords
  for (const keyword of PRIORITY_KEYWORDS) {
    if (keywords.length >= maxKeywords) break;

    if (typeof keyword === "string") {
      if (textLower.includes(keyword) && !keywords.includes(keyword)) {
        keywords.push(keyword);
      }
    }
  }

  // If still need more, extract significant words
  if (keywords.length < maxKeywords) {
    const words = text
      .replace(/[^\w\s-]/g, " ")
      .split(/\s+/)
      .filter((word) => {
        const w = word.toLowerCase();
        return (
          w.length > 3 &&
          !NOISE_WORDS.has(w) &&
          !keywords.some((k) => k.toLowerCase() === w)
        );
      });

    // Add unique words up to maxKeywords
    for (const word of words) {
      if (keywords.length >= maxKeywords) break;
      if (!keywords.some((k) => k.toLowerCase() === word.toLowerCase())) {
        keywords.push(word);
      }
    }
  }

  return keywords.slice(0, maxKeywords);
}

function extractChannel(title?: string): string {
  if (!title) return "dev";
  const match = title.match(/#(\w+)/);
  return match ? match[1] : "dev";
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function AgentCommsWidget({ messages, limit = 8 }: AgentCommsWidgetProps) {
  // Filter to only channel messages
  const channelMessages = messages
    .filter((m) => m.eventType === "channel_message")
    .slice(0, limit);

  if (channelMessages.length === 0) {
    return (
      <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-400 mb-3">Agent Comms</h3>
        <div className="text-center text-zinc-500 text-sm py-4">
          No recent communications
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-400">Agent Comms</h3>
        <span className="text-[10px] text-zinc-600">{channelMessages.length} msgs</span>
      </div>

      {/* Messages */}
      <div className="space-y-2">
        {channelMessages.map((msg) => {
          const channel = extractChannel(msg.title);
          const keywords = extractKeywords(msg.description || "", 5);
          const agentName = (msg.agentName || "?").toUpperCase();

          return (
            <div
              key={msg._id}
              className="py-2 border-b border-zinc-800/50 last:border-0 min-h-[44px] active:bg-zinc-800/50 transition-colors rounded"
            >
              {/* Agent → Channel : Time */}
              <div className="flex items-center gap-1.5 text-xs mb-1">
                <span className="font-semibold text-blue-400">{agentName}</span>
                <span className="text-zinc-600">→</span>
                <span className="text-zinc-400">#{channel}</span>
                <span className="text-zinc-700 ml-auto">{formatTime(msg.timestamp)}</span>
              </div>

              {/* Keywords */}
              <div className="flex flex-wrap gap-1.5">
                {keywords.length > 0 ? (
                  keywords.map((keyword, i) => (
                    <span
                      key={i}
                      className={`text-[11px] px-1.5 py-0.5 rounded ${
                        keyword.match(/AGT-\d+/i)
                          ? "bg-purple-900/50 text-purple-300"
                          : keyword.match(/shipped|completed|done|merged|deployed/i)
                          ? "bg-green-900/50 text-green-300"
                          : keyword.match(/blocked|waiting|stuck/i)
                          ? "bg-red-900/50 text-red-300"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {keyword}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-zinc-600 truncate">
                    {(msg.description || "").slice(0, 50)}...
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
