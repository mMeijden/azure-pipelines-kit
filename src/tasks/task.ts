import { Step, BaseStepProps } from "../steps/step";

export interface TaskProps extends BaseStepProps {
	/** Task name and version (e.g., "npmAuthenticate@0") */
	readonly task: string;
	/** Task inputs */
	readonly inputs?: Record<string, any>;
}

export class Task extends Step {
	public readonly task: string;
	public readonly inputs?: Record<string, any>;

	constructor(props: TaskProps) {
		super(props);
		this.task = props.task;
		this.inputs = props.inputs;
	}

	synthesize() {
		const result: any = {
			task: this.task
		};

		// Add inputs if they exist
		if (this.inputs && Object.keys(this.inputs).length > 0) {
			result.inputs = this.inputs;
		}

		// Add common step properties
		this.addCommonProps(result);

		return result;
	}
}
