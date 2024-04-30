// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

library AddressArray{
    // FUNCTION TO CHECK IF AN ADRESS INCLUDES A VALUE
    ///@dev [1, 2, 3].includes(4) = false
    function includes(address[] memory _array, address _searchElement) internal pure returns(bool){
        bool isFound = false;

        for(uint i = 0; i < _array.length; i++){
            if(_array[i] == _searchElement) return isFound = true;
        }

        return isFound;
    }
}