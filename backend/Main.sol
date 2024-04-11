// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

// IMPORTING NECESSARY FILES
    // IMPORTING CONTRACTS
import "./contracts/AdvancedStorage.sol";
    // IMPORTING INTERFACES
import "./interfaces/IMain.sol";

contract MainContract is IMainContract{
    // DECLARING VARIABLES
    address[] public contractAddresses;

    // A MODIFIER TO CHECK IF A CONTRACT IS A REGISTERED CONTRACT
    modifier onlyExistingContract(address _contractAddress){
        require(_isContract(_contractAddress), "This contract doesn't exist");
        _;
    }

    // A FUNCTION TO CHECK IF A CONTRACT REALLY IS A REGISTERED CONTRACT
    function _isContract(address _address) private view returns(bool){
        bool isContract = false;

        for(uint i = 0; i < contractAddresses.length; i++){
            if(contractAddresses[i] == _address) return isContract = true;
        }

        return isContract;
    }

    // A FUNCTION TO GET THE PEOPLE OWNED BY A CRETAIN ADDRESS IN A CERTAIN CONTRACT
    function getPerson(
        address _contractAddress, 
        address _ownerAddress,
        uint _index
    ) external view onlyExistingContract(_contractAddress) returns(Person memory){
        AdvancedStorage advancedStorage = AdvancedStorage(_contractAddress);
        (string memory name, uint favouriteNumber) = advancedStorage.peopleMap(_ownerAddress, _index);
        return Person(name, favouriteNumber);
    }

        // A FUNCTION TO GET OWNERS OF PEOPLE IN A CERTAIN CONTRACT
    function getOwner(
        address _contractAddress,
        uint _index
    ) external view onlyExistingContract(_contractAddress) returns(address){
        AdvancedStorage advancedStorage = AdvancedStorage(_contractAddress);
        return advancedStorage.ownerAddresses(_index);
    }

    // A FUNCTION TO CREATE A CONTRACT
    function createContract() external{
        AdvancedStorage advancedStorage = new AdvancedStorage();
        contractAddresses.push(address(advancedStorage));
    }

    // A FUNCTION TO CALL A CONTRACT'S FUNCTION TO CREATE A PERSON
    function createPerson(
        address _contractAddress, 
        address _ownerAddress, 
        string calldata _name, 
        uint _favouriteNumber
    ) external onlyExistingContract(_contractAddress){
        AdvancedStorage advancedStorage = AdvancedStorage(_contractAddress);
        advancedStorage._createPerson(_ownerAddress, _name, _favouriteNumber);
    }

    // A FUNCTION TO CALL A CONTRACT'S FUNCTION TO INCREASE A PERSON'S FAVOURITE NUMBER
    function decrFavouriteNumber(
        address _contractAddress, 
        address _ownerAddress, 
        uint _value, 
        Person calldata _person
    ) external onlyExistingContract(_contractAddress){
        AdvancedStorage advancedStorage = AdvancedStorage(_contractAddress);
        advancedStorage._decrFavouriteNumber(_ownerAddress, _value, _person);
    }

    // A FUNCTION TO CALL A CONTRACT'S FUNCTION TO DECREASE A PERSON'S FAVOURITE NUMBER
    function incrFavouriteNumber(
        address _contractAddress, 
        address _ownerAddress, 
        uint _value, 
        Person calldata _person
    ) external{
        AdvancedStorage advancedStorage = AdvancedStorage(_contractAddress);
        advancedStorage._incrFavouriteNumber(_ownerAddress, _value, _person);
    }
}