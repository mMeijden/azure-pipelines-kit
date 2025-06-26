import { Resource, BaseResourceProps } from "./resource";

/**
 * Properties for Package resource
 */
export interface PackageResourceProps extends BaseResourceProps {
	/** Package type (npm, nuget, pypi, maven, etc.) */
	readonly type: "npm" | "nuget" | "pypi" | "maven" | "cargo" | "pip" | "composer";
	/** Connection to package feed */
	readonly connection?: string;
	/** Package name/identifier */
	readonly packageName?: string;
	/** Package version */
	readonly version?: string;
	/** Package scope (for npm packages) */
	readonly scope?: string;
	/** Package source/feed */
	readonly source?: string;
	/** Trigger configuration */
	readonly trigger?: {
		/** Enable automatic triggering */
		readonly enabled?: boolean;
		/** Tags that trigger */
		readonly tags?: string[];
	};
}

/**
 * Package resource construct
 *
 * References external packages for use in the pipeline
 */
export class PackageResource extends Resource {
	public readonly type: string;
	public readonly connection?: string;
	public readonly packageName?: string;
	public readonly version?: string;
	public readonly scope?: string;
	public readonly source?: string;
	public readonly trigger?: any;

	constructor(props: PackageResourceProps) {
		super(props.name);
		this.type = props.type;
		this.connection = props.connection;
		this.packageName = props.packageName;
		this.version = props.version;
		this.scope = props.scope;
		this.source = props.source;
		this.trigger = props.trigger;
	}

	synthesize(): any {
		const result: any = {
			package: this.name,
			type: this.type
		};

		if (this.connection !== undefined) {
			result.connection = this.connection;
		}
		if (this.packageName !== undefined) {
			result.name = this.packageName;
		}
		if (this.version !== undefined) {
			result.version = this.version;
		}
		if (this.scope !== undefined) {
			result.scope = this.scope;
		}
		if (this.source !== undefined) {
			result.source = this.source;
		}
		if (this.trigger !== undefined) {
			result.trigger = this.trigger;
		}

		return result;
	}

	/**
	 * Create an NPM package resource
	 */
	static npm(name: string, packageName: string, version?: string, connection?: string): PackageResource {
		return new PackageResource({
			name,
			type: "npm",
			packageName,
			version,
			connection
		});
	}

	/**
	 * Create a NuGet package resource
	 */
	static nuget(name: string, packageName: string, version?: string, connection?: string): PackageResource {
		return new PackageResource({
			name,
			type: "nuget",
			packageName,
			version,
			connection
		});
	}

	/**
	 * Create a PyPI package resource
	 */
	static pypi(name: string, packageName: string, version?: string, connection?: string): PackageResource {
		return new PackageResource({
			name,
			type: "pypi",
			packageName,
			version,
			connection
		});
	}

	/**
	 * Create a Maven package resource
	 */
	static maven(name: string, packageName: string, version?: string, connection?: string): PackageResource {
		return new PackageResource({
			name,
			type: "maven",
			packageName,
			version,
			connection
		});
	}

	/**
	 * Create a package resource with trigger
	 */
	static withTrigger(name: string, type: PackageResourceProps["type"], packageName: string, triggerTags: string[]): PackageResource {
		return new PackageResource({
			name,
			type,
			packageName,
			trigger: {
				enabled: true,
				tags: triggerTags
			}
		});
	}
}
