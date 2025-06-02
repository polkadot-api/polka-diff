import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Check,
  Filter,
  ArrowLeft,
} from "lucide-react"
import {
  getKindIcon,
  getCompatibilityLabel,
  getCompatibilityColor,
  getKindDisplayLabel,
} from "./get-kind-icon"
import { useState } from "react"
import {
  CompatibilityLevel,
  type Change,
  type ComparedChange,
} from "@polkadot-api/compare-runtimes"
import type { Output } from "./types"

const getCompatibilityIcon = (level: CompatibilityLevel) => {
  switch (level) {
    case CompatibilityLevel.Incompatible:
      return <XCircle className="w-3 h-3" />
    case CompatibilityLevel.Partial:
      return <AlertTriangle className="w-3 h-3" />
    case CompatibilityLevel.BackwardsCompatible:
      return <CheckCircle className="w-3 h-3" />
    case CompatibilityLevel.Identical:
      return <CheckCircle className="w-3 h-3" />
    default:
      return <AlertTriangle className="w-3 h-3" />
  }
}

const groupChangesByPallet = (changes: Change[]) => {
  return changes.reduce(
    (acc, change) => {
      const key = "pallet" in change ? change.pallet : change.group
      if (!acc[key]) acc[key] = []
      acc[key].push(change)
      return acc
    },
    {} as Record<string, Change[]>,
  )
}

const groupComparedChangesByPallet = (changes: ComparedChange[]) => {
  return changes.reduce(
    (acc, change) => {
      const key = "pallet" in change ? change.pallet : change.group
      if (!acc[key]) acc[key] = []
      acc[key].push(change)
      return acc
    },
    {} as Record<string, ComparedChange[]>,
  )
}

const getWorstCompatibilityLevel = (
  change: ComparedChange,
): CompatibilityLevel => {
  if (typeof change.compat === "number") {
    return change.compat
  }
  // Return the worst (lowest) compatibility level between args and values
  return Math.min(change.compat.args, change.compat.values)
}

const filterModifiedByCompatibility = (
  changes: ComparedChange[],
  filter: string,
): ComparedChange[] => {
  if (filter === "all") return changes

  const targetLevel = Number.parseInt(filter) as CompatibilityLevel
  return changes.filter(
    (change) => getWorstCompatibilityLevel(change) === targetLevel,
  )
}

interface RuntimeDiffViewerProps {
  data: Output
  onBack?: () => void
}

export default function RuntimeDiffViewer({
  data,
  onBack,
}: RuntimeDiffViewerProps) {
  const [activeSection, setActiveSection] = useState<
    "added" | "removed" | "modified" | "unchanged"
  >("added")
  const [modifiedFilter, setModifiedFilter] = useState<string>("all")

  const addedByPallet = groupChangesByPallet(data.added)
  const removedByPallet = groupChangesByPallet(data.removed)
  const filteredModified = filterModifiedByCompatibility(
    data.modified,
    modifiedFilter,
  )
  const modifiedByPallet = groupComparedChangesByPallet(filteredModified)
  const unchangedByPallet = groupComparedChangesByPallet(data.unchanged)

  const renderSectionContent = () => {
    switch (activeSection) {
      case "added":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Plus className="w-5 h-5" />
                Added Items
              </CardTitle>
              <CardDescription>
                New functionality added to the runtime
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(addedByPallet).map(([pallet, changes]) => (
                <div key={pallet} className="space-y-2">
                  <h3 className="font-semibold text-lg">{pallet}</h3>
                  <div className="grid gap-2">
                    {changes.map((change, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 border-green-200"
                      >
                        {getKindIcon(change.kind)}
                        <span className="font-medium">{change.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {getKindDisplayLabel(change.kind)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {Object.keys(addedByPallet).indexOf(pallet) <
                    Object.keys(addedByPallet).length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )

      case "removed":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Minus className="w-5 h-5" />
                Removed Items
              </CardTitle>
              <CardDescription>
                Functionality removed from the runtime
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(removedByPallet).map(([pallet, changes]) => (
                <div key={pallet} className="space-y-2">
                  <h3 className="font-semibold text-lg">{pallet}</h3>
                  <div className="grid gap-2">
                    {changes.map((change, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-red-50 border-red-200"
                      >
                        {getKindIcon(change.kind)}
                        <span className="font-medium">{change.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {getKindDisplayLabel(change.kind)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {Object.keys(removedByPallet).indexOf(pallet) <
                    Object.keys(removedByPallet).length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )

      case "modified":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="w-5 h-5" />
                Modified Items
              </CardTitle>
              <CardDescription>
                Existing functionality with compatibility changes
              </CardDescription>
              <div className="flex items-center gap-2 pt-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select
                  value={modifiedFilter}
                  onValueChange={setModifiedFilter}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Filter by compatibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Changes ({data.modified.length})
                    </SelectItem>
                    <SelectItem value="0">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <XCircle className="w-3 h-3 text-red-600" />
                        Incompatible (
                        {
                          data.modified.filter(
                            (c) => getWorstCompatibilityLevel(c) === 0,
                          ).length
                        }
                        )
                      </div>
                    </SelectItem>
                    <SelectItem value="1">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <AlertTriangle className="w-3 h-3 text-yellow-600" />
                        Partial (
                        {
                          data.modified.filter(
                            (c) => getWorstCompatibilityLevel(c) === 1,
                          ).length
                        }
                        )
                      </div>
                    </SelectItem>
                    <SelectItem value="2">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        Backwards Compatible (
                        {
                          data.modified.filter(
                            (c) => getWorstCompatibilityLevel(c) === 2,
                          ).length
                        }
                        )
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(modifiedByPallet).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items match the selected filter
                </div>
              ) : (
                Object.entries(modifiedByPallet).map(([pallet, changes]) => (
                  <div key={pallet} className="space-y-2">
                    <h3 className="font-semibold text-lg">{pallet}</h3>
                    <div className="grid gap-2">
                      {changes.map((change, index) => (
                        <div
                          key={index}
                          className="p-3 border rounded-lg bg-yellow-50 border-yellow-200"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            {getKindIcon(change.kind)}
                            <span className="font-medium">{change.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {getKindDisplayLabel(change.kind)}
                            </Badge>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            {typeof change.compat === "number" ? (
                              <Badge
                                variant={getCompatibilityColor(change.compat)}
                                className="flex items-center gap-1"
                              >
                                {getCompatibilityIcon(change.compat)}
                                {getCompatibilityLabel(change.compat)}
                              </Badge>
                            ) : (
                              <>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">
                                    Args:
                                  </span>
                                  <Badge
                                    variant={getCompatibilityColor(
                                      change.compat.args,
                                    )}
                                    className="flex items-center gap-1 text-xs"
                                  >
                                    {getCompatibilityIcon(change.compat.args)}
                                    {getCompatibilityLabel(change.compat.args)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">
                                    Values:
                                  </span>
                                  <Badge
                                    variant={getCompatibilityColor(
                                      change.compat.values,
                                    )}
                                    className="flex items-center gap-1 text-xs"
                                  >
                                    {getCompatibilityIcon(change.compat.values)}
                                    {getCompatibilityLabel(
                                      change.compat.values,
                                    )}
                                  </Badge>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {Object.keys(modifiedByPallet).indexOf(pallet) <
                      Object.keys(modifiedByPallet).length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )

      case "unchanged":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-5 h-5" />
                Unchanged Items
              </CardTitle>
              <CardDescription>
                Existing functionality with no compatibility changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(unchangedByPallet).map(([pallet, changes]) => (
                <div key={pallet} className="space-y-2">
                  <h3 className="font-semibold text-lg">{pallet}</h3>
                  <div className="grid gap-2">
                    {changes.map((change, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 border-gray-200"
                      >
                        {getKindIcon(change.kind)}
                        <span className="font-medium">{change.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {getKindDisplayLabel(change.kind)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {Object.keys(unchangedByPallet).indexOf(pallet) <
                    Object.keys(unchangedByPallet).length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-center space-y-2 flex-1">
          <h1 className="text-3xl font-bold">Runtime Comparison Results</h1>
          <p className="text-muted-foreground">
            Differences between the selected runtime versions
          </p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack} className="ml-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Selection
          </Button>
        )}
      </div>

      {/* Overview Cards - Now Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeSection === "added" ? "ring-2 ring-green-500 bg-green-50" : ""
          }`}
          onClick={() => setActiveSection("added")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Added</CardTitle>
            <Plus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.added.length}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeSection === "removed" ? "ring-2 ring-red-500 bg-red-50" : ""
          }`}
          onClick={() => setActiveSection("removed")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Removed</CardTitle>
            <Minus className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.removed.length}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeSection === "modified"
              ? "ring-2 ring-yellow-500 bg-yellow-50"
              : ""
          }`}
          onClick={() => setActiveSection("modified")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modified</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data.modified.length}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${
            activeSection === "unchanged"
              ? "ring-2 ring-gray-500 bg-gray-50"
              : ""
          }`}
          onClick={() => setActiveSection("unchanged")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unchanged</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {data.unchanged.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Section */}
      <div className="space-y-4">{renderSectionContent()}</div>
    </div>
  )
}
