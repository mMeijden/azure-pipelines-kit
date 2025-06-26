import { Construct } from "../../construct";

/**
 * Lifecycle hook configuration for RunOnce strategy
 */
export interface LifecycleHook {
	/** Steps to run in this lifecycle hook */
	readonly steps?: any[];
	/** Pool to run the steps on */
	readonly pool?: any;
}

/**
 * Success/Failure handlers for RunOnce strategy
 */
export interface RunOnceHandlers {
	/** Steps to run on successful deployment */
	readonly success?: LifecycleHook;
	/** Steps to run on failed deployment */
	readonly failure?: LifecycleHook;
}

/**
 * Properties for RunOnce deployment strategy
 */
export interface RunOnceStrategyProps {
	/** Steps to run during pre-deployment phase */
	readonly preDeploy?: LifecycleHook;
	/** Steps to run during deployment phase (required) */
	readonly deploy: LifecycleHook;
	/** Steps to run after traffic routing */
	readonly postRouteTraffic?: LifecycleHook;
	/** Success and failure handlers */
	readonly on?: RunOnceHandlers;
}

/**
 * RunOnce deployment strategy
 *
 * Executes steps one time in the following order:
 * 1. preDeploy (optional)
 * 2. deploy (required)
 * 3. postRouteTraffic (optional)
 * 4. on.success or on.failure (optional)
 */
export class RunOnceStrategy extends Construct {
	public readonly preDeploy?: LifecycleHook;
	public readonly deploy: LifecycleHook;
	public readonly postRouteTraffic?: LifecycleHook;
	public readonly on?: RunOnceHandlers;

	constructor(props: RunOnceStrategyProps) {
		super();

		if (!props.deploy) {
			throw new Error("RunOnce strategy requires a deploy phase");
		}

		this.preDeploy = props.preDeploy;
		this.deploy = props.deploy;
		this.postRouteTraffic = props.postRouteTraffic;
		this.on = props.on;
	}

	synthesize() {
		const runOnce: any = {
			deploy: this.deploy
		};

		if (this.preDeploy) {
			runOnce.preDeploy = this.preDeploy;
		}

		if (this.postRouteTraffic) {
			runOnce.postRouteTraffic = this.postRouteTraffic;
		}

		if (this.on) {
			runOnce.on = this.on;
		}

		return { runOnce };
	}

	/**
	 * Create a simple RunOnce strategy with just deployment steps
	 */
	static simple(steps: any[], pool?: any): RunOnceStrategy {
		return new RunOnceStrategy({
			deploy: { steps, pool }
		});
	}
}
