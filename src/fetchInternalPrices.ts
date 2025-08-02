import { Connection, PublicKey } from "@solana/web3.js"
// @ts-ignore
import * as BufferLayout from "buffer-layout"
import fs from "fs"
import path from "path"
import { connection } from "./utils/connection"
import extractTokens from "./utils/extractTokens"

type TokenEntry = {
	symbol: string
	intOracleAddress: string
	pythPriceId: string
	decimals: number
}

const layout = BufferLayout.struct([BufferLayout.blob(20), BufferLayout.nu64("price")])

async function fetchInternalPrices(): Promise<Record<string, number>> {
	const tokens = extractTokens()
	const prices: Record<string, number> = {}

	for (const token of tokens) {
		try {
			const accountInfo = await connection.getAccountInfo(new PublicKey(token.intOracleAddress))
			if (!accountInfo) {
				console.log(`${token.symbol}: account not found`)
				continue
			}

			const buffer = accountInfo.data
			// console.log(`${token.symbol}: raw =`, buffer.toString("hex").slice(0, 64))
			const decoded = layout.decode(buffer)
			const price = Number(decoded.price) / 10 ** token.decimals

			// console.log(`${token.symbol}: ${price}`)
			prices[token.symbol] = price
		} catch (err) {
			console.error(`Error reading ${token.symbol}:`, err instanceof Error ? err.message : err)
		}
	}

	const outputPath = path.resolve(__dirname, "../data/tokenData.json")
	fs.writeFileSync(outputPath, JSON.stringify(prices, null, 2), "utf-8")

	return prices
}

export default fetchInternalPrices
