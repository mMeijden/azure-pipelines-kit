import { Step, BaseStepProps } from "./step";

/**
 * Properties for ReviewApp step
 */
export interface ReviewAppStepProps extends BaseStepProps {
	/** The deployment provider (e.g., 'kubernetes', 'containerInstance') */
	readonly provider: string;
	/** The resource name */
	readonly resourceName?: string;
	/** The resource type */
	readonly resourceType?: string;
	/** Additional configuration for the provider */
	readonly configuration?: Record<string, any>;
}

/**
 * ReviewApp step construct
 *
 * Creates a resource dynamically under a deploy phase provider
 */
export class ReviewAppStep extends Step {
	public readonly provider: string;
	public readonly resourceName?: string;
	public readonly resourceType?: string;
	public readonly configuration?: Record<string, any>;

	constructor(props: ReviewAppStepProps) {
		super(props);
		this.provider = props.provider;
		this.resourceName = props.resourceName;
		this.resourceType = props.resourceType;
		this.configuration = props.configuration;
	}

	synthesize(): any {
		const result: any = {
			reviewApp: {
				provider: this.provider
			}
		};

		if (this.resourceName !== undefined) {
			result.reviewApp.resourceName = this.resourceName;
		}
		if (this.resourceType !== undefined) {
			result.reviewApp.resourceType = this.resourceType;
		}
		if (this.configuration !== undefined) {
			result.reviewApp.configuration = this.configuration;
		}

		this.addCommonProps(result);
		return result;
	}

	/**
	 * Create a simple review app step
	 */
	static create(provider: string, displayName?: string): ReviewAppStep {
		return new ReviewAppStep({ provider, displayName });
	}

	/**
	 * Create a review app step with resource configuration
	 */
	static withResource(provider: string, resourceName: string, resourceType: string, displayName?: string): ReviewAppStep {
		return new ReviewAppStep({ provider, resourceName, resourceType, displayName });
	}

	/**
	 * Create a Kubernetes review app
	 */
	static kubernetes(resourceName?: string, displayName?: string): ReviewAppStep {
		return new ReviewAppStep({
			provider: "kubernetes",
			resourceName,
			resourceType: "namespace",
			displayName
		});
	}

	/**
	 * Create a Container Instance review app
	 */
	static containerInstance(resourceName?: string, displayName?: string): ReviewAppStep {
		return new ReviewAppStep({
			provider: "containerInstance",
			resourceName,
			displayName
		});
	}
}
