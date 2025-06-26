import { Step, BaseStepProps } from "./step";

/**
 * Properties for Checkout step
 */
export interface CheckoutStepProps extends BaseStepProps {
	/** Repository to checkout ('self' for current repo, or repository resource name) */
	readonly checkout: string;
	/** Whether to clean the repository */
	readonly clean?: boolean;
	/** Fetch depth */
	readonly fetchDepth?: number;
	/** Whether to download LFS files */
	readonly lfs?: boolean;
	/** Submodules to checkout */
	readonly submodules?: boolean | "recursive";
	/** Path to checkout the repository to */
	readonly path?: string;
	/** Whether to persist credentials */
	readonly persistCredentials?: boolean;
}

/**
 * Checkout step construct
 *
 * Checks out source code from a repository
 */
export class CheckoutStep extends Step {
	public readonly checkout: string;
	public readonly clean?: boolean;
	public readonly fetchDepth?: number;
	public readonly lfs?: boolean;
	public readonly submodules?: boolean | "recursive";
	public readonly path?: string;
	public readonly persistCredentials?: boolean;

	constructor(props: CheckoutStepProps) {
		super(props);
		this.checkout = props.checkout;
		this.clean = props.clean;
		this.fetchDepth = props.fetchDepth;
		this.lfs = props.lfs;
		this.submodules = props.submodules;
		this.path = props.path;
		this.persistCredentials = props.persistCredentials;
	}

	synthesize(): any {
		const result: any = {
			checkout: this.checkout
		};

		if (this.clean !== undefined) result.clean = this.clean;
		if (this.fetchDepth !== undefined) result.fetchDepth = this.fetchDepth;
		if (this.lfs !== undefined) result.lfs = this.lfs;
		if (this.submodules !== undefined) result.submodules = this.submodules;
		if (this.path !== undefined) result.path = this.path;
		if (this.persistCredentials !== undefined) result.persistCredentials = this.persistCredentials;

		this.addCommonProps(result);
		return result;
	}

	/**
	 * Create a checkout step for the current repository
	 */
	static self(clean?: boolean): CheckoutStep {
		return new CheckoutStep({ checkout: "self", clean });
	}

	/**
	 * Create a checkout step for a specific repository
	 */
	static repository(repository: string, path?: string): CheckoutStep {
		return new CheckoutStep({ checkout: repository, path });
	}
}
