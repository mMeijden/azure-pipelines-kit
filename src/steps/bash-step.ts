import { Step, BaseStepProps } from "./step";
import { createBlockLiteralScalar } from "./yaml-utils";
import * as fs from "fs";
import * as path from "path";

/**
 * Properties for Bash step
 */
export interface BashStepProps extends BaseStepProps {
	/** Bash script content */
	readonly bash: string;
	/** Working directory for the script */
	readonly workingDirectory?: string;
	/** Fail on stderr output */
	readonly failOnStderr?: boolean;
}

/**
 * Bash step construct
 *
 * Runs a bash script on Linux/macOS agents
 */
export class BashStep extends Step {
	public readonly bash: string;
	public readonly workingDirectory?: string;
	public readonly failOnStderr?: boolean;

	constructor(bashOrProps: string | BashStepProps) {
		// Handle simple string constructor
		if (typeof bashOrProps === "string") {
			super({});
			this.bash = bashOrProps;
		} else {
			// Handle full props object
			super(bashOrProps);
			this.bash = bashOrProps.bash;
			this.workingDirectory = bashOrProps.workingDirectory;
			this.failOnStderr = bashOrProps.failOnStderr;
		}
	}

	synthesize(): any {
		const result: any = {
			bash: createBlockLiteralScalar(this.bash)
		};

		if (this.workingDirectory !== undefined) {
			result.workingDirectory = this.workingDirectory;
		}
		if (this.failOnStderr !== undefined) {
			result.failOnStderr = this.failOnStderr;
		}

		this.addCommonProps(result);
		return result;
	}

	/**
	 * Create a simple bash step
	 */
	static create(bash: string, displayName?: string): BashStep {
		return new BashStep({ bash, displayName });
	}

	/**
	 * Create a bash step from a shell script file
	 */
	static fromFile(filePath: string, displayName?: string): BashStep {
		if (!fs.existsSync(filePath)) {
			throw new Error(`Bash script file not found: ${filePath}`);
		}
		const bash = fs.readFileSync(filePath, "utf8");
		const defaultDisplayName = displayName || `Bash script from ${path.basename(filePath)}`;
		return new BashStep({ bash, displayName: defaultDisplayName });
	}

	/**
	 * Create a bash step from a shell script file with additional properties
	 */
	static fromFileWithProps(filePath: string, props: Omit<BashStepProps, "bash">): BashStep {
		if (!fs.existsSync(filePath)) {
			throw new Error(`Bash script file not found: ${filePath}`);
		}
		const bash = fs.readFileSync(filePath, "utf8");
		return new BashStep({ ...props, bash });
	}
}
