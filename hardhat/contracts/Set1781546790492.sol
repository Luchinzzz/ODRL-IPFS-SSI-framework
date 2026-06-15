
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;

    contract Set1781546790492 {

            
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


            
     // Array to store elements in the Set
    string[] public elements;

    // Mapping to store the index of each string in the 'elements' array
    mapping(string => uint256) private indexes;

    // Add an element to the Set
    function insert(string memory value) onlyAuthorized public {
        require(!contains(value), "Set already contains this value");

        // Add the value to the array
        elements.push(value);

        // Store the index in the mapping, +1 because index 0 means not present
        indexes[value] = elements.length;
    }

    // Remove an element from the Set
    function remove(string memory value) onlyAuthorized public {
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
    function values() onlyAuthorized public view returns (string[] memory) {
        return elements;
    }
    
    // Verify if the element is present in the Set
    function contains(string memory value) public view returns (bool) {
        // If the index is greater than 0, it exists in the Set
        return indexes[value] != 0;
}

    // Return the number of elements in the Set
    function length() onlyAuthorized public view returns (uint256) {
        return elements.length;
    }
        
function isPartOf_C1()
    onlyAuthorized
    public
    view
    returns (bool)
{
    return indexes["project_manager"] != 0;
}


        
      function evaluate_P1() onlyAuthorized public view returns (bool) {
          if((isPartOf_C1()))
              return true;
          else
              return false;
      }       
      

        

        

        
    }
    