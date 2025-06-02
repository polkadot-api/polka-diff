import { useState } from "react"
import RuntimeDiffViewer from "./runtime-diff-viewer"
import SourceSelector from "./source-selector"
import { processData } from "./data-processing"
import { compareRuntimes } from "@polkadot-api/compare-runtimes"
import { type Output } from "./types"

export type RuntimeSource = {
  type: "websocket" | "metadata" | "wasm"
  metadata: Uint8Array
  websocketUri?: string
  blockHash?: string
  blockHeight?: string
  file?: File
  hexString?: string
}

export type SelectedSources = {
  previous: RuntimeSource | null
  next: RuntimeSource | null
}

type AppState = "selection" | "comparing"

export default function RuntimeComparisonApp() {
  const [sources, setSources] = useState<SelectedSources>({
    previous: null,
    next: null,
  })
  const [appState, setAppState] = useState<AppState>("selection")
  const [data, setData] = useState<Output | null>(null)

  const handleSourcesSelected = (selectedSources: SelectedSources) => {
    setData(
      processData(
        compareRuntimes(
          selectedSources.previous!.metadata,
          selectedSources.next!.metadata,
        ),
      ),
    )
    setSources(selectedSources)
    setAppState("comparing")
  }

  const handleBackToSelection = () => {
    setAppState("selection")
  }

  if (appState === "comparing" && !!data) {
    return <RuntimeDiffViewer data={data} onBack={handleBackToSelection} />
  }

  return (
    <SourceSelector
      onSourcesSelected={handleSourcesSelected}
      selectedSources={sources}
    />
  )
}
