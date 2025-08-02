import axios from "axios"
import configTokens from "../data/configTokens.json"

export async function fetchLatestPythPrices(): Promise<Record<string, number>> {
	const result: Record<string, number> = {}
	try {
		const queryParams = Object.values(configTokens)
			.map((token) => `ids[]=${token.pythPriceId}`)
			.join("&")
		const url = `https://hermes.pyth.network/v2/updates/price/latest?${queryParams}&parsed=true&ignore_invalid_price_ids=true`
		const { data } = await axios.get(url)

		if (Array.isArray(data?.parsed)) {
			for (const entry of data.parsed) {
				if (
					entry?.price?.price !== undefined &&
					entry?.price?.expo !== undefined &&
					typeof entry.id === "string"
				) {
					const price = Number(entry.price.price) * 10 ** entry.price.expo
					result[entry.id.toLowerCase()] = price
				}
			}
		} else {
			console.error("Unexpected Pyth API response structure:", data)
		}
	} catch (err) {
		console.error("Error fetching latest Pyth prices:", err)
	}
	return result
}
