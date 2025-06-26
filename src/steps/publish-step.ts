import { Step, BaseStepProps } from "./step";

/**
 * Properties for Publish step
 */
export interface PublishStepProps extends BaseStepProps {
	/** Type of publish ('publish' for artifacts) */
	readonly publish: string;
	/** Artifact name */
	readonly artifact?: string;
	/** Path to files to publish */
	readonly path?: string;
}

/**
 * Publish step construct
 *
 * Publishes artifacts for use in later stages or jobs
 */
export class PublishStep extends Step {
	public readonly publish: string;
	public readonly artifact?: string;
	public readonly path?: string;

	constructor(props: PublishStepProps) {
		super(props);
		this.publish = props.publish;
		this.artifact = props.artifact;
		this.path = props.path;
	}

	synthesize(): any {
		const result: any = {
			publish: this.publish
		};

		if (this.artifact !== undefined) result.artifact = this.artifact;
		if (this.path !== undefined) result.path = this.path;

		this.addCommonProps(result);
		return result;
	}

	/**
	 * Publish build artifacts
	 */
	static artifact(artifactName: string, path: string, displayName?: string): PublishStep {
		return new PublishStep({
			publish: path,
			artifact: artifactName,
			displayName
		});
	}
}
