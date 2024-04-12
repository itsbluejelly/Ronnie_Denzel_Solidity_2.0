import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-web3-v4";
import { HardhatRuntimeEnvironment } from "hardhat/types";

// A TASK TO PRINT OUT ALL AVAILABLE ACCOUNTS
task("show_accounts", "A task to print out all accounts", async function(taskArgs, {web3}: HardhatRuntimeEnvironment){
  console.log(await web3.eth.getAccounts())
})

const config: HardhatUserConfig = {
  solidity: "0.8.25",
  defaultNetwork: "hardhat"
};

export default config;
