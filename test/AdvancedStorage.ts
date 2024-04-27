// IMPORTING NECESSARY FILES
    // IMPORTING MODULES
import { web3 } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {expect} from "chai"
    // IMPORTING ABI
import {abi as advancedContractABI, bytecode} from "../artifacts/contracts/AdvancedStorage.sol/AdvancedStorage.json"
    // IMPORTING TYPES
import { Person } from "../types/types";

// A TEST FOR THE ADVANCEDSTORAGE CONTRACT
describe("AdvancedStorageTest", () => {
    // A FUNCTION TO DEPLOY THE CONTRACT
    async function deployContract(){
            // 1. GET AN ACCOUNT ADDRESS
        console.log("Preparing an account...")
        const [accountAddress, wrongAddress] = await web3.eth.getAccounts()
        console.log(`Account ready\n\t1. Your main address is ${accountAddress}\n\t2. Your other address is ${wrongAddress}\n`)
            // 2. CREATE A CONTRACT
        console.log("Creating the AdvancedStorage contract...")
        const contract = new web3.eth.Contract(advancedContractABI)
        console.log("Contract created successfully\n")
            // 3. DEPLOY THE CONTRACT
        console.log("Deploying the contract...")
        const advancedStorageContract = await contract.deploy({data: bytecode}).send({from: accountAddress})
        console.log(`Contract deployed successfully, contract address is ${advancedStorageContract.options.address}`)

        return {accountAddress, advancedStorageContract, wrongAddress}
    }

    // A TEST FOR THE DEPLOYED CONTRACT
    describe("Deployment test", () => {
        // TESTING IF IT REJECTS A NON OWNER FROM CALLING INCREASE FUNCTION
        it("should throw an error if an increase is done by a non owner", async () => {
            const {accountAddress, advancedStorageContract, wrongAddress} = await loadFixture(deployContract)
                // RIGHT PERSON CREATES A PERSON
            console.log("Creating a person...")

            await advancedStorageContract.methods
                ._createPerson(accountAddress, "testPerson", "100")
                .send({from: accountAddress})

            console.log("Person created successfully\n")
                // GETTING THE CREATED PERSON
            console.log("Getting the person...")

            const person: Person = await advancedStorageContract.methods
                .peopleMap(accountAddress, "0x0000000000000000000000000000000000000000")
                .call()

            console.log("Person obtained successfully\n")
                // WRONG PERSON CREATES A PERSON
            console.log("Creating a person for wrong account...")

            await advancedStorageContract.methods
                ._createPerson(wrongAddress, "wrongPerson", "0")
                .send({from: wrongAddress})

            console.log("Person created successfully\n")
                // WRONG PERSON TRIES INCREASE FUNCTION
            console.log("Wrong address increasing favourite number...")

            expect(
                await advancedStorageContract.methods
                    ._incrFavouriteNumber(wrongAddress, "200", person)
                    .send({from: wrongAddress})
            ).to.be.revertedWith("You must be a registered owner to access a person")
        })

        // TESTING IF IT INCREASES A NUMBER
        it("should increase the favourite number", async () => {
            const {accountAddress, advancedStorageContract} = await loadFixture(deployContract)
                // CREATING A PERSON
            console.log("Creating a person...")

            await advancedStorageContract.methods
                ._createPerson(accountAddress, "testPerson", "100")
                .send({from: accountAddress})

            console.log("Person created successfully\n")
                // GETTING THE CREATED PERSON
            console.log("Getting the person...")

            let person: Person = await advancedStorageContract.methods
                .peopleMap(accountAddress, "0x0000000000000000000000000000000000000000")
                .call()

            console.log("Person obtained successfully\n")
                // INCREASING THE PERSON'S FAVOURITE NUMBER
            console.log("Increasing favourite number...")
            
            await advancedStorageContract.methods
                ._incrFavouriteNumber(accountAddress, "200", person)
                .send({from: accountAddress})

            console.log("Favourite number increased\n")
                // REFETCHING THE SAME PERSON
            console.log("Refetching the person...")

            person = await advancedStorageContract.methods
                .peopleMap(accountAddress, "0x0000000000000000000000000000000000000000")
                .call()

            expect(person.favouriteNumber).to.equal("300", "The person should have a new favourite number of 300")
        })

        // TESTING IF IT REJECTS A NON OWNER FROM CALLING DECREASE FUNCTION
        it("should throw an error if a decrease is done by a non owner", async () => {
            const {accountAddress, advancedStorageContract, wrongAddress} = await loadFixture(deployContract)
                // RIGHT PERSON CREATES A PERSON
            console.log("Creating a person...")

            await advancedStorageContract.methods
                ._createPerson(accountAddress, "testPerson", "300")
                .send({from: accountAddress})

            console.log("Person created successfully\n")
                // GETTING THE CREATED PERSON
            console.log("Getting the person...")

            const person: Person = await advancedStorageContract.methods
                .peopleMap(accountAddress, "0x0000000000000000000000000000000000000000")
                .call()

            console.log("Person obtained successfully\n")
                // WRONG PERSON CREATES A PERSON
            console.log("Creating a person for wrong account...")

            await advancedStorageContract.methods
                ._createPerson(wrongAddress, "wrongPerson", "0")
                .send({from: wrongAddress})

            console.log("Person created successfully\n")
                // WRONG PERSON TRIES DECREASE FUNCTION
            console.log("Wrong address decreasing favourite number...")

            expect(
                await advancedStorageContract.methods
                    ._decrFavouriteNumber(wrongAddress, "200", person)
                    .send({from: wrongAddress})
            ).to.be.revertedWith("You must be a registered owner to access a person")
        })

        // TESTING IF IT DECREASES A NUMBER
        it("should decrease the favourite number", async () => {
            const {accountAddress, advancedStorageContract} = await loadFixture(deployContract)
                // CREATING A PERSON
            console.log("Creating a person...")

            await advancedStorageContract.methods
                ._createPerson(accountAddress, "testPerson", "300")
                .send({from: accountAddress})

            console.log("Person created successfully\n")
                // GETTING THE CREATED PERSON
            console.log("Getting the person...")

            let person: Person = await advancedStorageContract.methods
                .peopleMap(accountAddress, "0x0000000000000000000000000000000000000000")
                .call()

            console.log("Person obtained successfully\n")
                // DECREASING THE PERSON'S FAVOURITE NUMBER
            console.log("Decreasing favourite number...")
            
            await advancedStorageContract.methods
                ._decrFavouriteNumber(accountAddress, "200", person)
                .send({from: accountAddress})

            console.log("Favourite number decreased\n")
                // REFETCHING THE SAME PERSON
            console.log("Refetching the person...")

            person = await advancedStorageContract.methods
                .peopleMap(accountAddress, "0x0000000000000000000000000000000000000000")
                .call()

            expect(person.favouriteNumber).to.equal("100", "The person should have a new favourite number of 100")
        })
    })
})