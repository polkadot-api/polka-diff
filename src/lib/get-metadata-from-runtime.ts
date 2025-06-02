import { fromHex, toHex } from "@polkadot-api/utils"

let innerGetIt: null | ((code: Uint8Array) => Uint8Array) = null

export const getMetadataFromRuntime = async (
  code: Uint8Array,
): Promise<Uint8Array> => {
  if (!innerGetIt) {
    const [init, _getMetadataFromRuntime] = await import(
      "@polkadot-api/wasm-executor/web"
    ).then(
      ({ default: init, getMetadataFromRuntime: _getMetadataFromRuntime }) =>
        [init, _getMetadataFromRuntime] as const,
    )
    await init()
    innerGetIt = (innerCode) =>
      fromHex(_getMetadataFromRuntime(toHex(innerCode) as "0x"))
  }

  return innerGetIt(code)
}
