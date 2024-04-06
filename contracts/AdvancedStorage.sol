// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

// IMPORTING NECESSARY FILES
    // IMPORTING CONTRACTS
import "contracts/SimpleStorage.sol";
    // IMPORTING LIBRARIES
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract AdvancedStorage is SimpleStorage{
    // DECLARING LIBRARIES
    using SafeMath for uint;

    // A MODIFIER TO CHECK IF AN ADDRESS IS A REGISTERED OWNER
    modifier onlyOwner(address _ownerAddress){
        require(_isOwner(_ownerAddress), "You must be a registered owner to access a person");
        _;
    }

    // A FUNCTION TO CHECK IF AN ADDRESS REALLY IS AN OWNER
    function _isOwner(address _address) private view returns(bool){
        bool isOwner = false;

        for(uint i = 0; i < ownerAddresses.length; i++){
            if(ownerAddresses[i] == _address) return isOwner = true;
        }

        return isOwner;
    }

    // A FUNCTION TO INCREASE THE VALUE OF A PERSON'S FAVOURITE NUMBER
    function _incrFavouriteNumber(
        address _ownerAddress, 
        uint _value, 
        Person calldata _person
    ) external onlyOwner(_ownerAddress){
        Person[] storage ownedPeople = peopleMap[_ownerAddress];

        for(uint i = 0; i < ownedPeople.length; i++){
            Person storage currentPerson = ownedPeople[i];

            if(
                keccak256(abi.encodePacked(currentPerson.name)) == keccak256(abi.encodePacked( _person.name)) &&
                currentPerson.favouriteNumber == _person.favouriteNumber
            ){
                (bool status, uint answer) = currentPerson.favouriteNumber.tryAdd(_value);
                require(status, "An error occured during addition");
                currentPerson.favouriteNumber = answer;
            }
        }
    }

    // A FUNCTION TO DECREASE THE VALUE OF A PERSON'S FAVOURITE NUMBER
    function _decrFavouriteNumber(
        address _ownerAddress, 
        uint _value, 
        Person calldata _person
    ) external onlyOwner(_ownerAddress){
        Person[] storage ownedPeople = peopleMap[_ownerAddress];

        for(uint i = 0; i < ownedPeople.length; i++){
            Person storage currentPerson = ownedPeople[i];

            if(
                keccak256(abi.encodePacked(currentPerson.name)) == keccak256(abi.encodePacked( _person.name)) &&
                currentPerson.favouriteNumber == _person.favouriteNumber
            ){
                (bool status, uint answer) = currentPerson.favouriteNumber.trySub(_value);
                require(status, "An error occured during subtraction");
                currentPerson.favouriteNumber = answer;
            }
        }
    }
}