import { Construct } from "./construct";

export interface PoolProps {
	demands?: string | string[];
	vmImage?: string;
}

export class Pool extends Construct {
	private props: PoolProps;
	private name: string;

	constructor(name: string, props: PoolProps) {
		super();
		this.name = name;
		this.props = props;
	}

	synthesize() {
		const pool: { [key: string]: any } = {};

		if (this.name) {
			pool.name = this.name;
		}

		if (this.props.demands) {
			// Ensure demands is always an array for proper YAML output
			if (Array.isArray(this.props.demands)) {
				pool.demands = this.props.demands;
			} else {
				pool.demands = [this.props.demands];
			}
		}

		if (this.props.vmImage) {
			pool.vmImage = this.props.vmImage;
		}

		// Return just the pool configuration object
		return pool;
	}

	/**
	 * Synthesize for use at pipeline level (wraps in { pool: {...} })
	 */
	synthesizeForPipeline() {
		const poolConfig = this.synthesize();
		return Object.keys(poolConfig).length > 0 ? { pool: poolConfig } : {};
	}
}
