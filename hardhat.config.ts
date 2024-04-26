import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-web3-v4";
import { HardhatRuntimeEnvironment } from "hardhat/types";

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

const config: HardhatUserConfig = {
  solidity: "0.8.25",
  defaultNetwork: "hardhat"
};

export default config;
