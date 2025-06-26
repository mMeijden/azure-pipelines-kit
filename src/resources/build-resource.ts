import { Resource, BaseResourceProps } from "./resource";

/**
 * Properties for Build resource
 */
export interface BuildResourceProps extends BaseResourceProps {
	/** Build definition ID or name */
	readonly definition: string;
	/** Project name (if different from current) */
	readonly project?: string;
	/** Source type */
	readonly source?: string;
	/** Specific version to reference */
	readonly version?: string;
	/** Branch to reference */
	readonly branch?: string;
	/** Tags to filter builds */
	readonly tags?: string[];
	/** Trigger configuration */
	readonly trigger?: {
		/** Enable automatic triggering */
		readonly enabled?: boolean;
		/** Branches that trigger */
		readonly branches?: string[];
		/** Paths that trigger */
		readonly paths?: string[];
		/** Tags that trigger */
		readonly tags?: string[];
	};
}

/**
 * Build resource construct
 *
 * References build definitions for artifact consumption
 */
export class BuildResource extends Resource {
	public readonly definition: string;
	public readonly project?: string;
	public readonly source?: string;
	public readonly version?: string;
	public readonly branch?: string;
	public readonly tags?: string[];
	public readonly trigger?: any;

	constructor(props: BuildResourceProps) {
		super(props.name);
		this.definition = props.definition;
		this.project = props.project;
		this.source = props.source;
		this.version = props.version;
		this.branch = props.branch;
		this.tags = props.tags;
		this.trigger = props.trigger;
	}

	synthesize(): any {
		const result: any = {
			build: this.name,
			source: this.definition
		};

		if (this.project !== undefined) {
			result.project = this.project;
		}
		if (this.source !== undefined) {
			result.source = this.source;
		}
		if (this.version !== undefined) {
			result.version = this.version;
		}
		if (this.branch !== undefined) {
			result.branch = this.branch;
		}
		if (this.tags !== undefined && this.tags.length > 0) {
			result.tags = this.tags;
		}
		if (this.trigger !== undefined) {
			result.trigger = this.trigger;
		}

		return result;
	}

	/**
	 * Create a build resource with automatic triggering
	 */
	static withTrigger(name: string, definition: string, triggerBranches: string[], project?: string): BuildResource {
		return new BuildResource({
			name,
			definition,
			project,
			trigger: {
				enabled: true,
				branches: triggerBranches
			}
		});
	}

	/**
	 * Create a simple build resource reference
	 */
	static create(name: string, definition: string, project?: string): BuildResource {
		return new BuildResource({
			name,
			definition,
			project
		});
	}
}
