import { Rule } from './Rule';
import { RuleDuty } from './RuleDuty';

export class RulePermission extends Rule {
  duty?: RuleDuty[];
  constructor() {
    super();
  }
}