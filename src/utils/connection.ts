import { Connection } from "@solana/web3.js"

// Replace this with your custom RPC endpoint
const RPC_ENDPOINT =
	"https://flashtr-flash-885f.mainnet.rpcpool.com/b7c56ef6-f1fa-44cd-97be-484dfb73e002"

export const connection = new Connection(RPC_ENDPOINT, "confirmed")
