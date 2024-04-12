// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

// IMPORTING STRUCTS
import "./structs.sol";

contract SimpleStorage{
    // DECLARING VARIABLES
    mapping (address => Person[]) public peopleMap;
    address[] public ownerAddresses;

    // A FUNCTION TO CREATE A PERSON
    function _createPerson(address _ownerAddress, string calldata _name, uint _favouriteNumber) external  {
        // CREATING A PERSON AND ADDING THEM TO THE LIST OF THE RELEVANT OWNER
        Person[] storage people = peopleMap[_ownerAddress];
        people.push(Person(_name, _favouriteNumber));

        // ADDING THE ADDRESS TO THE LIST OF OWNERS, IF NOT ALREADY PRESENT
        for(uint i = 0; i < ownerAddresses.length; i++){
            if(ownerAddresses[i] == _ownerAddress) return;
        }

        ownerAddresses.push(_ownerAddress);
    }
}