import { ClaimIdSchema, EvidenceIdSchema } from "@proofstack/core"
import { fireEvent, render, screen } from "@testing-library/react"
import { expect, it, vi } from "vitest"
import { ClaimMatrix } from "../src/components/ClaimMatrix.js"
import { VerdictHero } from "../src/components/VerdictHero.js"

it("shows the verification score and incomplete state", () => {
  render(<VerdictHero score={43} complete={false} project="release-console" runId="run-43" />)

  expect(screen.getByText("43% verified")).toBeVisible()
  expect(screen.getByText(/incomplete evidence/i)).toBeVisible()
})

it("selects a claim without relying on color", () => {
  const onSelect = vi.fn()
  render(
    <ClaimMatrix
      claims={[
        {
          id: ClaimIdSchema.parse("visible-status"),
          title: "The rendered product exposes a verified state",
          required: true,
          weight: 3,
          verdict: "fail",
          evidenceIds: [EvidenceIdSchema.parse("browser-status")],
        },
      ]}
      onSelect={onSelect}
    />,
  )

  const claim = screen.getByRole("button", {
    name: /the rendered product exposes a verified state/i,
  })
  expect(claim).toHaveTextContent(/fail/i)
  fireEvent.click(claim)
  expect(onSelect).toHaveBeenCalledWith("visible-status")
})
