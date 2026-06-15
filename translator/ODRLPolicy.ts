
//import { Rule } from "./ODRL-models/Rule";
import { RuleDuty } from "./ODRL-models/RuleDuty";
import { RulePermission } from "./ODRL-models/RulePermission";
import { RuleProhibition } from "./ODRL-models/RuleProhibition";


export class ODRLPolicy {
    id?: string; 
    type: string; 
    profile?: string;
    prohibition: RuleProhibition[]; 
    obligation: RuleDuty[]; 
    permission: RulePermission[]; 
  
    constructor(
      type: string,
      prohibition: RuleProhibition[], 
      obligation: RuleDuty[],
      permission: RulePermission[],
      id?: string,
      profile?: string
    ) {
      this.type = type;
      this.prohibition = prohibition;
      this.obligation = obligation;
      this.permission = permission;
      this.id = id;
      this.profile = profile;
    }

     
    public addPermission(permission: RulePermission): void {
      this.permission.push(permission);
    }
  
    public addProhibition(prohibition: RuleProhibition): void {
      this.prohibition.push(prohibition);
    }
  
    public addDuty(duty: RuleDuty): void {
      this.obligation.push(duty);
    }
  }