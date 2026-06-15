import { Constraint } from './Constraint';
import { LogicalConstraint } from './LogicalConstraint';

export class PartyCollection {
  public source?: string;
  public refinement?: Constraint[];
  public logicalConstraints?: LogicalConstraint[];
}