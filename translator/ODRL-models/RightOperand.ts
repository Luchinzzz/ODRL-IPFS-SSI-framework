export class RightOperand {
    public '@id'?: string;
    public value: string | number | [];

    constructor(value: string | number) {
        this.value = value;
    }

}