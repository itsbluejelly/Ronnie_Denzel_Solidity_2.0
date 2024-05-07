// IMPORTING NECESSARY FILES
  // IMPORTING MODULES
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-web3-v4";
  // IMPORTING TYPES
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ShowAccountBalanceParams } from "./types/types";

task(
  "show_accounts",
  "shows a list of all available accounts",
  async (
    { number }: { number?: number },
    { web3 }: HardhatRuntimeEnvironment
  ) => {
    const accounts: string[] = await web3.eth.getAccounts();
    console.log(`Currently the node has ${accounts.length} accounts\n`);
    number ? console.log(accounts.slice(0, number)) : console.log(accounts);
  }
).addOptionalParam(
  "number",
  "The number of accounts displayed, if more than the available accounts all will be displayed"
);

task(
  "show_account_balance",
  "shows the balance an account has",
  async (
    { account, denomination = "ether" }: ShowAccountBalanceParams,
    { web3 }: HardhatRuntimeEnvironment
  ) => {
    const accountBalance = await web3.eth.getBalance(account);
    console.log(
      `Account balance: ${parseFloat(web3.utils.fromWei(accountBalance, denomination)).toFixed(5)} ${
        denomination[0].toUpperCase() + denomination.slice(1).toLowerCase()
      }`
    );
  }
)
  .addParam("account", "The account to check the current balance")
  .addOptionalParam(
    "denomination",
    "The denomination to report the balance in, defaults to ether if not provided"
  );

const config: HardhatUserConfig = {
  solidity: "0.8.25",
  defaultNetwork: "hardhat"
};

export default config;
