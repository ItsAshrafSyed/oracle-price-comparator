import fetchInternalPrices from "./fetchInternalPrices"
import { fetchLatestPythPrices } from "./fetchPythPrices"
import tokenMetadata from "../data/configTokens.json"

async function main() {
	const [internalPrices, pythPrices] = await Promise.all([
		fetchInternalPrices(),
		fetchLatestPythPrices(),
	])
	const result: Record<string, any> = {}

	for (const token of tokenMetadata) {
		const symbol = token.symbol.toUpperCase()
		const priceId = token.pythPriceId?.toLowerCase().replace(/^0x/, "")
		const internal = internalPrices[symbol]
		const pyth = priceId ? pythPrices[priceId] : undefined

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
