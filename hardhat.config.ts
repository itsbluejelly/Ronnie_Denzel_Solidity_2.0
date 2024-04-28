import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-web3-v4";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {abi} from "./artifacts/contracts/Main.sol/MainContract.json"

// A TASK TO PRINT OUT ALL AVAILABLE ACCOUNTS
task("show_accounts", "A task to print out all accounts", async function(taskArgs, {web3}: HardhatRuntimeEnvironment){
  console.log(await web3.eth.getAccounts())
})

// A TASK TO SHOW AN ACCOUNT BALANCE
task("show_account_balance", "A task to show the account balance", async({address}: {address: string}, {web3}: HardhatRuntimeEnvironment) => {
  const accountBalance: bigint = await web3.eth.getBalance(address)
  const ethBalance: string = web3.utils.fromWei(accountBalance, "ether")
  console.log(`${ethBalance} ETH`)
}).addParam("address", "The address of the account")

task("create_contract", "create advancedContract instance", async(taskArgs, {web3}: HardhatRuntimeEnvironment) => {
  const contract = new web3.eth.Contract(abi, "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512")
  await contract.methods.createContract().send({from: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"})
  console.log("created, waiting...")
  const address: string = await contract.methods.contractAddresses(0).call()
  console.log("done")
  console.log(`Contract created is: ${address}`)
})

const config: HardhatUserConfig = {
  solidity: "0.8.25",
  defaultNetwork: "hardhat",
  
  networks: {
    "localhost": {
      url: "http://127.0.0.1:8545/",
      
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", 
        "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
      ],

      chainId: 31337
    }
  }
};

export default config;
