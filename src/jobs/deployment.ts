import { Construct } from "../construct";
import { Environment } from "./environment";
import { RunOnceStrategy, RollingStrategy, CanaryStrategy } from "@strategies";

export interface WorkspaceOptions {
	/** What to clean up before the job runs */
	readonly clean?: "outputs" | "resources" | "all";
}

export interface UsesOptions {
	/** Repository references */
	readonly repositories?: string[];
	/** Pool references */
	readonly pools?: string[];
}

export interface DeploymentProps {
	/** Name of the deployment job, A-Z, a-z, 0-9, and underscore. The word deploy is a keyword and is unsupported as the deployment name. */
	readonly deployment: string;
	/** Human-readable name for the deployment */
	readonly displayName?: string;
	/** Any jobs which must complete before this one */
	readonly dependsOn?: string | string[];
	/** Evaluate this condition expression to determine whether to run this deployment */
	readonly condition?: string;
	/** Continue running even on failure? */
	readonly continueOnError?: string;
	/** Time to wait for this job to complete before the server kills it */
	readonly timeoutInMinutes?: string;
	/** Time to wait for the job to cancel before forcibly terminating it */
	readonly cancelTimeoutInMinutes?: string;
	/** Deployment-specific variables */
	readonly variables?: any; // variables | variable[]
	/** Pool where this job will run */
	readonly pool?: string | any; // string | pool
	/** Target environment name and optionally a resource name to record the deployment history; format: environment-name.resource-name */
	readonly environment?: string | Environment;
	/** Execution strategy for this deployment */
	readonly strategy?: RunOnceStrategy | RollingStrategy | CanaryStrategy;
	/** Workspace options on the agent */
	readonly workspace?: WorkspaceOptions;
	/** Any resources required by this job that are not already referenced */
	readonly uses?: UsesOptions;
	/** Container resource name */
	readonly container?: string | any; // string | container
	/** Container resources to run as a service container */
	readonly services?: Record<string, string>;
	/** Deployment related information passed from a pipeline when extending a template */
	readonly templateContext?: any;
}

export class Deployment extends Construct {
	public readonly deployment: string;
	public readonly displayName?: string;
	public readonly dependsOn?: string | string[];
	public readonly condition?: string;
	public readonly continueOnError?: string;
	public readonly timeoutInMinutes?: string;
	public readonly cancelTimeoutInMinutes?: string;
	public readonly variables?: any;
	public readonly pool?: string | any;
	public readonly environment?: string | Environment;
	public readonly strategy?: RunOnceStrategy | RollingStrategy | CanaryStrategy;
	public readonly workspace?: WorkspaceOptions;
	public readonly uses?: UsesOptions;
	public readonly container?: string | any;
	public readonly services?: Record<string, string>;
	public readonly templateContext?: any;

	constructor(props: DeploymentProps) {
		super();

		// Validate deployment name
		if (!props.deployment || props.deployment.trim() === "") {
			throw new Error("Deployment name cannot be empty");
		}

		if (props.deployment.toLowerCase() === "deploy") {
			throw new Error('The word "deploy" is a keyword and is unsupported as the deployment name');
		}

		// Validate deployment name format (A-Z, a-z, 0-9, and underscore)
		if (!/^[A-Za-z0-9_]+$/.test(props.deployment)) {
			throw new Error("Deployment name must contain only A-Z, a-z, 0-9, and underscore characters");
		}

		this.deployment = props.deployment;
		this.displayName = props.displayName;
		this.dependsOn = props.dependsOn;
		this.condition = props.condition;
		this.continueOnError = props.continueOnError;
		this.timeoutInMinutes = props.timeoutInMinutes;
		this.cancelTimeoutInMinutes = props.cancelTimeoutInMinutes;
		this.variables = props.variables;
		this.pool = props.pool;
		this.environment = props.environment;
		this.strategy = props.strategy;
		this.workspace = props.workspace;
		this.uses = props.uses;
		this.container = props.container;
		this.services = props.services;
		this.templateContext = props.templateContext;
	}

	synthesize() {
		// Start with required property
		const result: any = { deployment: this.deployment };

		// Helper function to add property if it has a value
		const addIfDefined = (key: string, value: any) => {
			if (value !== undefined && value !== null) {
				result[key] = value;
			}
		};

		// Add all optional properties
		addIfDefined("displayName", this.displayName);

		// Handle environment specially - it can be a string or an Environment object
		if (this.environment !== undefined && this.environment !== null) {
			result.environment = typeof this.environment === "string" ? this.environment : this.environment.synthesize();
		}

		// Handle strategy specially - it needs to be synthesized
		if (this.strategy !== undefined && this.strategy !== null) {
			result.strategy = this.strategy.synthesize();
		}

		addIfDefined("dependsOn", this.dependsOn);
		addIfDefined("condition", this.condition);
		addIfDefined("continueOnError", this.continueOnError);
		addIfDefined("timeoutInMinutes", this.timeoutInMinutes);
		addIfDefined("cancelTimeoutInMinutes", this.cancelTimeoutInMinutes);
		addIfDefined("variables", this.variables);
		addIfDefined("pool", this.pool);
		addIfDefined("workspace", this.workspace);
		addIfDefined("uses", this.uses);
		addIfDefined("container", this.container);
		addIfDefined("services", this.services);
		addIfDefined("templateContext", this.templateContext);

		return result;
	}
}
