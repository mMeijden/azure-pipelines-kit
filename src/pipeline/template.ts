import { Construct } from "../construct";

export interface TemplateProps {
	readonly template: string;
	readonly parameters?: { [key: string]: any };
}

export class Template extends Construct implements TemplateProps {
	public readonly template: string;
	public readonly parameters: { [key: string]: any };

	constructor(props: TemplateProps) {
		super();
		this.template = props.template;
		this.parameters = props.parameters || {};
	}

	synthesize() {
		return {
			template: this.template,
			parameters: this.parameters
		};
	}
}
