import { Database, Zap, Eye, Hash, AlertCircle, Code } from "lucide-react"

export function getKindIcon(kind: string) {
  switch (kind) {
    case "const":
      return <Hash className="w-4 h-4" />
    case "stg":
      return <Database className="w-4 h-4" />
    case "call":
      return <Zap className="w-4 h-4" />
    case "event":
      return <Eye className="w-4 h-4" />
    case "error":
      return <AlertCircle className="w-4 h-4" />
    case "view":
      return <Eye className="w-4 h-4" />
    case "api":
      return <Code className="w-4 h-4" />
    default:
      return <Hash className="w-4 h-4" />
  }
}

export function getCompatibilityLabel(level: number) {
  switch (level) {
    case 0:
      return "Incompatible"
    case 1:
      return "Partial"
    case 2:
      return "Backwards Compatible"
    case 3:
      return "Identical"
    default:
      return "Unknown"
  }
}

export function getCompatibilityColor(level: number) {
  switch (level) {
    case 0:
      return "destructive" // Red - stays the same
    case 1:
      return "orange" // Orange for partial compatibility
    case 2:
      return "teal" // Teal for backwards compatible
    case 3:
      return "green" // Green for identical
    default:
      return "outline"
  }
}

export function getKindDisplayLabel(kind: string) {
  switch (kind) {
    case "const":
      return "constant"
    case "stg":
      return "storage"
    case "call":
      return "transaction"
    case "event":
      return "event"
    case "error":
      return "error"
    case "view":
      return "view"
    case "api":
      return "runtime API"
    default:
      return kind
  }
}
