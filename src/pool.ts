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
			pool.demands = this.props.demands;
		}

		if (this.props.vmImage) {
			pool.vmImage = this.props.vmImage;
		}

		// Only return the pool object if it's not empty
		return Object.keys(pool).length > 0 ? { pool } : {};
	}
}
