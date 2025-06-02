import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import RuntimeComparisonApp from "./runtime-comparison-app"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RuntimeComparisonApp />
  </StrictMode>,
)
