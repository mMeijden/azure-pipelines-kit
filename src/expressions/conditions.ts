/**
 * Chainable condition classes for Azure DevOps template expressions
 * These provide a fluent API for building complex conditions
 */

/**
 * Base class for all template expression conditions
 */
export abstract class Condition {
	abstract toCondition(): TemplateExpressionCondition;

	/**
	 * Combine this condition with another using AND logic
	 */
	and(other: Condition): And {
		return new And(this, other);
	}

	/**
	 * Combine this condition with another using OR logic
	 */
	or(other: Condition): Or {
		return new Or(this, other);
	}

	/**
	 * Negate this condition
	 */
	not(): Not {
		return new Not(this);
	}
}

/**
 * Equality condition
 */
export class Eq extends Condition {
	constructor(private readonly left: string, private readonly right: string | number | boolean) {
		super();
	}

	toCondition(): TemplateExpressionCondition {
		return { type: "eq", left: this.left, right: this.right };
	}
}

/**
 * Not-equal condition
 */
export class Ne extends Condition {
	constructor(private readonly left: string, private readonly right: string | number | boolean) {
		super();
	}

	toCondition(): TemplateExpressionCondition {
		return { type: "ne", left: this.left, right: this.right };
	}
}

/**
 * Greater-than condition
 */
export class Gt extends Condition {
	constructor(private readonly left: string, private readonly right: number) {
		super();
	}

	toCondition(): TemplateExpressionCondition {
		return { type: "gt", left: this.left, right: this.right };
	}
}

/**
 * Greater-than-or-equal condition
 */
export class Ge extends Condition {
	constructor(private readonly left: string, private readonly right: number) {
		super();
	}

	toCondition(): TemplateExpressionCondition {
		return { type: "ge", left: this.left, right: this.right };
	}
}

/**
 * Less-than condition
 */
export class Lt extends Condition {
	constructor(private readonly left: string, private readonly right: number) {
		super();
	}

	toCondition(): TemplateExpressionCondition {
		return { type: "lt", left: this.left, right: this.right };
	}
}

/**
 * Less-than-or-equal condition
 */
export class Le extends Condition {
	constructor(private readonly left: string, private readonly right: number) {
		super();
	}

	toCondition(): TemplateExpressionCondition {
		return { type: "le", left: this.left, right: this.right };
	}
}

/**
 * AND logical condition
 */
export class And extends Condition {
	private conditions: Condition[];

	constructor(...conditions: Condition[]) {
		super();
		this.conditions = conditions;
	}

	/**
	 * Add another condition to this AND expression
	 */
	and(other: Condition): And {
		return new And(...this.conditions, other);
	}

	toCondition(): TemplateExpressionCondition {
		return {
			type: "and",
			conditions: this.conditions.map((c) => c.toCondition())
		};
	}
}

/**
 * OR logical condition
 */
export class Or extends Condition {
	private conditions: Condition[];

	constructor(...conditions: Condition[]) {
		super();
		this.conditions = conditions;
	}

	/**
	 * Add another condition to this OR expression
	 */
	or(other: Condition): Or {
		return new Or(...this.conditions, other);
	}

	toCondition(): TemplateExpressionCondition {
		return {
			type: "or",
			conditions: this.conditions.map((c) => c.toCondition())
		};
	}
}

/**
 * NOT logical condition
 */
export class Not extends Condition {
	constructor(private readonly condition: Condition) {
		super();
	}

	toCondition(): TemplateExpressionCondition {
		return {
			type: "not",
			condition: this.condition.toCondition()
		};
	}
}

/**
 * Contains condition
 */
export class Contains extends Condition {
	constructor(private readonly haystack: string, private readonly needle: string) {
		super();
	}

	toCondition(): TemplateExpressionCondition {
		return { type: "contains", haystack: this.haystack, needle: this.needle };
	}
}

/**
 * ContainsValue condition
 */
export class ContainsValue extends Condition {
	constructor(private readonly object: string, private readonly value: string | number | boolean) {
		super();
	}

	toCondition(): TemplateExpressionCondition {
		return { type: "containsValue", object: this.object, value: this.value };
	}
}

/**
 * StartsWith condition
 */
export class StartsWith extends Condition {
	constructor(private readonly string: string, private readonly prefix: string) {
		super();
	}

	toCondition(): TemplateExpressionCondition {
		return { type: "startsWith", string: this.string, prefix: this.prefix };
	}
}

/**
 * EndsWith condition
 */
export class EndsWith extends Condition {
	constructor(private readonly string: string, private readonly suffix: string) {
		super();
	}

	toCondition(): TemplateExpressionCondition {
		return { type: "endsWith", string: this.string, suffix: this.suffix };
	}
}

/**
 * Custom expression condition for complex expressions like succeeded(), failed(), etc.
 */
export class Custom extends Condition {
	constructor(private readonly expression: string) {
		super();
	}

	toCondition(): TemplateExpressionCondition {
		return { type: "custom", expression: this.expression };
	}
}

// Import the type from the main template expression file
import { TemplateExpressionCondition } from "./template-expression";

// Convenience functions for creating conditions
export const succeeded = (job?: string) => new Custom(job ? `succeeded('${job}')` : "succeeded()");
export const failed = (job?: string) => new Custom(job ? `failed('${job}')` : "failed()");
export const always = () => new Custom("always()");
export const canceled = () => new Custom("canceled()");
export const succeededOrFailed = () => new Custom("succeededOrFailed()");

// Variables helper for cleaner syntax
export const variables = {
	/**
	 * Create a variable reference for use in conditions
	 */
	get: (name: string) => `variables.${name}`,

	/**
	 * Create a variable reference with bracket notation for complex names
	 */
	getBracket: (name: string) => `variables['${name}']`
};

// Parameters helper
export const parameters = {
	/**
	 * Create a parameter reference for use in conditions
	 */
	get: (name: string) => `parameters.${name}`,

	/**
	 * Create a parameter reference with bracket notation for complex names
	 */
	getBracket: (name: string) => `parameters['${name}']`
};
