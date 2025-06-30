import { Construct } from "../construct";
import * as YAML from "yaml";
import { Extends } from "./extends";
import { Stage } from "./stage";
import { Template } from "./template";
import { Resources } from "../resources/resources";

export interface PipelineProps {
	/** Name of the pipeline */
	name?: string;
	/** Trigger configuration */
	trigger?: any;
	/** Pool configuration */
	pool?: any;
	/** Variables for the pipeline */
	variables?: any;
	/** Resources for the pipeline */
	resources?: Resources;
}

export class Pipeline {
	private constructs: Construct[];
	private stages: (Stage | Template)[];
	private props: PipelineProps;
	private resources?: Resources;

	constructor(props: PipelineProps = {}) {
		this.constructs = [];
		this.stages = [];
		this.props = props;
		this.resources = props.resources;
	}

	add(construct: Construct) {
		this.constructs.push(construct);
	}

	/**
	 * Set resources for the pipeline
	 */
	setResources(resources: Resources) {
		this.resources = resources;
	}

	/**
	 * Add resources to the pipeline
	 */
	addResources(resources: Resources) {
		this.resources = resources;
	}

	/**
	 * Add or update the pipeline trigger
	 */
	addTrigger(trigger: any) {
		this.props.trigger = trigger;
	}

	/**
	 * Add or update a single pipeline variable
	 */
	addVariable(key: string, value: any) {
		if (!this.props.variables) this.props.variables = {};
		this.props.variables[key] = value;
	}

	/**
	 * Add or update multiple pipeline variables
	 */
	addVariables(vars: Record<string, any>) {
		if (!this.props.variables) this.props.variables = {};
		Object.assign(this.props.variables, vars);
	}

	/**
	 * Add or update the pipeline pool
	 */
	addPool(pool: any) {
		this.props.pool = pool;
	}

	synthesize(): string {
		const pipelineConfig: any = {};

		// Add pipeline-level properties
		if (this.props.name) pipelineConfig.name = this.props.name;
		if (this.props.trigger) pipelineConfig.trigger = this.props.trigger;
		if (this.props.pool) {
			// Special handling for Pool instances
			if (this.props.pool && typeof this.props.pool.synthesize === "function") {
				pipelineConfig.pool = this.props.pool.synthesize();
			} else {
				pipelineConfig.pool = this.props.pool;
			}
		}
		if (this.props.variables) pipelineConfig.variables = this.props.variables;

		// Add resources if they exist
		if (this.resources) {
			const resourcesConfig = this.resources.synthesize();
			if (resourcesConfig) {
				pipelineConfig.resources = resourcesConfig;
			}
		}

		// Add constructs (extends, etc.)
		const constructsConfig = this.constructs.reduce((acc, construct) => {
			return { ...acc, ...construct.synthesize() };
		}, {});

		// Add stages if they exist
		if (this.stages.length > 0) {
			pipelineConfig.stages = this.stages.map((stage) => stage.synthesize());
		}

		// Merge everything together
		const finalConfig = { ...constructsConfig, ...pipelineConfig };

		return YAML.stringify(finalConfig, {
			lineWidth: 0,
			minContentWidth: 0
		});
	}

	extends(name: string, parameters: { [key: string]: any }) {
		this.constructs.push(new Extends(name, parameters));
	}

	addStage(stage: Stage | Template) {
		this.stages.push(stage);
	}
}
