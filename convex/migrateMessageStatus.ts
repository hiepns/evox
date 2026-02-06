/**
 * Migration: Add statusCode, sentAt to existing messages
 * Run once: npx convex run migrateMessageStatus:migrateAll
 */

import { mutation } from "./_generated/server";

export const migrateAll = mutation({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query("agentMessages").collect();

    let migrated = 0;

    for (const msg of messages) {
      // Skip if already migrated
      if (msg.statusCode !== undefined) continue;

      // Migrate: status string → statusCode number
      const statusCode = msg.status === "read" ? 2 : 1; // read=2(seen), unread=1(delivered)

      // Add sentAt from timestamp
      const sentAt = msg.timestamp;

      // Update message
      await ctx.db.patch(msg._id, {
        statusCode,
        sentAt,
        // Don't set seenAt/repliedAt for old messages (unknown)
      });

      migrated++;
    }

    return {
      success: true,
      totalMessages: messages.length,
      migrated,
      message: `Migrated ${migrated} messages to new status format`,
    };
  },
});

export const checkMigrationStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const allMessages = await ctx.db.query("agentMessages").collect();
    const migratedMessages = allMessages.filter((m) => m.statusCode !== undefined);
    const needsMigration = allMessages.filter((m) => m.statusCode === undefined);

    return {
      total: allMessages.length,
      migrated: migratedMessages.length,
      needsMigration: needsMigration.length,
      percentage: Math.round((migratedMessages.length / allMessages.length) * 100),
    };
  },
});
