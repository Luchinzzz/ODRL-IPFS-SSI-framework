import { Asset } from './Asset';

export const enum RelationType {
  TARGET = 'target',
}

export class Relation{
  type: RelationType;
  asset: Asset;

  constructor(type: RelationType, asset: Asset) {
    this.type = type;
    this.asset = asset;
  }
}