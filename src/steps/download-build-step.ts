import { Step, BaseStepProps } from "./step";

/**
 * Properties for DownloadBuild step
 */
export interface DownloadBuildStepProps extends BaseStepProps {
	/** The build definition ID or name */
	readonly buildDefinition: string;
	/** The build version to download */
	readonly buildVersion?: string;
	/** The project from which to download the build */
	readonly project?: string;
	/** The download path */
	readonly downloadPath?: string;
	/** Specific artifact name to download */
	readonly artifactName?: string;
	/** Whether to clean the destination folder before downloading */
	readonly cleanDestinationFolder?: boolean;
	/** The build number/version to download. Defaults to latest */
	readonly buildVersionToDownload?: "latest" | "latestFromBranch" | "specific";
	/** The branch to download from when using latestFromBranch */
	readonly branchName?: string;
	/** Pattern to match artifact names */
	readonly itemPattern?: string;
	/** Tags to filter builds */
	readonly tags?: string[];
}

/**
 * DownloadBuild step construct
 *
 * Downloads build artifacts from Azure Pipelines
 */
export class DownloadBuildStep extends Step {
	public readonly buildDefinition: string;
	public readonly buildVersion?: string;
	public readonly project?: string;
	public readonly downloadPath?: string;
	public readonly artifactName?: string;
	public readonly cleanDestinationFolder?: boolean;
	public readonly buildVersionToDownload?: string;
	public readonly branchName?: string;
	public readonly itemPattern?: string;
	public readonly tags?: string[];

	constructor(props: DownloadBuildStepProps) {
		super(props);
		this.buildDefinition = props.buildDefinition;
		this.buildVersion = props.buildVersion;
		this.project = props.project;
		this.downloadPath = props.downloadPath;
		this.artifactName = props.artifactName;
		this.cleanDestinationFolder = props.cleanDestinationFolder;
		this.buildVersionToDownload = props.buildVersionToDownload;
		this.branchName = props.branchName;
		this.itemPattern = props.itemPattern;
		this.tags = props.tags;
	}

	synthesize(): any {
		const result: any = {
			downloadBuild: {
				definition: this.buildDefinition
			}
		};

		if (this.buildVersion !== undefined) {
			result.downloadBuild.version = this.buildVersion;
		}
		if (this.project !== undefined) {
			result.downloadBuild.project = this.project;
		}
		if (this.downloadPath !== undefined) {
			result.downloadBuild.downloadPath = this.downloadPath;
		}
		if (this.artifactName !== undefined) {
			result.downloadBuild.artifact = this.artifactName;
		}
		if (this.cleanDestinationFolder !== undefined) {
			result.downloadBuild.cleanDestinationFolder = this.cleanDestinationFolder;
		}
		if (this.buildVersionToDownload !== undefined) {
			result.downloadBuild.buildVersionToDownload = this.buildVersionToDownload;
		}
		if (this.branchName !== undefined) {
			result.downloadBuild.branchName = this.branchName;
		}
		if (this.itemPattern !== undefined) {
			result.downloadBuild.itemPattern = this.itemPattern;
		}
		if (this.tags !== undefined && this.tags.length > 0) {
			result.downloadBuild.tags = this.tags;
		}

		this.addCommonProps(result);
		return result;
	}

	/**
	 * Create a simple download build step
	 */
	static create(buildDefinition: string, displayName?: string): DownloadBuildStep {
		return new DownloadBuildStep({ buildDefinition, displayName });
	}

	/**
	 * Create a download build step with specific artifact
	 */
	static withArtifact(buildDefinition: string, artifactName: string, displayName?: string): DownloadBuildStep {
		return new DownloadBuildStep({ buildDefinition, artifactName, displayName });
	}

	/**
	 * Create a download build step with custom path
	 */
	static withPath(buildDefinition: string, downloadPath: string, displayName?: string): DownloadBuildStep {
		return new DownloadBuildStep({ buildDefinition, downloadPath, displayName });
	}

	/**
	 * Create a download build step for latest from specific branch
	 */
	static fromBranch(buildDefinition: string, branchName: string, displayName?: string): DownloadBuildStep {
		return new DownloadBuildStep({
			buildDefinition,
			branchName,
			buildVersionToDownload: "latestFromBranch",
			displayName
		});
	}
}
