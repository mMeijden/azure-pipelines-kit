import { Construct } from "./construct";

export interface ExpressionProps {
	expression: string;
	content: Construct | object;
}

export class Expression extends Construct {
	private props: ExpressionProps;

	constructor(props: ExpressionProps) {
		super();
		this.props = props;
	}

	synthesize() {
		const content = this.props.content instanceof Construct ? this.props.content.synthesize() : this.props.content;

		return {
			[`\${{ ${this.props.expression} }}`]: content
		};
	}
}
