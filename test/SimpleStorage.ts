// IMPORTING NECESSARY FILES
    // IMPORTING MODULES
import {web3} from "hardhat"
import {expect} from "chai"
    // IMPORTING FILES
import simpleStorageABI from "../artifacts/contracts/SimpleStorage.sol/SimpleStorage.json"

// A TEST FOR THE SIMPLESTORAGE CONTRACT
describe("SimpleStorage", () => {
    async function deployContract(){
        // 1. CREATING A CONTRACT
        const simpleStorage = new web3.eth.Contract(simpleStorageABI)
        // 2. DEPLOYING THE CONTRACT
    }
})