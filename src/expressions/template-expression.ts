/**
 * Template expression types for Azure DevOps pipelines
 */
export type TemplateExpressionCondition =
	| { type: "eq"; left: string; right: string | number | boolean }
	| { type: "ne"; left: string; right: string | number | boolean }
	| { type: "gt"; left: string; right: number }
	| { type: "ge"; left: string; right: number }
	| { type: "lt"; left: string; right: number }
	| { type: "le"; left: string; right: number }
	| { type: "and"; conditions: TemplateExpressionCondition[] }
	| { type: "or"; conditions: TemplateExpressionCondition[] }
	| { type: "not"; condition: TemplateExpressionCondition }
	| { type: "contains"; haystack: string; needle: string }
	| { type: "containsValue"; object: string; value: string | number | boolean }
	| { type: "startsWith"; string: string; prefix: string }
	| { type: "endsWith"; string: string; suffix: string }
	| { type: "custom"; expression: string };

// Import Condition from conditions module
import { Condition } from "./conditions";

/**
 * Template expression wrapper for conditional content
 */
export class TemplateExpression<T = any> {
	public readonly condition: TemplateExpressionCondition;

	constructor(condition: TemplateExpressionCondition | Condition, public readonly content: T | T[]) {
		// If it's a Condition object, convert it to TemplateExpressionCondition
		if (condition && typeof (condition as Condition).toCondition === "function") {
			this.condition = (condition as Condition).toCondition();
		} else {
			this.condition = condition as TemplateExpressionCondition;
		}
	}

	/**
	 * Create a template expression from a chainable condition
	 */
	static from<T>(condition: Condition, content: T | T[]): TemplateExpression<T> {
		return new TemplateExpression(condition, content);
	}

	/**
	 * Create an equality condition
	 */
	static eq<T>(left: string, right: string | number | boolean, content: T | T[]): TemplateExpression<T> {
		return new TemplateExpression({ type: "eq", left, right }, content);
	}

	/**
	 * Create a not-equal condition
	 */
	static ne<T>(left: string, right: string | number | boolean, content: T | T[]): TemplateExpression<T> {
		return new TemplateExpression({ type: "ne", left, right }, content);
	}

	/**
	 * Create a greater-than condition
	 */
	static gt<T>(left: string, right: number, content: T | T[]): TemplateExpression<T> {
		return new TemplateExpression({ type: "gt", left, right }, content);
	}

	/**
	 * Create a greater-than-or-equal condition
	 */
	static ge<T>(left: string, right: number, content: T | T[]): TemplateExpression<T> {
		return new TemplateExpression({ type: "ge", left, right }, content);
	}

	/**
	 * Create a less-than condition
	 */
	static lt<T>(left: string, right: number, content: T | T[]): TemplateExpression<T> {
		return new TemplateExpression({ type: "lt", left, right }, content);
	}

	/**
	 * Create a less-than-or-equal condition
	 */
	static le<T>(left: string, right: number, content: T | T[]): TemplateExpression<T> {
		return new TemplateExpression({ type: "le", left, right }, content);
	}

	/**
	 * Create an AND condition
	 */
	static and<T>(conditions: TemplateExpressionCondition[], content: T | T[]): TemplateExpression<T> {
		return new TemplateExpression({ type: "and", conditions }, content);
	}

	/**
	 * Create an OR condition
	 */
	static or<T>(conditions: TemplateExpressionCondition[], content: T | T[]): TemplateExpression<T> {
		return new TemplateExpression({ type: "or", conditions }, content);
	}

	/**
	 * Create a NOT condition
	 */
	static not<T>(condition: TemplateExpressionCondition, content: T | T[]): TemplateExpression<T> {
		return new TemplateExpression({ type: "not", condition }, content);
	}

	/**
	 * Create a contains condition
	 */
	static contains<T>(haystack: string, needle: string, content: T | T[]): TemplateExpression<T> {
		return new TemplateExpression({ type: "contains", haystack, needle }, content);
	}

	/**
	 * Create a containsValue condition
	 */
	static containsValue<T>(object: string, value: string | number | boolean, content: T | T[]): TemplateExpression<T> {
		return new TemplateExpression({ type: "containsValue", object, value }, content);
	}

	/**
	 * Create a startsWith condition
	 */
	static startsWith<T>(string: string, prefix: string, content: T | T[]): TemplateExpression<T> {
		return new TemplateExpression({ type: "startsWith", string, prefix }, content);
	}

	/**
	 * Create an endsWith condition
	 */
	static endsWith<T>(string: string, suffix: string, content: T | T[]): TemplateExpression<T> {
		return new TemplateExpression({ type: "endsWith", string, suffix }, content);
	}

	/**
	 * Create a custom expression condition
	 */
	static custom<T>(expression: string, content: T | T[]): TemplateExpression<T> {
		return new TemplateExpression({ type: "custom", expression }, content);
	}

	/**
	 * Synthesize the condition to Azure DevOps template expression syntax
	 */
	synthesizeCondition(): string {
		return this.formatCondition(this.condition);
	}

	private formatCondition(condition: TemplateExpressionCondition): string {
		switch (condition.type) {
			case "eq":
				return `eq(${condition.left}, ${this.formatValue(condition.right)})`;
			case "ne":
				return `ne(${condition.left}, ${this.formatValue(condition.right)})`;
			case "gt":
				return `gt(${condition.left}, ${condition.right})`;
			case "ge":
				return `ge(${condition.left}, ${condition.right})`;
			case "lt":
				return `lt(${condition.left}, ${condition.right})`;
			case "le":
				return `le(${condition.left}, ${condition.right})`;
			case "and":
				return `and(${condition.conditions.map((c) => this.formatCondition(c)).join(", ")})`;
			case "or":
				return `or(${condition.conditions.map((c) => this.formatCondition(c)).join(", ")})`;
			case "not":
				return `not(${this.formatCondition(condition.condition)})`;
			case "contains":
				return `contains(${condition.haystack}, ${this.formatValue(condition.needle)})`;
			case "containsValue":
				return `containsValue(${condition.object}, ${this.formatValue(condition.value)})`;
			case "startsWith":
				return `startsWith(${condition.string}, ${this.formatValue(condition.prefix)})`;
			case "endsWith":
				return `endsWith(${condition.string}, ${this.formatValue(condition.suffix)})`;
			case "custom":
				return condition.expression;
			default:
				throw new Error(`Unknown condition type: ${(condition as any).type}`);
		}
	}

	private formatValue(value: string | number | boolean): string {
		if (typeof value === "string") {
			return `'${value}'`;
		}
		return String(value);
	}
}

/**
 * Type guard to check if a value is a template expression
 */
export function isTemplateExpression(value: any): value is TemplateExpression {
	return value instanceof TemplateExpression;
}
