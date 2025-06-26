import { Step, BaseStepProps } from "./step";
import { createBlockLiteralScalar } from "./yaml-utils";

/**
 * Properties for PowerShell step
 */
export interface PowerShellStepProps extends BaseStepProps {
	/** PowerShell script content */
	readonly powershell: string;
	/** Working directory for the script */
	readonly workingDirectory?: string;
	/** Fail on stderr output */
	readonly failOnStderr?: boolean;
	/** Ignore last exit code */
	readonly ignoreLASTEXITCODE?: boolean;
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
 * PowerShell step construct
 *
 * Runs a PowerShell script on Windows agents
 */
export class PowerShellStep extends Step {
	public readonly powershell: string;
	public readonly workingDirectory?: string;
	public readonly failOnStderr?: boolean;
	public readonly ignoreLASTEXITCODE?: boolean;
	public readonly errorActionPreference?: string;
	public readonly warningPreference?: string;
	public readonly informationPreference?: string;
	public readonly verbosePreference?: string;
	public readonly debugPreference?: string;

	constructor(powershellOrProps: string | PowerShellStepProps) {
		// Handle simple string constructor
		if (typeof powershellOrProps === "string") {
			super({});
			this.powershell = powershellOrProps;
		} else {
			// Handle full props object
			super(powershellOrProps);
			this.powershell = powershellOrProps.powershell;
			this.workingDirectory = powershellOrProps.workingDirectory;
			this.failOnStderr = powershellOrProps.failOnStderr;
			this.ignoreLASTEXITCODE = powershellOrProps.ignoreLASTEXITCODE;
			this.errorActionPreference = powershellOrProps.errorActionPreference;
			this.warningPreference = powershellOrProps.warningPreference;
			this.informationPreference = powershellOrProps.informationPreference;
			this.verbosePreference = powershellOrProps.verbosePreference;
			this.debugPreference = powershellOrProps.debugPreference;
		}
	}

	synthesize(): any {
		const result: any = {
			powershell: createBlockLiteralScalar(this.powershell)
		};

		if (this.workingDirectory !== undefined) result.workingDirectory = this.workingDirectory;
		if (this.failOnStderr !== undefined) result.failOnStderr = this.failOnStderr;
		if (this.ignoreLASTEXITCODE !== undefined) result.ignoreLASTEXITCODE = this.ignoreLASTEXITCODE;
		if (this.errorActionPreference !== undefined) result.errorActionPreference = this.errorActionPreference;
		if (this.warningPreference !== undefined) result.warningPreference = this.warningPreference;
		if (this.informationPreference !== undefined) result.informationPreference = this.informationPreference;
		if (this.verbosePreference !== undefined) result.verbosePreference = this.verbosePreference;
		if (this.debugPreference !== undefined) result.debugPreference = this.debugPreference;

		this.addCommonProps(result);
		return result;
	}

	/**
	 * Create a simple PowerShell step
	 */
	static create(powershell: string, displayName?: string): PowerShellStep {
		return new PowerShellStep({ powershell, displayName });
	}
}
