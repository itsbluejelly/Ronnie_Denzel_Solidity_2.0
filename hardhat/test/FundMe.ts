// IMPORTING NECESSARY FILES
    // IMPORTING MODULES
import {web3} from "hardhat"
import {expect} from "chai"
import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
    // IMPORTING ABIS
import {abi as FundMeABI, bytecode} from "../artifacts/contracts/FundMe.sol/FundMe.json"

// A TEST FOR THE FUNDME CONTRACT
describe("FundMeContract", () => {
    // A FUNCTION TO DEPLOY THE CONTRACT
    async function deployContract(){
            // 1. GET WEB3 WALLET
        console.log("Preparing an account from your wallet...")
        const [mainAccount] = await web3.eth.getAccounts()
        const accountBalance = await web3.eth.getBalance(mainAccount)
        console.log(`\n\t- Account address: ${mainAccount}\n\t- Account balance: ${parseFloat(web3.utils.fromWei(accountBalance, "ether")).toFixed(4)} ETH\n`)
            // 2. CREATE CONTRACT
        console.log("Creating the FundMe contract...")
        const contract = new web3.eth.Contract(FundMeABI)
        console.log("Contract created successfully\n")
            // 3. DEPLOY CONTRACT
        console.log("Deploying the contract...")
        const fundAmount: string = web3.utils.toWei("0.001", "ether")
        
        const gasEstimate: bigint = await contract.deploy({
            data: bytecode,
            arguments: [fundAmount]
        }).estimateGas({ from: mainAccount })

        const deployedContract = await contract
          .deploy({
            data: bytecode,
            arguments: [fundAmount],
          })
          .send({ from: mainAccount });

        console.log(`Contract deployed successfully.\n\t- Contract address: ${deployedContract.options.address}\n\t- Gas used: ${parseFloat(web3.utils.fromWei(gasEstimate, "ether")).toFixed(4)} ETH\n`)

        return {mainAccount, deployedContract, fundAmount}
    }

    describe("Deployment", () => {
        it("should set the fund amount accordingly", async() => {
            const {deployedContract, fundAmount} = await loadFixture(deployContract)
            console.log("Checking if the current fund amount is equal to the previous set value...")
            const currentFundAmount: string = await deployedContract.methods.fundAmount().call()
            expect(currentFundAmount).to.equal(fundAmount, "The set fund amount should be equal to the value returned")
        })
    })

    describe("Functionality", () => {
        it("should return the right owner")
    })
})