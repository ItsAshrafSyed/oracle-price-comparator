import axios from "axios"

export async function fetchLatestPythPrices(
	pythPriceIds: string[]
): Promise<Record<string, number>> {
	const result: Record<string, number> = {}
	try {
		const queryParams = pythPriceIds.map((id) => `ids[]=${id}`).join("&")
		const url = `https://hermes.pyth.network/v2/updates/price/latest?${queryParams}&parsed=true&ignore_invalid_price_ids=true`
		const { data } = await axios.get(url)

		// console.log("Raw Pyth API response:", data)

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
			// console.log("Parsed prices:", result)
		} else {
			console.error("Unexpected Pyth API response structure:", data)
		}
	} catch (err) {
		console.error("Error fetching latest Pyth prices:", err)
	}
	return result
}
