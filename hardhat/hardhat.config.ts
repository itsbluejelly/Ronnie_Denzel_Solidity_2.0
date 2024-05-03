// IMPORTING NECESSARY FILES
// IMPORTING MODULES
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-web3-v4";
import { HardhatRuntimeEnvironment} from "hardhat/types";
// IMPORTING TYPES
import { ShowAccountsParam, AccountType } from "./types/types";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  defaultNetwork: "hardhat",
};

task(
  "show_accounts",
  "Show all available accounts and their balances",
  async (
    { number, order }: ShowAccountsParam,
    { web3 }: HardhatRuntimeEnvironment
  ) => {
    // GETTING THE ACCOUNTS AVAILABLE
    const accounts: string[] = await web3.eth.getAccounts();
    const availableAccounts: AccountType[] = [];

    // SHOWING THE NO OF ACCOUNTS SPECIIFIED
    if (!number || number >= accounts.length) {
      for (const account of accounts) {
        const accountBalance = await web3.eth.getBalance(account);
        availableAccounts.push({ account, balance: accountBalance });
      }
    } else {
      for (let i: number = 0; i < number; i++) {
        const account: string = accounts[i];
        const accountBalance = await web3.eth.getBalance(account);

        availableAccounts.push({
          account,
          balance: accountBalance,
        });
      }
    }

    // ARRANGING THE ACCOUNTS WITHIN THE ORDER SPECIFIED
    if (order && (order == "asc" || order == "ascending")) {
      for (let i: number = 0; i < availableAccounts.length; i++) {
        for (let j: number = 1; j < availableAccounts.length; j++) {
          if (availableAccounts[i].balance > availableAccounts[j].balance) {
            const higherAccount: AccountType = availableAccounts[i];
            availableAccounts[i] = availableAccounts[j];
            availableAccounts[j] = higherAccount;
          }
        }
      }
    } else {
      for (let i: number = 0; i < availableAccounts.length; i++) {
        for (let j: number = 1; j < availableAccounts.length; j++) {
          if (availableAccounts[j].balance > availableAccounts[i].balance) {
            const lowerAccount: AccountType = availableAccounts[i];
            availableAccounts[i] = availableAccounts[j];
            availableAccounts[j] = lowerAccount;
          }
        }
      }
    }

    for (const account of availableAccounts) {
      const newBalance: `${string} ETH` = `${parseFloat(
        web3.utils.fromWei(account.balance, "ether")
      ).toFixed(5)} ETH`

      account.balance = newBalance;
    }

    // SHOW RESULTS
    console.log(availableAccounts);
    if (number && number > accounts.length)
      console.log(`Sorry, only ${accounts.length} accounts are available`);
  }
)
  .addOptionalParam(
    "number",
    "The number of accounts to display, must be less than or equal to the available accounts"
  )
  .addOptionalParam(
    "order",
    "The order of balances to display, either asc or desc(desc by default)"
  );

export default config;
