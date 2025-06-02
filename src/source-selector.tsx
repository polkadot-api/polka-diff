import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Upload,
  Wifi,
  FileText,
  Code,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Hash,
  RefreshCw,
  XCircle,
} from "lucide-react"
import type { RuntimeSource, SelectedSources } from "./runtime-comparison-app"
import { getRuntimeFromWs } from "./lib/runtime-from-ws"
import { getMetadataFromRuntime } from "./lib/get-metadata-from-runtime"
import { fromHex } from "@polkadot-api/utils"

interface SourceSelectorProps {
  onSourcesSelected: (sources: SelectedSources) => void
  selectedSources: SelectedSources
}

type WebSocketBlockType = "current" | "height" | "hash"

type SourceState = "idle" | "loading" | "success" | "error"

type SourceStatus = {
  state: SourceState
  errorMessage?: string
}

export default function SourceSelector({
  onSourcesSelected,
  selectedSources,
}: SourceSelectorProps) {
  const [sources, setSources] = useState<SelectedSources>(selectedSources)
  const [sourceStatus, setSourceStatus] = useState<{
    previous: SourceStatus
    next: SourceStatus
  }>({
    previous: { state: selectedSources.previous ? "success" : "idle" },
    next: { state: selectedSources.next ? "success" : "idle" },
  })

  const [websocketInputs, setWebsocketInputs] = useState({
    previous: {
      uri: "",
      blockType: "current" as WebSocketBlockType,
      blockValue: "",
    },
    next: {
      uri: "",
      blockType: "current" as WebSocketBlockType,
      blockValue: "",
    },
  })

  const [metadataInputs, setMetadataInputs] = useState({
    previous: { hexString: "" },
    next: { hexString: "" },
  })

  // Initialize form inputs based on existing sources
  useEffect(() => {
    setSources(selectedSources)

    // Initialize websocket inputs if sources exist
    Object.entries(selectedSources).forEach(([key, source]) => {
      if (source?.type === "websocket") {
        const sourceType = key as "previous" | "next"
        setWebsocketInputs((prev) => ({
          ...prev,
          [sourceType]: {
            uri: source.websocketUri || "",
            blockType: source.blockHash
              ? "hash"
              : source.blockHeight
                ? "height"
                : "current",
            blockValue: source.blockHash || source.blockHeight || "",
          },
        }))
      }

      if (source?.type === "metadata" && source.hexString) {
        const sourceType = key as "previous" | "next"
        setMetadataInputs((prev) => ({
          ...prev,
          [sourceType]: {
            hexString: source.hexString || "",
          },
        }))
      }
    })
  }, [selectedSources])

  const handleWebsocketChange = (
    sourceType: "previous" | "next",
    field: "uri" | "blockType" | "blockValue",
    value: string,
  ) => {
    setWebsocketInputs((prev) => ({
      ...prev,
      [sourceType]: {
        ...prev[sourceType],
        [field]: value,
      },
    }))
  }

  const handleMetadataHexChange = (
    sourceType: "previous" | "next",
    value: string,
  ) => {
    setMetadataInputs((prev) => ({
      ...prev,
      [sourceType]: {
        ...prev[sourceType],
        hexString: value,
      },
    }))
  }

  const handleWebsocketSubmit = async (sourceType: "previous" | "next") => {
    const input = websocketInputs[sourceType]
    if (!input.uri.trim()) return

    setSourceStatus((prev) => ({
      ...prev,
      [sourceType]: { state: "loading" },
    }))

    const block =
      input.blockType === "current"
        ? undefined
        : input.blockType === "hash"
          ? input.blockValue
          : Number(input.blockValue)
    try {
      const source: RuntimeSource = {
        type: "websocket",
        websocketUri: input.uri.trim(),
        metadata: await getRuntimeFromWs(input.uri, block),
      }

      if (input.blockType === "hash" && input.blockValue.trim()) {
        source.blockHash = input.blockValue.trim()
      } else if (input.blockType === "height" && input.blockValue.trim()) {
        source.blockHeight = input.blockValue.trim()
      }

      setSources((prev) => ({
        ...prev,
        [sourceType]: source,
      }))

      setSourceStatus((prev) => ({
        ...prev,
        [sourceType]: { state: "success" },
      }))
    } catch {
      setSourceStatus((prev) => ({
        ...prev,
        [sourceType]: { state: "error", errorMessage: "Error loading runtime" },
      }))
    }
  }

  const handleFileUpload = async (
    sourceType: "previous" | "next",
    fileType: "metadata" | "wasm",
    file: File,
  ) => {
    setSourceStatus((prev) => ({
      ...prev,
      [sourceType]: { state: "loading" },
    }))

    try {
      const fileBytes = new Uint8Array(await file.arrayBuffer())

      const source: RuntimeSource = {
        type: fileType,
        file,
        metadata:
          fileType === "metadata"
            ? fileBytes
            : await getMetadataFromRuntime(fileBytes),
      }

      setSources((prev) => ({
        ...prev,
        [sourceType]: source,
      }))

      setSourceStatus((prev) => ({
        ...prev,
        [sourceType]: { state: "success" },
      }))
    } catch (e) {
      console.error(e)
      setSourceStatus((prev) => ({
        ...prev,
        [sourceType]: {
          state: "error",
          errorMessage: "Error loading runtime from file.",
        },
      }))
    }
  }

  const handleMetadataHexSubmit = async (sourceType: "previous" | "next") => {
    const hexString = metadataInputs[sourceType].hexString.trim()
    if (!hexString) return

    setSourceStatus((prev) => ({
      ...prev,
      [sourceType]: { state: "loading" },
    }))

    try {
      const source: RuntimeSource = {
        type: "metadata",
        hexString,
        metadata: fromHex(hexString),
      }

      setSources((prev) => ({
        ...prev,
        [sourceType]: source,
      }))

      setSourceStatus((prev) => ({
        ...prev,
        [sourceType]: { state: "success" },
      }))
    } catch {
      setSourceStatus((prev) => ({
        ...prev,
        [sourceType]: {
          state: "error",
          errorMessage: "Error loading runtime from hexadecimal input.",
        },
      }))
    }
  }

  const clearSource = (sourceType: "previous" | "next") => {
    setSources((prev) => ({
      ...prev,
      [sourceType]: null,
    }))

    setSourceStatus((prev) => ({
      ...prev,
      [sourceType]: { state: "idle" },
    }))

    // Clear form inputs
    setWebsocketInputs((prev) => ({
      ...prev,
      [sourceType]: {
        uri: "",
        blockType: "current",
        blockValue: "",
      },
    }))

    setMetadataInputs((prev) => ({
      ...prev,
      [sourceType]: {
        hexString: "",
      },
    }))
  }

  const retrySource = (sourceType: "previous" | "next") => {
    const source = sources[sourceType]
    if (!source) return

    if (source.type === "websocket") {
      handleWebsocketSubmit(sourceType)
    } else if (source.type === "metadata") {
      if (source.file) {
        handleFileUpload(sourceType, "metadata", source.file)
      } else {
        handleMetadataHexSubmit(sourceType)
      }
    } else if (source.type === "wasm" && source.file) {
      handleFileUpload(sourceType, "wasm", source.file)
    }
  }

  const canCompare =
    sources.previous &&
    sources.next &&
    sourceStatus.previous.state === "success" &&
    sourceStatus.next.state === "success"

  const renderSourceCard = (
    sourceType: "previous" | "next",
    title: string,
    description: string,
  ) => {
    const source = sources[sourceType]
    const status = sourceStatus[sourceType]
    const websocketInput = websocketInputs[sourceType]
    const metadataInput = metadataInputs[sourceType]

    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {title}
                {status.state === "success" && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {status.state === "loading" && (
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                )}
                {status.state === "error" && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {source && status.state === "success" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearSource(sourceType)}
              >
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {status.state === "loading" ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm text-muted-foreground">
                Processing runtime source...
              </p>
            </div>
          ) : status.state === "error" ? (
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Processing Failed
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      {status.errorMessage}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => retrySource(sourceType)}
                  size="sm"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
                <Button
                  variant="outline"
                  onClick={() => clearSource(sourceType)}
                  size="sm"
                  className="flex-1"
                >
                  Clear
                </Button>
              </div>
            </div>
          ) : source && status.state === "success" ? (
            <div className="space-y-2">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {source.type === "websocket" && <Wifi className="w-4 h-4" />}
                  {source.type === "metadata" && (
                    <FileText className="w-4 h-4" />
                  )}
                  {source.type === "wasm" && <Code className="w-4 h-4" />}
                  <Badge variant="outline" className="text-xs">
                    {source.type === "websocket"
                      ? "WebSocket"
                      : source.type === "metadata"
                        ? source.file
                          ? "Metadata File"
                          : "Metadata Hex"
                        : "WASM File"}
                  </Badge>
                </div>
                {source.type === "websocket" ? (
                  <div className="space-y-1 text-sm">
                    <div>
                      <strong>URI:</strong> {source.websocketUri}
                    </div>
                    {source.blockHash && (
                      <div>
                        <strong>Block Hash:</strong> {source.blockHash}
                      </div>
                    )}
                    {source.blockHeight && (
                      <div>
                        <strong>Block Height:</strong> {source.blockHeight}
                      </div>
                    )}
                    {!source.blockHash && !source.blockHeight && (
                      <div className="text-muted-foreground">
                        Using current runtime
                      </div>
                    )}
                  </div>
                ) : source.type === "metadata" ? (
                  <div className="text-sm">
                    {source.file ? (
                      <div>
                        <strong>File:</strong> {source.file.name}
                      </div>
                    ) : (
                      <div>
                        <strong>Hex String:</strong>{" "}
                        {source.hexString?.substring(0, 50)}...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm">
                    <strong>File:</strong> {source.file?.name}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Tabs defaultValue="websocket" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="websocket" className="text-xs">
                  WebSocket
                </TabsTrigger>
                <TabsTrigger value="metadata" className="text-xs">
                  Metadata
                </TabsTrigger>
                <TabsTrigger value="wasm" className="text-xs">
                  WASM
                </TabsTrigger>
              </TabsList>

              <TabsContent value="websocket" className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor={`${sourceType}-uri`}>WebSocket URI *</Label>
                    <Input
                      id={`${sourceType}-uri`}
                      placeholder="wss://rpc.polkadot.io"
                      value={websocketInput.uri}
                      onChange={(e) =>
                        handleWebsocketChange(sourceType, "uri", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${sourceType}-block-type`}>
                      Runtime Selection
                    </Label>
                    <Select
                      value={websocketInput.blockType}
                      onValueChange={(value: WebSocketBlockType) => {
                        handleWebsocketChange(sourceType, "blockType", value)
                        handleWebsocketChange(sourceType, "blockValue", "")
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current runtime</SelectItem>
                        <SelectItem value="height">
                          Runtime at block height
                        </SelectItem>
                        <SelectItem value="hash">
                          Runtime at block hash
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {websocketInput.blockType !== "current" && (
                    <div className="space-y-2">
                      <Label htmlFor={`${sourceType}-block-value`}>
                        {websocketInput.blockType === "height"
                          ? "Block Height"
                          : "Block Hash"}
                      </Label>
                      <Input
                        id={`${sourceType}-block-value`}
                        placeholder={
                          websocketInput.blockType === "height"
                            ? "12345"
                            : "0x..."
                        }
                        value={websocketInput.blockValue}
                        onChange={(e) =>
                          handleWebsocketChange(
                            sourceType,
                            "blockValue",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  )}

                  <Button
                    onClick={() => handleWebsocketSubmit(sourceType)}
                    disabled={
                      !websocketInput.uri.trim() ||
                      (websocketInput.blockType !== "current" &&
                        !websocketInput.blockValue.trim())
                    }
                    className="w-full"
                  >
                    <Wifi className="w-4 h-4 mr-2" />
                    Connect to WebSocket
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4">
                <Tabs defaultValue="file" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="file" className="text-xs">
                      Upload File
                    </TabsTrigger>
                    <TabsTrigger value="hex" className="text-xs">
                      Hex String
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="file" className="space-y-3">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload SCALE-encoded metadata
                      </p>
                      <Input
                        type="file"
                        accept=".scale,.bin,.wasm"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(sourceType, "metadata", file)
                          }
                        }}
                        className="max-w-xs mx-auto"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Binary file containing SCALE-encoded metadata
                    </p>
                  </TabsContent>

                  <TabsContent value="hex" className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor={`${sourceType}-metadata-hex`}>
                        Metadata Hex String
                      </Label>
                      <Textarea
                        id={`${sourceType}-metadata-hex`}
                        placeholder="0x4d6574610d..."
                        value={metadataInput.hexString}
                        onChange={(e) =>
                          handleMetadataHexChange(sourceType, e.target.value)
                        }
                        className="min-h-[120px] font-mono text-xs"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Hexadecimal string of SCALE-encoded metadata
                    </p>
                    <Button
                      onClick={() => handleMetadataHexSubmit(sourceType)}
                      disabled={!metadataInput.hexString.trim()}
                      className="w-full"
                    >
                      <Hash className="w-4 h-4 mr-2" />
                      Use Hex Metadata
                    </Button>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="wasm" className="space-y-4">
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">
                      Upload WASM runtime
                    </p>
                    <Input
                      type="file"
                      accept=".wasm"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleFileUpload(sourceType, "wasm", file)
                        }
                      }}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload the compiled WASM runtime file
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Polkadot Runtime Diff</h1>
        <p className="text-muted-foreground">
          Compare changes between runtime versions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderSourceCard(
          "previous",
          "Previous Runtime",
          "Select the older runtime version to compare from",
        )}

        <div className="flex items-center justify-center lg:hidden">
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
        </div>

        {renderSourceCard(
          "next",
          "Next Runtime",
          "Select the newer runtime version to compare to",
        )}
      </div>

      <div className="flex items-center justify-center">
        <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>

      <Separator />

      <div className="text-center space-y-4">
        {!canCompare ? (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <AlertCircle className="w-5 h-5" />
            <span>
              Please successfully load both runtime sources to continue
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span>Both runtime sources loaded successfully</span>
            </div>
            <Button
              size="lg"
              onClick={() => onSourcesSelected(sources)}
              className="px-8"
            >
              Compare Runtimes
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
