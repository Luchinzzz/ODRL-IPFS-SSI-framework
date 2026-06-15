import { LeftOperand } from "./LeftOperand";
import { RightOperand } from "./RightOperand";
//import { LogicalConstraint } from "./LogicalConstraint";


export class Constraint {
    public uid?: string;
    public dataType?: string;
    public unit?: string;
    public status?: number;
    public operator: string | null;
    public leftOperand: LeftOperand | null;
    public rightOperand: RightOperand | null;
    public rightOperandReference?: null | string | string[];

    constructor(
        leftOperand: LeftOperand | null,
        operator: string | null,
        rightOperand: RightOperand | null,
    ) {
        this.leftOperand = leftOperand;
        this.operator = operator;
        this.rightOperand = rightOperand;
    }
}