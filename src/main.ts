import fetchInternalPrices from "./fetchInternalPrices"
import { fetchLatestPythPrices } from "./fetchPythPrices"
import extractTokens from "./utils/extractTokens"

async function main() {
	const internalPrices = await fetchInternalPrices()
	const tokenMetadata = await extractTokens()

	const pythPriceIdMap = tokenMetadata.reduce((acc, token) => {
		if (token.pythPriceId) {
			acc[token.symbol.toUpperCase()] = token.pythPriceId.toLowerCase()
		}
		return acc
	}, {} as Record<string, string>)

	// console.log("Pyth ID Map:", pythPriceIdMap)

	const pythPriceIds = Object.values(pythPriceIdMap)
	const pythPrices = await fetchLatestPythPrices(pythPriceIds)

	const result: Record<string, any> = {}

	for (const symbol of Object.keys(internalPrices)) {
		const internal = internalPrices[symbol]
		const priceId = pythPriceIdMap[symbol.toUpperCase()]?.toLowerCase().replace(/^0x/, "")
		const pyth = pythPrices[priceId]

		const diff = internal !== undefined && pyth !== undefined ? internal - pyth : undefined
		const diffPercent =
			internal !== undefined && pyth !== undefined && diff !== undefined
				? (diff / pyth) * 100
				: undefined

		result[symbol] = {
			internal,
			pyth,
			diff,
			diffPercent,
		}
	}

	console.log(JSON.stringify(result, null, 2))
}

main()
