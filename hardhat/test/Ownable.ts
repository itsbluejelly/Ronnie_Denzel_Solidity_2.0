// IMPORTING NECESSARY FILES
    // IMPORTING MODULES
import { web3 } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
    // IMPORTING ABIS
import {abi as OwnableABI, bytecode} from "../artifacts/contracts/@openzeppelin/contracts/access/Ownable.sol/Ownable.json"

// A TEST FOR THE OWNABLE CONTRACT
describe("Ownable Contract", () => {
  // A FUNCTION TO DEPLOY THE CONTRACT
  async function deployContract() {
        // 1. GET WEB3 WALLET
    console.log("Preparing an account from your wallet...");
    const [mainAccount] = await web3.eth.getAccounts();
    const accountBalance = await web3.eth.getBalance(mainAccount);
    console.log(
      `\n\t- Account address: ${mainAccount}\n\t- Account balance: ${parseFloat(
        web3.utils.fromWei(accountBalance, "ether")
      ).toFixed(4)} ETH\n`
    );
        // 2. CREATE CONTRACT
    console.log("Creating the Ownable contract...");
    const contract = new web3.eth.Contract(OwnableABI);
    console.log("Contract created successfully\n");
        // 3. DEPLOY CONTRACT
    console.log("Deploying the contract...");

    const gasEstimate: bigint = await contract.deploy({
        data: bytecode,
        arguments: [mainAccount]
      })
      .estimateGas({ from: mainAccount });

    const deployedContract = await contract
      .deploy({
        data: bytecode,
        arguments: [mainAccount],
      })
      .send({ from: mainAccount });

    console.log(
      `Contract deployed successfully.\n\t- Contract address: ${
        deployedContract.options.address
      }\n\t- Gas used: ${parseFloat(
        web3.utils.fromWei(gasEstimate, "ether")
      ).toFixed(4)} ETH\n`
    );

    return { mainAccount, contract, deployedContract };
  }

  describe("Deployment", () => {
    it("should throw an error if an address is 0", async() => {
        const {contract, mainAccount} = await loadFixture(deployContract)
        console.log("Deploying the contract setting the owner as address of 0..")
        
        await expect(
          contract
            .deploy({
              data: bytecode,
              arguments: ["0x0000000000000000000000000000000000000000"],
            })
            .send({ from: mainAccount })
        ).to.be.rejectedWith("OwnableInvalidOwner");
    })
  })
})
