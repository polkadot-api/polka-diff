import {
  CompatibilityLevel,
  type ComparedChange,
  type Output,
} from "@polkadot-api/compare-runtimes"

export const processData = (data: Output) => {
  const modified: ComparedChange[] = []
  const unchanged: ComparedChange[] = []

  data.kept.forEach((item: ComparedChange) => {
    let isModified = false

    if (typeof item.compat === "number") {
      isModified = item.compat !== CompatibilityLevel.Identical
    } else if (item.compat) {
      isModified =
        item.compat.args !== CompatibilityLevel.Identical ||
        item.compat.values !== CompatibilityLevel.Identical
    }

    if (isModified) modified.push(item)
    else unchanged.push(item)
  })

  return {
    added: data.added,
    removed: data.removed,
    modified: modified,
    unchanged: unchanged,
  }
}
