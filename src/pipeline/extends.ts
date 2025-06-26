import { Construct } from "../construct";

export class Extends extends Construct {
	private name: string;
	private parameters: { [key: string]: any };

	constructor(name: string, parameters: { [key: string]: any }) {
		super();
		this.name = name;
		this.parameters = parameters;
	}

	synthesize() {
		return {
			extends: {
				template: this.name,
				parameters: this.parameters
			}
		};
	}
}
