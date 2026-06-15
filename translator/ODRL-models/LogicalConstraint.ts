import { Constraint } from './Constraint';

export class LogicalConstraint extends Constraint {
    static readonly operands: string[] = ['and', 'andSequence', 'or', 'xone'];
    constraint?: string[];
    operand: string;

    constructor(operand: string, constraint: string[]) {
        super(null, null, null);
        this.operand = operand;
        this.constraint = constraint

    }

}