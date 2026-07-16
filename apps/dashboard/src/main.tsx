import "@fontsource-variable/geist"
import "@fontsource-variable/geist-mono"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App.js"
import "./styles.css"

const { DEV: isDevelopment, VITE_DISABLE_REACT_DEVTOOLS: disableReactDevTools } = import.meta.env

if (isDevelopment && disableReactDevTools !== "1") {
  void import("react-grab")
  void import("react-scan")
}

const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("ProofStack root element is missing")

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
