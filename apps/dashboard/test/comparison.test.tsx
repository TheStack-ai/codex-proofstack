import { ClaimIdSchema } from "@proofstack/core"
import { fireEvent, render, screen } from "@testing-library/react"
import { expect, it, vi } from "vitest"
import { RepairPacket } from "../src/components/RepairPacket.js"
import { RunComparison } from "../src/components/RunComparison.js"

it("labels a failed-to-passing claim as improved", () => {
  render(
    <RunComparison
      afterScore={100}
      beforeScore={38}
      changes={[
        {
          id: ClaimIdSchema.parse("visible-status"),
          before: "fail",
          after: "pass",
          change: "improved",
        },
      ]}
      onBaselineFile={vi.fn()}
    />,
  )

  expect(screen.getByText("improved")).toBeVisible()
  expect(screen.getByText("38 → 100")).toBeVisible()
})

it("copies the exact repair packet", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  })
  render(<RepairPacket failedCount={1} value="repair exactly this" />)

  fireEvent.click(screen.getByRole("button", { name: /copy for codex/i }))

  expect(writeText).toHaveBeenCalledWith("repair exactly this")
})
