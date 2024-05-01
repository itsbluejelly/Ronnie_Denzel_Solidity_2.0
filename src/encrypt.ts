// IMPORTING NECESSARY FILES
    // IMPORTING MODULES
import {KeyStore, Web3} from "web3"
import dotenv from "dotenv"
import fsPromises from "fs/promises"
import path from "path"

dotenv.config()

// A SCRIPT TO ENCRYPT THE PRIVATE KEY AND THE PASSWORD
export default async function encrypt(){
    try{
        // DECLARING VARIABLES
        const PRIVATE_KEY = process.env.PRIVATE_KEY
        const PASSWORD = process.env.PASSWORD

        // DOING CHEKS TO ENSURE NO MISSING VARIABLES
        if(!PRIVATE_KEY){
            throw new Error("Missing PRIVATE_KEY in .env file")
        }else if(!PASSWORD){
            throw new Error("Missing PASSWORD in .env file")
        }

            // 1. CREATE PROVIDER
        console.log("Creating a provider...")
        const web3Provider = new Web3()
        console.log("Provider created successfully\n")
            // 2. ENCRYPT WALLET AND REMOVE RECORDED PRIVATE KEY
        console.log("Encrypting stored wallet...")
        const encryptedPrivateKey: KeyStore = await web3Provider.eth.accounts.encrypt(PRIVATE_KEY, PASSWORD)
        
        const filePath: string = path.join(__dirname, '..', 'artifacts', 'wallet.json')
        await fsPromises.writeFile(filePath, JSON.stringify(encryptedPrivateKey, null ,4), "utf-8")

        const envFilePath: string = path.join(__dirname, "..", ".env")
        let contents: string[] = (await fsPromises.readFile(envFilePath)).toString("utf-8").split("\n")
        let newContent: string = contents.filter(string => !string.includes("PRIVATE_KEY=")).join("\n")
        await fsPromises.writeFile(envFilePath, newContent, "utf-8")
        
        console.log("Private key encrypted, deleted from .env and stored successfully\n")
    }catch(error: unknown){
        console.error(`${(error as Error).message}`)
    }
}

encrypt()