// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract simple1781549271453 {
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

    function evaluateConstraint_C1_FirstPermission(
        uint dateTime
    ) public view onlyAuthorized returns (bool) {
        return dateTime < 1781506800000;
    }

    function evaluateConstraint_C2_FirstPermission(
        string memory name
    ) public view onlyAuthorized returns (bool) {
        return
            keccak256(abi.encodePacked(name)) ==
            keccak256(abi.encodePacked("Francesco"));
    }

    function evaluateConstraint_C3_FirstPermission(
        uint age
    ) public view onlyAuthorized returns (bool) {
        uint rightOperand = 18;

        return age > rightOperand;
    }

    function evaluate_FirstPermission(
        uint dateTime,
        string memory name,
        uint age
    ) public view onlyAuthorized returns (bool) {
        if (
            (evaluateConstraint_C2_FirstPermission(name) ||
                evaluateConstraint_C1_FirstPermission(dateTime)) &&
            (evaluateConstraint_C3_FirstPermission(age) &&
                evaluateConstraint_C2_FirstPermission(name)) &&
            (evaluateConstraint_C3_FirstPermission(age) &&
                evaluateConstraint_C1_FirstPermission(dateTime))
        ) return true;
        else return false;
    }
}
