import { getWsProvider } from "@polkadot-api/ws-provider/web"
import { createClient } from "@polkadot-api/substrate-client"
import { Bytes, Option, u32, Vector } from "@polkadot-api/substrate-bindings"
import { toHex } from "@polkadot-api/utils"

const u32ListDecoder = Vector(u32).dec
const versionedArgs = (v: number) => toHex(u32.enc(v))
const opaqueBytes = Bytes()
const optionalOpaqueBytes = Option(opaqueBytes)

export const getRuntimeFromWs = async (
  uri: string,
  block?: number | string,
): Promise<Uint8Array> => {
  const client = createClient(getWsProvider(uri))
  let blockHash: string
  if (typeof block === "string") {
    blockHash = block
  } else {
    const blockHeight: number =
      typeof block === "number" ? block : await client.archive.finalizedHeight()
    blockHash = (await client.archive.hashByHeight(blockHeight))[0]
  }

  const { call } = client.archive
  let availableVersions: number[] = [14]
  try {
    availableVersions = u32ListDecoder(
      await call(blockHash, "Metadata_metadata_versions", ""),
    )
  } catch {}

  const [v] = availableVersions
    .filter((x) => x > 13 && x < 17)
    .sort((a, b) => b - a)

  const rawMetadata =
    v === 14
      ? opaqueBytes.dec(await call(blockHash, "Metadata_metadata", ""))
      : optionalOpaqueBytes.dec(
          await call(
            blockHash,
            "Metadata_metadata_at_version",
            versionedArgs(v),
          ),
        )!

  client.destroy()
  return rawMetadata
}
