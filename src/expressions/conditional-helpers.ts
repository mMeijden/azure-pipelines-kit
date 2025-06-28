import { TemplateExpression, isTemplateExpression } from "../expressions/template-expression";

/**
 * Base interface for all steps that can be conditional
 */
export interface ConditionalStep {
	/**
	 * Template expression condition for this step
	 */
	condition?: TemplateExpression;
}

/**
 * Helper to synthesize conditional content
 */
export function synthesizeConditional<T>(items: (T | TemplateExpression<T>)[], synthesizeItem: (item: T) => any): any[] {
	const result: any[] = [];

	for (const item of items) {
		if (isTemplateExpression(item)) {
			// This is a conditional block
			const content = Array.isArray(item.content) ? item.content : [item.content];
			const synthesizedContent = content.map(synthesizeItem);

			// For single items, unwrap from array to match Azure DevOps expectations
			const finalContent = synthesizedContent.length === 1 ? synthesizedContent[0] : synthesizedContent;

			// Wrap in template expression syntax (single dollar sign)
			result.push({
				[`\${{ if ${item.synthesizeCondition()} }}`]: finalContent
			});
		} else {
			// Regular item
			result.push(synthesizeItem(item));
		}
	}

	return result;
}

/**
 * Helper to flatten conditional YAML structure for proper output
 */
export function flattenConditionalYaml(obj: any): any {
	if (Array.isArray(obj)) {
		const result: any[] = [];
		for (const item of obj) {
			if (typeof item === "object" && item !== null) {
				const keys = Object.keys(item);
				if (keys.length === 1 && keys[0].startsWith("${{ if ")) {
					// This is a conditional block - special handling
					const conditionKey = keys[0];
					const content = item[conditionKey];
					result.push({ [conditionKey]: flattenConditionalYaml(content) });
				} else {
					result.push(flattenConditionalYaml(item));
				}
			} else {
				result.push(item);
			}
		}
		return result;
	} else if (typeof obj === "object" && obj !== null) {
		const result: any = {};
		for (const [key, value] of Object.entries(obj)) {
			result[key] = flattenConditionalYaml(value);
		}
		return result;
	}
	return obj;
}
