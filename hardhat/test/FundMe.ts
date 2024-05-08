// IMPORTING NECESSARY FILES
    // IMPORTING MODULES
import {web3} from "hardhat"
import {expect} from "chai"
import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
    // IMPORTING ABIS
import {abi as FundMeABI, bytecode} from "../artifacts/contracts/FundMe.sol/FundMe.json"

// A TEST FOR THE FUNDME CONTRACT
describe("FundMeContract", () => {
    // A FUNCTION TO DEPLOY THE CONTRACT
    async function deployContract(){
            // 1. GET WEB3 WALLET
        console.log("Obtaining 2 accounts with sufficient funds...")
		const [mainAccount, otherAccount] = await web3.eth.getAccounts()
		const mainAccountBalance: string = web3.utils.fromWei(await web3.eth.getBalance(mainAccount), "ether")
		const otherAccountBalance: string = web3.utils.fromWei(await web3.eth.getBalance(otherAccount), "ether")
		console.log(`Account obtained successfully\n\t1. Main account address: ${mainAccount}\n\t2. Main account balance: ${parseFloat(mainAccountBalance).toFixed(4)} ETH\n\t3. Other account address: ${otherAccount}\n\t4. Other account balance: ${parseFloat(otherAccountBalance).toFixed(4)} ETH\n`)
            // 2. CREATE CONTRACT
        console.log("Creating the FundMe contract...")
        const rawContract = new web3.eth.Contract(FundMeABI)
        console.log("Contract created successfully\n")
            // 3. DEPLOY CONTRACT
        console.log("Deploying the contract...")
        const fundAmount: string = web3.utils.toWei("0.001", "ether")
        
        const gasEstimate: bigint = await rawContract.deploy({
            data: bytecode,
            arguments: [fundAmount]
        }).estimateGas({ from: mainAccount })

        const deployedContract = await rawContract
          .deploy({
            data: bytecode,
            arguments: [fundAmount],
          })
          .send({ from: mainAccount });

        console.log(`Contract deployed successfully.\n\t- Contract address: ${deployedContract.options.address}\n\t- Gas used: ${parseFloat(web3.utils.fromWei(gasEstimate, "ether")).toFixed(4)} ETH\n`)

        return {mainAccount, otherAccount, rawContract, deployedContract, fundAmount}
    }

    describe("Deployment", () => {
		it("Should set the new owner to the deployer address", async() => {
			const {rawContract, mainAccount, fundAmount} = await loadFixture(deployContract)
				// 1. DEPLOYING THE CONTRACT
			console.log("Deploying the contract to check if owner is set appropriately...")
		
			const gasEstimate: string = web3.utils.fromWei(await rawContract.deploy({
					data: bytecode,
					arguments: [fundAmount],
				}).estimateGas({ from: mainAccount }), 
				
				"ether"
			);

			const deployedContract = await rawContract.deploy({
				data: bytecode,
				arguments: [fundAmount],
			}).send({from: mainAccount})

			console.log(`Contract deployed successfully\n\t1. Contract address: ${deployedContract.options.address}\n\t2. Gas fees: ${parseFloat(gasEstimate).toFixed(4)} ETH\n`)
				// 2. CALLING FOR THE OWNER
			console.log("Checking the current owner...")
			const ownerAddress: string = await deployedContract.methods.owner().call()
			
			expect(ownerAddress).to.equal(mainAccount)
		})

		it("Should emit an event when the new owner is initiated", async() => {
			const {rawContract, mainAccount, fundAmount} = await loadFixture(deployContract)
			console.log("Deploying the contract to check if event relating to the owner is emitted...")

			expect(await rawContract.deploy({
					data: bytecode,
					arguments: [fundAmount]
				}).send({from: mainAccount})
			).to.emit(rawContract, "OwnershipTransferred")
			.withArgs("0x0000000000000000000000000000000000000000", mainAccount)
		})

        it("Should set the fund amount to the value declared in deployment", async() => {
            const {rawContract, mainAccount, fundAmount} = await loadFixture(deployContract)
				// 1. DEPLOYING THE CONTRACT
			console.log("Deploying the contract to check if fund amount is set appropriately...")
		
			const gasEstimate: string = web3.utils.fromWei(await rawContract.deploy({
					data: bytecode,
					arguments: [fundAmount],
				}).estimateGas({ from: mainAccount }), 
				
				"ether"
			);

			const deployedContract = await rawContract.deploy({
				data: bytecode,
				arguments: [fundAmount],
			}).send({from: mainAccount})

			console.log(`Contract deployed successfully\n\t1. Contract address: ${deployedContract.options.address}\n\t2. Gas fees: ${parseFloat(gasEstimate).toFixed(4)} ETH\n`)
				// 2. CHECKING THE FUND AMOUNT
			console.log("Checking the fund amount...")
			const currentFundAmount: string = await deployedContract.methods.fundAmount().call()
			
			expect(currentFundAmount).to.equal(fundAmount) 
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

        it("Should return the amount funded by the current account", async() => {
            const {deployedContract, mainAccount, fundAmount} = await loadFixture(deployContract)
                // 1. DEPOSIT MONEY INTO THE ACCOUNT
            console.log("Depositing money into the contract...")

            const gasEstimate: string = web3.utils.fromWei(await deployedContract.methods.fund().estimateGas({
                    from: mainAccount,
                    value: fundAmount
                }), 
                
                "ether"
            )

            await deployedContract.methods.fund().send({
                from: mainAccount,
                value: fundAmount
            })

            console.log(`Deposit done successfully\n\t1. Gas fees: ${parseFloat(gasEstimate).toFixed(4)} ETH\n\t2. Value deducted: ${web3.utils.fromWei(fundAmount, "ether")} ETH\n`)
                // 2. CHECK THE AMOUNT SENT BY THE CURRENT ACCOUNT
            console.log("Checking the value deposited...")
            const depositValue: string = await deployedContract.methods.payerAmountMapping(mainAccount).call()

            expect(depositValue).to.equal(fundAmount, "The deposit value must equal the fund amount")
        })

        it("Should return the first payer address as the current account", async() => {
            const { deployedContract, mainAccount, fundAmount } = await loadFixture(deployContract);
                // 1. DEPOSIT MONEY INTO THE ACCOUNT
            console.log("Depositing money into the contract...");

            const gasEstimate: string = web3.utils.fromWei(
              await deployedContract.methods.fund().estimateGas({
                from: mainAccount,
                value: fundAmount,
              }),

              "ether"
            );

            await deployedContract.methods.fund().send({
              from: mainAccount,
              value: fundAmount,
            });

            console.log(
              `Deposit done successfully\n\t1. Gas fees: ${parseFloat(
                gasEstimate
              ).toFixed(4)} ETH\n\t2. Value deducted: ${web3.utils.fromWei(
                fundAmount,
                "ether"
              )} ETH\n`
            );

                // 2. CHECK THE ADDRESS THAT DEPOSITED FIRST
            console.log("Checking the first depositor...");
            const firstDepositor: string = await deployedContract.methods.payerAddresses(0).call();

            expect(firstDepositor).to.equal(mainAccount, "The first depositor must be the current address")
        })

        it("Should return the current fund amount", async() => {
            const {deployedContract, fundAmount} = await loadFixture(deployContract)
            console.log("Checking the fund amount...");
            const currentFundAmount: string = await deployedContract.methods.fundAmount().call();

            expect(currentFundAmount).to.equal(fundAmount, "The current fund amount must be the set fund amount"); 
        })

        it("Should throw an error if a non-owner tries to update the fund amount", async() => {
            const {deployedContract, otherAccount} = await loadFixture(deployContract)
            console.log("Updating the fund amount with the wrong address...")
            const newFundAmount: string = web3.utils.toWei("0.002", "ether")

            await expect(
              deployedContract.methods
                .setFundAmount(newFundAmount)
                .send({ from: otherAccount })
            ).to.be.rejectedWith(
              "Error happened while trying to execute a function inside a smart contract",
              "An error should throw if the fund amount is updated by a non-owner"
            );
        })

        it("Should set the new fund amount to the one passed as an argument", async() => {
            const {deployedContract, mainAccount} = await loadFixture(deployContract)
                // 1. UPDATE THE FUND AMOUNT
            console.log("Updating the fund amount...")
            const newFundAmount: string = web3.utils.toWei("0.002", "ether");

            const gasEstimate: string = web3.utils.fromWei(
                await deployedContract.methods.setFundAmount(newFundAmount).estimateGas(), "ether"
            )
            
            await deployedContract.methods
              .setFundAmount(newFundAmount)
              .send({ from: mainAccount });

            console.log(
              `Update done successfully\n\t1. Gas fees: ${parseFloat(
                gasEstimate
              ).toFixed(4)} ETH`
            );
                // 2. OBTAIN THE NEW FUND AMOUNT
            console.log("Getting the new fund amount...")
            const currentFundAmount: string = await deployedContract.methods.fundAmount().call();

            expect(currentFundAmount).to.equal(newFundAmount, "The current fund amount must be the set fund amount"); 
        })

        it("Should throw an error if a non-owner tries to withdraw money", async() => {
            const {deployedContract, otherAccount, fundAmount} = await loadFixture(deployContract)
                // 1. DEPOSIT MONEY TO THE CONTRACT
            console.log("Depositing money into the contract...");

            const gasEstimate: string = web3.utils.fromWei(
              await deployedContract.methods.fund().estimateGas({
                from: otherAccount,
                value: fundAmount,
              }),

              "ether"
            );

            await deployedContract.methods.fund().send({
              from: otherAccount,
              value: fundAmount,
            });

            console.log(
              `Deposit done successfully\n\t1. Gas fees: ${parseFloat(
                gasEstimate
              ).toFixed(4)} ETH\n\t2. Value deducted: ${web3.utils.fromWei(
                fundAmount,
                "ether"
              )} ETH\n`
            );
                // 2. WITHDRAW MONEY WRONGFULLY
            console.log("Withdrawing money from the contract with wrong address...")

            await expect(
              deployedContract.methods.withdraw().send({ from: otherAccount })
            ).to.be.rejectedWith(
              "Error happened while trying to execute a function inside a smart contract",
              "An error should throw if the withdrawal is done by a non-owner"
            );
        })

        it("Should withdraw all the money in the contract", async() => {
            const {deployedContract, fundAmount, mainAccount} = await loadFixture(deployContract)
                // 1. DEPOSIT MONEY
            console.log("Depositing money into the contract...");

            let gasEstimate: string = web3.utils.fromWei(
              await deployedContract.methods.fund().estimateGas({
                from: mainAccount,
                value: fundAmount,
              }),

              "ether"
            );

            await deployedContract.methods.fund().send({
              from: mainAccount,
              value: fundAmount,
            });

            let accountBalance: string = web3.utils.fromWei(await web3.eth.getBalance(mainAccount), "ether")

            console.log(
              `Deposit done successfully\n\t1. Gas fees: ${parseFloat(
                gasEstimate
              ).toFixed(4)} ETH\n\t2. New balance: ${parseFloat(accountBalance).toFixed(4)} ETH\n`
            );
                
                // 2. WITHDRAW THE MONEY
            console.log("Withdrawing money from the contract...")
            
            gasEstimate = web3.utils.fromWei(
                await deployedContract.methods
                    .withdraw()
                    .estimateGas({from: mainAccount}),
                    
                "ether"
            )

            await deployedContract.methods
              .withdraw()
              .send({ from: mainAccount })

            accountBalance = web3.utils.fromWei(await web3.eth.getBalance(mainAccount), "ether")

            console.log(
              `Deposit done successfully\n\t1. Gas fees: ${parseFloat(
                gasEstimate
              ).toFixed(4)} ETH\n\t2. New balance: ${parseFloat(
                accountBalance
              ).toFixed(4)} ETH\n`
            );

                // 3. GET THE AMOUNT PREVIOUSLY DEPOSITED
            console.log("Getting the amount deposited initially...")
            const previousDeposit: string = await deployedContract.methods.payerAmountMapping(mainAccount).call()
            
            expect(previousDeposit).to.equal(0n)
                // 4. GET THE 1ST DEPOSITOR
            console.log("Getting the 1st depositor...")

            await expect(deployedContract.methods.payerAddresses(0).call()).to.be.rejectedWith(
              "Error happened while trying to execute a function inside a smart contract",
              "An error should since there is no payer after withdrawal"
            );
        })

        it("Should emit a funded event when the money is withdrawn", async() => {
            const {deployedContract, mainAccount, fundAmount} = await loadFixture(deployContract)
                // 1. DEPOSIT MONEY
            console.log("Depositing money into the contract...");

            let gasEstimate: string = web3.utils.fromWei(
              await deployedContract.methods.fund().estimateGas({
                from: mainAccount,
                value: fundAmount,
              }),

              "ether"
            );

            await deployedContract.methods.fund().send({
              from: mainAccount,
              value: fundAmount,
            });

            console.log(
              `Deposit done successfully\n\t1. Gas fees: ${parseFloat(
                gasEstimate
              ).toFixed(4)} ETH\n\t2. Value sent: ${parseFloat(
                web3.utils.fromWei(fundAmount, "ether")
              ).toFixed(4)} ETH\n`
            );

                // 2. LISTEN TO EVENT
            console.log("Listening to the funded event...")

            expect(await deployedContract.methods.withdraw().send({ from: mainAccount }))
                .to.emit(deployedContract, "funded")
                .withArgs(mainAccount, fundAmount)
        });

        it("Should throw an error if a non-owner tries to refund money", async () => {
            const { deployedContract, otherAccount } = await loadFixture(deployContract);
                // 1. DEPOSIT EXCESS MONEY TO THE CONTRACT
            console.log("Depositing money into the contract...");
            const depositValue: string = web3.utils.toWei("0.002", "ether")

            const gasEstimate: string = web3.utils.fromWei(
              await deployedContract.methods.fund().estimateGas({
                from: otherAccount,
                value: depositValue,
              }),

              "ether"
            );

            await deployedContract.methods.fund().send({
              from: otherAccount,
              value: depositValue,
            });

            console.log(
              `Deposit done successfully\n\t1. Gas fees: ${parseFloat(
                gasEstimate
              ).toFixed(4)} ETH\n\t2. Value deducted: ${web3.utils.fromWei(
                depositValue,
                "ether"
              )} ETH\n`
            );

                // 2. REFUND MONEY WRONGFULLY
            console.log("Refunding money wrongfully...");

            await expect(
              deployedContract.methods
                .refund(otherAccount)
                .send({ from: otherAccount })
            ).to.be.rejectedWith(
              "Error happened while trying to execute a function inside a smart contract",
              "An error should throw if the refunding is done by a non-owner"
            );
        });

        it("Should throw an error if the address refunded to is not a payer", async () => {
            const {deployedContract, mainAccount, otherAccount} = await loadFixture(deployContract)
            console.log("Refunding money to a non-payer...")

            await expect(
              deployedContract.methods
                .refund(otherAccount)
                .send({ from: mainAccount })
            ).to.be.rejectedWith(
              "Error happened while trying to execute a function inside a smart contract",
              "An error should throw if the refunding is done to a non-payer"
            );
        });

        it("Should throw an error if the address refunded to did not pay in excess", async () => {
            const { deployedContract, mainAccount, fundAmount } = await loadFixture(deployContract);
                // 1. DEPOSIT EXACT MONEY TO THE CONTRACT
            console.log("Depositing money into the contract...");

            const gasEstimate: string = web3.utils.fromWei(
              await deployedContract.methods.fund().estimateGas({
                from: mainAccount,
                value: fundAmount,
              }),

              "ether"
            );

            await deployedContract.methods.fund().send({
              from: mainAccount,
              value: fundAmount,
            });

            console.log(
              `Deposit done successfully\n\t1. Gas fees: ${parseFloat(
                gasEstimate
              ).toFixed(4)} ETH\n\t2. Value deducted: ${web3.utils.fromWei(
                fundAmount,
                "ether"
              )} ETH\n`
            );

            // 2. REFUND MONEY WRONGFULLY
            console.log("Refunding money wrongfully...");

            await expect(
              deployedContract.methods
                .refund(mainAccount)
                .send({ from: mainAccount })
            ).to.be.rejectedWith(
              "Error happened while trying to execute a function inside a smart contract",
              "An error should throw if the refunding is done yet the value deposited is exact"
            );
        });

        it("Should refund the excess money", async () => {
            const { deployedContract, mainAccount, fundAmount } = await loadFixture(deployContract);
                // 1. EXCESS DEPOSIT MONEY
            console.log("Depositing excess money into the contract...");
            const depositValue: string = web3.utils.toWei("0.002", "ether")

            let gasEstimate: string = web3.utils.fromWei(
              await deployedContract.methods.fund().estimateGas({
                from: mainAccount,
                value: depositValue,
              }),

              "ether"
            );

            await deployedContract.methods.fund().send({
              from: mainAccount,
              value: depositValue,
            });

            let accountBalance: string = web3.utils.fromWei(
              await web3.eth.getBalance(mainAccount),
              "ether"
            );

            console.log(
              `Deposit done successfully\n\t1. Gas fees: ${parseFloat(
                gasEstimate
              ).toFixed(4)} ETH\n\t2. New balance: ${parseFloat(
                accountBalance
              ).toFixed(4)} ETH\n`
            );

            // 2. REFUND THE MONEY
            console.log("Getting refund from the contract...");

            gasEstimate = web3.utils.fromWei(
              await deployedContract.methods
                .refund(mainAccount)
                .estimateGas({ from: mainAccount }),

              "ether"
            );

            await deployedContract.methods
              .refund(mainAccount)
              .send({ from: mainAccount });

            accountBalance = web3.utils.fromWei(
              await web3.eth.getBalance(mainAccount),
              "ether"
            );

            console.log(
              `Deposit done successfully\n\t1. Gas fees: ${parseFloat(
                gasEstimate
              ).toFixed(4)} ETH\n\t2. New balance: ${parseFloat(
                accountBalance
              ).toFixed(4)} ETH\n`
            );

            // 3. GET THE AMOUNT PREVIOUSLY DEPOSITED
            console.log("Getting the amount deposited initially...");
            const previousDeposit: string = await deployedContract.methods
              .payerAmountMapping(mainAccount)
              .call();

            expect(previousDeposit).to.equal(fundAmount);
        });

        it("Should emit a payer event after the excess payer is refunded", async() => {
            const { deployedContract, mainAccount, fundAmount } = await loadFixture(deployContract);
            // 1. EXCESS DEPOSIT MONEY
            console.log("Depositing excess money into the contract...");
            const depositValue: string = web3.utils.toWei("0.002", "ether");

            let gasEstimate: string = web3.utils.fromWei(
                await deployedContract.methods.fund().estimateGas({
                from: mainAccount,
                value: depositValue,
                }),

                "ether"
            );

            await deployedContract.methods.fund().send({
                from: mainAccount,
                value: depositValue,
            });

            let accountBalance: string = web3.utils.fromWei(
                await web3.eth.getBalance(mainAccount),
                "ether"
            );

            console.log(
                `Deposit done successfully\n\t1. Gas fees: ${parseFloat(
                gasEstimate
                ).toFixed(4)} ETH\n\t2. New balance: ${parseFloat(
                accountBalance
                ).toFixed(4)} ETH\n`
            );

            // 2. LISTEN TO EVENT
            console.log("Listening to the funded event...");

            expect(
                await deployedContract.methods
                .refund(mainAccount)
                .send({ from: mainAccount })
            )
                .to.emit(deployedContract, "funded")
                .withArgs(mainAccount, parseFloat(depositValue) - parseFloat(fundAmount));
        })
    })

    describe("Financials", () => {
        it("Should throw an error if the value sent is less than the fund amount", async() => {
            const {deployedContract, mainAccount} = await loadFixture(deployContract)
            const depositValue: string = web3.utils.toWei("0.0001", "ether")

            await expect(
              deployedContract.methods.fund().send({
                from: mainAccount,
                value: depositValue,
              })
            ).to.be.rejectedWith(
              "Error happened while trying to execute a function inside a smart contract",
              "An error should throw if the value is less than the fund amount"
            );
        })

        it("Should deposit money to the contract", async() => {
            const { deployedContract, fundAmount, mainAccount } = await loadFixture(deployContract);
                // 1. DEPOSIT MONEY
            console.log("Depositing money into the contract...");

            let gasEstimate: string = web3.utils.fromWei(
              await deployedContract.methods.fund().estimateGas({
                from: mainAccount,
                value: fundAmount,
              }),

              "ether"
            );

            await deployedContract.methods.fund().send({
              from: mainAccount,
              value: fundAmount,
            });

            console.log(
              `Deposit done successfully\n\t1. Gas fees: ${parseFloat(
                gasEstimate
              ).toFixed(4)} ETH\n\t2. New balance: ${parseFloat(
                web3.utils.fromWei(fundAmount, "ether")
              ).toFixed(4)} ETH\n`
            );

                // 2. GET THE AMOUNT DEPOSITED
            console.log("Getting the amount deposited...");
            
            const depositValue: string = await deployedContract.methods
              .payerAmountMapping(mainAccount)
              .call();

            expect(depositValue).to.equal(fundAmount);
                // 3. GET THE 1ST DEPOSITOR
            console.log("Getting the 1st depositor...");
            const payerAddress: string = await deployedContract.methods.payerAddresses(0).call();

            expect(payerAddress).to.equal(mainAccount)
        })

        it("Should emit a payer event after deposition", async() => {
            const {deployedContract, fundAmount, mainAccount} = await loadFixture(deployContract)
            console.log("Listening for funded event...")

            expect(
                await deployedContract.methods
                    .fund()
                    .send({
                        from: mainAccount,
                        value: fundAmount
                    })
            ).to.emit(deployedContract, "funded")
            .withArgs(mainAccount, fundAmount)
        })
    })
})