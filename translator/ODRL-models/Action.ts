import { Constraint } from './Constraint';

export const actions = [
    'Attribution',
    'CommericalUse',
    'DerivativeWorks',
    'Distribution',
    'Notice',
    'Reproduction',
    'ShareAlike',
    'Sharing',
    'SourceCode',
    'acceptTracking',
    'adHocShare',
    'aggregate',
    'annotate',
    'anonymize',
    'append',
    'appendTo',
    'archive',
    'attachPolicy',
    'attachSource',
    'attribute',
    'commercialize',
    'compensate',
    'concurrentUse',
    'copy',
    'delete',
    'derive',
    'digitize',
    'display',
    'distribute',
    'ensureExclusivity',
    'execute',
    'export',
    'extract',
    'extractChar',
    'extractPage',
    'extractWord',
    'give',
    'grantUse',
    'include',
    'index',
    'inform',
    'install',
    'lease',
    'lend',
    'license',
    'modify',
    'move',
    'nextPolicy',
    'obtainConsent',
    'pay',
    'play',
    'present',
    'preview',
    'print',
    'read',
    'reproduce',
    'reviewPolicy',
    'secondaryUse',
    'sell',
    'share',
    'shareAlike',
    'stream',
    'synchronize',
    'textToSpeech',
    'transfer',
    'transform',
    'translate',
    'uninstall',
    'use',
    'watermark',
    'write',
    'writeTo',
] as const;

export type ActionType = (typeof actions)[number];

type InclusionMap = Map<string, Set<string>>;

export class Action {
    private static inclusions: InclusionMap = new Map();

    value: string;
    refinement?: Constraint[];
    // to be considered in case of policy conflicts
    includedIn?: Action | null;
    implies?: Action[];

    constructor(value: string, includedIn: Action | null) {
        this.value = value;
        this.includedIn = includedIn;
    }
}