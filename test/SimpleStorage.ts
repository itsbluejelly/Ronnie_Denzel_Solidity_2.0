// IMPORTING NECESSARY FILES
    // IMPORTING MODULES
import {web3} from "hardhat"
import {expect} from "chai"
import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
    // IMPORTING FILES
import {abi as simpleStorageABI, bytecode} from "../artifacts/contracts/SimpleStorage.sol/SimpleStorage.json"
    // IMPORT TYPES
import { Person } from "../types/types"

// A TEST FOR THE SIMPLESTORAGE CONTRACT
describe("SimpleStorageTest", () => {
    // A FUNCTION TO DEPLOY THE CONTRACT
    async function deployContract(){
            // 1. GET ACCOUNT
        console.log("Getting your account ready...")
        const [accountAddress] = await web3.eth.getAccounts()
        console.log(`Account obtained successfully, your account address is: ${accountAddress}\n`)
            // 2. CREATE A CONTRACT
        console.log("Creating the simpleStorage contract...")
        const contract = new web3.eth.Contract(simpleStorageABI)
        console.log("Contract created successfully\n")
            // 3. DEPLOY CONTRACT
        console.log("Deploying the contract...")
        const simpleStorageContract = await contract.deploy({data: bytecode}).send({from: accountAddress})
        console.log(`Contract deployed successfully, contract address is: ${simpleStorageContract.options.address}\n`)

        return {simpleStorageContract, accountAddress}
    }

    // THE TESTS RAN ON THE DEPLOYED CONTRACT
    describe("Deployement test", () => {
        // TESTING IF IT RETURNS A PERSON
        it("should return a person", async() => {
            const {accountAddress, simpleStorageContract} = await loadFixture(deployContract)
                // CREATING A PERSON
            console.log("Creating a person...")
            await simpleStorageContract.methods._createPerson(accountAddress, "TestPerson", 100).send({from: accountAddress})
            console.log("Person created successfully...\n")
                // READ THE PERSON
            console.log("Obtaining the person...")                                               /* f39Fd6e51aad88F6F4ce6aB8827279cffFb92266 */
            const person: Person = await simpleStorageContract.methods.peopleMap(accountAddress, "0x0000000000000000000000000000000000000000").call()
            
            expect(person.favouriteNumber).to.equal(100, "the person should have a favourite number of 100")
            expect(person.name).to.equal("TestPerson", "the person should have the name TestPerson")
        })

        // TESTING IF IT RETURNS AN OWNER
        it("should return an owner", async() => {
            const {accountAddress, simpleStorageContract} = await loadFixture(deployContract)
                // CREATING A PERSON
            console.log("Creating a person...")
            await simpleStorageContract.methods._createPerson(accountAddress, "TestPerson", 100).send({from: accountAddress})
            console.log("Person created successfully...\n")
                // OBTAINING THE OWNER
            console.log("Obtaining the owner...")
            const ownerAddress: string = await simpleStorageContract.methods.ownerAddresses("0").call()
            
            expect(ownerAddress).to.equal(accountAddress, "the owner should be the current account address")
        })
    })
})