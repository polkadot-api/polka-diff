import {
  type Change,
  type ComparedChange,
} from "@polkadot-api/compare-runtimes"

export type Output = {
  added: Array<Change>
  removed: Array<Change>
  modified: Array<ComparedChange>
  unchanged: Array<ComparedChange>
}
