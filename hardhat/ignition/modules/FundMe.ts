// IMPORTING NECESSARY TYPES
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { web3 } from "hardhat";

// CREATING A MODULE TO DEPLOY THE FUNDME CONTRACT
const FundMeDeployer = buildModule("FundMeModule", (builder) => {
    // DECLARING VARIABLES
  const fundAmount: string = web3.utils.toWei("0.001", "ether");
    // CREATING THE FUNDME CONTRACT
  const FUND_AMOUNT = builder.getParameter("_fundAmount", fundAmount);
  const FundMeContract = builder.contract("FundMe", [FUND_AMOUNT]);

  return { FundMeContract };
});

export default FundMeDeployer;
