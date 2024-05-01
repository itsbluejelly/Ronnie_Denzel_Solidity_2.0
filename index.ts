// IMPORTING FILES
    // IMPORTING NECESSARY MODULES
import {Web3} from "web3"
import dotenv from "dotenv"
    // IMPORTING NECESSARY ABIS
    // IMPORTING NECESSARY TYPES
import { NetworkType, ChainType } from "src/types/types"
import { RegisteredSubscription } from "web3/lib/commonjs/eth.exports"
    // IMPORTING NECESSARY CONFIGS
import web3Config from "src/web3Config"
// const web3Config: NetworkType = {
//     mainnet: [],

//     testnet: [{
//         name: "Sepolia",
//         ID: 11155111,
//         explorerURL: "https://sepolia.etherscan.io",
//         RPC_URL: "https://sepolia.infura.io/v3",
//         accounts: ["0x680811fF817962cA83040532776550fD790C2F9b"] //ADD YOUR OWN ADDRESSES
//     }]
// }

dotenv.config()

// A FUNCTION TO GET THE CURRENT CHAIN RPC_URL
function getCurrentChain(networkType: keyof NetworkType, chainID: number): ChainType{
    // DECLARING VARIABLES
    const RPC_KEY = process.env.RPC_KEY

    // CHECKING FOR MISSING VARIABLES
    if(!RPC_KEY) throw new Error("Missing RPC_KEY in .env file")

    // DETERMINING THE CURRENT CHAIN BASED ON THE NETWORK TYPE
    let currentChain: ChainType | undefined

    if(networkType === "mainnet"){
        currentChain = web3Config.mainnet.find(chain => chain.ID === chainID)
    }else{
        currentChain = web3Config.testnet.find(chain => chain.ID === chainID)
    }

    // IF NO CURRENTCHAIN IS FOUND, THROW AN ERROR, ELSE UPDATE ITS RPC_URL WITH THE KEY
    if(!currentChain) throw new Error("Invalid networkType or chainID")

    console.log(`Success, we determined the network to be ${currentChain.name} ${networkType}`)
    currentChain.RPC_URL = `${currentChain.RPC_URL}/${process.env.RPC_KEY}`

    return currentChain
}

// A FUNCTION TO GET THE WALLET ADDRESS
async function getCurrentAccount(chain: ChainType, web3Provider: Web3<RegisteredSubscription>): Promise<string>{
    let accountAddress: string | undefined

    for(const address of chain.accounts){
        const accountBalance: bigint = await web3Provider.eth.getBalance(address)
        
        if(accountBalance){
            accountAddress = address
        }else{
            continue
        }
    }

    if(!accountAddress) throw new Error("The provided addresses have all their balances used up, or no address is provided at all")

    return accountAddress
}

// A SCRIPT TO RUN THE MAIN FUNCTION
export default async function main(RPC_URL?: string, networkType?: keyof NetworkType, chainID?: number): Promise<void>{
    try{
        // DEFINING VARIABLES
        let currentChainRPC, currentAddress: string
        let currentChain: ChainType | undefined

        // FINDING CURRENT CHAIN RPC_URL
        if(networkType && chainID && !RPC_URL){
            currentChain = getCurrentChain(networkType, chainID)
            currentChainRPC = currentChain.RPC_URL
        }else if(!networkType && !chainID && RPC_URL){
            currentChainRPC = RPC_URL
        }else{
            throw new Error("You can either give the RPC_URL alone, or the networkType and chainID")
        }

            // 1. CREATE A WEB3 PROVIDER
        console.log("Creating a web3 provider...")
        const web3Provider = new Web3(currentChainRPC)
        console.log("Web3Provider instantiated successfully\n")
            // 2. CREATE A WEB3 WALLET
        console.log("Creating a web3 wallet...")
        
        // FINDING CURRENT ACCOUNT ADDRESS
        if(networkType && chainID && !RPC_URL){
            currentAddress = await getCurrentAccount(currentChain as ChainType, web3Provider)
        }else if(!networkType && !chainID && RPC_URL){
            currentAddress = await web3Provider.eth.accounts.wallet.decrypt()

        // 3. CREATE A CONTRACT
        // 4. DEPLOY A CONTRACT
        // 5. VERIFY THE CONTRACT
        // 6. INTERACT
    }catch(error: unknown){
        console.error(`${(error as Error).message}`)
    }
}

main("", "testnet", 11155111)
