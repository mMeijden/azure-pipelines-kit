import { Step, BaseStepProps } from "./step";
import { createBlockLiteralScalar } from "./yaml-utils";
import * as fs from "fs";
import * as path from "path";

/**
 * Properties for Script step
 */
export interface ScriptProps extends BaseStepProps {
	/** Script content to run */
	readonly script: string;
	/** Working directory for the script */
	readonly workingDirectory?: string;
	/** Fail on stderr output */
	readonly failOnStderr?: boolean;
}

/**
 * Script step construct
 *
 * Runs a script using the default shell on the agent
 */
export class Script extends Step {
	public readonly script: string;
	public readonly workingDirectory?: string;
	public readonly failOnStderr?: boolean;

	constructor(scriptOrProps: string | ScriptProps) {
		// Handle simple string constructor
		if (typeof scriptOrProps === "string") {
			super({});
			this.script = scriptOrProps;
		} else {
			// Handle full props object
			super(scriptOrProps);
			this.script = scriptOrProps.script;
			this.workingDirectory = scriptOrProps.workingDirectory;
			this.failOnStderr = scriptOrProps.failOnStderr;
		}
	}

	synthesize(): any {
		const result: any = {
			script: createBlockLiteralScalar(this.script)
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
	 * Create a simple script step
	 */
	static create(script: string, displayName?: string): Script {
		return new Script({ script, displayName });
	}

	/**
	 * Create a script step with working directory
	 */
	static withWorkingDir(script: string, workingDirectory: string, displayName?: string): Script {
		return new Script({ script, workingDirectory, displayName });
	}

	/**
	 * Create a script step that continues on error
	 */
	static continueOnError(script: string, displayName?: string): Script {
		return new Script({ script, displayName, continueOnError: true });
	}

	/**
	 * Create a script step with environment variables
	 */
	static withEnv(script: string, env: Record<string, string>, displayName?: string): Script {
		return new Script({ script, env, displayName });
	}

	/**
	 * Create a script step from a file
	 */
	static fromFile(filePath: string, displayName?: string): Script {
		if (!fs.existsSync(filePath)) {
			throw new Error(`Script file not found: ${filePath}`);
		}
		const script = fs.readFileSync(filePath, "utf8");
		const defaultDisplayName = displayName || `Script from ${path.basename(filePath)}`;
		return new Script({ script, displayName: defaultDisplayName });
	}

	/**
	 * Create a script step from a file with additional properties
	 */
	static fromFileWithProps(filePath: string, props: Omit<ScriptProps, "script">): Script {
		if (!fs.existsSync(filePath)) {
			throw new Error(`Script file not found: ${filePath}`);
		}
		const script = fs.readFileSync(filePath, "utf8");
		return new Script({ ...props, script });
	}
}
