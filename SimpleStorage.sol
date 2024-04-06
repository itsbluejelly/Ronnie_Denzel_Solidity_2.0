// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract SimpleStorage{
    // DECLARING STRUCTS
    struct Person{
        string name;
        uint favouriteNumber;
    }

    // DECLARING VARIABLES
    mapping (address => Person[]) public peopleMap;

    // A FUNCTION TO CREATE A PERSON
    function createPerson(string calldata _name, uint _favouriteNumber) external{
        Person[] storage people = peopleMap[msg.sender];
        people.push(Person(_name, _favouriteNumber));
    }
}