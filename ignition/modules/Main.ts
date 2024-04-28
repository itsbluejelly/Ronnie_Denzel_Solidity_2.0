import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// A MODULE TO DEPLOY MAIN CONTRACT
const mainModule = buildModule("mainModule", (builder) => {
    const MainContract = builder.contract("MainContract")
    return {MainContract}
})

export default mainModule