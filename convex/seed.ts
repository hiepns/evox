import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const seedDatabase = mutation({
  handler: async (ctx) => {
    // Check if already seeded - must have BOTH agents AND projects
    const existingAgents = await ctx.db.query("agents").collect();
    const existingProjects = await ctx.db.query("projects").collect();

    if (existingAgents.length > 0 && existingProjects.length > 0) {
      // Ensure ADR-001 agent mappings exist (max, sam, leo) even when already seeded
      const existingMappings = await ctx.db.query("agentMappings").collect();
      if (existingMappings.length === 0) {
        const son = existingAgents.find((a) => a.name === "SON" || a.role === "pm");
        const sam = existingAgents.find((a) => a.name === "SAM" || a.role === "backend");
        const leo = existingAgents.find((a) => a.name === "LEO" || a.role === "frontend");
        const sonId = son?._id ?? existingAgents[0]._id;
        const samId = sam?._id ?? existingAgents[0]._id;
        const leoId = leo?._id ?? existingAgents[0]._id;
        await ctx.db.insert("agentMappings", { name: "max", convexAgentId: sonId });
        await ctx.db.insert("agentMappings", { name: "sam", convexAgentId: samId });
        await ctx.db.insert("agentMappings", { name: "leo", convexAgentId: leoId });
      }
      return { message: "Database already seeded", skipped: true };
    }

    // Handle partial state
    const shouldCreateAgents = existingAgents.length === 0;
    const shouldCreateProjects = existingProjects.length === 0;

    const now = Date.now();

    // Get or create projects
    let evoxProjectId: Id<"projects">;
    let agentFactoryId: Id<"projects">;
    let affitorId: Id<"projects">;
    let myTimezoneId: Id<"projects">;

    if (shouldCreateProjects) {
      evoxProjectId = await ctx.db.insert("projects", {
        name: "EVOX",
        description: "Mission Control MVP - Agent coordination dashboard",
        createdAt: now,
      });

      agentFactoryId = await ctx.db.insert("projects", {
        name: "Agent Factory",
        description: "AI agent creation and management platform",
        createdAt: now,
      });

      affitorId = await ctx.db.insert("projects", {
        name: "Affitor",
        description: "Affiliate marketing automation tool",
        createdAt: now,
      });

      myTimezoneId = await ctx.db.insert("projects", {
        name: "MyTimezone",
        description: "Global time zone coordination app",
        createdAt: now,
      });
    } else {
      const evox = existingProjects.find((p) => p.name === "EVOX");
      if (!evox) {
        evoxProjectId = await ctx.db.insert("projects", {
          name: "EVOX",
          description: "Mission Control MVP - Agent coordination dashboard",
          createdAt: now,
        });
      } else {
        evoxProjectId = evox._id;
      }
      agentFactoryId = existingProjects.find((p) => p.name === "Agent Factory")?._id ?? evoxProjectId;
      affitorId = existingProjects.find((p) => p.name === "Affitor")?._id ?? evoxProjectId;
      myTimezoneId = existingProjects.find((p) => p.name === "MyTimezone")?._id ?? evoxProjectId;
    }

    // Get or create agents
    let sonId: Id<"agents">;
    let samId: Id<"agents">;
    let leoId: Id<"agents">;

    if (shouldCreateAgents) {
      sonId = await ctx.db.insert("agents", {
        name: "SON",
        role: "pm",
        status: "online",
        avatar: "👨‍💼",
        lastSeen: now,
      });

      samId = await ctx.db.insert("agents", {
        name: "SAM",
        role: "backend",
        status: "online",
        avatar: "🤖",
        lastSeen: now,
      });

      leoId = await ctx.db.insert("agents", {
        name: "LEO",
        role: "frontend",
        status: "offline",
        avatar: "🦁",
        lastSeen: now,
      });
    } else {
      const son = existingAgents.find((a) => a.name === "SON" || a.role === "pm");
      const sam = existingAgents.find((a) => a.name === "SAM" || a.role === "backend");
      const leo = existingAgents.find((a) => a.name === "LEO" || a.role === "frontend");

      sonId = son?._id ?? existingAgents[0]._id;
      samId = sam?._id ?? existingAgents[0]._id;
      leoId = leo?._id ?? existingAgents[0]._id;
    }

    // ADR-001: agent name → Convex/Linear mapping (max, sam, leo)
    const existingMappings = await ctx.db.query("agentMappings").collect();
    if (existingMappings.length === 0) {
      await ctx.db.insert("agentMappings", {
        name: "max",
        convexAgentId: sonId,
        linearUserId: undefined,
      });
      await ctx.db.insert("agentMappings", {
        name: "sam",
        convexAgentId: samId,
        linearUserId: undefined,
      });
      await ctx.db.insert("agentMappings", {
        name: "leo",
        convexAgentId: leoId,
        linearUserId: undefined,
      });
    }

    // Only create sample tasks/messages if this is a full fresh seed
    if (shouldCreateAgents && shouldCreateProjects) {
      // Create initial tasks
      const task1 = await ctx.db.insert("tasks", {
        projectId: evoxProjectId,
        title: "EVOX-1: Setup Convex schema",
        description: "Create schema.ts with 7 tables: agents, tasks, messages, activities, notifications, documents, heartbeats",
        status: "in_progress",
        priority: "urgent",
        assignee: samId,
        createdBy: sonId,
        createdAt: now,
        updatedAt: now,
      });

      const task2 = await ctx.db.insert("tasks", {
        projectId: evoxProjectId,
        title: "EVOX-2: Create backend CRUD functions",
        description: "Implement CRUD operations for agents, tasks, messages, activities in Convex",
        status: "in_progress",
        priority: "high",
        assignee: samId,
        createdBy: sonId,
        createdAt: now,
        updatedAt: now,
      });

      const task3 = await ctx.db.insert("tasks", {
        projectId: evoxProjectId,
        title: "EVOX-3: Design Mission Control UI",
        description: "Create main dashboard layout with agent status, task board, and activity feed",
        status: "todo",
        priority: "high",
        assignee: leoId,
        createdBy: sonId,
        createdAt: now,
        updatedAt: now,
      });

      await ctx.db.insert("tasks", {
        projectId: evoxProjectId,
        title: "EVOX-4: Implement real-time updates",
        description: "Connect frontend to Convex subscriptions for live data updates",
        status: "backlog",
        priority: "medium",
        createdBy: sonId,
        createdAt: now,
        updatedAt: now,
      });

      // Create welcome messages
      await ctx.db.insert("messages", {
        from: sonId,
        content: "Welcome to EVOX Mission Control! Let's build something amazing. 🚀",
        channel: "general",
        mentions: [samId, leoId],
        createdAt: now,
      });

      await ctx.db.insert("messages", {
        from: samId,
        content: "Backend infrastructure ready. Schema and CRUD functions deployed. ⚙️",
        channel: "dev",
        mentions: [],
        createdAt: now + 1000,
      });

      // Create initial activities
      await ctx.db.insert("activities", {
        agent: samId,
        action: "created_schema",
        target: "convex/schema.ts",
        metadata: { tables: 7 },
        createdAt: now,
      });

      await ctx.db.insert("activities", {
        agent: samId,
        action: "deployed_functions",
        target: "convex/",
        metadata: { files: ["agents.ts", "tasks.ts", "messages.ts", "activities.ts"] },
        createdAt: now + 1000,
      });

      await ctx.db.insert("activities", {
        agent: sonId,
        action: "created_task",
        target: task1,
        createdAt: now + 2000,
      });

      // Create initial notifications
      await ctx.db.insert("notifications", {
        to: samId,
        type: "assignment",
        title: "New Task Assigned",
        message: "You've been assigned: EVOX-1: Setup Convex schema",
        read: false,
        relatedTask: task1,
        createdAt: now,
      });

      await ctx.db.insert("notifications", {
        to: samId,
        type: "assignment",
        title: "New Task Assigned",
        message: "You've been assigned: EVOX-2: Create backend CRUD functions",
        read: false,
        relatedTask: task2,
        createdAt: now,
      });

      await ctx.db.insert("notifications", {
        to: leoId,
        type: "assignment",
        title: "New Task Assigned",
        message: "You've been assigned: EVOX-3: Design Mission Control UI",
        read: false,
        relatedTask: task3,
        createdAt: now,
      });

      await ctx.db.insert("notifications", {
        to: samId,
        type: "mention",
        title: "You were mentioned",
        message: "Welcome to EVOX Mission Control! Let's build something amazing. 🚀",
        read: false,
        createdAt: now,
      });

      await ctx.db.insert("notifications", {
        to: leoId,
        type: "mention",
        title: "You were mentioned",
        message: "Welcome to EVOX Mission Control! Let's build something amazing. 🚀",
        read: false,
        createdAt: now,
      });

      // Create initial documentation
      await ctx.db.insert("documents", {
        title: "EVOX Architecture",
        content: `# EVOX Architecture

## Tech Stack
- Next.js App Router + TypeScript + Tailwind + shadcn/ui
- Database: Convex (real-time, serverless)

## Agent Territories
- SON (PM): Project management, requirements, coordination
- SAM (Backend): convex/, scripts/, lib/evox/
- LEO (Frontend): app/evox/, components/evox/

## Rules
- Commit format: closes EVOX-XX
- No auto-push unless Son approves
- Types first: schema.ts before UI`,
        author: sonId,
        project: "EVOX",
        updatedAt: now,
      });

      // Create initial heartbeats
      await ctx.db.insert("heartbeats", {
        agent: sonId,
        status: "online",
        timestamp: now,
        metadata: { source: "seed" },
      });

      await ctx.db.insert("heartbeats", {
        agent: samId,
        status: "online",
        timestamp: now,
        metadata: { source: "seed" },
      });

      await ctx.db.insert("heartbeats", {
        agent: leoId,
        status: "offline",
        timestamp: now,
        metadata: { source: "seed" },
      });
    }

    return {
      message: shouldCreateAgents && shouldCreateProjects
        ? "Database seeded successfully"
        : "Database repaired - missing entities created",
      projects: { evoxProjectId, agentFactoryId, affitorId, myTimezoneId },
      agents: { sonId, samId, leoId },
      createdAgents: shouldCreateAgents,
      createdProjects: shouldCreateProjects,
    };
  },
});

/**
 * Seed agent skills (AGT-129: Skill System)
 * Run: npx convex run seed:seedSkills
 */
export const seedSkills = mutation({
  handler: async (ctx) => {
    const now = Date.now();

    // Get existing agents
    const agents = await ctx.db.query("agents").collect();
    if (agents.length === 0) {
      return { message: "No agents found. Run seedDatabase first.", skipped: true };
    }

    // Check if skills already seeded
    const existingSkills = await ctx.db.query("agentSkills").collect();
    if (existingSkills.length > 0) {
      return { message: "Skills already seeded", skipped: true };
    }

    const son = agents.find((a) => a.name === "SON" || a.role === "pm");
    const sam = agents.find((a) => a.name === "SAM" || a.role === "backend");
    const leo = agents.find((a) => a.name === "LEO" || a.role === "frontend");

    const results = [];

    // SON/MAX (PM) - Level 3 Lead
    if (son) {
      await ctx.db.insert("agentSkills", {
        agentId: son._id,
        autonomyLevel: 3,
        skills: [
          { name: "project-management", proficiency: 95, verified: true, lastUsed: now },
          { name: "linear", proficiency: 90, verified: true, lastUsed: now },
          { name: "requirements", proficiency: 85, verified: true, lastUsed: now },
          { name: "code-review", proficiency: 80, verified: true, lastUsed: now },
        ],
        territory: ["docs/", "CLAUDE.md", ".cursorrules", "DISPATCH.md"],
        permissions: {
          canPush: false,
          canMerge: true,
          canDeploy: false,
          canEditSchema: true,
          canApproveOthers: true,
        },
        tasksCompleted: 0,
        tasksWithBugs: 0,
        createdAt: now,
        updatedAt: now,
      });
      results.push({ agent: "SON/MAX", level: 3 });
    }

    // SAM (Backend) - Level 2 Specialist
    if (sam) {
      await ctx.db.insert("agentSkills", {
        agentId: sam._id,
        autonomyLevel: 2,
        skills: [
          { name: "typescript", proficiency: 90, verified: true, lastUsed: now },
          { name: "convex", proficiency: 95, verified: true, lastUsed: now },
          { name: "node.js", proficiency: 85, verified: true, lastUsed: now },
          { name: "linear-api", proficiency: 80, verified: true, lastUsed: now },
          { name: "webhooks", proficiency: 85, verified: true, lastUsed: now },
        ],
        territory: ["convex/", "scripts/", "lib/evox/"],
        permissions: {
          canPush: false,
          canMerge: false,
          canDeploy: false,
          canEditSchema: false,
          canApproveOthers: false,
        },
        tasksCompleted: 0,
        tasksWithBugs: 0,
        createdAt: now,
        updatedAt: now,
      });
      results.push({ agent: "SAM", level: 2 });
    }

    // LEO (Frontend) - Level 2 Specialist
    if (leo) {
      await ctx.db.insert("agentSkills", {
        agentId: leo._id,
        autonomyLevel: 2,
        skills: [
          { name: "react", proficiency: 90, verified: true, lastUsed: now },
          { name: "next.js", proficiency: 85, verified: true, lastUsed: now },
          { name: "tailwind", proficiency: 90, verified: true, lastUsed: now },
          { name: "typescript", proficiency: 85, verified: true, lastUsed: now },
          { name: "shadcn-ui", proficiency: 80, verified: true, lastUsed: now },
        ],
        territory: ["app/", "components/"],
        permissions: {
          canPush: false,
          canMerge: false,
          canDeploy: false,
          canEditSchema: false,
          canApproveOthers: false,
        },
        tasksCompleted: 0,
        tasksWithBugs: 0,
        createdAt: now,
        updatedAt: now,
      });
      results.push({ agent: "LEO", level: 2 });
    }

    return {
      message: "Agent skills seeded successfully",
      seeded: results,
    };
  },
});

// Reset database (use with caution!)
export const resetDatabase = mutation({
  handler: async (ctx) => {
    // Delete all data from all tables
    const tables = [
      "projects",
      "agents",
      "tasks",
      "messages",
      "activities",
      "notifications",
      "documents",
      "heartbeats",
      "settings",
    ] as const;

    let totalDeleted = 0;

    for (const table of tables) {
      const items = await ctx.db.query(table).collect();
      for (const item of items) {
        await ctx.db.delete(item._id);
        totalDeleted++;
      }
    }

    return {
      message: "Database reset complete",
      deletedCount: totalDeleted,
    };
  },
});
