import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"

const broken = JSON.parse(await readFile("apps/dashboard/public/demo/broken.json", "utf8"))
const repaired = JSON.parse(await readFile("apps/dashboard/public/demo/repaired.json", "utf8"))

const claim = (bundle, id) => bundle.claims.find((item) => item.id === id)

assert.ok(broken.score < 100, "the broken product must not receive a perfect score")
assert.equal(repaired.score, 100, "the repaired product must be fully verified")
assert.equal(claim(broken, "tests")?.verdict, "pass")
assert.equal(claim(broken, "visible-status")?.verdict, "fail")
assert.equal(claim(repaired, "visible-status")?.verdict, "pass")
assert.ok(
  repaired.claims.filter((item) => item.required).every((item) => item.verdict === "pass"),
  "every required repaired claim must pass",
)
assert.match(broken.repairPacket.prompt, /visible-status/)

for (const bundle of [broken, repaired]) {
  const screenshot = bundle.evidence.find((item) => item.type === "browser")?.asset
  assert.ok(screenshot, `${bundle.runId} must include browser screenshot evidence`)
  await access(
    `apps/dashboard/public/demo/assets/${bundle.runId.replace("demo-", "")}/${screenshot}`,
  )
}

console.log(
  `demo integration passed: ${broken.score} broken → ${repaired.score} repaired; green tests did not hide the browser failure`,
)
