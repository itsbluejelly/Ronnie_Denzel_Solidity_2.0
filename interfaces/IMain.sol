// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

// DECLARING A PERSON STRUCT
import "structs.sol";

interface IMainContract{
    function getPerson(address _contractAddress, address _ownerAddress, uint _index) external view returns(Person memory);
    function getOwner(address _contractAddress, uint _index) external view returns(address);
    function createContract() external;
    function createPerson(address _contractAddress, address _ownerAddress, string calldata _name, uint _favouriteNumber) external;
    function incrFavouriteNumber(address _contractAddress, address _ownerAddress, uint _value, Person calldata _person) external;
    function decrFavouriteNumber(address _contractAddress, address _ownerAddress, uint _value, Person calldata _person) external;
}