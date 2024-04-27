// IMPORTING NECESSARY FILES
    // IMPORTING MODULES
import {web3} from "hardhat"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import {expect} from "chai"
    // IMPORTING TYPES
import { Person } from "../types/types"
    // IMPORTING ABI
import {abi as mainContractABI, bytecode} from "../artifacts/contracts/Main.sol/MainContract.json"

// A TEST FOR THE MAIN CONTRACT
describe("MainTest", () => {
    // A FUNCTION TO DEPLOY THE CONTRACT
    async function deployContract(){
            // 1. GET ACCOUNT ADDRESS
        console.log("Generating wallet addresses...")
        const [walletAddress] = await web3.eth.getAccounts()
        console.log(`Wallet address generated: Your main wallet address is ${walletAddress}\n`)
            // 2. CREATE CONTRACT
        console.log("Creating the Main contract...")
        const contract = new web3.eth.Contract(mainContractABI)
        console.log("Contract created successfully\n")
            // 3. DEPLOY CONTRACT
        console.log("Deploying the contract...")
        const mainContract = await contract.deploy({data: bytecode}).send({from: walletAddress})
        console.log(`Contract deployed successfully, contract address is ${mainContract.options.address}\n`)

        return {walletAddress, mainContract}
    }

    // A TEST FOR THE DEPLOYED CONTRACT
    describe("Deployment test", () => {
        // TESTING IF IT CAN CREATE A CONTRACT
        it("should create a contract", async() => {
            const {mainContract, walletAddress} = await loadFixture(deployContract)
                // CREATE A CONTRACT
            console.log("Creating the first contract...")
            await mainContract.methods.createContract().send({from: walletAddress})
            console.log("First contract created\n")
                // GET THE 1ST CONTRACT ADDRESS
            console.log("Getting 1st contract address...")
            const firstContractAddress: string = await mainContract.methods.contractAddresses("0").call()
            console.log(`First contract address: ${firstContractAddress}`)
                // CREATE ANOTHER CONTRACT
            console.log("Creating another contract...")
            await mainContract.methods.createContract().send({from: walletAddress})
            console.log("Second contract created\n")
                // GET THE SECOND CONTRACT ADDRESS
            console.log("Getting 2nd contract address...")
            const secondContractAddress: string = await mainContract.methods.contractAddresses("1").call()
            console.log(`Second contract address: ${secondContractAddress}`)

            expect(firstContractAddress).to.not.equal(secondContractAddress, "The 1st and 2nd addresses must be different")
        })

        // TESTING IF IT CAN REJECT INVALID CONTRACT FROM CREATING A PERSON
        it("should reject invalid contract from creating a person", async() => {
            const {mainContract, walletAddress} = await loadFixture(deployContract)
               // CREATE A CONTRACT
            console.log("Creating the contract...")
            await mainContract.methods.createContract().send({from: walletAddress})
            console.log("Contract created\n")
                // GET THE CONTRACT ADDRESS
            console.log("Getting contract address...")
            const contractAddress: string = await mainContract.methods.contractAddresses("0").call()
            console.log(`First contract address: ${contractAddress}`)

            console.log("Creating person with wrong contract...")
            
            expect(
                await mainContract.methods
                    .createPerson(contractAddress, walletAddress, "wrongContract", "0")
                    .send({from: walletAddress})
            ).to.be.revertedWith("This contract doesn't exist")
        })

        // TESTING IF IT CAN CREATE A PERSON
        it("should create a person", async() => {
            const {mainContract, walletAddress} = await loadFixture(deployContract)
                // CREATE A CONTRACT
            console.log("Creating a contract...")
            await mainContract.methods.createContract().send({from: walletAddress})
            console.log("Contract created\n")
                // GET THE CONTRACT ADDRESS
            console.log("Getting contract address...")
            const contractAddress: string = await mainContract.methods.contractAddresses("0").call()
            console.log(`Contract address fetched\n`)
                // CREATE A PERSON
            console.log("Creating a person...")
            
            await mainContract.methods
                .createPerson(contractAddress, walletAddress, "TestPerson", "100")
                .send({from: walletAddress})

            console.log("Person created successfully\n")
                // FETCH CREATED PERSON
            console.log("Getting the person...")
            const person: Person = await mainContract.methods.getPerson(contractAddress, walletAddress, "0").call()
            console.log("Person fetched successfully\n")

            expect(person.favouriteNumber).to.equal(100, "The person should have the favouriteNumber 100")
            expect(person.name).to.equal("TestPerson", "The person should have the name TestPerson")
        })

        // TESTING IF IT CAN REJECT INVALID CONTRACT FROM GETTING A PERSON
        it("should reject invalid contract from getting a person", async() => {
            const {mainContract, walletAddress} = await loadFixture(deployContract)
               // CREATE A CONTRACT
            console.log("Creating the contract...")
            await mainContract.methods.createContract().send({from: walletAddress})
            console.log("Contract created\n")
                // GET THE CONTRACT ADDRESS
            console.log("Getting contract address...")
            const contractAddress: string = await mainContract.methods.contractAddresses("0").call()
            console.log(`First contract address: ${contractAddress}`)
                 // CREATE A PERSON
            console.log("Creating a person...")
            
            await mainContract.methods
                .createPerson(contractAddress, walletAddress, "TestPerson", "100")
                .send({from: walletAddress})

            console.log("Person created successfully\n")

            console.log("Getting person with wrong contract...")
            
            expect(await mainContract.methods.getPerson(contractAddress, walletAddress, "0").call())
                .to.be.revertedWith("This contract doesn't exist")
        })

        // TESTING IF IT CAN REJECT INVALID CONTRACT FROM GETTING AN OWNER
        it("should reject invalid contract from getting an owner", async() => {
            const {mainContract, walletAddress} = await loadFixture(deployContract)
               // CREATE A CONTRACT
            console.log("Creating the contract...")
            await mainContract.methods.createContract().send({from: walletAddress})
            console.log("Contract created\n")
                // GET THE CONTRACT ADDRESS
            console.log("Getting contract address...")
            const contractAddress: string = await mainContract.methods.contractAddresses("0").call()
            console.log(`First contract address: ${contractAddress}`)
                 // CREATE A PERSON
            console.log("Creating a person...")
            
            await mainContract.methods
                .createPerson(contractAddress, walletAddress, "TestPerson", "100")
                .send({from: walletAddress})

            console.log("Person created successfully\n")

            console.log("Getting owner with wrong contract...")
            
            expect(await mainContract.methods.getOwner(contractAddress, "0").call())
                .to.be.revertedWith("This contract doesn't exist")
        })

        // TESTING IF IT CAN FETCH AN OWNER
        it("should get an owner", async() => {
            const {mainContract, walletAddress} = await loadFixture(deployContract)
                // CREATE A CONTRACT
            console.log("Creating a contract...")
            await mainContract.methods.createContract().send({from: walletAddress})
            console.log("Contract created\n")
                // GET THE CONTRACT ADDRESS
            console.log("Getting contract address...")
            const contractAddress: string = await mainContract.methods.contractAddresses("0").call()
            console.log(`Contract address fetched\n`)
                // CREATE A PERSON
            console.log("Creating a person...")
            
            await mainContract.methods
                .createPerson(contractAddress, walletAddress, "TestPerson", "100")
                .send({from: walletAddress})

            console.log("Person created successfully\n")
                // FETCH THE PERSON'S OWNER
            console.log("Getting the person's owner...")
            const ownerAddress: string = await mainContract.methods.getOwner(contractAddress, "0").call()
            console.log("Owner fetched successfully\n")

            expect(ownerAddress).to.equal(walletAddress, "The owner should be the current wallet address")
        })

        // TESTING IF IT CAN REJECT INVALID CONTRACT FROM INCREASING FAVOURITE NUMBER
        it("should reject invalid contract from increasing favourite number", async() => {
            const {mainContract, walletAddress} = await loadFixture(deployContract)
               // CREATE A CONTRACT
            console.log("Creating the contract...")
            await mainContract.methods.createContract().send({from: walletAddress})
            console.log("Contract created\n")
                // GET THE CONTRACT ADDRESS
            console.log("Getting contract address...")
            const contractAddress: string = await mainContract.methods.contractAddresses("0").call()
            console.log(`First contract address: ${contractAddress}`)
                 // CREATE A PERSON
            console.log("Creating a person...")
            
            await mainContract.methods
                .createPerson(contractAddress, walletAddress, "TestPerson", "100")
                .send({from: walletAddress})

            console.log("Person created successfully\n")
                 // FETCH CREATED PERSON
            console.log("Getting the person...")
            const person: Person = await mainContract.methods.getPerson(contractAddress, walletAddress, "0").call()
            console.log("Person fetched successfully\n") 

            console.log("Increasing favouriteNumber with wrong contract...")
            
            expect(
                await mainContract.methods
                    .incrFavouriteNumber(contractAddress, walletAddress, "200", person)
                    .send({from: walletAddress}))
                .to.be.revertedWith("This contract doesn't exist")
        })

        // TESTING IF IT CAN INCREASE FAVOURITE NUMBER
        it("should increasing favourite number", async() => {
            const {mainContract, walletAddress} = await loadFixture(deployContract)
               // CREATE A CONTRACT
            console.log("Creating the contract...")
            await mainContract.methods.createContract().send({from: walletAddress})
            console.log("Contract created\n")
                // GET THE CONTRACT ADDRESS
            console.log("Getting contract address...")
            const contractAddress: string = await mainContract.methods.contractAddresses("0").call()
            console.log(`First contract address: ${contractAddress}`)
                 // CREATE A PERSON
            console.log("Creating a person...")
            
            await mainContract.methods
                .createPerson(contractAddress, walletAddress, "TestPerson", "100")
                .send({from: walletAddress})

            console.log("Person created successfully\n")
                 // FETCH CREATED PERSON
            console.log("Getting the person...")
            let person: Person = await mainContract.methods.getPerson(contractAddress, walletAddress, "0").call()
            console.log("Person fetched successfully\n") 
                // INCREASE THE NUMBER
            console.log("Increasing favouriteNumber...")

            await mainContract.methods
                .incrFavouriteNumber(contractAddress, walletAddress, "200", person)
                .send({from: walletAddress})

            console.log("Favourite number increased\n")
                // REFETCH THE PERSON
            console.log("Refetching the person")
            person = await mainContract.methods.getPerson(contractAddress, walletAddress, "0").call()
            console.log("Person refetched successfully\n")

            expect(person.favouriteNumber).to.equal(300, "The person should have a new favouriteNumber of 300")
        })

        // TESTING IF IT CAN REJECT INVALID CONTRACT FROM DECREASING FAVOURITE NUMBER
        it("should reject invalid contract from decreasing favourite number", async() => {
            const {mainContract, walletAddress} = await loadFixture(deployContract)
               // CREATE A CONTRACT
            console.log("Creating the contract...")
            await mainContract.methods.createContract().send({from: walletAddress})
            console.log("Contract created\n")
                // GET THE CONTRACT ADDRESS
            console.log("Getting contract address...")
            const contractAddress: string = await mainContract.methods.contractAddresses("0").call()
            console.log(`First contract address: ${contractAddress}`)
                 // CREATE A PERSON
            console.log("Creating a person...")
            
            await mainContract.methods
                .createPerson(contractAddress, walletAddress, "TestPerson", "300")
                .send({from: walletAddress})

            console.log("Person created successfully\n")
                 // FETCH CREATED PERSON
            console.log("Getting the person...")
            const person: Person = await mainContract.methods.getPerson(contractAddress, walletAddress, "0").call()
            console.log("Person fetched successfully\n") 

            console.log("Decreasing favouriteNumber with wrong contract...")
            
            expect(
                await mainContract.methods
                    .decrFavouriteNumber(contractAddress, walletAddress, "200", person)
                    .send({from: walletAddress}))
                .to.be.revertedWith("This contract doesn't exist")
        })

        // TESTING IF IT CAN DECREASE FAVOURITE NUMBER
        it("should increasing favourite number", async() => {
            const {mainContract, walletAddress} = await loadFixture(deployContract)
               // CREATE A CONTRACT
            console.log("Creating the contract...")
            await mainContract.methods.createContract().send({from: walletAddress})
            console.log("Contract created\n")
                // GET THE CONTRACT ADDRESS
            console.log("Getting contract address...")
            const contractAddress: string = await mainContract.methods.contractAddresses("0").call()
            console.log(`First contract address: ${contractAddress}`)
                 // CREATE A PERSON
            console.log("Creating a person...")
            
            await mainContract.methods
                .createPerson(contractAddress, walletAddress, "TestPerson", "300")
                .send({from: walletAddress})

            console.log("Person created successfully\n")
                 // FETCH CREATED PERSON
            console.log("Getting the person...")
            let person: Person = await mainContract.methods.getPerson(contractAddress, walletAddress, "0").call()
            console.log("Person fetched successfully\n") 
                // INCREASE THE NUMBER
            console.log("Decreasing favouriteNumber...")

            await mainContract.methods
                .decrFavouriteNumber(contractAddress, walletAddress, "200", person)
                .send({from: walletAddress})

            console.log("Favourite number decreased\n")
                // REFETCH THE PERSON
            console.log("Refetching the person")
            person = await mainContract.methods.getPerson(contractAddress, walletAddress, "0").call()
            console.log("Person refetched successfully\n")

            expect(person.favouriteNumber).to.equal(100, "The person should have a new favouriteNumber of 100")
        })
    })
})