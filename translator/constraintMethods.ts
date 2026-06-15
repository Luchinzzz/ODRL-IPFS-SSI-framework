import { Constraint } from "./ODRL-models/Constraint.js";
import { LogicalConstraint } from "./ODRL-models/LogicalConstraint.js";
import { Operator } from "./ODRL-models/Operator.js";
import { LeftOperand } from "./ODRL-models/LeftOperand.js";
import { RightOperand } from "./ODRL-models/RightOperand.js";
import { toUnixTimestamp } from "./utils.js";
export interface constraintMap {
  constraintsCode: string;
  constraintInput: Set<string>;
  constraintNames: string[];
  codeExpr: Map<string, string>;
}

interface leftOperandOccurences {
  leftOperand: string;
  count: number;
  code: string;
}

const codeSet = `    
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
        `;

function sanitizeIdentifier(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/^[0-9]/, "_$&");
}

// Explore Logical Constraint field to check if there are logical contraints between constraints
export function exploreLogicalConstraints(
  logConstraints: LogicalConstraint[],
  constraintMap: constraintMap,
) {
  let logicalCostraint: string = "";
  let ruleCall = {
    constraintsCombination: new Map(),
  };
  let logicalConstrainsName: string[] = [];

  for (let i in logConstraints) {
    // Check if a logical constraint is present
    if (logConstraints[i] != undefined) {
      logicalCostraint = logConstraints[i].operand;
      let uidLConstraint = logConstraints[i].uid;

      if (uidLConstraint) logicalConstrainsName.push(uidLConstraint);

      if (logicalCostraint == "and" || logicalCostraint == "andSequence")
        logicalCostraint = "&&";
      else if (logicalCostraint == "or") logicalCostraint = "||";
      else logicalCostraint = "^";

      if (logConstraints[i].constraint != undefined) {
        for (let c in logConstraints[i].constraint) {
          let cons: string = logConstraints[i].constraint[c];

          if (constraintMap.codeExpr.get(cons)) {
            let codeExpr = constraintMap.codeExpr.get(cons);

            if (
              ruleCall.constraintsCombination.size === 0 &&
              codeExpr != undefined &&
              uidLConstraint != undefined
            ) {
              ruleCall.constraintsCombination.set(uidLConstraint, codeExpr);
            } else {
              if (
                ruleCall.constraintsCombination.get(uidLConstraint) != undefined
              )
                codeExpr +=
                  ` ${logicalCostraint} ` +
                  ruleCall.constraintsCombination.get(uidLConstraint);
              ruleCall.constraintsCombination.set(uidLConstraint, codeExpr);
            }
          }
        }
      }
    } else {
      console.log("Missing Logical Constraint");
    }
  }
  return { ruleCall, logicalConstrainsName };
}

// Create a function for each constraint in a Rule
export function exploreConstraints(
  constraint: Constraint[],
  ruleId: string,
): constraintMap {
  let code = "";
  let operatorTranslated = "";

  let constraintMap: constraintMap = {
    constraintsCode: "",
    constraintInput: new Set(),
    constraintNames: [],
    codeExpr: new Map(),
  };

  const validTypes = [
    "xsd:string",
    "xsd:integer",
    "xsd:unsignedInt",
    "xsd:time",
    "xsd:date",
    "xsd:dateTime",
    "xsd:stringSet",
  ];

  for (const cons of constraint) {
    let constraintType = "";

    // Operatore
    if (cons.operator) {
      const op = new Operator(cons.operator);
      operatorTranslated = op.getSolidityOperator();
    }

    // UID
    const constrainId = cons.uid ?? "";

    if (!constrainId) {
      console.log("Missing constraint ID");
      continue;
    }

    // Left operand
    let leftOperand = "";

    if (cons.leftOperand) {
      leftOperand =
        typeof cons.leftOperand === "string"
          ? cons.leftOperand
          : String(cons.leftOperand);
    } else {
      console.log("Missing LeftOperand");
      continue;
    }

    const solidityOperand = sanitizeIdentifier(leftOperand);

    // Right operand
    let valueVal: any = "";

    if (cons.rightOperand?.value !== undefined) {
      valueVal = cons.rightOperand.value;
    }

    // Data type
    const valueType = cons.dataType ?? "";

    if (!validTypes.includes(valueType)) {
      continue;
    }

    constraintMap.constraintNames.push(constrainId);

    /*
    ==========================
    xsd:string
    ==========================
    */

    if (valueType === "xsd:string") {
      constraintType = "string";

      code += `
function evaluateConstraint_${constrainId}_${ruleId}(string memory ${solidityOperand})
    onlyAuthorized
    public
    view
    returns (bool)
{
    return keccak256(abi.encodePacked(${solidityOperand}))
        == keccak256(abi.encodePacked("${valueVal}"));
}
`;
    } else if (valueType === "xsd:integer" || valueType === "xsd:unsignedInt") {

    /*
    ==========================
    xsd:integer
    ==========================
    */
      constraintType = "uint";

      code += `
function evaluateConstraint_${constrainId}_${ruleId}(uint ${solidityOperand})
    onlyAuthorized
    public
    view
    returns (bool)
{
    uint rightOperand = ${valueVal};

    return ${solidityOperand} ${operatorTranslated} rightOperand;
}
`;
    } else if (valueType === "xsd:stringSet" && cons.operator === "isPartOf") {

    /*
    ==========================
    isPartOf
    ==========================
    */
      if (!code.includes(codeSet)) {
        code += codeSet;
      }

      code += `
function isPartOf_${constrainId}()
    onlyAuthorized
    public
    view
    returns (bool)
{
    return indexes["${solidityOperand}"] != 0;
}
`;

      constraintMap.codeExpr.set(constrainId, `isPartOf_${constrainId}()`);

      continue;
    } else if (

    /*
    ==========================
    Date / Time
    ==========================
    */
      valueType === "xsd:date" ||
      valueType === "xsd:time" ||
      valueType === "xsd:dateTime"
    ) {
      let rightOperandConverted;
      let unixTimestampInSeconds;

      if (typeof valueVal === "string") {
        rightOperandConverted = toUnixTimestamp(valueVal);
      }

      if (rightOperandConverted) {
        unixTimestampInSeconds = Math.floor(rightOperandConverted / 1000);
      }

      // Caso currentDateTime
      if (solidityOperand === "currentDateTime") {
        code += `
function evaluateConstraint_${constrainId}_${ruleId}()
    onlyAuthorized
    public
    view
    returns (bool)
{
    uint currentTime = block.timestamp;

    return currentTime ${operatorTranslated} ${unixTimestampInSeconds};
}
`;
      }

      // Altre date
      else {
        constraintType = "uint";

        code += `
function evaluateConstraint_${constrainId}_${ruleId}(uint ${solidityOperand})
    onlyAuthorized
    public
    view
    returns (bool)
{
    return ${solidityOperand}
        ${operatorTranslated}
        ${rightOperandConverted};
}
`;
      }
    }

    /*
    ==========================
    INPUTS
    ==========================
    */

    const isCurrentDateTime = solidityOperand === "currentDateTime";

    // currentDateTime NON deve comparire
    // negli input di evaluate_*
    if (!isCurrentDateTime && constraintType !== "") {
      if (constraintType === "string") {
        constraintMap.constraintInput.add(`string memory ${solidityOperand}`);
      } else {
        constraintMap.constraintInput.add(
          `${constraintType} ${solidityOperand}`,
        );
      }
    }

    /*
    ==========================
    codeExpr
    ==========================
    */

    if (isCurrentDateTime) {
      constraintMap.codeExpr.set(
        constrainId,
        `evaluateConstraint_${constrainId}_${ruleId}()`,
      );
    } else {
      constraintMap.codeExpr.set(
        constrainId,
        `evaluateConstraint_${constrainId}_${ruleId}(${solidityOperand})`,
      );
    }
  }

  constraintMap.constraintsCode = code;

  return constraintMap;
}

export function createEvalFunction(
  constraintMap: constraintMap,
  ruleName: string,
  logConsNames: string[],
  constraintCombination: Map<string, string>,
) {
  let evalFun: string = "";
  let inputs: string = "";
  let ifStatement: string = "";
  let combinedConstraints: string = "";
  let constraintCombinationMap = {
    code: "",
    combinedConstraints: "",
  };
  for (let c in logConsNames) {
    if (ifStatement == "") {
      ifStatement += `(` + constraintCombination.get(logConsNames[c]) + `)`;
    } else {
      ifStatement += ` && (` + constraintCombination.get(logConsNames[c]) + `)`;
    }
  }

  for (const i of constraintMap.constraintInput) {
    if (inputs === "") {
      inputs = i;
    } else {
      inputs += `, ${i}`;
    }
  }

  evalFun = `
      function evaluate_${ruleName}(${inputs}) onlyAuthorized public view returns (bool) {
          if(${ifStatement})
              return true;
          else
              return false;
      }       
      `;
  combinedConstraints = `evaluate_${ruleName}(${inputs}) `;

  constraintCombinationMap.code = evalFun;
  constraintCombinationMap.combinedConstraints = combinedConstraints;

  return constraintCombinationMap;
}
