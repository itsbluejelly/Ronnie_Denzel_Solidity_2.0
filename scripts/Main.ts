// IMPORTING NECESSARY FILES
    // IMPORTING MODULES
import { Web3 } from "web3";
import {abi as mainContractABI} from "../artifacts/contracts/Main.sol/MainContract.json"
import { Person } from "../types/types";

// A SCRIPT TO RUN NODE FROM LOCALHOST
async function main(): Promise<void>{
    try{
        let gasEstimate: bigint | number = 0

        console.log("Setting up web3 provider...")
        const web3Provider = new Web3("http://127.0.0.1:8545/")
        console.log("Provider set successfully\n")

        console.log("Setting up your wallet...")
        const [wallet] = web3Provider.eth.accounts.wallet.add("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")
        const originalBalance = await web3Provider.eth.getBalance(wallet.address)
        console.log(`Wallet created successfully.\n\t1. wallet address: ${wallet.address}\n\t2. wallet amount: ${web3Provider.utils.fromWei(originalBalance, "ether")} ETH\n`)

        console.log("Getting the deployed mainContract...")
        const mainContract = new web3Provider.eth.Contract(mainContractABI, "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512")
        console.log(`Contract obtained successfully, contract address: ${mainContract.options.address}`)
        console.log(`\tGas usage: ${gasEstimate}\n`)

        console.log("Creating an advancedStorage contract...")
        await mainContract.methods.createContract().send({from: wallet.address})
        gasEstimate = await mainContract.methods.createContract().estimateGas()
        console.log("Contract created successfully")
        console.log(`\tGas usage: ${gasEstimate}\n`)

        console.log("Fetching the contract address...")
        const advancedStorageAddress: string = await mainContract.methods.contractAddresses(0).call()
        gasEstimate = await mainContract.methods.contractAddresses(0).estimateGas()
        console.log(`Contract fetched successfully, its address: ${advancedStorageAddress}`)
        console.log(`\tGas usage: ${gasEstimate}\n`)

        console.log("Creating a person...")
        await mainContract.methods.createPerson(advancedStorageAddress, wallet.address, "first", 0).send({from: wallet.address})
        gasEstimate = await mainContract.methods.createPerson(advancedStorageAddress, wallet.address, "first", 0).estimateGas()
        console.log("Person created successfully")
        console.log(`\tGas usage: ${gasEstimate}\n`)

        console.log("Getting the person...")
        let person: Person = await mainContract.methods.getPerson(advancedStorageAddress, wallet.address, 0).call()
        gasEstimate = await mainContract.methods.getPerson(advancedStorageAddress, wallet.address, 0).estimateGas()
        console.log(`Person fetched successfully\n\t-name: ${person.name}\n\t-favouriteNumber: ${person.favouriteNumber}`)
        console.log(`\tGas usage: ${gasEstimate}\n`)

        console.log("Getting the owner...")
        const ownerAddress: string = await mainContract.methods.getOwner(advancedStorageAddress, 0).call()
        gasEstimate = await mainContract.methods.getOwner(advancedStorageAddress, 0).estimateGas()
        console.log(`owner fetched successfully.\n\t1. Owner: ${ownerAddress}\n\t2. Current address: ${wallet.address}`)
        console.log(`\tGas usage: ${gasEstimate}\n`)

        console.log("Increasing the favouriteNumber...")
            // INCREASING THE NUMBER
        await mainContract.methods.incrFavouriteNumber(advancedStorageAddress, wallet.address, 100, person).send({from: wallet.address})
        gasEstimate = await mainContract.methods.incrFavouriteNumber(advancedStorageAddress, wallet.address, 100, person).estimateGas()
            // REFETCHING THE PERSON
        person = await mainContract.methods.getPerson(advancedStorageAddress, wallet.address, 0).call()
        gasEstimate += await mainContract.methods.getPerson(advancedStorageAddress, wallet.address, 0).estimateGas()
        console.log(`Increase successful, new favourite number is: ${person.favouriteNumber}`)
        console.log(`\tGas usage: ${gasEstimate}\n`)

        console.log("Decreasing the favouriteNumber...")
            // INCREASING THE NUMBER
        await mainContract.methods.decrFavouriteNumber(advancedStorageAddress, wallet.address, 50, person).send({from: wallet.address})
        gasEstimate = await mainContract.methods.decrFavouriteNumber(advancedStorageAddress, wallet.address, 50, person).estimateGas()
            // REFETCHING THE PERSON
        person = await mainContract.methods.getPerson(advancedStorageAddress, wallet.address, 0).call()
        gasEstimate += await mainContract.methods.getPerson(advancedStorageAddress, wallet.address, 0).estimateGas()
        console.log(`Increase successful, new favourite number is: ${person.favouriteNumber}`)
        console.log(`\tGas usage: ${gasEstimate}\n`)

        const currentBalance = await web3Provider.eth.getBalance(wallet.address)
        console.log(`Balance: ${web3Provider.utils.fromWei(currentBalance, "ether")}/${web3Provider.utils.fromWei(originalBalance, "ether")} ETH`)
    }catch(error: unknown){
        console.error(`${(error as Error).message}`)
    }
}

main()