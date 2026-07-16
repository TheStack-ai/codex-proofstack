import { readFile } from "node:fs/promises"
import { createServer } from "node:http"
import { join } from "node:path"

const states = new Set(["broken", "repaired"])
const state = process.env.PROOFSTACK_DEMO_STATE ?? "broken"
const port = Number(process.env.PROOFSTACK_DEMO_PORT ?? 4173)

if (!states.has(state)) throw new TypeError("PROOFSTACK_DEMO_STATE must be broken or repaired")
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new RangeError("PROOFSTACK_DEMO_PORT must be a valid TCP port")
}

const html = await readFile(join(import.meta.dirname, state, "index.html"), "utf8")
const styles = await readFile(join(import.meta.dirname, "styles.css"), "utf8")

const server = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
    })
    response.end(JSON.stringify({ status: "ok", state }))
    return
  }

  if (request.url === "/styles.css") {
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": "text/css; charset=utf-8",
    })
    response.end(styles)
    return
  }

  if (request.url === "/" || request.url === "/index.html") {
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-security-policy": "default-src 'self'; style-src 'self'; img-src 'self' data:",
      "content-type": "text/html; charset=utf-8",
      "x-content-type-options": "nosniff",
    })
    response.end(html)
    return
  }

  response.writeHead(404, { "content-type": "text/plain; charset=utf-8" })
  response.end("Not found")
})

server.listen(port, "127.0.0.1", () => {
  console.log(`proofstack-demo:${state}:${port}`)
})

process.once("SIGTERM", () => server.close())
process.once("SIGINT", () => server.close())
