import { Step, BaseStepProps } from "./step";

/**
 * Properties for Task step
 */
export interface TaskStepProps extends BaseStepProps {
	/** Task name and version (e.g., "AzureWebApp@1") */
	readonly task: string;
	/** Task inputs */
	readonly inputs?: Record<string, any>;
	/** Task name for reference */
	readonly name?: string;
}

/**
 * Task step construct
 *
 * Runs a predefined Azure DevOps task
 */
export class TaskStep extends Step {
	public readonly task: string;
	public readonly inputs?: Record<string, any>;
	public readonly name?: string;

	constructor(props: TaskStepProps) {
		super(props);
		this.task = props.task;
		this.inputs = props.inputs;
		this.name = props.name;
	}

	synthesize(): any {
		const result: any = {
			task: this.task
		};

		if (this.inputs !== undefined && Object.keys(this.inputs).length > 0) {
			result.inputs = this.inputs;
		}
		if (this.name !== undefined) {
			result.name = this.name;
		}

		this.addCommonProps(result);
		return result;
	}

	/**
	 * Create a simple task step
	 */
	static create(task: string, inputs?: Record<string, any>, displayName?: string): TaskStep {
		return new TaskStep({ task, inputs, displayName });
	}
}
