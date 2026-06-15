import fs from "fs";
import { Constraint } from "./ODRL-models/Constraint";
import { RulePermission } from "./ODRL-models/RulePermission";
import { RuleProhibition } from "./ODRL-models/RuleProhibition";
import { LogicalConstraint } from "./ODRL-models/LogicalConstraint";
import {
  exploreConstraints,
  exploreLogicalConstraints,
  createEvalFunction
} from "./constraintMethods.js";
import { RuleDuty } from "./ODRL-models/RuleDuty";
//import {axios} from "axios"

// Union of two sets
function union(setA: any, setB: any) {
  let _union = new Set(setA);
  for (let elem of setB) {
    _union.add(elem);
  }
  return _union;
}

const onlyAuthorizedCode = `    
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
`;

// Parse a JSON file
export function exploreODRLpolicy(jsonPath: string) {
  const jsonString = fs.readFileSync(jsonPath, "utf-8");
  const ODRLpolicy = JSON.parse(jsonString);
  return ODRLpolicy;
}

// If a rule contains multiple values, it validates all of them
function validateAllRules(
  rules: RulePermission[] | RuleProhibition[],
  type: string,
): string {
  let validationFunctions = "";
  let ruleNames: string[] = [];
  let conditions: string = "";
  let inputs;
  let combinedValidation: string = "";

  for (const rule of rules) {
    if (rule.uid) {
      const ruleCode = createRuleCode(rule, type);
      validationFunctions += ruleCode.rules;
      inputs = ruleCode.inputs;
      console.log(inputs);
      console.log(ruleCode.combinedConstraintName);
      if (ruleCode.conditions) {
        conditions += ruleCode.conditions;
      }
      for (let i in ruleCode.combinedConstraintName) {
        ruleNames.push(i);
        console.log(ruleNames);
      }
    }
  }

  if (ruleNames.length >= 2) {
    combinedValidation = `
    function validateAll${type.charAt(0).toUpperCase() + type.slice(1)}(${inputs}) public view returns (bool) {
        return ${ruleNames.join(" && ")};
    }
    `;
  } else {
    combinedValidation = `
        function validateAll${type.charAt(0).toUpperCase() + type.slice(1)}(${inputs}) public view returns (bool) {
            return ${ruleNames};
        }
        `;
  }
  return validationFunctions + conditions + combinedValidation;
}

function createRuleCode(rule: RulePermission | RuleProhibition, type: string) {
  let rules = "";
  let conditions = "";
  let idRule = "";
  let combinedConstrainMap;
  let combinedConstraintName = new Set();
  let inputs;

  if (rule.uid) idRule = rule.uid;

  if (rule.constraint) {
    const constraints: Constraint[] = rule.constraint;
    console.log(constraints);
    const constraintMap = exploreConstraints(constraints, idRule);

    rules += constraintMap.constraintsCode;

    // In case there are no logical constraints, all constraints must be considered ("and")
    let defaultLogicalConstraints: LogicalConstraint[] = [
      {
        uid: "LC1",
        operand: "and",
        operator: null,
        leftOperand: null,
        rightOperand: null,
        constraint: [],
      },
    ];

    for (let cname in constraintMap.constraintNames) {
      defaultLogicalConstraints[0].constraint?.push(
        constraintMap.constraintNames[cname],
      );
    }
    if (rule.logicalConstraints) {
      const logicalConstraints: LogicalConstraint[] = rule.logicalConstraints;
      let logicalConstraintCode = exploreLogicalConstraints(
        logicalConstraints,
        constraintMap,
      );
      if (logicalConstraintCode != undefined) {
        combinedConstrainMap = createEvalFunction(
          constraintMap,
          idRule,
          logicalConstraintCode.logicalConstrainsName,
          logicalConstraintCode.ruleCall.constraintsCombination,
        );
        conditions += combinedConstrainMap.code;
        combinedConstraintName.add(combinedConstrainMap.combinedConstraints);
      }
    } else {
      console.log(defaultLogicalConstraints);
      let logicalConstraintCode = exploreLogicalConstraints(
        defaultLogicalConstraints,
        constraintMap,
      );
      if (logicalConstraintCode != undefined) {
        combinedConstrainMap = createEvalFunction(
          constraintMap,
          idRule,
          logicalConstraintCode.logicalConstrainsName,
          logicalConstraintCode.ruleCall.constraintsCombination,
        );
        conditions += combinedConstrainMap.code; // ← usa solo .code
        combinedConstraintName.add(combinedConstrainMap.combinedConstraints);
      }
    }
  }

  if (rule.assignee?.partOf?.refinement != undefined) {
    const constraints: Constraint[] = rule.assignee?.partOf?.refinement;
    const constraintMap = exploreConstraints(constraints, idRule);

    rules += constraintMap.constraintsCode;
    inputs = constraintMap.constraintInput;

    if (rule.assignee?.partOf?.logicalConstraints != undefined) {
      const logicalConstraints: LogicalConstraint[] =
        rule.assignee?.partOf?.logicalConstraints;
      let logicalConstraintCode = exploreLogicalConstraints(
        logicalConstraints,
        constraintMap,
      );
      if (logicalConstraintCode != undefined) {
        combinedConstrainMap = createEvalFunction(
          constraintMap,
          idRule,
          logicalConstraintCode.logicalConstrainsName,
          logicalConstraintCode.ruleCall.constraintsCombination,
        );
        conditions += combinedConstrainMap.code;
        combinedConstraintName.add(combinedConstrainMap.combinedConstraints);
      }
    }
  }

  console.log(rules);
  return { rules, conditions, combinedConstraintName, inputs };
}

export function generateSolidityContract(policy: any, fileName?: string): string {
  let rulesCode = ""; // Contains the translated constraint functions (evaluateConstraint_*)
  let conditionsCode = ""; // Contains the evaluation functions (evaluate_*)
  let permissionValidationCode = ""; // Contains the permission validation function
  let prohibitionValidationCode = ""; // Contains the prohibition validation function
  let obligationValidationCode = ""; // Contains the obligation validation function


  // Analyze Permission rules
  if (policy.permission) {
    if (policy.permission.length >= 2) {
      // If there are multiple permissions, generate a combined validation function
      permissionValidationCode = validateAllRules(
        policy.permission,
        "permission",
      );
    } else {
      // If there is only one permission, generate rules and conditions separately
      for (const permission of policy.permission) {
        const ruleCode = createRuleCode(permission, "permission");
        rulesCode += ruleCode.rules; // Append constraint functions
        if (ruleCode.conditions) conditionsCode += ruleCode.conditions; // Append evaluation function
      }
    }
  }

  // Analyze Prohibition rules
  // Always uses validateAllRules since prohibitions are always combined
  if (policy.prohibition) {
    prohibitionValidationCode = validateAllRules(
      policy.prohibition,
      "prohibition",
    );
  }

  // Analyze Obligation (Duty) rules
  // Always uses validateAllRules since obligations are always combined
  if (policy.obligation) {
    obligationValidationCode = validateAllRules(
      policy.obligation,
      "obligation",
    );
  }

  // Generate the final Solidity contract including all sections:
  // - onlyAuthorizedCode: owner/authorization boilerplate
  // - rulesCode: evaluateConstraint_* functions (single permission case)
  // - conditionsCode: evaluate_* functions (single permission case)
  // - permissionValidationCode: validateAllPermission (multiple permissions case)
  // - prohibitionValidationCode: validateAllProhibition
  // - obligationValidationCode: validateAllObligation
  return `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;

    contract ${ fileName || "ODRLPolicyContract" } {

        ${onlyAuthorizedCode}

        ${rulesCode}

        ${conditionsCode}

        ${permissionValidationCode}

        ${prohibitionValidationCode}

        ${obligationValidationCode}
    }
    `;
}

// // Look for a specific value in JSON
// try {
//   // Using process.env.NODE_ARG works for Linux and Windows shells
//   const filePath = process.env.NODE_ARG || "./json/examples/example-20cs.json";
//   const fileName = path.basename(filePath, path.extname(filePath))?.replace(/[^a-zA-Z0-9]/g, "");
//   const policy: ODRLPolicy = exploreODRLpolicy(filePath);
//   //  const policy: ODRLPolicy = json.policy;

//   // Validate policy data
//   if (!policy) {
//     throw new Error("Invalid policy data");
//   }

//   // Generate the Solidity contract
//   const solidityCode = generateSolidityContract(policy, fileName);

//   // Save the contract to a file
//   // Save in hardhat folder
//   fs.writeFileSync("../hardhat/contracts/" + fileName + ".sol", solidityCode);

//   console.log("Solidity contract " + fileName + " successfully generated!");
// } catch (error) {
//   if (error instanceof Error) {
//     console.error("Error during Solidity contract generation:", error.message);
//   } else {
//     console.error("Error during Solidity contract generation:", error);
//   }
// }
