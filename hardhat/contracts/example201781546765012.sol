
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;

    contract example201781546765012 {

            
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


        
function evaluateConstraint_C1_(string memory subjectRole)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(subjectRole))
        == keccak256(abi.encodePacked("bachelor student"));
}

function evaluateConstraint_C2_(uint gradeAverage)
    onlyAuthorized
    public
    view
    returns (bool)
{
    uint rightOperand = 27;

    return gradeAverage >= rightOperand;
}

function evaluateConstraint_C3_(uint gradeAverage)
    onlyAuthorized
    public
    view
    returns (bool)
{
    uint rightOperand = 30;

    return gradeAverage <= rightOperand;
}

function evaluateConstraint_C4_(uint enrollmentYear)
    onlyAuthorized
    public
    view
    returns (bool)
{
    uint rightOperand = 3;

    return enrollmentYear <= rightOperand;
}

function evaluateConstraint_C5_(uint enrollmentYear)
    onlyAuthorized
    public
    view
    returns (bool)
{
    uint rightOperand = 1;

    return enrollmentYear >= rightOperand;
}

function evaluateConstraint_C6_(uint age)
    onlyAuthorized
    public
    view
    returns (bool)
{
    uint rightOperand = 18;

    return age > rightOperand;
}

function evaluateConstraint_C7_(string memory location)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(location))
        == keccak256(abi.encodePacked("USA"));
}

function evaluateConstraint_C8_(string memory role)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(role))
        == keccak256(abi.encodePacked("admin"));
}

function evaluateConstraint_C9_(uint dateTime)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return dateTime
        <
        1704067199000;
}

function evaluateConstraint_C10_(string memory subscription)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(subscription))
        == keccak256(abi.encodePacked("premium"));
}

function evaluateConstraint_C11_(string memory subscription)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(subscription))
        == keccak256(abi.encodePacked("free"));
}

function evaluateConstraint_C12_(string memory subscription)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(subscription))
        == keccak256(abi.encodePacked("basic"));
}

function evaluateConstraint_C13_(string memory subscription)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(subscription))
        == keccak256(abi.encodePacked("trial"));
}

function evaluateConstraint_C14_(string memory subscription)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(subscription))
        == keccak256(abi.encodePacked("student"));
}

function evaluateConstraint_C15_(string memory subscription)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(subscription))
        == keccak256(abi.encodePacked("teacher"));
}

function evaluateConstraint_C16_(string memory subscription)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(subscription))
        == keccak256(abi.encodePacked("staff"));
}

function evaluateConstraint_C17_(string memory subscription)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(subscription))
        == keccak256(abi.encodePacked("alumni"));
}

function evaluateConstraint_C18_(string memory subscription)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(subscription))
        == keccak256(abi.encodePacked("parent"));
}

function evaluateConstraint_C19_(string memory subscription)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(subscription))
        == keccak256(abi.encodePacked("guest"));
}

function evaluateConstraint_C20_(string memory subscription)
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(subscription))
        == keccak256(abi.encodePacked("other"));
}


        
      function evaluate_(string memory subjectRole, uint gradeAverage, uint enrollmentYear, uint age, string memory location, string memory role, uint dateTime, string memory subscription) onlyAuthorized public view returns (bool) {
          if((evaluateConstraint_C20_(subscription) && evaluateConstraint_C19_(subscription) && evaluateConstraint_C18_(subscription) && evaluateConstraint_C17_(subscription) && evaluateConstraint_C16_(subscription) && evaluateConstraint_C15_(subscription) && evaluateConstraint_C14_(subscription) && evaluateConstraint_C13_(subscription) && evaluateConstraint_C12_(subscription) && evaluateConstraint_C11_(subscription) && evaluateConstraint_C10_(subscription) && evaluateConstraint_C9_(dateTime) && evaluateConstraint_C8_(role) && evaluateConstraint_C7_(location) && evaluateConstraint_C6_(age) && evaluateConstraint_C5_(enrollmentYear) && evaluateConstraint_C4_(enrollmentYear) && evaluateConstraint_C3_(gradeAverage) && evaluateConstraint_C2_(gradeAverage) && evaluateConstraint_C1_(subjectRole)))
              return true;
          else
              return false;
      }       
      

        

        

        
    }
    