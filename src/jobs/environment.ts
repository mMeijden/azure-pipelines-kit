import { Construct } from "../construct";

/**
 * Full syntax environment object properties for complete control
 */
export interface EnvironmentObjectProps {
	/** Name of environment */
	readonly name: string;
	/** Name of resource */
	readonly resourceName?: string;
	/** Id of resource */
	readonly resourceId?: string;
	/** Type of environment resource */
	readonly resourceType?: string;
	/** List of tag filters */
	readonly tags?: string;
}

/**
 * Environment can be either a simple string or a full environment object
 */
export type EnvironmentProps = string | EnvironmentObjectProps;

/**
 * Environment construct for deployment jobs
 *
 * Supports both simple string format and full object format:
 * - Simple: environment: "production"
 * - Full: environment: { name: "production", resourceName: "web-server", ... }
 */
export class Environment extends Construct {
	private readonly props: EnvironmentProps;

	constructor(props: EnvironmentProps) {
		super();

		if (typeof props === "string") {
			if (!props || props.trim() === "") {
				throw new Error("Environment name cannot be empty");
			}
		} else {
			if (!props.name || props.name.trim() === "") {
				throw new Error("Environment name cannot be empty");
			}
		}

		this.props = props;
	}

	/**
	 * Get the environment name
	 */
	get name(): string {
		return typeof this.props === "string" ? this.props : this.props.name;
	}

	/**
	 * Check if this is a simple string environment
	 */
	get isSimple(): boolean {
		return typeof this.props === "string";
	}

	/**
	 * Get the full environment object (if applicable)
	 */
	get environmentObject(): EnvironmentObjectProps | undefined {
		return typeof this.props === "string" ? undefined : this.props;
	}

	synthesize() {
		// For simple string environments, return just the string
		if (typeof this.props === "string") {
			return this.props;
		}

		// For full environment objects, return the complete object
		const result: any = {
			name: this.props.name
		};

		// Add optional properties if they have values
		if (this.props.resourceName !== undefined) {
			result.resourceName = this.props.resourceName;
		}
		if (this.props.resourceId !== undefined) {
			result.resourceId = this.props.resourceId;
		}
		if (this.props.resourceType !== undefined) {
			result.resourceType = this.props.resourceType;
		}
		if (this.props.tags !== undefined) {
			result.tags = this.props.tags;
		}

		return result;
	}

	/**
	 * Create a simple string environment
	 */
	static fromString(name: string): Environment {
		return new Environment(name);
	}

	/**
	 * Create a full environment object with all properties
	 */
	static fromObject(props: EnvironmentObjectProps): Environment {
		return new Environment(props);
	}
}
