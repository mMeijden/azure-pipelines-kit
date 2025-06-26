import { Step, BaseStepProps } from "./step";

/**
 * Properties for Download step
 */
export interface DownloadStepProps extends BaseStepProps {
	/** Type of download ('current', 'specific', or pipeline resource name) */
	readonly download: string;
	/** Artifact name to download */
	readonly artifact?: string;
	/** Patterns to include when downloading */
	readonly patterns?: string | string[];
	/** Path to download to */
	readonly path?: string;
}

/**
 * Download step construct
 *
 * Downloads artifacts from the current pipeline or other pipelines
 */
export class DownloadStep extends Step {
	public readonly download: string;
	public readonly artifact?: string;
	public readonly patterns?: string | string[];
	public readonly path?: string;

	constructor(props: DownloadStepProps) {
		super(props);
		this.download = props.download;
		this.artifact = props.artifact;
		this.patterns = props.patterns;
		this.path = props.path;
	}

	synthesize(): any {
		const result: any = {
			download: this.download
		};

		if (this.artifact !== undefined) result.artifact = this.artifact;
		if (this.patterns !== undefined) result.patterns = this.patterns;
		if (this.path !== undefined) result.path = this.path;

		this.addCommonProps(result);
		return result;
	}

	/**
	 * Download artifacts from current pipeline
	 */
	static current(artifact?: string, path?: string): DownloadStep {
		return new DownloadStep({ download: "current", artifact, path });
	}

	/**
	 * Download all artifacts from current pipeline
	 */
	static all(path?: string): DownloadStep {
		return new DownloadStep({ download: "current", path });
	}
}
