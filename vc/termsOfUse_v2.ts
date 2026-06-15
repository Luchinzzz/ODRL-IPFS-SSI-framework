export class TermsOfUseV2 {
  id?: string;
  type: string;
  hashIPFS?: string;
  hashSP?: string;
  addressSP?: string;

  constructor(
    type: string,
    id?: string,
    hashIPFS?: string,
    hashSP?: string,
    addressSP?: string,
  ) {
    this.type = type;
    this.id = id;
    this.addressSP = addressSP;
    this.hashIPFS = hashIPFS;
    this.hashSP = hashSP;
  }
}
