// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract zkABAC1781548817996 {
    address public owner;
    bytes32 private fileHash;

    // Mapping to store authorized addresses
    mapping(address => bool) public authorizedAddresses;

    // Events to log when an address is authorized or revoked
    event Authorized(address indexed user);
    event Revoked(address indexed user);

    // Modifier to check if the sender is authorized
    modifier onlyAuthorized() {
        require(authorizedAddresses[msg.sender], "Not authorized");
        _;
    }

    // Constructor of the contract, the address deploying the contract becomes the owner
    constructor() {
        owner = msg.sender;
        authorizedAddresses[owner] = true;
    }

    // Function to authorize an address
    function authorize(address user) external {
        require(msg.sender == owner, "Only the owner can authorize");
        require(user != address(0), "Invalid address");

        authorizedAddresses[user] = true;
        emit Authorized(user);
    }

    // Function to revoke authorization for an address
    function revoke(address user) external {
        require(msg.sender == owner, "Only the owner can revoke");
        require(user != address(0), "Invalid address");

        authorizedAddresses[user] = false;
        emit Revoked(user);
    }

    function evaluateConstraint_C1_(
        string memory subjectRole
    ) public view onlyAuthorized returns (bool) {
        return
            keccak256(abi.encodePacked(subjectRole)) ==
            keccak256(abi.encodePacked("bachelor student"));
    }

    function evaluateConstraint_C2_(
        uint gradeAverage
    ) public view onlyAuthorized returns (bool) {
        uint rightOperand = 27;

        return gradeAverage >= rightOperand;
    }

    function evaluateConstraint_C3_(
        uint gradeAverage
    ) public view onlyAuthorized returns (bool) {
        uint rightOperand = 30;

        return gradeAverage <= rightOperand;
    }

    function evaluateConstraint_C4_(
        uint enrollmentYear
    ) public view onlyAuthorized returns (bool) {
        uint rightOperand = 3;

        return enrollmentYear <= rightOperand;
    }

    function evaluateConstraint_C5_(
        uint enrollmentYear
    ) public view onlyAuthorized returns (bool) {
        uint rightOperand = 1;

        return enrollmentYear >= rightOperand;
    }

    function evaluate_(
        string memory subjectRole,
        uint gradeAverage,
        uint enrollmentYear
    ) public view onlyAuthorized returns (bool) {
        if (
            (evaluateConstraint_C5_(enrollmentYear) &&
                evaluateConstraint_C4_(enrollmentYear) &&
                evaluateConstraint_C3_(gradeAverage) &&
                evaluateConstraint_C2_(gradeAverage) &&
                evaluateConstraint_C1_(subjectRole))
        ) return true;
        else return false;
    }
}
