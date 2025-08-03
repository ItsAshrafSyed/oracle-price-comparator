import { Connection } from "@solana/web3.js"
import "dotenv/config"

const RPC_ENDPOINT = process.env.RPC_ENDPOINT

export const connection = new Connection(RPC_ENDPOINT ?? "", "confirmed")
