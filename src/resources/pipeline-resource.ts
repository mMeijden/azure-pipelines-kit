import { Resource, BaseResourceProps } from "./resource";

/**
 * Properties for Pipeline resource
 */
export interface PipelineResourceProps extends BaseResourceProps {
	/** Source pipeline identifier */
	readonly pipeline: string;
	/** Project name (if different from current) */
	readonly project?: string;
	/** Source type (e.g., 'azurePipelines') */
	readonly source?: string;
	/** Specific version to download */
	readonly version?: string;
	/** Branch to trigger from */
	readonly branch?: string;
	/** Tags to filter builds */
	readonly tags?: string[];
	/** Trigger configuration */
	readonly trigger?: {
		/** Enable automatic triggering */
		readonly enabled?: boolean;
		/** Branches that trigger this pipeline */
		readonly branches?: string[];
		/** Paths that trigger this pipeline */
		readonly paths?: string[];
		/** Tags that trigger this pipeline */
		readonly tags?: string[];
		/** Stages to trigger on */
		readonly stages?: string[];
	};
}

/**
 * Pipeline resource construct
 *
 * References other Azure Pipelines for artifact consumption and triggering
 */
export class PipelineResource extends Resource {
	public readonly pipeline: string;
	public readonly project?: string;
	public readonly source?: string;
	public readonly version?: string;
	public readonly branch?: string;
	public readonly tags?: string[];
	public readonly trigger?: any;

	constructor(props: PipelineResourceProps) {
		super(props.name);
		this.pipeline = props.pipeline;
		this.project = props.project;
		this.source = props.source;
		this.version = props.version;
		this.branch = props.branch;
		this.tags = props.tags;
		this.trigger = props.trigger;
	}

	synthesize(): any {
		const result: any = {
			pipeline: this.name,
			source: this.pipeline
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
	 * Create a pipeline resource with automatic triggering
	 */
	static withTrigger(name: string, pipeline: string, triggerBranches: string[], project?: string): PipelineResource {
		return new PipelineResource({
			name,
			pipeline,
			project,
			trigger: {
				enabled: true,
				branches: triggerBranches
			}
		});
	}

	/**
	 * Create a simple pipeline resource reference
	 */
	static create(name: string, pipeline: string, project?: string): PipelineResource {
		return new PipelineResource({
			name,
			pipeline,
			project
		});
	}
}
