import { Resource, BaseResourceProps } from "./resource";

/**
 * Properties for Repository resource
 */
export interface RepositoryResourceProps extends BaseResourceProps {
	/** Repository type (git, github, bitbucket, etc.) */
	readonly type: "git" | "github" | "githubenterprise" | "bitbucket" | "tfsgit";
	/** Repository endpoint/connection name */
	readonly endpoint?: string;
	/** Repository URL or identifier */
	readonly repository?: string;
	/** Default branch to checkout */
	readonly ref?: string;
	/** Trigger configuration */
	readonly trigger?: {
		/** Enable trigger */
		readonly enabled?: boolean;
		/** Branches to trigger on */
		readonly branches?: string[];
		/** Paths to trigger on */
		readonly paths?: string[];
		/** Tags to trigger on */
		readonly tags?: string[];
	};
}

/**
 * Repository resource construct
 *
 * References external repositories for use in the pipeline
 */
export class RepositoryResource extends Resource {
	public readonly type: string;
	public readonly endpoint?: string;
	public readonly repository?: string;
	public readonly ref?: string;
	public readonly trigger?: any;

	constructor(props: RepositoryResourceProps) {
		super(props.name);
		this.type = props.type;
		this.endpoint = props.endpoint;
		this.repository = props.repository;
		this.ref = props.ref;
		this.trigger = props.trigger;
	}

	synthesize(): any {
		const result: any = {
			repository: this.name,
			type: this.type
		};

		if (this.endpoint !== undefined) {
			result.endpoint = this.endpoint;
		}
		if (this.repository !== undefined) {
			result.name = this.repository;
		}
		if (this.ref !== undefined) {
			result.ref = this.ref;
		}
		if (this.trigger !== undefined) {
			result.trigger = this.trigger;
		}

		return result;
	}

	/**
	 * Create a GitHub repository resource
	 */
	static github(name: string, repository: string, endpoint?: string): RepositoryResource {
		return new RepositoryResource({
			name,
			type: "github",
			repository,
			endpoint
		});
	}

	/**
	 * Create a Bitbucket repository resource
	 */
	static bitbucket(name: string, repository: string, endpoint?: string): RepositoryResource {
		return new RepositoryResource({
			name,
			type: "bitbucket",
			repository,
			endpoint
		});
	}

	/**
	 * Create a Git repository resource
	 */
	static git(name: string, repository: string, endpoint?: string): RepositoryResource {
		return new RepositoryResource({
			name,
			type: "git",
			repository,
			endpoint
		});
	}
}
