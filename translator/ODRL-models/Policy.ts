
import { RuleDuty } from './RuleDuty';
import { RulePermission } from './RulePermission';
import { RuleProhibition } from './RuleProhibition';

export type PolicyContext = string | { [key: string]: string }[];
enum ConflictTerm{
    perm = "perm",
    prohibit = "prohibit",
    invalid = "invalid"

}

export abstract class Policy {
  protected '@context': PolicyContext = '';
  protected '@type': string;
  protected uid: string;
  protected permission: RulePermission[];
  protected prohibition: RuleProhibition[];
  protected obligation: RuleDuty[];
  protected profile?: string[];
  protected inheritFrom?: string[];
  protected conflict?: ConflictTerm[];

  constructor(uid: string, context: PolicyContext, type: string) {
    this.uid = uid;
    this['@context'] = context;
    this['@type'] = type;
    this.permission = [];
    this.prohibition = [];
    this.obligation = [];
  }

  public get permissions(): RulePermission[] {
    return this.permission;
  }

  public get prohibitions(): RuleProhibition[] {
    return this.prohibition;
  }

  public get obligations(): RulePermission[] {
    return this.permission;
  }

  public addPermission(permission: RulePermission): void {
    this.permission.push(permission);
  }

  public addProhibition(prohibition: RuleProhibition): void {
    this.prohibition.push(prohibition);
  }

  public addDuty(prohibition: RuleDuty): void {
    this.obligation.push(prohibition);
  }


}