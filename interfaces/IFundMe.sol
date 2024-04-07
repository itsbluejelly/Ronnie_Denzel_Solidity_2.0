// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

interface IFundMe{
    function setFundAmount(uint _value) external;
    function fund() external payable;
    function withdraw() external;
    function refund(address payable _refundAddress) external;

    error InsufficientFunds(); // ERROR RAISED IF FUNDS ARE INSUFFICIENT
    error FailedTransaction(); // ERROR RAISED IF TRANSACTION FAILED
    error InvalidRefund(); // ERROR RAISED IF THERE IS NO REFUND

    event funded(address indexed payer, uint amount);
}