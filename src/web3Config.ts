// IMPORTING NECESSARY TYPES
import { NetworkType } from "./types/types"

// EXPORTING AN OBJECT CONTAINING DETAILS ON WEB3 NETWORKS
const web3Config: NetworkType = {
    mainnet: [],

    testnet: [{
        name: "Sepolia",
        ID: 11155111,
        explorerURL: "https://sepolia.etherscan.io",
        RPC_URL: "https://sepolia.infura.io/v3"
    }]
}

export default web3Config