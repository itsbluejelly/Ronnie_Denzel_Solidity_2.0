// IMPORTING NECESSARY FILES
    // IMPORTING TYPES
import { AccountType, EventType } from "../types/types"
    // IMPORTING ABIS
import {abi as FundMeContractABI} from "../artifacts/contracts/FundMe.sol/FundMe.json"
    // IMPORTING MODULES
import {web3} from "hardhat"
import { vars } from "hardhat/config";

// A FUNCTION TO GET THE HIGHEST BALANCED ACOUNT
async function getRichestAccount(accounts: string[]): Promise<AccountType>{
    // Map each account to an object with the balance as a BigNumber
    const arrangedAccounts: AccountType[] = await Promise.all(accounts.map(async (account) => ({
        account,
        balance: await web3.eth.getBalance(account)
    })));


    // LOOP THROUGH THE NEW LIST TO GET THE ARRANGED ACCOUNTS
    for(let first: number = 0; first < arrangedAccounts.length; first++){
        for(let second: number = first + 1; second < arrangedAccounts.length; second++){
            let firstAccount: AccountType = arrangedAccounts[first]
            let secondAccount: AccountType = arrangedAccounts[second]

            if(firstAccount.balance < secondAccount.balance){
                const tempAccount: AccountType = firstAccount
                firstAccount = secondAccount
                secondAccount = tempAccount
            }
        }
    }

    // RETURN THE ACCOUNT WITH THE HIGHEST BALANCE
    return arrangedAccounts[0]
}

// A SCRIPT TO TEST OUT THE FUNCTIONALITY AFTER DEPLOYMENT
async function FundMeTest(
  contractAddress: string
): Promise<void> {
  try {
    // 1. GET A WEB3 WALLET
    console.log("Preparing an account with most sufficient funds...");
    const accounts: string[] = await web3.eth.getAccounts();
    const { account: mainAccount, balance: accountBalance } =
      await getRichestAccount(accounts);

    console.log(
      `Account obtained successfully\n\t- Account address: ${mainAccount}\n\t- Account balance: ${parseFloat(
        web3.utils.fromWei(accountBalance, "ether")
      ).toFixed(5)} ETH\n`
    );

    // 2. CREATE A CONTRACT
    console.log("Creating the FundMe contract...");
    const deployedContract = new web3.eth.Contract(
      FundMeContractABI,
      contractAddress
    );
    console.log(`Contract found successfully at address: ${contractAddress}\n`);
    // 3. INTERACT WITH THE CONTRACT
    // A FUNCTION TO GET THE CURRENT OWNER
    console.log("Getting the address of the current owner...");
    let gasEstimate: string = web3.utils.fromWei(
      await deployedContract.methods.owner().estimateGas(),
      "ether"
    );
    let currentOwner: string = await deployedContract.methods.owner().call();

    console.log(
      `Owner found successfully\n\t- Current owner: ${currentOwner}\n\t- Gas used: ${parseFloat(
        gasEstimate
      ).toFixed(4)} ETH\n`
    );

    // A FUNCTION TO GET THE CURRENT FUND AMOUNT
    console.log("Getting the current fund amount...");
    gasEstimate = web3.utils.fromWei(
      await deployedContract.methods.fundAmount().estimateGas(),
      "ether"
    );
    const currentFundAmount: string = await deployedContract.methods
      .fundAmount()
      .call();

    console.log(
      `Fund amount found successfully\n\t- Current fund amount: ${parseFloat(
        web3.utils.fromWei(currentFundAmount, "ether")
      ).toFixed(4)}\n\t- Gas used: ${parseFloat(gasEstimate).toFixed(4)} ETH\n`
    );

    // A FUNCTION TO FUND THE CONTRACT EXCESSIVELY
    console.log("Funding the contract excessively...");
    const depositValue: string = web3.utils.toWei("0.01", "ether");

    console.log("Connected, ready to listen for event...");

    gasEstimate = web3.utils.fromWei(
      await deployedContract.methods.fund().estimateGas({
        value: depositValue,
        from: mainAccount,
      }),

      "ether"
    );

    await deployedContract.methods.fund().send({
      value: depositValue,
      from: mainAccount,
    });

    let currentBalance: string = web3.utils.fromWei(
      await web3.eth.getBalance(mainAccount),
      "ether"
    );

    console.log(
      `Transaction went through successfully\t- Deposited value: ${parseFloat(
        web3.utils.fromWei(depositValue, "ether")
      ).toFixed(4)} ETH\n\t- Gas used: ${parseFloat(gasEstimate).toFixed(
        4
      )} ETH\n\t- Current balance: ${parseFloat(currentBalance).toFixed(
        4
      )} ETH\n`
    );

    // A FUNCTION TO GET THE 1ST DEPOSITOR
    console.log("Getting the 1st depositor...");
    gasEstimate = web3.utils.fromWei(
      await deployedContract.methods.payerAddresses(0).estimateGas(),
      "ether"
    );
    const firstDepositor: string = await deployedContract.methods
      .payerAddresses(0)
      .call();

    console.log(
      `First depositor found successfully\n\t- Depositor address: ${firstDepositor}\n\t- Gas used: ${parseFloat(
        gasEstimate
      ).toFixed(4)} ETH\n`
    );

    // A FUNCTION TO GET THE AMOUNT I DEPOSITED
    console.log("Getting the money deposited...");
    gasEstimate = web3.utils.fromWei(
      await deployedContract.methods
        .payerAmountMapping(mainAccount)
        .estimateGas(),
      "ether"
    );
    let depositedValue: string = await deployedContract.methods
      .payerAmountMapping(mainAccount)
      .call();

    console.log(
      `Amount found successfully\n\t- Previous deposit: ${parseFloat(
        web3.utils.fromWei(depositedValue, "ether")
      ).toFixed(4)}\n\t- Gas used: ${parseFloat(gasEstimate).toFixed(4)} ETH\n`
    );

    if (mainAccount === currentOwner) {
      // A FUNCTION TO REFUND THE EXCESS MONEY
      console.log("Refunding the excess money...");

      gasEstimate = web3.utils.fromWei(
        await deployedContract.methods.refund(mainAccount).estimateGas({
          from: mainAccount,
        }),

        "ether"
      );

      await deployedContract.methods
        .refund(mainAccount)
        .send({ from: mainAccount });
      currentBalance = web3.utils.fromWei(
        await web3.eth.getBalance(mainAccount),
        "ether"
      );
      depositedValue = await deployedContract.methods
        .payerAmountMapping(mainAccount)
        .call();

      console.log(
        `Transaction went through successfully\t- Deposited value: ${parseFloat(
          web3.utils.fromWei(depositedValue, "ether")
        ).toFixed(4)} ETH\n\t- Gas used: ${parseFloat(gasEstimate).toFixed(
          4
        )} ETH\n\t- Current balance: ${parseFloat(currentBalance).toFixed(
          4
        )} ETH\n`
      );

      // A FUNCTION TO WITHDRAW ALL THE MONEY
      console.log("Withdrawing the money deposited...");

      gasEstimate = web3.utils.fromWei(
        await deployedContract.methods.withdraw().estimateGas({
          from: mainAccount,
        }),
        "ether"
      );

      await deployedContract.methods.withdraw().send({ from: mainAccount });
      currentBalance = web3.utils.fromWei(
        await web3.eth.getBalance(mainAccount),
        "ether"
      );
      const contractBalance: string = web3.utils.fromWei(
        await web3.eth.getBalance(contractAddress),
        "ether"
      );

      console.log(
        `Transaction went through successfully\t- Contract balance: ${parseFloat(
          contractBalance
        ).toFixed(4)} ETH\n\t- Gas used: ${parseFloat(gasEstimate).toFixed(
          4
        )} ETH\n\t- Current balance: ${parseFloat(currentBalance).toFixed(
          4
        )} ETH\n`
      );

    //   // A FUNCTION TO FINALLY TRANSFER OWNERSHIP
    //   console.log("Terminating ownership...");

    //   gasEstimate = web3.utils.fromWei(
    //     await deployedContract.methods
    //       .renounceOwnership()
    //       .estimateGas({ from: mainAccount }),

    //     "ether"
    //   );

    //   await deployedContract.methods
    //     .renounceOwnership()
    //     .send({ from: mainAccount });
    //   currentOwner = await deployedContract.methods.owner().call();

    //   console.log(
    //     `Owner found successfully\n\t- Current owner: ${currentOwner}\n\t- Gas used: ${parseFloat(
    //       gasEstimate
    //     ).toFixed(4)} ETH\n`
    //   );
    }
  } catch (error: unknown) {
    console.error(error);
  }
}

FundMeTest(vars.get("SEPOLIA_CONTRACT_ADDRESS"));