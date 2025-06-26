import { Step, BaseStepProps } from "./step";

/**
 * Properties for Template step
 */
export interface TemplateStepProps extends BaseStepProps {
	/** Template file path */
	readonly template: string;
	/** Parameters to pass to the template */
	readonly parameters?: Record<string, any>;
}

/**
 * Template step construct
 *
 * References a template file with steps
 */
export class TemplateStep extends Step {
	public readonly template: string;
	public readonly parameters?: Record<string, any>;

	constructor(props: TemplateStepProps) {
		super(props);
		this.template = props.template;
		this.parameters = props.parameters;
	}

	synthesize(): any {
		const result: any = {
			template: this.template
		};

		if (this.parameters !== undefined && Object.keys(this.parameters).length > 0) {
			result.parameters = this.parameters;
		}

		this.addCommonProps(result);
		return result;
	}

	/**
	 * Create a template step reference
	 */
	static create(template: string, parameters?: Record<string, any>): TemplateStep {
		return new TemplateStep({ template, parameters });
	}
}
