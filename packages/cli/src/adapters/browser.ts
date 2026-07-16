import { mkdir } from "node:fs/promises"
import { join } from "node:path"
import { type Check, redactText } from "@proofstack/core"
import { type Browser, chromium } from "playwright"
import type { AdapterContext, AdapterResult } from "./types.js"

const BROWSER_PROTOCOLS = new Set(["http:", "https:"])

export async function runBrowserCheck(
  check: Extract<Check, { type: "browser" }>,
  context: AdapterContext,
): Promise<AdapterResult> {
  const startedAt = performance.now()
  const protocol = new URL(check.url).protocol
  const asset = check.screenshot ?? `${check.id}.png`

  if (!BROWSER_PROTOCOLS.has(protocol)) {
    return {
      checkId: check.id,
      type: check.type,
      verdict: "unknown",
      summary: `${protocol} is not a supported browser protocol`,
      durationMs: Math.round(performance.now() - startedAt),
    }
  }

  if (asset.includes("/") || asset.includes("\\")) {
    return {
      checkId: check.id,
      type: check.type,
      verdict: "unknown",
      summary: "Screenshot path must stay inside the assets directory",
      durationMs: Math.round(performance.now() - startedAt),
    }
  }

  let browser: Browser | undefined
  try {
    await mkdir(context.assetsDir, { recursive: true })
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.goto(check.url, { waitUntil: "domcontentloaded", timeout: 15_000 })

    const textVisible =
      check.text === undefined ||
      (await page.getByText(check.text, { exact: false }).first().isVisible())
    const roleVisible =
      check.role === undefined ||
      (await page
        .getByRole(check.role, check.name === undefined ? {} : { name: check.name })
        .first()
        .isVisible())
    const passed = textVisible && roleVisible
    const title = await page.title()

    await page.screenshot({ path: join(context.assetsDir, asset), fullPage: true })

    return {
      checkId: check.id,
      type: check.type,
      verdict: passed ? "pass" : "fail",
      summary: passed ? "Browser assertion is visible" : "Browser assertion is not visible",
      detail: redactText(`Final URL: ${page.url()}\nTitle: ${title}`, { home: context.home }),
      durationMs: Math.round(performance.now() - startedAt),
      asset,
    }
  } catch (error) {
    if (!(error instanceof Error)) throw error
    return {
      checkId: check.id,
      type: check.type,
      verdict: "unknown",
      summary: "Browser verification could not complete",
      detail: redactText(error.message, { home: context.home }),
      durationMs: Math.round(performance.now() - startedAt),
    }
  } finally {
    await browser?.close()
  }
}
