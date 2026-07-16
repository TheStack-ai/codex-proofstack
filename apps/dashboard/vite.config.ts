import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const { GITHUB_PAGES: githubPages } = process.env

export default defineConfig({
  base: githubPages === "true" ? "/codex-proofstack/" : "/",
  plugins: [react()],
})
