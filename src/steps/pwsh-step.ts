import { Step, BaseStepProps } from "./step";
import { createBlockLiteralScalar } from "./yaml-utils";
import * as fs from "fs";

/**
 * Properties for PowerShell Core (pwsh) step
 */
export interface PwshStepProps extends BaseStepProps {
	/** PowerShell Core script content */
	readonly pwsh: string;
	/** Working directory for the script */
	readonly workingDirectory?: string;
	/** Fail on stderr output */
	readonly failOnStderr?: boolean;
	/** Error action preference */
	readonly errorActionPreference?: "stop" | "continue" | "silentlyContinue";
	/** Warning preference */
	readonly warningPreference?: "stop" | "continue" | "silentlyContinue";
	/** Information preference */
	readonly informationPreference?: "stop" | "continue" | "silentlyContinue";
	/** Verbose preference */
	readonly verbosePreference?: "stop" | "continue" | "silentlyContinue";
	/** Debug preference */
	readonly debugPreference?: "stop" | "continue" | "silentlyContinue";
}

/**
 * PowerShell Core (pwsh) step construct
 *
 * Runs a script in PowerShell Core on Windows, macOS, and Linux
 */
export class PwshStep extends Step {
	public readonly pwsh: string;
	public readonly workingDirectory?: string;
	public readonly failOnStderr?: boolean;
	public readonly errorActionPreference?: string;
	public readonly warningPreference?: string;
	public readonly informationPreference?: string;
	public readonly verbosePreference?: string;
	public readonly debugPreference?: string;

	constructor(pwshOrProps: string | PwshStepProps) {
		// Handle simple string constructor
		if (typeof pwshOrProps === "string") {
			super({});
			this.pwsh = pwshOrProps;
		} else {
			// Handle full props object
			super(pwshOrProps);
			this.pwsh = pwshOrProps.pwsh;
			this.workingDirectory = pwshOrProps.workingDirectory;
			this.failOnStderr = pwshOrProps.failOnStderr;
			this.errorActionPreference = pwshOrProps.errorActionPreference;
			this.warningPreference = pwshOrProps.warningPreference;
			this.informationPreference = pwshOrProps.informationPreference;
			this.verbosePreference = pwshOrProps.verbosePreference;
			this.debugPreference = pwshOrProps.debugPreference;
		}
	}

	synthesize(): any {
		const result: any = {
			pwsh: createBlockLiteralScalar(this.pwsh)
		};

		if (this.workingDirectory !== undefined) {
			result.workingDirectory = this.workingDirectory;
		}
		if (this.failOnStderr !== undefined) {
			result.failOnStderr = this.failOnStderr;
		}
		if (this.errorActionPreference !== undefined) {
			result.errorActionPreference = this.errorActionPreference;
		}
		if (this.warningPreference !== undefined) {
			result.warningPreference = this.warningPreference;
		}
		if (this.informationPreference !== undefined) {
			result.informationPreference = this.informationPreference;
		}
		if (this.verbosePreference !== undefined) {
			result.verbosePreference = this.verbosePreference;
		}
		if (this.debugPreference !== undefined) {
			result.debugPreference = this.debugPreference;
		}

		this.addCommonProps(result);
		return result;
	}

	/**
	 * Create a simple PowerShell Core step
	 */
	static create(pwsh: string, displayName?: string): PwshStep {
		return new PwshStep({ pwsh, displayName });
	}

	/**
	 * Create a PowerShell Core step with working directory
	 */
	static withWorkingDir(pwsh: string, workingDirectory: string, displayName?: string): PwshStep {
		return new PwshStep({ pwsh, workingDirectory, displayName });
	}

	/**
	 * Create a PowerShell Core step that continues on error
	 */
	static continueOnError(pwsh: string, displayName?: string): PwshStep {
		return new PwshStep({ pwsh, displayName, continueOnError: true });
	}

	/**
	 * Create a PowerShell Core step with environment variables
	 */
	static withEnv(pwsh: string, env: Record<string, string>, displayName?: string): PwshStep {
		return new PwshStep({ pwsh, env, displayName });
	}

	/**
	 * Create a PowerShell Core step from a file
	 */
	static fromFile(filePath: string, displayName?: string): PwshStep {
		const pwsh = fs.readFileSync(filePath, "utf-8");
		return new PwshStep({ pwsh, displayName });
	}

	/**
	 * Create a PowerShell Core step from a file with additional properties
	 */
	static fromFileWithProps(filePath: string, props: Omit<PwshStepProps, "pwsh">): PwshStep {
		const pwsh = fs.readFileSync(filePath, "utf-8");
		return new PwshStep({ ...props, pwsh });
	}
}
