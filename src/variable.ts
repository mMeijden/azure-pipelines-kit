import { Construct } from "./construct";

interface ConditionalValue {
	condition: string;
	value: any;
}

export interface VariableDefinition {
	name: string;
	value?: any;
	readonly?: boolean;
	conditionalValues?: ConditionalValue[];
}

export class Variable extends Construct {
	private props: VariableDefinition;

	constructor(props: VariableDefinition) {
		super();
		this.props = props;
	}

	synthesize() {
		const result: any = { name: this.props.name };

		if (this.props.conditionalValues && this.props.conditionalValues.length > 0) {
			this.props.conditionalValues.forEach((cv) => {
				result[`$\{{ ${cv.condition} }}`] = { value: cv.value };
			});
		} else if (this.props.value !== undefined) {
			if (this.props.readonly) {
				result.value = this.props.value;
				result.readonly = true;
			} else {
				return { [this.props.name]: this.props.value };
			}
		}

		return result;
	}
}
