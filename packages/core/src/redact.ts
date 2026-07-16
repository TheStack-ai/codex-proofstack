const DEFAULT_MAX_LENGTH = 4_000
const TRUNCATION_MARKER = "[TRUNCATED]"

export type RedactionOptions = {
  readonly home?: string
  readonly projectRoot?: string
  readonly maxLength?: number
}

export function redactText(input: string, options: RedactionOptions = {}): string {
  const requestedMaxLength = options.maxLength ?? DEFAULT_MAX_LENGTH
  const maxLength = Number.isFinite(requestedMaxLength)
    ? Math.max(0, Math.floor(requestedMaxLength))
    : DEFAULT_MAX_LENGTH

  const credentialSafeText = input
    .replace(/(Authorization:\s*Bearer\s+)[^\s"']+/gi, "$1[REDACTED]")
    .replace(
      /(["'][A-Z0-9_]*(?:API[_-]?KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)[A-Z0-9_]*["']\s*:\s*)["'][^"'\r\n]*["']/gi,
      '$1"[REDACTED]"',
    )
    .replace(
      /([A-Z0-9_]*(?:API[_-]?KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)[A-Z0-9_]*\s*[=:]\s*)[^\s"']+/gi,
      "$1[REDACTED]",
    )
    .replace(/\bsk-[A-Za-z0-9_-]+\b/g, "[REDACTED]")
    .replace(/\b(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_-]+)\b/g, "[REDACTED]")

  const projectSafeText =
    options.projectRoot !== undefined && options.projectRoot.length > 0
      ? credentialSafeText.split(options.projectRoot).join("$PROJECT_ROOT")
      : credentialSafeText

  const pathSafeText =
    options.home !== undefined && options.home.length > 0
      ? projectSafeText.split(options.home).join("~")
      : projectSafeText

  return pathSafeText.length > maxLength
    ? `${pathSafeText.slice(0, maxLength)}\n${TRUNCATION_MARKER}`
    : pathSafeText
}
