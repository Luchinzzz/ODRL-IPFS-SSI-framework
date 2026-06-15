
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;

    contract DPODRL1781546666360 {

            
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


        
function evaluateConstraint_C5_P1(uint dateTime)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return dateTime
        >=
        1781506800000;
}

function evaluateConstraint_C6_P1(uint dateTime)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return dateTime
        <=
        1781535600000;
}

function evaluateConstraint_C1_P1(string memory role)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(role))
        == keccak256(abi.encodePacked("doctor"));
}

function evaluateConstraint_C2_P1(string memory department)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(department))
        == keccak256(abi.encodePacked("cardiology"));
}

function evaluateConstraint_C3_P1(string memory specialization)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(specialization))
        == keccak256(abi.encodePacked("paediatrics"));
}

function evaluateConstraint_C4_P1(uint experience)
    onlyAuthorized
    public
    view
    returns (bool)
{
    uint rightOperand = 3;

    return experience >= rightOperand;
}


        
      function evaluate_P1(uint dateTime) onlyAuthorized public view returns (bool) {
          if((evaluateConstraint_C6_P1(dateTime) && evaluateConstraint_C5_P1(dateTime)))
              return true;
          else
              return false;
      }       
      
      function evaluate_P1(string memory role, string memory department, string memory specialization, uint experience) onlyAuthorized public view returns (bool) {
          if((evaluateConstraint_C4_P1(experience) && evaluateConstraint_C3_P1(specialization) && evaluateConstraint_C2_P1(department) && evaluateConstraint_C1_P1(role)))
              return true;
          else
              return false;
      }       
      

        

        

        
    }
    