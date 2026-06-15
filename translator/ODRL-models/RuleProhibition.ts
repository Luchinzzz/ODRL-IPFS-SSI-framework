import { Rule } from './Rule';
import { RuleDuty } from './RuleDuty';

export class RuleProhibition extends Rule {
  remedy?: RuleDuty[];
  constructor() {
    super();
  }

  public addRemedy(duty: RuleDuty) {
    if (this.remedy === undefined) {
      this.remedy = [];
    }
    this.remedy.push(duty);
  }  
}