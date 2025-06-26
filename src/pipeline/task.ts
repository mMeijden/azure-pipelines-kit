import { Construct } from "../construct";

export class Task extends Construct {
	private props: any;

	constructor(props: any) {
		super();
		this.props = props;
	}

	synthesize() {
		return this.props;
	}
}
