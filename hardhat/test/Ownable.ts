/* 
  THIS TEST IS FOR THE OWNABLE CONTRACT WHICH IS BY DEFAULT ABSTRACT, SO IT IS NOT DEPLOYED IN ACTUALITY BUT TESTED UPON IRREGARDLES 
*/

// IMPORTING NECESSARY FILES
	// IMPORTING MODULES
import {web3} from "hardhat"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import {expect} from "chai"
	// IMPORTING ABIS
import {abi as OwnableContractABI, bytecode} from "../artifacts/contracts/@openzeppelin/contracts/access/Ownable.sol/Ownable.json"

// A TEST FOR THE OWNABLE CONTRACT
describe("OwnableContract", () => {
	async function deployContract(){
			// 1. GET A WEB3 ACCOUNT FROM THE WALLET
		console.log("Obtaining 2 accounts with sufficient funds...")
		const [mainAccount, otherAccount] = await web3.eth.getAccounts()
		const mainAccountBalance: string = web3.utils.fromWei(await web3.eth.getBalance(mainAccount), "ether")
		const otherAccountBalance: string = web3.utils.fromWei(await web3.eth.getBalance(otherAccount), "ether")
		console.log(`Account obtained successfully\n\t1. Main account address: ${mainAccount}\n\t2. Main account balance: ${parseFloat(mainAccountBalance).toFixed(4)} ETH\n\t3. Other account address: ${otherAccount}\n\t4. Other account balance: ${parseFloat(otherAccountBalance).toFixed(4)} ETH\n`)
			// 2. CREATE A CONTRACT
		console.log("Generating the Ownable Contract...")
		const rawContract = new web3.eth.Contract(OwnableContractABI)
		console.log("Raw contract generated successfully\n")
			// 3. FEPLOY THE CONTRACT
		console.log("Deploying the contract...")
		
		const gasEstimate: string = web3.utils.fromWei(await rawContract.deploy({
				data: bytecode,
				arguments: [mainAccount],
			}).estimateGas({ from: mainAccount }), 
			
			"ether"
		);

		const deployedContract = await rawContract.deploy({
			data: bytecode,
			arguments: [mainAccount],
		}).send({from: mainAccount})

		console.log(`Contract deployed successfully\n\t1. Contract address: ${deployedContract.options.address}\n\t2. Gas fees: ${parseFloat(gasEstimate).toFixed(4)} ETH\n`)

		return {mainAccount, otherAccount, rawContract, deployedContract}
	}

	describe("Deployment", () => {
		it("Should throw an error if a null address is set as the owner", async() => {
			const {rawContract, mainAccount} = await loadFixture(deployContract)
			console.log("Deploying the contract with the wrong initialOwner parameter...")

			await expect(rawContract.deploy({
					data: bytecode,
					arguments: ["0x0000000000000000000000000000000000000000"],
				}).send({ from: mainAccount })
			).to.be.rejectedWith("Error happened while trying to execute a function inside a smart contract", "An error should throw if the initialOwner is 0")
		})

		it("Should set the new owner to the one passed as an argument", async() => {
			const {rawContract, mainAccount} = await loadFixture(deployContract)
				// 1. DEPLOYING THE CONTRACT
			console.log("Deploying the contract to check if owner is set appropriately...")
		
			const gasEstimate: string = web3.utils.fromWei(await rawContract.deploy({
					data: bytecode,
					arguments: [mainAccount],
				}).estimateGas({ from: mainAccount }), 
				
				"ether"
			);

			const deployedContract = await rawContract.deploy({
				data: bytecode,
				arguments: [mainAccount],
			}).send({from: mainAccount})

			console.log(`Contract deployed successfully\n\t1. Contract address: ${deployedContract.options.address}\n\t2. Gas fees: ${parseFloat(gasEstimate).toFixed(4)} ETH\n`)
				// 2. CALLING FOR THE OWNER
			console.log("Checking the current owner...")
			const ownerAddress: string = await deployedContract.methods.owner().call()
			
			expect(ownerAddress).to.equal(mainAccount)
		})

		it("Should emit an event when the new owner is initiated", async() => {
			const {rawContract, mainAccount} = await loadFixture(deployContract)
			console.log("Deploying the contract to check if event relating to the owner is emitted...")

			expect(await rawContract.deploy({
					data: bytecode,
					arguments: [mainAccount]
				}).send({from: mainAccount})
			).to.emit(rawContract, "OwnershipTransferred")
			.withArgs("0x0000000000000000000000000000000000000000", mainAccount)
		})
	})

	describe("Functionality", () => {
		it("Should return the current owner", async() => {
			const {deployedContract, mainAccount} = await loadFixture(deployContract)
			console.log("Checking if the current owner is the current account used...")
			const ownerAddress: string = await deployedContract.methods.owner().call()

			expect(ownerAddress).to.equal(mainAccount)
		})

		it("Should throw an error if a non-owner renounces contract ownership", async() => {
			const {deployedContract, otherAccount} = await loadFixture(deployContract)
			console.log("Renouncing ownership with the wrong address...")

			await expect(deployedContract.methods.renounceOwnership().send({ from: otherAccount }))
				.to.be.rejectedWith("Error happened while trying to execute a function inside a smart contract", "An error should throw if the sender is not the current owner");
		})

		it("Should renounce the ownership of the contract to a null address", async() => {
			const {deployedContract, mainAccount} = await loadFixture(deployContract)
				// 1. RENOUNCING OWNERSHIP
			console.log("Renouncing the ownership of the contract...")

			const gasEstimate: string = web3.utils.fromWei(
				await deployedContract.methods.renounceOwnership().estimateGas({from: mainAccount}),
				"ether"
			)

			await deployedContract.methods.renounceOwnership().send({from: mainAccount})
			console.log(`Ownership renounced successfully\n\t- Gas fees: ${parseFloat(gasEstimate).toFixed(4)} ETH\n`)
				// 2. CHECKING CURRENT ADDRESS
			console.log("Checking the current contract owner...")
			const ownerAddress: string = await deployedContract.methods.owner().call()

			expect(ownerAddress).to.equal("0x0000000000000000000000000000000000000000")
		})

		it("Should emit an event when the new owner is a null address after renounciation", async() => {
			const {deployedContract, mainAccount} = await loadFixture(deployContract)
			console.log("Checking for the owner-related event being emitted...")

			expect(await deployedContract.methods.renounceOwnership().send({ from: mainAccount }))
				.to.emit(deployContract, "OwnershipTransferred")
				.withArgs(mainAccount, "0x0000000000000000000000000000000000000000")
		})

		it("Should throw an error if a non-owner transfers contract ownership", async() => {
			const {deployedContract, otherAccount, mainAccount} = await loadFixture(deployContract)
			console.log("Transferring ownership with the wrong address...")

			await expect(
				deployedContract.methods.transferOwnership(mainAccount).send({ from: otherAccount })
			).to.be.rejectedWith("Error happened while trying to execute a function inside a smart contract", "An error should throw if a non-owner transfers ownership");
		})

		it("Should throw an error if a null address receives contract ownership", async() => {
			const {deployedContract, mainAccount} = await loadFixture(deployContract)
			console.log("Transferring ownership to a null address...")

			await expect(
				deployedContract.methods.transferOwnership("0x0000000000000000000000000000000000000000")
					.send({ from: mainAccount })
			).to.be.rejectedWith("Error happened while trying to execute a function inside a smart contract", "An error should throw if ownership is transferred to a null address");
		})

		it("Should transfer contract ownership to another real account address", async () => {
			const {deployedContract, mainAccount, otherAccount} = await loadFixture(deployContract)
				// 1. TRANSFERRING OWNERSHIP
			console.log("Transferring the ownership of the contract...")

			const gasEstimate: string = web3.utils.fromWei(
				await deployedContract.methods.transferOwnership(otherAccount)
					.estimateGas({from: mainAccount}),
				"ether"
			)

			await deployedContract.methods.transferOwnership(otherAccount).send({from: mainAccount})
			console.log(`Ownership renounced successfully\n\t- Gas fees: ${parseFloat(gasEstimate).toFixed(4)} ETH\n`)
				// 2. CHECKING CURRENT ADDRESS
			console.log("Checking the current contract owner...")
			const ownerAddress: string = await deployedContract.methods.owner().call()

			expect(ownerAddress).to.equal(otherAccount)
		});

		it("Should emit an event when the new owner is transferred ownership", async() => {
			const {deployedContract, mainAccount, otherAccount} = await loadFixture(deployContract)
			console.log("Checking for the owner-related event being emitted after transfer...")

			expect(
				await deployedContract.methods.transferOwnership(otherAccount).send({ from: mainAccount })
			).to.emit(deployContract, "OwnershipTransferred")
				.withArgs(mainAccount, otherAccount)
		})
	})
})