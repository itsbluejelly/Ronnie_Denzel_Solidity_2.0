// IMPORTING NECESSARY GENERICS
import { ObjectGenerator } from "./generics"

// A TYPE FOR THE CHAIN
export type ChainType = {
    ID: number,
    name: string,
    explorerURL?: string,
    RPC_URL?: string,
    accounts: `0x${string}`[]
}

// A TYPE FOR THE NETWORK
export type NetworkType = ObjectGenerator<"mainnet" | "testnet", ChainType[]>