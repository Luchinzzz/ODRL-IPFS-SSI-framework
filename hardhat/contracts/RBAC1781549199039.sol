// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RBAC1781549199039 {
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

    function evaluateConstraint_C1_P1(
        string memory location
    ) public view onlyAuthorized returns (bool) {
        return
            keccak256(abi.encodePacked(location)) ==
            keccak256(abi.encodePacked("off-campus"));
    }

    // Array to store elements in the Set
    string[] public elements;

    // Mapping to store the index of each string in the 'elements' array
    mapping(string => uint256) private indexes;

    // Add an element to the Set
    function insert(string memory value) public onlyAuthorized {
        require(!contains(value), "Set already contains this value");

        // Add the value to the array
        elements.push(value);

        // Store the index in the mapping, +1 because index 0 means not present
        indexes[value] = elements.length;
    }

    // Remove an element from the Set
    function remove(string memory value) public onlyAuthorized {
        require(contains(value), "Set does not contain this value");

        // Find the index of the value in the array
        uint256 index = indexes[value] - 1; // -1 to adjust for 1-based index

        // Move the last element to the position of the element being removed
        uint256 lastIndex = elements.length - 1;
        string memory lastValue = elements[lastIndex];

        // Swap the element with the last one
        elements[index] = lastValue;
        indexes[lastValue] = index + 1; // Adjust for 1-based index

        // Delete the index of the removed element
        delete indexes[value];

        // Remove the last element from the array
        elements.pop();
    }

    // Return all values in the Set
    function values() public view onlyAuthorized returns (string[] memory) {
        return elements;
    }

    // Verify if the element is present in the Set
    function contains(string memory value) public view returns (bool) {
        // If the index is greater than 0, it exists in the Set
        return indexes[value] != 0;
    }

    // Return the number of elements in the Set
    function length() public view onlyAuthorized returns (uint256) {
        return elements.length;
    }

    function isPartOf_C2() public view onlyAuthorized returns (bool) {
        return indexes["project_manager"] != 0;
    }

    function evaluateConstraint_C1_P2(
        string memory location
    ) public view onlyAuthorized returns (bool) {
        return
            keccak256(abi.encodePacked(location)) ==
            keccak256(abi.encodePacked("on-campus"));
    }

    function evaluate_P1(
        string memory location
    ) public view onlyAuthorized returns (bool) {
        if ((isPartOf_C2() && evaluateConstraint_C1_P1(location))) return true;
        else return false;
    }

    function evaluate_P2(
        string memory location
    ) public view onlyAuthorized returns (bool) {
        if ((evaluateConstraint_C1_P2(location))) return true;
        else return false;
    }
}
