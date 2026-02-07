"use node";

/**
 * Quinn Browser Actions
 * AGT-240: Convex actions for headless browser testing
 *
 * TEMPORARY: Disabled due to Playwright bundling issues with Convex.
 * Playwright has complex dependencies (chromium-bidi) that can't be bundled.
 * TODO: Move browser testing to external HTTP endpoint or standalone script.
 *
 * Provides Quinn with browser capabilities to:
 * - Capture screenshots of localhost:3000
 * - Check for console errors
 * - Verify UI elements exist
 *
 * NOTE: This file requires Node.js runtime for Playwright browser automation
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
// TEMPORARILY DISABLED - Playwright bundling issues
// import {
//   captureScreenshot,
//   checkConsoleErrors,
//   verifyElementExists,
//   comprehensiveCheck,
// } from "../lib/evox/quinn-browser";

/**
 * Capture a screenshot of a page
 * TEMPORARILY DISABLED - See file header
 */
export const screenshot = action({
  args: {
    url: v.string(),
    timeout: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    throw new Error("Browser actions temporarily disabled due to Playwright bundling issues. See AGT-240.");
  },
});

/**
 * Check for console errors on a page
 * TEMPORARILY DISABLED - See file header
 */
export const checkErrors = action({
  args: {
    url: v.string(),
    timeout: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    throw new Error("Browser actions temporarily disabled due to Playwright bundling issues. See AGT-240.");
  },
});

/**
 * Verify a UI element exists
 * TEMPORARILY DISABLED - See file header
 */
export const verifyElement = action({
  args: {
    url: v.string(),
    selector: v.string(),
    timeout: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    throw new Error("Browser actions temporarily disabled due to Playwright bundling issues. See AGT-240.");
  },
});

/**
 * Comprehensive check - screenshot + errors + elements
 * This is the main action Quinn should use
 * TEMPORARILY DISABLED - See file header
 */
export const comprehensivePageCheck = action({
  args: {
    url: v.string(),
    selectors: v.optional(v.array(v.string())),
    timeout: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    throw new Error("Browser actions temporarily disabled due to Playwright bundling issues. See AGT-240.");
  },
});

/**
 * Quick health check - localhost:3000 with common selectors
 * TEMPORARILY DISABLED - See file header
 */
export const quickHealthCheck = action({
  args: {},
  handler: async (ctx) => {
    throw new Error("Browser actions temporarily disabled due to Playwright bundling issues. See AGT-240.");
  },
});
