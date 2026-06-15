import { Asset } from './Asset';
import { Constraint } from './Constraint';
import { Party } from './Party';
import { Relation } from './Relation';
import { Action } from './Action';
import { LogicalConstraint } from './LogicalConstraint';

export abstract class Rule {
    action?: Action | Action[];
    target?: Asset;
    // Legal or moral entity that has established the obligation / author of the policy.
    assigner?: Party;
    // Individual or entity recipient of the obligation, required to comply with the policy.
    assignee?: Party;
    asset?: Asset;
    function?: Party[];
    failure?: Rule[];
    constraint?: Constraint[];
    uid?: string;
    relation?: Relation;
    logicalConstraints?: LogicalConstraint[];


    constructor(uid?: string) {
        if (uid) {
            this.uid = uid;
        }
    }

}