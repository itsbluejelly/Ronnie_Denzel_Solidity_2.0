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
        // 1. INSTANTIATE A PROVIDER
        console.log("Creating a web3 provider...")
        const web3Provider = new Web3(`${process.env.SEPOLIA_METAMASK_TESTNET_RPC}/${process.env.INFURA_ID}`)

        // 2. CREATE A WALLET
        console.log("\nProvider created successfully, generating a wallet...")
        const [account] = web3Provider.eth.accounts.wallet.add(`0x${process.env.ACCOUNT_PRIVATE_KEY}`)
        console.log(`Account created successfully, account address is ${account.address}`)

        // 3. CREATE A CONTRACT
        console.log("\nCreating the main contract...")
        const mainContract = new web3Provider.eth.Contract(mainContractABI)
        console.log("Account created successfully")

        // 4. DEPLOY THE CONTRACT
        console.log("\nDeploying contract...")
        const bytePath: string = path.join(__dirname, ".", "backend", "artifacts", "Main_sol_MainContract.bin")
        const byteCode: string = `0x${await fsPromises.readFile(bytePath, "utf8")}`
        const deployedContract = await mainContract.deploy({data: byteCode}).send({from: account.address})
        console.log(`Account deployed successfully, account address is: ${deployedContract.options.address}`)

        // 5. INTERACT WITH THE CONTRACT
        console.log("\nCreating a storage contract...")
        await deployedContract.methods.createContract().send({from: account.address})
        const contractAddress: string = await deployedContract.methods.contractAddresses(0).call()
        console.log(`Contract created successfully, address is ${contractAddress}`)

        console.log("\nCreating your own person...")
        await deployedContract.methods.createPerson(contractAddress, account.address, "testPerson", "1").send({from: account.address})
        let createdPerson: PersonType = await deployedContract.methods.getPerson(contractAddress, account.address, 0).call()
        console.log(`Person created successfully,\n\tName: ${createdPerson.name}\n\tFavourite number: ${createdPerson.favouriteNumber}`)

        console.log("\nIncreasing number count...")
        await deployedContract.methods.incrFavouriteNumber(contractAddress, account.address, "200", createdPerson).send({from: account.address})
        createdPerson = await deployedContract.methods.getPerson(contractAddress, account.address, 0).call()
        console.log(`Number increased successfully, new number is ${createdPerson.favouriteNumber}`)

        console.log("\nDecreasing number count...")
        await deployedContract.methods.decrFavouriteNumber(contractAddress, account.address, "100", createdPerson).send({from: account.address})
        createdPerson = await deployedContract.methods.getPerson(contractAddress, account.address, 0).call()
        console.log(`Number increased successfully, new number is ${createdPerson.favouriteNumber}`)
    }catch(error){
        console.error((error as Error).name)
    }
}

main()