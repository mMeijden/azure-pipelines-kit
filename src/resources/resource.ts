import { Construct } from "../construct";

/**
 * Base interface for all resource types
 */
export interface BaseResourceProps {
	/** Resource identifier/name */
	readonly name: string;
}

/**
 * Abstract base class for all resource types
 */
export abstract class Resource extends Construct {
	public readonly name: string;

	constructor(name: string) {
		super();
		this.name = name;
	}

	abstract synthesize(): any;
}
