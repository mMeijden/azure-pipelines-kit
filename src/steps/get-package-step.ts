import { Step, BaseStepProps } from "./step";

/**
 * Properties for GetPackage step
 */
export interface GetPackageStepProps extends BaseStepProps {
	/** The package type (npm, nuget, pypi, etc.) */
	readonly packageType: "npm" | "nuget" | "pypi" | "maven" | "upack";
	/** The feed name or ID */
	readonly feed: string;
	/** The package name */
	readonly definition: string;
	/** The package version */
	readonly version: string;
	/** The download path */
	readonly downloadPath?: string;
	/** Extract downloaded package */
	readonly extract?: boolean;
	/** Pattern to filter files to extract */
	readonly files?: string;
	/** The organization (for feeds in different organizations) */
	readonly organization?: string;
	/** The project (for project-scoped feeds) */
	readonly project?: string;
	/** Connection to external feed */
	readonly connection?: string;
}

/**
 * GetPackage step construct
 *
 * Downloads a package from a package management feed in Azure Artifacts
 */
export class GetPackageStep extends Step {
	public readonly packageType: string;
	public readonly feed: string;
	public readonly definition: string;
	public readonly version: string;
	public readonly downloadPath?: string;
	public readonly extract?: boolean;
	public readonly files?: string;
	public readonly organization?: string;
	public readonly project?: string;
	public readonly connection?: string;

	constructor(props: GetPackageStepProps) {
		super(props);
		this.packageType = props.packageType;
		this.feed = props.feed;
		this.definition = props.definition;
		this.version = props.version;
		this.downloadPath = props.downloadPath;
		this.extract = props.extract;
		this.files = props.files;
		this.organization = props.organization;
		this.project = props.project;
		this.connection = props.connection;
	}

	synthesize(): any {
		const result: any = {
			getPackage: {
				packageType: this.packageType,
				feed: this.feed,
				definition: this.definition,
				version: this.version
			}
		};

		if (this.downloadPath !== undefined) {
			result.getPackage.downloadPath = this.downloadPath;
		}
		if (this.extract !== undefined) {
			result.getPackage.extract = this.extract;
		}
		if (this.files !== undefined) {
			result.getPackage.files = this.files;
		}
		if (this.organization !== undefined) {
			result.getPackage.organization = this.organization;
		}
		if (this.project !== undefined) {
			result.getPackage.project = this.project;
		}
		if (this.connection !== undefined) {
			result.getPackage.connection = this.connection;
		}

		this.addCommonProps(result);
		return result;
	}

	/**
	 * Create a simple get package step
	 */
	static create(
		packageType: GetPackageStepProps["packageType"],
		feed: string,
		definition: string,
		version: string,
		displayName?: string
	): GetPackageStep {
		return new GetPackageStep({ packageType, feed, definition, version, displayName });
	}

	/**
	 * Create a get package step with extraction
	 */
	static withExtract(
		packageType: GetPackageStepProps["packageType"],
		feed: string,
		definition: string,
		version: string,
		downloadPath: string,
		displayName?: string
	): GetPackageStep {
		return new GetPackageStep({
			packageType,
			feed,
			definition,
			version,
			downloadPath,
			extract: true,
			displayName
		});
	}

	/**
	 * Create an NPM package download step
	 */
	static npm(feed: string, packageName: string, version: string, displayName?: string): GetPackageStep {
		return new GetPackageStep({
			packageType: "npm",
			feed,
			definition: packageName,
			version,
			displayName
		});
	}

	/**
	 * Create a NuGet package download step
	 */
	static nuget(feed: string, packageName: string, version: string, displayName?: string): GetPackageStep {
		return new GetPackageStep({
			packageType: "nuget",
			feed,
			definition: packageName,
			version,
			displayName
		});
	}

	/**
	 * Create a Python package download step
	 */
	static pypi(feed: string, packageName: string, version: string, displayName?: string): GetPackageStep {
		return new GetPackageStep({
			packageType: "pypi",
			feed,
			definition: packageName,
			version,
			displayName
		});
	}
}
