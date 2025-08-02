// extract tokens from PoolConfig.json
import fs from "fs"
import path from "path"

type TokenEntry = {
	symbol: string
	intOracleAddress: string
	extOracleAddress: string
	pythTicker: string
	pythPriceId: string
	decimals: number
}

export default function extractTokens(): TokenEntry[] {
	const configPath = path.resolve(__dirname, "../../data/PoolConfig.json")
	const raw = fs.readFileSync(configPath, "utf-8")
	const poolConfig = JSON.parse(raw)

	const mainnetPools = poolConfig.pools.filter((p: any) => p.cluster === "mainnet-beta")

	const tokens = mainnetPools.flatMap((pool: any) =>
		pool.custodies.map((custody: any) => ({
			symbol: custody.symbol,
			intOracleAddress: custody.intOracleAddress,
			pythPriceId: custody.pythPriceId,
			decimals: custody.decimals,
			extOracleAddress: custody.extOracleAddress,
			pythTicker: custody.pythTicker,
		}))
	)

	const uniqueBySymbol = Array.from(
		new Map(tokens.map((t: TokenEntry) => [t.symbol, t])).values()
	) as TokenEntry[]

	return uniqueBySymbol
}

const tokenData = extractTokens()

const outputPath = path.resolve(__dirname, "../../data/configTokens.json")
fs.writeFileSync(outputPath, JSON.stringify(tokenData, null, 2), "utf-8")
