export abstract class Construct {
	protected _node: any;

	constructor() {
		this._node = {};
	}

	abstract synthesize(): any;
}
