import express from "express"
import cors from "cors"
import fetchInternalPrices from "./fetchInternalPrices"
import { fetchLatestPythPrices } from "./fetchPythPrices"
import tokenMetadata from "../data/configTokens.json"

const app = express()
app.use(cors())

const deltaHistory: Record<string, number[]> = {}
const MAX_HISTORY_LENGTH = 60 * 60 // 60 minutes assuming 1 data point per second

app.get("/prices/stream", async (req, res) => {
	res.setHeader("Content-Type", "text/event-stream")
	res.setHeader("Cache-Control", "no-cache")
	res.setHeader("Connection", "keep-alive")

	const sendPrices = async () => {
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

			if (!deltaHistory[symbol]) {
				deltaHistory[symbol] = []
			}

			if (typeof diffPercent === "number") {
				deltaHistory[symbol].push(Math.abs(diffPercent))
				if (deltaHistory[symbol].length > MAX_HISTORY_LENGTH) {
					deltaHistory[symbol].shift()
				}
			}

			const maxDiffPercent = deltaHistory[symbol]?.length
				? Math.max(...deltaHistory[symbol])
				: undefined

			result[symbol] = {
				internal,
				pyth,
				diff,
				diffPercent,
				maxDiffPercent,
			}
		}

		res.write(`data: ${JSON.stringify(result)}\n\n`)
	}

	const intervalId = setInterval(sendPrices, 1000)

	req.on("close", () => {
		clearInterval(intervalId)
		res.end()
	})
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
