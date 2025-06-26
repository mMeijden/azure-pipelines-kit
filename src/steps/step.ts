/**
 * Base interface for all step types
 */
export interface BaseStepProps {
	/** Display name for the step */
	readonly displayName?: string;
	/** Condition under which the step will run */
	readonly condition?: string;
	/** Whether to continue on error */
	readonly continueOnError?: boolean;
	/** Whether this step is enabled */
	readonly enabled?: boolean;
	/** Environment variables for the step */
	readonly env?: Record<string, string>;
	/** Timeout in minutes */
	readonly timeoutInMinutes?: number;
	/** Retry policy */
	readonly retryCountOnTaskFailure?: number;
}

/**
 * Abstract base class for all step types
 * Note: Steps do NOT extend Construct to avoid _node property pollution
 */
export abstract class Step {
	public readonly displayName?: string;
	public readonly condition?: string;
	public readonly continueOnError?: boolean;
	public readonly enabled?: boolean;
	public readonly env?: Record<string, string>;
	public readonly timeoutInMinutes?: number;
	public readonly retryCountOnTaskFailure?: number;

	constructor(props: BaseStepProps = {}) {
		this.displayName = props.displayName;
		this.condition = props.condition;
		this.continueOnError = props.continueOnError;
		this.enabled = props.enabled;
		this.env = props.env;
		this.timeoutInMinutes = props.timeoutInMinutes;
		this.retryCountOnTaskFailure = props.retryCountOnTaskFailure;
	}

	/**
	 * Add common step properties to the synthesized output
	 */
	protected addCommonProps(result: any): void {
		if (this.displayName !== undefined) result.displayName = this.displayName;
		if (this.condition !== undefined) result.condition = this.condition;
		if (this.continueOnError !== undefined) result.continueOnError = this.continueOnError;
		if (this.enabled !== undefined) result.enabled = this.enabled;
		if (this.env !== undefined) result.env = this.env;
		if (this.timeoutInMinutes !== undefined) result.timeoutInMinutes = this.timeoutInMinutes;
		if (this.retryCountOnTaskFailure !== undefined) result.retryCountOnTaskFailure = this.retryCountOnTaskFailure;
	}

	abstract synthesize(): any;
}
