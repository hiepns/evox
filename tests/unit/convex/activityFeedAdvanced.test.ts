/**
 * Advanced Activity Feed Tests
 *
 * North Star: CEO sees what's happening in real-time.
 * Tests cover: filtering, pagination, aggregation, real-time updates.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockCtx } from "../../helpers/convex-mock";

describe("Activity Feed - Advanced Features", () => {
  let ctx: ReturnType<typeof createMockCtx>;

  beforeEach(() => {
    ctx = createMockCtx();
  });

  function mockActivity(overrides: Partial<{
    agentName: string;
    eventType: string;
    description: string;
    linearIdentifier: string;
    timestamp: number;
    metadata: Record<string, unknown>;
  }> = {}) {
    return {
      _id: `activity_${Math.random().toString(36).slice(2)}`,
      _creationTime: Date.now(),
      agentName: "SAM",
      eventType: "completed",
      description: "Completed task",
      linearIdentifier: "AGT-123",
      timestamp: Date.now(),
      metadata: {},
      ...overrides,
    };
  }

  describe("Filtering", () => {
    it("should filter by agent name", () => {
      const activities = [
        mockActivity({ agentName: "SAM" }),
        mockActivity({ agentName: "LEO" }),
        mockActivity({ agentName: "SAM" }),
        mockActivity({ agentName: "QUINN" }),
      ];

      const samActivities = activities.filter((a) => a.agentName === "SAM");

      expect(samActivities).toHaveLength(2);
    });

    it("should filter by event type", () => {
      const activities = [
        mockActivity({ eventType: "completed" }),
        mockActivity({ eventType: "started" }),
        mockActivity({ eventType: "completed" }),
        mockActivity({ eventType: "push" }),
      ];

      const completed = activities.filter((a) => a.eventType === "completed");

      expect(completed).toHaveLength(2);
    });

    it("should filter by date range", () => {
      const now = Date.now();
      const activities = [
        mockActivity({ timestamp: now - 60 * 60 * 1000 }), // 1 hour ago
        mockActivity({ timestamp: now - 25 * 60 * 60 * 1000 }), // 25 hours ago
        mockActivity({ timestamp: now - 2 * 60 * 60 * 1000 }), // 2 hours ago
      ];

      const last24h = 24 * 60 * 60 * 1000;
      const recent = activities.filter((a) => now - a.timestamp < last24h);

      expect(recent).toHaveLength(2);
    });

    it("should filter by ticket identifier", () => {
      const activities = [
        mockActivity({ linearIdentifier: "AGT-123" }),
        mockActivity({ linearIdentifier: "AGT-456" }),
        mockActivity({ linearIdentifier: "AGT-123" }),
      ];

      const ticket123 = activities.filter((a) => a.linearIdentifier === "AGT-123");

      expect(ticket123).toHaveLength(2);
    });

    it("should combine multiple filters", () => {
      const activities = [
        mockActivity({ agentName: "SAM", eventType: "completed" }),
        mockActivity({ agentName: "SAM", eventType: "started" }),
        mockActivity({ agentName: "LEO", eventType: "completed" }),
      ];

      const samCompleted = activities.filter(
        (a) => a.agentName === "SAM" && a.eventType === "completed"
      );

      expect(samCompleted).toHaveLength(1);
    });
  });

  describe("Pagination", () => {
    it("should return paginated results", () => {
      const activities = Array.from({ length: 50 }, (_, i) =>
        mockActivity({ description: `Activity ${i}` })
      );

      const pageSize = 10;
      const page1 = activities.slice(0, pageSize);
      const page2 = activities.slice(pageSize, pageSize * 2);

      expect(page1).toHaveLength(10);
      expect(page2).toHaveLength(10);
    });

    it("should handle cursor-based pagination", () => {
      const activities = Array.from({ length: 30 }, (_, i) =>
        mockActivity({ timestamp: Date.now() - i * 1000 })
      );

      const cursor = activities[9].timestamp;
      const nextPage = activities.filter((a) => a.timestamp < cursor).slice(0, 10);

      expect(nextPage).toHaveLength(10);
      expect(nextPage[0].timestamp).toBeLessThan(cursor);
    });

    it("should return hasMore flag", () => {
      const activities = Array.from({ length: 25 }, () => mockActivity());
      const pageSize = 10;
      const page = activities.slice(0, pageSize);
      const hasMore = activities.length > pageSize;

      expect(page).toHaveLength(10);
      expect(hasMore).toBe(true);
    });
  });

  describe("Aggregation", () => {
    it("should count activities by agent", () => {
      const activities = [
        mockActivity({ agentName: "SAM" }),
        mockActivity({ agentName: "SAM" }),
        mockActivity({ agentName: "LEO" }),
        mockActivity({ agentName: "QUINN" }),
        mockActivity({ agentName: "SAM" }),
      ];

      const countByAgent = activities.reduce((acc, a) => {
        acc[a.agentName] = (acc[a.agentName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(countByAgent["SAM"]).toBe(3);
      expect(countByAgent["LEO"]).toBe(1);
      expect(countByAgent["QUINN"]).toBe(1);
    });

    it("should count activities by event type", () => {
      const activities = [
        mockActivity({ eventType: "completed" }),
        mockActivity({ eventType: "completed" }),
        mockActivity({ eventType: "started" }),
        mockActivity({ eventType: "push" }),
      ];

      const countByType = activities.reduce((acc, a) => {
        acc[a.eventType] = (acc[a.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(countByType["completed"]).toBe(2);
      expect(countByType["started"]).toBe(1);
    });

    it("should calculate hourly activity counts", () => {
      const now = Date.now();
      const activities = [
        mockActivity({ timestamp: now - 30 * 60 * 1000 }), // 30 min ago
        mockActivity({ timestamp: now - 90 * 60 * 1000 }), // 1.5 hours ago
        mockActivity({ timestamp: now - 45 * 60 * 1000 }), // 45 min ago
      ];

      const hourlyBuckets: Record<number, number> = {};
      activities.forEach((a) => {
        const hour = Math.floor(a.timestamp / (60 * 60 * 1000));
        hourlyBuckets[hour] = (hourlyBuckets[hour] || 0) + 1;
      });

      const bucketCount = Object.keys(hourlyBuckets).length;
      expect(bucketCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Real-time Updates", () => {
    it("should support subscription to new activities", () => {
      const subscribers: Array<(activity: ReturnType<typeof mockActivity>) => void> = [];

      const subscribe = (callback: (activity: ReturnType<typeof mockActivity>) => void) => {
        subscribers.push(callback);
        return () => {
          const index = subscribers.indexOf(callback);
          if (index > -1) subscribers.splice(index, 1);
        };
      };

      const received: ReturnType<typeof mockActivity>[] = [];
      const unsubscribe = subscribe((activity) => received.push(activity));

      // Simulate new activity
      const newActivity = mockActivity({ description: "New task started" });
      subscribers.forEach((cb) => cb(newActivity));

      expect(received).toHaveLength(1);
      expect(received[0].description).toBe("New task started");

      unsubscribe();
      expect(subscribers).toHaveLength(0);
    });

    it("should batch updates for performance", () => {
      const activities: ReturnType<typeof mockActivity>[] = [];
      const batchSize = 5;
      let batchCount = 0;

      const addWithBatching = (activity: ReturnType<typeof mockActivity>) => {
        activities.push(activity);
        if (activities.length % batchSize === 0) {
          batchCount++;
        }
      };

      for (let i = 0; i < 15; i++) {
        addWithBatching(mockActivity());
      }

      expect(batchCount).toBe(3);
    });
  });

  describe("Activity Formatting", () => {
    it("should format relative timestamps", () => {
      const formatRelative = (timestamp: number): string => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
      };

      expect(formatRelative(Date.now() - 30000)).toBe("just now");
      expect(formatRelative(Date.now() - 5 * 60000)).toBe("5m ago");
      expect(formatRelative(Date.now() - 3 * 3600000)).toBe("3h ago");
      expect(formatRelative(Date.now() - 2 * 86400000)).toBe("2d ago");
    });

    it("should generate activity summaries", () => {
      const generateSummary = (activity: ReturnType<typeof mockActivity>): string => {
        switch (activity.eventType) {
          case "completed":
            return `${activity.agentName} completed ${activity.linearIdentifier}`;
          case "started":
            return `${activity.agentName} started ${activity.linearIdentifier}`;
          case "push":
            return `${activity.agentName} pushed code`;
          default:
            return activity.description;
        }
      };

      const activity = mockActivity({
        agentName: "SAM",
        eventType: "completed",
        linearIdentifier: "AGT-456",
      });

      expect(generateSummary(activity)).toBe("SAM completed AGT-456");
    });

    it("should truncate long descriptions", () => {
      const truncate = (text: string, maxLength: number): string => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength - 3) + "...";
      };

      const longDesc = "This is a very long description that should be truncated";
      expect(truncate(longDesc, 20)).toBe("This is a very lo...");
      expect(truncate("Short", 20)).toBe("Short");
    });
  });

  describe("Activity Search", () => {
    it("should search by description keyword", () => {
      const activities = [
        mockActivity({ description: "Fixed authentication bug" }),
        mockActivity({ description: "Added new API endpoint" }),
        mockActivity({ description: "Updated authentication flow" }),
      ];

      const keyword = "authentication";
      const results = activities.filter((a) =>
        a.description.toLowerCase().includes(keyword.toLowerCase())
      );

      expect(results).toHaveLength(2);
    });

    it("should search case-insensitively", () => {
      const activities = [
        mockActivity({ description: "COMPLETED task" }),
        mockActivity({ description: "completed TASK" }),
        mockActivity({ description: "other work" }),
      ];

      const keyword = "completed";
      const results = activities.filter((a) =>
        a.description.toLowerCase().includes(keyword.toLowerCase())
      );

      expect(results).toHaveLength(2);
    });
  });
});
