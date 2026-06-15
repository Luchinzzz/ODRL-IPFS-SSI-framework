import { Constraint } from "./ODRL-models/Constraint.js"
import { LogicalConstraint } from "./ODRL-models/LogicalConstraint.js"
import { Operator } from "./ODRL-models/Operator.js"
import { LeftOperand } from "./ODRL-models/LeftOperand.js"
import { RightOperand } from "./ODRL-models/RightOperand.js"
import { toUnixTimestamp } from "./utils.js"

export interface constraintMap {
    constraintsCode: string,
    constraintInput: Set<string>,
    constraintNames: string[],
    codeExpr: Map<string, string>
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
        `
// Explore Logical Constraint field to check if there are logical contraints between constraints
export function exploreLogicalConstraints(logConstraints: LogicalConstraint[], constraintMap: constraintMap) {
    let logicalCostraint: string = ''
    let ruleCall = {
        constraintsCombination: new Map()
    }
    let logicalConstrainsName: string[] = []


    for (let i in logConstraints) {
        // Check if a logical constraint is present
        if (logConstraints[i] != undefined) {

            logicalCostraint = logConstraints[i].operand
            let uidLConstraint = logConstraints[i].uid

            if (uidLConstraint)
                logicalConstrainsName.push(uidLConstraint)

            if (logicalCostraint == "and" || logicalCostraint == "andSequence")
                logicalCostraint = "&&"
            else if (logicalCostraint == "or")
                logicalCostraint = "||"
            else
                logicalCostraint = "^"

            if (logConstraints[i].constraint != undefined) {
                for (let c in logConstraints[i].constraint) {

                    let cons: string = logConstraints[i].constraint[c]

                    if (constraintMap.codeExpr.get(cons)) {
                        let codeExpr = constraintMap.codeExpr.get(cons)

                        if (ruleCall.constraintsCombination.size === 0 && codeExpr != undefined && uidLConstraint != undefined) {
                            ruleCall.constraintsCombination.set(uidLConstraint, codeExpr)
                        }
                        else {
                            if (ruleCall.constraintsCombination.get(uidLConstraint) != undefined)
                                codeExpr += ` ${logicalCostraint} ` + ruleCall.constraintsCombination.get(uidLConstraint)
                            ruleCall.constraintsCombination.set(uidLConstraint, codeExpr)
                        }
                    }
                }
            }

        } else {
            console.log("Missing Logical Constraint")
        }
    }
    return { ruleCall, logicalConstrainsName }

}


// Create a function for each constraint in a Rule 
export function exploreConstraints(constraint: Constraint[], ruleId: string): constraintMap {
    let code: string = ""
    let codeExpr = ``
    let operatorTranslated: string = ""
    let constraintType: string = ""

    let constraintMap: constraintMap = {
        constraintsCode: "",
        constraintInput: new Set(),
        constraintNames: [],
        codeExpr: new Map()
    }

    for (let c in constraint) {
        //Translate the operator in the corresponding operator in Solidity
        if (constraint[c].operator != undefined) {
            const op = new Operator(constraint[c].operator);
            operatorTranslated = op.getSolidityOperator();

        }

        let LeftOperand: LeftOperand = { value: "" }
        let RightOperand: RightOperand = { value: [] }
        let constrainId: string = ""

        //Check if there is a Right Operand
        if (constraint[c].rightOperand != undefined) {

            RightOperand = constraint[c].rightOperand
        }
        else {
            console.log("Missing RightOperand")
        }

        //Check if there is a Left Operand
        if (constraint[c].leftOperand != undefined) {
            LeftOperand = constraint[c].leftOperand
        }
        else {
            console.log("Missing LeftOperand")
        }

        //Check if uid is undefined
        if (constraint[c].uid != undefined) {
            constrainId = constraint[c].uid
        } else {
            console.log("Missing ID for Constraint number " + c)
        }


        let valueVal: string | number | [] = ""
        let valueType: string = ""

        if (RightOperand.value != undefined)
            valueVal = RightOperand.value

        if (constraint[c].dataType != undefined)
            valueType = constraint[c].dataType



        // Add constraint uid in array
        constraintMap.constraintNames.push(constrainId)
        const validTypes: string[] = ["xsd:string", "xsd:integer", "xsd:unsignedInt", "xsd:time", "xsd:date", "xsd:dateTime", "xsd:stringSet"]

        if (valueType != undefined && validTypes.includes(valueType)) {
            if (valueType == "xsd:string") {
                constraintType = "string"
                code += `
    function evaluateConstraint_${constrainId}_${ruleId}( string memory ${LeftOperand}) onlyAuthorized public view returns (bool) {
        if(keccak256(abi.encodePacked(${LeftOperand})) == keccak256(abi.encodePacked("${valueVal}")))
            return true;
        else
            return false;
    }    
    `
            } else if (valueType == "xsd:integer" || valueType == "xsd:unsignedInt") {
                constraintType = "uint"
                code += `
    function evaluateConstraint_${constrainId}_${ruleId}(uint ${LeftOperand}) onlyAuthorized public view returns (bool) {
        uint rightOperand =  ${valueVal};
        if(${LeftOperand} ${operatorTranslated}  rightOperand )
            return true;
        else
            return false;
    }    
    `
            } else if (valueType == "xsd:stringSet" && constraint[c].operator == "isPartOf") {
                constraintType = "string"
                if (code.includes(codeSet)) {
                    code += `
    function isPartOf() onlyAuthorized public view returns (bool) {
        // If the index is greater than 0, it exists in the Set
        return indexes["${LeftOperand}"] != 0;
    } `} else {
                    code += codeSet + `              
    function isPartOf() onlyAuthorized public view returns (bool) {
        // If the index is greater than 0, it exists in the Set
        return indexes["${LeftOperand}"] != 0;
    }
  
                `
                }

            } else if (valueType == "xsd:dateTime" || valueType == "xsd:time" || valueType == "xsd:date") {
                let rightOperandConverted
                let unixTimestampInSeconds
                if (typeof valueVal === "string") {
                    rightOperandConverted = toUnixTimestamp(valueVal)
                    //rightOperandConverted = Date.parse(valueVal);
                }
                if (rightOperandConverted) {
                    unixTimestampInSeconds = Math.floor(rightOperandConverted / 1000);
                }

                if (typeof LeftOperand == "string" && LeftOperand == "currentDateTime") {
                    code += `
    function evaluateConstraint_${constrainId}_${ruleId}() onlyAuthorized public view returns (bool) {

         // Get the current time in seconds since Unix epoch
        uint currentTime = block.timestamp;

       
        if (currentTime ${operatorTranslated} ${unixTimestampInSeconds}) {
            return true;
        } else {
            return false;
        }
    }   
    ` } else {
                    constraintType = "uint"
                    code += `
    function evaluateConstraint_${constrainId}_${ruleId}(uint ${LeftOperand}) onlyAuthorized public view returns (bool) {
        if (${LeftOperand} ${operatorTranslated} ${rightOperandConverted}) {
            return true;
        } else {
            return false;
        }
    }   
    `
                }

            }
        }

        // Add a constraint input to the set
        if (constraintType == "string") {
            constraintMap.constraintInput.add(constraintType + " memory " + LeftOperand)
        }
        else {
            constraintMap.constraintInput.add(constraintType + " " + LeftOperand)

        }

        if (constraintType != undefined && typeof LeftOperand == "string" && LeftOperand != "currentDateTime") {
            codeExpr = `evaluateConstraint_${constrainId}_${ruleId}(${LeftOperand})`
            constraintMap.codeExpr.set(constrainId, codeExpr)
        } else {
            codeExpr = `evaluateConstraint_${constrainId}_${ruleId}()`
            constraintMap.codeExpr.set(constrainId, codeExpr)
        }
        //constraintMap.codeExpr.push({ uid: constrainId, expr: codeExpr })
    }
    constraintMap.constraintsCode = code
    return constraintMap
}


export function createEvalFunction(constraintMap: constraintMap, ruleName: string, logConsNames: string[], constraintCombination: Map<string, string>) {
    let evalFun: string = ""
    let inputs: string = ""
    let ifStatement: string = ""
    let combinedConstraints: string = ""
    let constraintCombinationMap = {
        code: "",
        combinedConstraints: ""
    }
    for (let c in logConsNames) {
        if (ifStatement == "") {
            ifStatement += `(` + constraintCombination.get(logConsNames[c]) + `)`
        }
        else {
            ifStatement += ` && (` + constraintCombination.get(logConsNames[c]) + `)`

        }
    }

    for (let i of constraintMap.constraintInput) {
        if (inputs == "") {
            inputs += i
        } else {
            inputs += `, ` + i
        }
    }

    evalFun = `
    function evaluate_${ruleName}(${inputs}) onlyAuthorized public view returns (bool) {
        if(${ifStatement})
            return true;
        else
            return false;
    }       
    `
    combinedConstraints = `evaluate_${ruleName}(${inputs}) `

    constraintCombinationMap.code = evalFun
    constraintCombinationMap.combinedConstraints = combinedConstraints

    return constraintCombinationMap
}

