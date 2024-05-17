// IMPORTING NECESSARY FILES
  // IMPORTING MODULES
import { HardhatUserConfig, task, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-web3-v4";
import "hardhat-gas-reporter"
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

// GETTING ENV VARIABLES
  // LOCALHOST
const LOCALHOST_RPC_URL: string = vars.get("LOCALHOST_RPC_URL")
const LOCALHOST_ACCOUNT_KEY_ONE: string = vars.get("LOCALHOST_ACCOUNT_KEY_ONE");
const LOCALHOST_ACCOUNT_KEY_TWO: string = vars.get("LOCALHOST_ACCOUNT_KEY_TWO");
   // SEPOLIA
const SEPOLIA_RPC_URL: string = vars.get("SEPOLIA_RPC_URL");
const SEPOLIA_ACCOUNT_KEY: string = vars.get("SEPOLIA_ACCOUNT_KEY");
const ETHERSCAN_API_KEY: string = vars.get("ETHERSCAN_API_KEY");
  // GAS REPORTER
const GASREPORTER_REPORT_GAS = vars.has("GASREPORTER_REPORT_GAS")
const GASREPORTER_API_KEY = vars.get("GASREPORTER_API_KEY")

const config: HardhatUserConfig = {
	solidity: "0.8.25",
	defaultNetwork: "hardhat",

	networks: {
		localhost: {
			url: LOCALHOST_RPC_URL,
			accounts: [LOCALHOST_ACCOUNT_KEY_ONE, LOCALHOST_ACCOUNT_KEY_TWO],
		},

		sepolia: {
		  url: SEPOLIA_RPC_URL,
		  chainId: 11155111,
		  accounts: [SEPOLIA_ACCOUNT_KEY],
		}
	},

	etherscan: {
	  apiKey: {
	    sepolia: ETHERSCAN_API_KEY
	  }
	},

	gasReporter: {
		enabled: GASREPORTER_REPORT_GAS,
		currency: "KES",
		coinmarketcap: GASREPORTER_API_KEY,
		outputFile: "./gas-report/report.txt",
		outputJSONFile: "./gas-report/report.json",
    outputJSON: true,
	},
}

export default config;
