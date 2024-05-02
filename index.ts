// IMPORTING FILES
    // IMPORTING NECESSARY MODULES
import {Web3} from "web3"
import dotenv from "dotenv"
import fsPromises from "fs/promises"
import path from "path"
    // IMPORT NECESSARY ABIS
import FundMeContractABI from "./artifacts/FundMe_sol_FundMe.json"
    // IMPORTING NECESSARY TYPES
import { NetworkType, ChainType } from "src/types/types"
import { RegisteredSubscription, estimateGas } from "web3/lib/commonjs/eth.exports"
    // IMPORTING NECESSARY CONFIGS
import web3Config from "./src/web3Config"
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
function getCurrentChainRPC(networkType: keyof NetworkType, chainID: number): string{
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

    return currentChain.RPC_URL
}

// A FUNCTION TO GET THE WALLET ADDRESS
async function getCurrentAccount(web3Provider: Web3<RegisteredSubscription>): Promise<string>{
    const filePath: string = path.join(__dirname, "artifacts", "wallet.json")
    const encryptedPrivateKey = await fsPromises.readFile(filePath, "utf-8")

    // IF NO ENCRYPTED KEY IS FOUND, THROW AN ERROR, OTHERWISE GET THE WALLET ADDRESS
    if(!encryptedPrivateKey) throw new Error("The targeted file lacks any content, try running the encrypted script first")

    const accountPrivateKey = (await web3Provider.eth.accounts.decrypt(encryptedPrivateKey, process.env.PASSWORD!)).privateKey
    const accountAddress: string = web3Provider.eth.accounts.wallet.add(accountPrivateKey)[0].address

    return accountAddress
}

// A SCRIPT TO RUN THE MAIN FUNCTION
export default async function main(RPC_URL?: string, networkType?: keyof NetworkType, chainID?: number): Promise<void>{
    try{
        // DEFINING VARIABLES
        let currentChainRPC: string | undefined
        let currentAddress: string | undefined
        let gasEstimate: bigint | number

        // FINDING CURRENT CHAIN RPC_URL
        if(networkType && chainID && !RPC_URL){
            currentChainRPC = getCurrentChainRPC(networkType, chainID)
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
        currentAddress = await getCurrentAccount(web3Provider)
        const accountBalance: bigint = await web3Provider.eth.getBalance(currentAddress as string)
        
        console.log(`Account obtained successfully\n\t- Account address: ${currentAddress}\n\t- Account balance ${parseFloat(web3Provider.utils.fromWei(accountBalance, "ether")).toFixed(5)} ETH\n`)

            // 3. CREATE A CONTRACT
        console.log("Creating the contract...")
        const contract = new web3Provider.eth.Contract(FundMeContractABI)
        console.log("Contract created successfully\n")
            // 4. DEPLOY A CONTRACT
        console.log("Deploying the contract...")

        // FINDING THE BYTECODE
        const bytePath = path.join(__dirname, "artifacts", "FundMe_sol_FundMe.bin")
        const byteCode = `0x${await fsPromises.readFile(bytePath)}`
        
        // DEPLOYING THE CONTRACT
        const fundAmount: string = web3Provider.utils.toWei(0.001, "ether")
        
        gasEstimate = await contract
            .deploy({data: byteCode, arguments: [fundAmount]})
            .estimateGas({from: currentAddress})
        
        const deployedContract = await contract
            .deploy({data: byteCode, arguments: [fundAmount]})
            .send({from: currentAddress})

        console.log(`Contract deployed successfully\n\t- Contract address: ${deployedContract.options.address}\n\t- Gas used: ${web3Provider.utils.fromWei(gasEstimate, "ether")} ETH\n`)
            
            // 6. INTERACT
        console.log("Getting the contact owner's address...")
        gasEstimate = await deployedContract.methods.owner().estimateGas()
        const ownerAddress: string = await deployedContract.methods.owner().call()
        
        console.log(`Owner fetched successfully\n\t-Current owner: ${ownerAddress}\n\t-Current address: ${currentAddress}\n\t-Gas used: ${web3Provider.utils.fromWei(gasEstimate, "ether")} ETH\n`)

        console.log("Getting transfership events...")
        const ownershipTranferEvent = deployedContract.events.OwnershipTransferred({filter: {newOwner: currentAddress}})
        ownershipTranferEvent.on("data", (data) => console.log(data.event))
        const finalAccountBalance: bigint = await web3Provider.eth.getBalance(currentAddress as string)
        
        console.log(`Account balance: ${parseFloat(web3Provider.utils.fromWei(finalAccountBalance, "ether")).toFixed(5)}/${parseFloat(web3Provider.utils.fromWei(accountBalance, "ether")).toFixed(5)} ETH\n`)
    }catch(error: unknown){
        console.error(`${(error as Error).message}`)
    }
}

main("", "testnet", 11155111)
