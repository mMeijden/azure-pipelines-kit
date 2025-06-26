import { Step } from "./step";

/**
 * Helper class for building arrays of steps
 */
export class StepsBuilder {
	private steps: any[] = [];

	/**
	 * Add a step to the collection
	 */
	add(step: Step): StepsBuilder {
		this.steps.push(step.synthesize());
		return this;
	}

	/**
	 * Add multiple steps to the collection
	 */
	addAll(...steps: Step[]): StepsBuilder {
		steps.forEach((step) => this.add(step));
		return this;
	}

	/**
	 * Get the synthesized steps array
	 */
	build(): any[] {
		return [...this.steps];
	}

	/**
	 * Create a new StepsBuilder
	 */
	static create(): StepsBuilder {
		return new StepsBuilder();
	}
}
