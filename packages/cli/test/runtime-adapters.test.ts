import { mkdtemp, rm, stat } from "node:fs/promises"
import { createServer } from "node:http"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { type Check, CheckSchema } from "@proofstack/core"
import { afterAll, beforeAll, describe, expect, it, onTestFinished } from "vitest"
import { runBrowserCheck } from "../src/adapters/browser.js"
import { runHttpCheck } from "../src/adapters/http.js"
import type { AdapterContext } from "../src/adapters/types.js"

const server = createServer((request, response) => {
  if (request.url === "/unavailable") {
    response.writeHead(503, { "content-type": "text/plain" })
    response.end("service unavailable")
    return
  }

  response.writeHead(200, { "content-type": "text/html" })
  response.end(
    '<main><h1>ProofStack</h1><button aria-label="Run proof">Verify</button><p hidden>Hidden evidence</p></main>',
  )
})

let serverUrl = ""
const BROWSER_TEST_TIMEOUT_MS = 20_000

beforeAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolve)
  })
  const address = server.address()
  if (address === null || typeof address === "string") throw new TypeError("Expected a TCP address")
  serverUrl = `http://127.0.0.1:${address.port}`
})

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error === undefined ? resolve() : reject(error)))
  })
})

async function createContext(): Promise<AdapterContext> {
  const assetsDir = await mkdtemp(join(tmpdir(), "proofstack-assets-"))
  onTestFinished(() => rm(assetsDir, { force: true, recursive: true }))
  return { root: process.cwd(), allowedCommands: [], home: tmpdir(), assetsDir }
}

function httpCheck(input: unknown): Extract<Check, { type: "http" }> {
  const parsed = CheckSchema.parse(input)
  if (parsed.type !== "http") throw new TypeError("Expected an HTTP check fixture")
  return parsed
}

function browserCheck(input: unknown): Extract<Check, { type: "browser" }> {
  const parsed = CheckSchema.parse(input)
  if (parsed.type !== "browser") throw new TypeError("Expected a browser check fixture")
  return parsed
}

describe("runtime adapters", () => {
  it("collects passing HTTP status and body evidence", async () => {
    const givenCheck = httpCheck({
      id: "health",
      type: "http",
      url: serverUrl,
      status: 200,
      contains: "ProofStack",
    })

    const whenRun = await runHttpCheck(givenCheck, await createContext())

    expect(whenRun.verdict).toBe("pass")
    expect(whenRun.checkId).toBe("health")
    expect(whenRun.detail).toContain("ProofStack")
  })

  it("fails an unexpected HTTP status", async () => {
    const givenCheck = httpCheck({
      id: "status",
      type: "http",
      url: `${serverUrl}/unavailable`,
      status: 200,
    })

    const whenRun = await runHttpCheck(givenCheck, await createContext())

    expect(whenRun.verdict).toBe("fail")
    expect(whenRun.summary).toContain("503")
  })

  it("returns unknown for unsupported URL protocols", async () => {
    const givenCheck = httpCheck({ id: "protocol", type: "http", url: "ftp://example.com" })

    const whenRun = await runHttpCheck(givenCheck, await createContext())

    expect(whenRun.verdict).toBe("unknown")
    expect(whenRun.summary).toMatch(/protocol/i)
  })

  it(
    "fails missing browser-visible text and writes a screenshot",
    async () => {
      const givenContext = await createContext()
      const givenCheck = browserCheck({
        id: "copy",
        type: "browser",
        url: serverUrl,
        text: "Evidence verified",
        screenshot: "copy.png",
      })

      const whenRun = await runBrowserCheck(givenCheck, givenContext)

      expect(whenRun.verdict).toBe("fail")
      expect(whenRun.asset).toBe("copy.png")
      const whenScreenshot = await stat(join(givenContext.assetsDir, "copy.png"))
      expect(whenScreenshot.size).toBeGreaterThan(0)
      expect(whenScreenshot.mode & 0o777).toBe(0o600)
    },
    BROWSER_TEST_TIMEOUT_MS,
  )

  it(
    "passes a visible accessible role and name",
    async () => {
      const givenCheck = browserCheck({
        id: "button",
        type: "browser",
        url: serverUrl,
        role: "button",
        name: "Run proof",
      })

      const whenRun = await runBrowserCheck(givenCheck, await createContext())

      expect(whenRun.verdict).toBe("pass")
    },
    BROWSER_TEST_TIMEOUT_MS,
  )

  it("refuses screenshot paths that escape the assets directory", async () => {
    const givenCheck = browserCheck({
      id: "asset-escape",
      type: "browser",
      url: serverUrl,
      screenshot: "../outside.png",
    })

    const whenRun = await runBrowserCheck(givenCheck, await createContext())

    expect(whenRun.verdict).toBe("unknown")
    expect(whenRun.summary).toMatch(/screenshot path/i)
  })
})
