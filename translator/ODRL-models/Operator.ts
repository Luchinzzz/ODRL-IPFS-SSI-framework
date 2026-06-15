export class Operator {
  /**
   * Maps ODRL operators to their corresponding Solidity operators.
   */
  private static readonly ODRL_TO_SOLIDITY: Record<string, string> = {
    eq: "==",
    neq: "!=",
    lt: "<",
    lteq: "<=",
    gt: ">",
    gteq: ">=",
    isPartOf: "isPartOf"
  };

  private odrlOperator: string;
  private solidityOperator: string;

  /**
   * Constructor to initialize the Operator class.
   * @param odrlOperator - The operator in ODRL format (e.g., "eq", "lt").
   * @throws Error if the operator is not valid.
   */
  constructor(odrlOperator: string) {
    if (!Operator.ODRL_TO_SOLIDITY.hasOwnProperty(odrlOperator)) {
      throw new Error(`Invalid ODRL operator: ${odrlOperator}`);
    }
    this.odrlOperator = odrlOperator;
    this.solidityOperator = Operator.ODRL_TO_SOLIDITY[odrlOperator];
  }

  /**
   * Returns the corresponding Solidity operator.
   * @returns The Solidity operator (e.g., "==", "<").
   */
  public getSolidityOperator(): string {
    return this.solidityOperator;
  }

  /**
   * Returns a readable representation of the mapping.
   * @returns A string describing the ODRL -> Solidity mapping.
   */
  public toString(): string {
    return `ODRL: ${this.odrlOperator} -> Solidity: ${this.solidityOperator}`;
  }
}
