import { Construct } from "../construct";
import { Step } from "../steps/step";
import { TemplateExpression, isTemplateExpression } from "../expressions/template-expression";
import { synthesizeConditional } from "../expressions/conditional-helpers";
import { Task } from "../tasks/task";

export interface JobProps {
	/** ID of the job */
	readonly job: string;
	/** Human-readable name for the job */
	readonly displayName?: string;
	/** Any jobs which must complete before this one */
	readonly dependsOn?: string | string[];
	/** Evaluate this condition expression to determine whether to run this job */
	readonly condition?: string;
	/** Continue running even on failure? */
	readonly continueOnError?: string;
	/** Time to wait for this job to complete before the server kills it */
	readonly timeoutInMinutes?: string;
	/** Time to wait for the job to cancel before forcibly terminating it */
	readonly cancelTimeoutInMinutes?: string;
	/** Steps to execute in this job - can include conditional steps */
	readonly steps?: (Step | TemplateExpression<Step>)[];
	/** Pool configuration for this job */
	readonly pool?: any;
}

export class Job extends Construct {
	public readonly job: string;
	public readonly displayName?: string;
	public readonly dependsOn?: string | string[];
	public readonly condition?: string;
	public readonly continueOnError?: string;
	public readonly timeoutInMinutes?: string;
	public readonly cancelTimeoutInMinutes?: string;
	private _steps: (Step | TemplateExpression<Step>)[];
	public readonly pool?: any;

	constructor(props: JobProps) {
		super();
		this.job = props.job;
		this.displayName = props.displayName;
		this.dependsOn = props.dependsOn;
		this.condition = props.condition;
		this.continueOnError = props.continueOnError;
		this.timeoutInMinutes = props.timeoutInMinutes;
		this.cancelTimeoutInMinutes = props.cancelTimeoutInMinutes;
		this._steps = props.steps || [];
		this.pool = props.pool;
	}

	/**
	 * Get the current steps in this job
	 */
	public get steps(): (Step | TemplateExpression<Step>)[] {
		return this._steps;
	}

	/**
	 * Add a step to this job
	 * @param step The step to add (can be a regular step or a template expression)
	 */
	public addStep(step: Step | TemplateExpression<Step>): void {
		this._steps.push(step);
	}

	synthesize() {
		const result: any = {
			job: this.job
		};

		// Define optional properties to include if they have values
		const optionalProps: Array<keyof Omit<JobProps, "job" | "steps">> = [
			"displayName",
			"dependsOn",
			"condition",
			"continueOnError",
			"timeoutInMinutes",
			"cancelTimeoutInMinutes",
			"pool"
		];

		// Add optional properties that have values
		optionalProps.forEach((prop) => {
			let value = this[prop];
			if (value !== undefined && value !== null) {
				// Special handling for pool - if it's a Pool instance, synthesize it
				if (prop === "pool" && value && typeof value.synthesize === "function") {
					value = value.synthesize();
				}
				result[prop] = value;
			}
		});

		// Add steps if provided
		if (this.steps && this.steps.length > 0) {
			result.steps = synthesizeConditional(this.steps, (step) => step.synthesize());
		}

		return result;
	}
}
