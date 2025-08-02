export type PriceComparison = {
	symbol: string
	pythPrice: number
	internalPrice: number
	diff: number
	pctDiff: number
}

function comparePrices(
	pyth: Record<string, number>,
	internal: Record<string, number>
): PriceComparison[] {
	const results: PriceComparison[] = []

	for (const symbol of Object.keys(internal)) {
		if (symbol in pyth) {
			const internalPrice = internal[symbol]
			const pythPrice = pyth[symbol]
			const diff = Math.abs(internalPrice - pythPrice)
			const pctDiff = (diff / pythPrice) * 100

			results.push({ symbol, internalPrice, pythPrice, diff, pctDiff })
		}
	}

	return results
}

export default comparePrices
