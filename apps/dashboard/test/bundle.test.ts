import { expect, it } from "vitest"
import { parseBundle } from "../src/lib/bundle.js"

it("rejects arbitrary JSON that is not a proof bundle", () => {
  expect(() => parseBundle({ score: 100 })).toThrow(/schemaVersion/)
})
