// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

// IMPORTING NECESSARY FILES
    // IMPORTING INTERFACES
import "interfaces/IFundMe.sol";
    // IMPORTING CONTRACTS
import "@openzeppelin/contracts/access/Ownable.sol";
    // IMPORTING LIBRARIES
import "libraries/AddressArray.sol";

contract FundMe is IFundMe, Ownable(msg.sender){
    // DECLARING LIBRARIES
    using AddressArray for address[];

    // DEFINING VARIABLES
    mapping(address => uint) public payerAmountMapping;
    address[] public payerAddresses;
    uint public fundAmount; 

    // A CONSTRUCTOR TO SET THE INITIAL CNTRACT VALUES
    constructor(uint _fundAmount) onlyOwner{
        fundAmount = _fundAmount;
    }

    // A FUNCTION TO SET THE MINIMUM AMOUNT
    function setFundAmount(uint _value) external onlyOwner{
        fundAmount = _value;
    }

    // A FUNCTION TO ACCEPT FUNDS FROM USERS
    function fund() external payable{
        // CHECK IF VALUE SENT IS GREATER THAN OR EQUAL TO MIN AMOUNT
       if(msg.value < fundAmount){
        revert InsufficientFunds();
       }

        // RECORDING TRANSACTION
       payerAmountMapping[_msgSender()] += msg.value;
       if(!payerAddresses.includes(_msgSender())) payerAddresses.push(_msgSender());
    }

    // A FUNCTION TO WITHDRAW FUNDS BY THE OWNER
    function withdraw() external onlyOwner{
        // CARRYING OUT TRANSACTION
        address payable currentOwner = payable(owner());
        uint currentValue = address(this).balance;
        (bool success, ) = currentOwner.call{value: currentValue}("");

        // CHECK IF TRANSACTION WENT THROUGH
        if(!success){
            revert FailedTransaction();
        }

        // RESET THE PAYER RECORDS
        for(uint i = 0; i < payerAddresses.length; i++){
            address currentAddress = payerAddresses[i];
            payerAmountMapping[currentAddress] = 0;
        }

        payerAddresses = new address[](0);
    }

    // A FUNCTION TO REFUND THE EXCESSIVELY PAYING USER
    function refund(address payable _refundAddress) external onlyOwner{
        // GET THE EXCESS AMOUNT TO REFUND
        require(payerAddresses.includes(_refundAddress), "This address is not a registered payer");
        uint excessAmount = payerAmountMapping[_refundAddress] - fundAmount;

        // IF AMOUNT IS LESS THAN OR EQUAL TO ZERO, RAISE AN ERROR
        if(excessAmount <= 0){
            revert InvalidRefund();
        }

        // CARRY OUT TRANSACTION OF EXCESS AMOUNT
        payerAmountMapping[_refundAddress] = fundAmount;
        (bool success, ) = _refundAddress.call{value: excessAmount}("");

        // CHECK IF TRANSACTION WENT THROUGH
        if(!success){
            revert FailedTransaction();
        }
    }
}