import { Task, TaskProps } from "./task";

/**
 * Properties for npm authenticate task
 */
export interface NpmAuthenticateV0Props extends Omit<TaskProps, "task"> {
	/**
	 * .npmrc file to authenticate
	 *
	 * The path to the .npmrc file that specifies the registries you want to work with.
	 * Select the file, not the folder, such as /packages/mypackage.npmrc.
	 */
	readonly workingFile: string;

	/**
	 * Credentials for registries outside this organization/collection
	 *
	 * The comma-separated list of npm service connection names for registries outside
	 * this organization or collection. The specified .npmrc file must contain registry
	 * entries corresponding to the service connections. If you only need registries in
	 * this organization or collection, leave this blank. The build's credentials are
	 * used automatically.
	 */
	readonly customEndpoint?: string;
}

/**
 * npm authenticate (for task runners) v0 task
 *
 * Don't use this task if you're also using the npm task. Provides npm credentials
 * to an .npmrc file in your repository for the scope of the build. This enables
 * npm task runners like gulp and Grunt to authenticate with private registries.
 *
 * Usage examples:
 *
 * // Basic usage for organization registries
 * const npmAuth = new NpmAuthenticateV0({
 *   workingFile: '.npmrc'
 * });
 *
 * // With external registries
 * const npmAuthExternal = new NpmAuthenticateV0({
 *   workingFile: '.npmrc',
 *   customEndpoint: 'MyNpmServiceConnection'
 * });
 *
 * // Using static helper method
 * const npmAuthHelper = NpmAuthenticateV0.authenticate('.npmrc', 'MyConnection');
 *
 * // Multiple service connections
 * const npmAuthMultiple = new NpmAuthenticateV0({
 *   workingFile: 'packages/mypackage/.npmrc',
 *   customEndpoint: 'Connection1, Connection2',
 *   displayName: 'Authenticate npm for multiple registries'
 * });
 */
export class NpmAuthenticateV0 extends Task {
	constructor(props: NpmAuthenticateV0Props) {
		const inputs: Record<string, any> = {
			workingFile: props.workingFile
		};

		// Only add customEndpoint if it's provided
		if (props.customEndpoint !== undefined) {
			inputs.customEndpoint = props.customEndpoint;
		}

		super({
			...props,
			task: "npmAuthenticate@0",
			inputs
		});
	}

	/**
	 * Create an npm authenticate task with default display name
	 */
	static authenticate(workingFile: string, customEndpoint?: string, displayName?: string): NpmAuthenticateV0 {
		return new NpmAuthenticateV0({
			workingFile,
			customEndpoint,
			displayName: displayName || "npm authenticate"
		});
	}
}
