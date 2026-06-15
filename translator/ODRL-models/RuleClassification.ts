import {RulePermission} from "./RulePermission"
import {RuleDuty} from "./RuleDuty"
import {RuleProhibition} from "./RuleProhibition"

export interface RuleClassification {
    permissions: RulePermission[]
    obligations: RuleDuty[]
    prohibitions: RuleProhibition[]
}