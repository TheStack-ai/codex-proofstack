import type { ButtonHTMLAttributes, ReactNode } from "react"

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: "primary" | "secondary" | "quiet"
}

export function ActionButton({
  children,
  className = "",
  type = "button",
  variant = "secondary",
  ...props
}: ActionButtonProps) {
  return (
    <button
      className={`action-button action-button--${variant} ${className}`.trim()}
      type={type}
      {...props}
    >
      <span>{children}</span>
      <span className="action-button__island" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="14" height="14">
          <title>Continue</title>
          <path d="M3 8h9m-3.5-3.5L12 8l-3.5 3.5" />
        </svg>
      </span>
    </button>
  )
}
