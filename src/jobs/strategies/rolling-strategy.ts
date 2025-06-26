import { Construct } from "../../construct";

/**
 * Lifecycle hook configuration for Rolling strategy
 */
export interface RollingLifecycleHook {
	/** Steps to run in this lifecycle hook */
	readonly steps?: any[];
	/** Pool to run the steps on */
	readonly pool?: any;
}

/**
 * Success/Failure handlers for Rolling strategy
 */
export interface RollingHandlers {
	/** Steps to run on successful deployment */
	readonly success?: RollingLifecycleHook;
	/** Steps to run on failed deployment */
	readonly failure?: RollingLifecycleHook;
}

/**
 * Properties for Rolling deployment strategy
 */
export interface RollingStrategyProps {
	/** Maximum number of targets that can be deployed to in parallel */
	readonly maxParallel?: number | string;
	/** Steps to run during pre-deployment phase */
	readonly preDeploy?: RollingLifecycleHook;
	/** Steps to run during deployment phase (required) */
	readonly deploy: RollingLifecycleHook;
	/** Steps to run after traffic routing */
	readonly postRouteTraffic?: RollingLifecycleHook;
	/** Success and failure handlers */
	readonly on?: RollingHandlers;
}

/**
 * Rolling deployment strategy
 *
 * Executes steps in batches across multiple targets:
 * - Deploys to a subset of targets at a time
 * - Controlled by maxParallel setting
 * - Continues to next batch only if current batch succeeds
 */
export class RollingStrategy extends Construct {
	public readonly maxParallel?: number | string;
	public readonly preDeploy?: RollingLifecycleHook;
	public readonly deploy: RollingLifecycleHook;
	public readonly postRouteTraffic?: RollingLifecycleHook;
	public readonly on?: RollingHandlers;

	constructor(props: RollingStrategyProps) {
		super();

		if (!props.deploy) {
			throw new Error("Rolling strategy requires a deploy phase");
		}

		this.maxParallel = props.maxParallel;
		this.preDeploy = props.preDeploy;
		this.deploy = props.deploy;
		this.postRouteTraffic = props.postRouteTraffic;
		this.on = props.on;
	}

	synthesize() {
		const rolling: any = {
			deploy: this.deploy
		};

		if (this.maxParallel !== undefined) {
			rolling.maxParallel = this.maxParallel;
		}

		if (this.preDeploy) {
			rolling.preDeploy = this.preDeploy;
		}

		if (this.postRouteTraffic) {
			rolling.postRouteTraffic = this.postRouteTraffic;
		}

		if (this.on) {
			rolling.on = this.on;
		}

		return { rolling };
	}

	/**
	 * Create a simple Rolling strategy with just deployment steps and maxParallel
	 */
	static simple(steps: any[], maxParallel?: number | string, pool?: any): RollingStrategy {
		return new RollingStrategy({
			maxParallel,
			deploy: { steps, pool }
		});
	}
}
