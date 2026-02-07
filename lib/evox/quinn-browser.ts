/**
 * Quinn Browser Testing Utilities
 * AGT-240: Headless browser operations for QA agent
 *
 * Provides headless browser capabilities for Quinn to:
 * - Capture UI screenshots
 * - Check for console errors
 * - Verify UI elements exist
 */

import { chromium, Browser, Page } from 'playwright';

export interface BrowserResult {
  success: boolean;
  error?: string;
  screenshot?: string; // Base64 encoded
  consoleErrors?: string[];
  elementExists?: boolean;
}

export interface BrowserConfig {
  url: string;
  timeout?: number;
  headless?: boolean;
}

/**
 * Capture a screenshot of a page
 */
export async function captureScreenshot(config: BrowserConfig): Promise<BrowserResult> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await chromium.launch({
      headless: config.headless ?? true
    });

    page = await browser.newPage();

    // Navigate to URL with timeout
    await page.goto(config.url, {
      timeout: config.timeout ?? 30000,
      waitUntil: 'networkidle'
    });

    // Capture screenshot as base64
    const screenshot = await page.screenshot({
      fullPage: true,
      type: 'png'
    });

    return {
      success: true,
      screenshot: screenshot.toString('base64')
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    await page?.close();
    await browser?.close();
  }
}

/**
 * Check for console errors on a page
 */
export async function checkConsoleErrors(config: BrowserConfig): Promise<BrowserResult> {
  let browser: Browser | null = null;
  let page: Page | null = null;
  const consoleErrors: string[] = [];

  try {
    browser = await chromium.launch({
      headless: config.headless ?? true
    });

    page = await browser.newPage();

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      consoleErrors.push(`Page Error: ${error.message}`);
    });

    // Navigate to URL
    await page.goto(config.url, {
      timeout: config.timeout ?? 30000,
      waitUntil: 'networkidle'
    });

    // Wait a bit for any async errors
    await page.waitForTimeout(2000);

    return {
      success: true,
      consoleErrors
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      consoleErrors
    };
  } finally {
    await page?.close();
    await browser?.close();
  }
}

/**
 * Verify a UI element exists on the page
 */
export async function verifyElementExists(
  config: BrowserConfig,
  selector: string
): Promise<BrowserResult> {
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    browser = await chromium.launch({
      headless: config.headless ?? true
    });

    page = await browser.newPage();

    // Navigate to URL
    await page.goto(config.url, {
      timeout: config.timeout ?? 30000,
      waitUntil: 'networkidle'
    });

    // Check if element exists
    const element = await page.$(selector);
    const exists = element !== null;

    // Also get screenshot if element doesn't exist for debugging
    let screenshot: string | undefined;
    if (!exists) {
      const screenshotBuffer = await page.screenshot({
        fullPage: true,
        type: 'png'
      });
      screenshot = screenshotBuffer.toString('base64');
    }

    return {
      success: true,
      elementExists: exists,
      screenshot
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    await page?.close();
    await browser?.close();
  }
}

/**
 * Comprehensive page check - screenshot + console errors + element verification
 */
export async function comprehensiveCheck(
  config: BrowserConfig,
  selectors?: string[]
): Promise<{
  success: boolean;
  error?: string;
  screenshot?: string;
  consoleErrors?: string[];
  elementsFound?: Record<string, boolean>;
}> {
  let browser: Browser | null = null;
  let page: Page | null = null;
  const consoleErrors: string[] = [];
  const elementsFound: Record<string, boolean> = {};

  try {
    browser = await chromium.launch({
      headless: config.headless ?? true
    });

    page = await browser.newPage();

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(`Page Error: ${error.message}`);
    });

    // Navigate to URL
    await page.goto(config.url, {
      timeout: config.timeout ?? 30000,
      waitUntil: 'networkidle'
    });

    // Wait for any async errors
    await page.waitForTimeout(2000);

    // Check selectors if provided
    if (selectors && selectors.length > 0) {
      for (const selector of selectors) {
        const element = await page.$(selector);
        elementsFound[selector] = element !== null;
      }
    }

    // Capture screenshot
    const screenshot = await page.screenshot({
      fullPage: true,
      type: 'png'
    });

    return {
      success: true,
      screenshot: screenshot.toString('base64'),
      consoleErrors,
      elementsFound: selectors ? elementsFound : undefined
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      consoleErrors
    };
  } finally {
    await page?.close();
    await browser?.close();
  }
}
