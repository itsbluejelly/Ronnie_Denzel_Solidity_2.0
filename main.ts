// IMPORTING NECESSARY FILES
    // IMPORTING MODULES
import Web3 from "web3"
import dotenv from "dotenv"
import fsPromises from "fs/promises"
import path from "path"
    // IMPORTING CONTRACT ABIS
import mainContractABI from "./backend/artifacts/Main_sol_MainContract"
    // IMPORTING TYPES
import { PersonType } from "types/types"

// CALLING MODULES
dotenv.config()

// A FUNCTION TO DEPLOY THE CONTRACT
async function main(): Promise<void>{
    try{
        // 1. CREATE A WEB3 PROVIDER
        console.log("Instantiating provider...")
        const web3Provider = new Web3(process.env.SEPOLIA_METAMASK_TESTNET_RPC)

        // 2. CREATE A WALLET
        console.log("Obtaining wallet...")
        const wallet = web3Provider.eth.accounts.wallet.add(process.env.SEPOLIA_METAMASK_PRIVATE_KEY!)
        const walletAddress: string = wallet[0].address
        console.log(`Wallet address is: ${walletAddress}, you own ${wallet.length} wallet(s)`)

        // 3. CREATE THE BYTECODE, A CONTRACT AND DEPLOY IT
        const byteCodePath: string = path.join(__dirname, ".", "backend", "artifacts", "Main_sol_MainContract.bin")
        const byteCode = `0x${await fsPromises.readFile(byteCodePath, 'utf8')}`

        const mainContract = new web3Provider.eth.Contract(mainContractABI)

        console.log("\nDeploying contract address...")
        const deployedContract = await mainContract.deploy({data: byteCode}).send({from: walletAddress})
        console.log(`The contract address is: ${deployedContract.options.address}`)

        // 4. CREATE A PERSON
        console.log("\nCreating a contract instance...")
        await deployedContract.methods.createContract().send({from: walletAddress})
        const contractAddress: string = await deployedContract.methods.contractAddresses(0).call()
        console.log(`\nSuccess, operating in contract ${contractAddress}`)

        console.log("\nCreating your person in the contract above...")
        await deployedContract.methods.createPerson(contractAddress, walletAddress, "first", "0").send({from: walletAddress})
        const createdPerson: PersonType = await deployedContract.methods.getPerson(contractAddress, walletAddress, 0).call()
        console.log(`Your created person has a name ${createdPerson.name} and a number of ${createdPerson.favouriteNumber}`)
    }catch(error: unknown){
        console.error((error as Error))
    }
}

main()