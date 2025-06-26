import { Construct } from "../../construct";

/**
 * Lifecycle hook configuration for Canary strategy
 */
export interface CanaryLifecycleHook {
	/** Steps to run in this lifecycle hook */
	readonly steps?: any[];
	/** Pool to run the steps on */
	readonly pool?: any;
}

/**
 * Success/Failure handlers for Canary strategy
 */
export interface CanaryHandlers {
	/** Steps to run on successful deployment */
	readonly success?: CanaryLifecycleHook;
	/** Steps to run on failed deployment */
	readonly failure?: CanaryLifecycleHook;
}

/**
 * Properties for Canary deployment strategy
 */
export interface CanaryStrategyProps {
	/** List of increments (percentages) for canary deployment */
	readonly increments: (number | string)[];
	/** Steps to run during pre-deployment phase */
	readonly preDeploy?: CanaryLifecycleHook;
	/** Steps to run during deployment phase (required) */
	readonly deploy: CanaryLifecycleHook;
	/** Steps to run after traffic routing */
	readonly postRouteTraffic?: CanaryLifecycleHook;
	/** Success and failure handlers */
	readonly on?: CanaryHandlers;
}

/**
 * Canary deployment strategy
 *
 * Executes steps in phases with gradual traffic routing:
 * - Deploys to incremental percentages of targets
 * - Each increment must succeed before proceeding
 * - Allows for gradual rollout with rollback capability
 */
export class CanaryStrategy extends Construct {
	public readonly increments: (number | string)[];
	public readonly preDeploy?: CanaryLifecycleHook;
	public readonly deploy: CanaryLifecycleHook;
	public readonly postRouteTraffic?: CanaryLifecycleHook;
	public readonly on?: CanaryHandlers;

	constructor(props: CanaryStrategyProps) {
		super();

		if (!props.deploy) {
			throw new Error("Canary strategy requires a deploy phase");
		}

		if (!props.increments || props.increments.length === 0) {
			throw new Error("Canary strategy requires at least one increment");
		}

		// Validate increments are valid percentages or numbers
		props.increments.forEach((increment, index) => {
			if (typeof increment === "number") {
				if (increment <= 0 || increment > 100) {
					throw new Error(`Increment at index ${index} must be between 1 and 100`);
				}
			} else if (typeof increment === "string") {
				// Allow string values for expressions like '$(CanaryIncrement)'
				if (!increment.trim()) {
					throw new Error(`Increment at index ${index} cannot be empty`);
				}
			}
		});

		this.increments = props.increments;
		this.preDeploy = props.preDeploy;
		this.deploy = props.deploy;
		this.postRouteTraffic = props.postRouteTraffic;
		this.on = props.on;
	}

	synthesize() {
		const canary: any = {
			increments: this.increments,
			deploy: this.deploy
		};

		if (this.preDeploy) {
			canary.preDeploy = this.preDeploy;
		}

		if (this.postRouteTraffic) {
			canary.postRouteTraffic = this.postRouteTraffic;
		}

		if (this.on) {
			canary.on = this.on;
		}

		return { canary };
	}

	/**
	 * Create a simple Canary strategy with just deployment steps and increments
	 */
	static simple(increments: (number | string)[], steps: any[], pool?: any): CanaryStrategy {
		return new CanaryStrategy({
			increments,
			deploy: { steps, pool }
		});
	}

	/**
	 * Create a typical Canary strategy with common increment percentages
	 */
	static typical(steps: any[], pool?: any): CanaryStrategy {
		return new CanaryStrategy({
			increments: [10, 25, 50, 100],
			deploy: { steps, pool }
		});
	}
}
