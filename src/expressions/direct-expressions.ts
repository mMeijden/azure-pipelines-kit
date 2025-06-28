/**
 * Direct template expression functions for more natural syntax
 * These provide a more intuitive API for creating conditional pipeline elements
 */

import { TemplateExpression } from "./template-expression";
import { Condition } from "./conditions";

/**
 * Create a conditional template expression using If syntax
 * @param condition The condition to evaluate (can be a Condition object or TemplateExpressionCondition)
 * @param content The content to include if the condition is true
 * @returns TemplateExpression wrapping the conditional content
 *
 * @example
 * ```typescript
 * // Using with chainable conditions
 * If(new Eq(variables.get("runTests"), "true"),
 *    new BashStep({ bash: "npm test" }))
 *
 * // Using with chained conditions
 * If(new Eq(variables.get("environment"), "staging")
 *      .and(succeeded("BuildStage")),
 *    new BashStep({ bash: "deploy to staging" }))
 * ```
 */
export function If<T>(condition: Condition, content: T | T[]): TemplateExpression<T> {
	return TemplateExpression.from(condition, content);
}

/**
 * Create a conditional template expression that runs when condition is false
 * @param condition The condition to evaluate
 * @param content The content to include if the condition is false
 * @returns TemplateExpression with negated condition
 *
 * @example
 * ```typescript
 * // Run when NOT in production
 * Unless(new Eq(variables.get("environment"), "production"),
 *        new BashStep({ bash: "run dev-only script" }))
 * ```
 */
export function Unless<T>(condition: Condition, content: T | T[]): TemplateExpression<T> {
	return TemplateExpression.from(condition.not(), content);
}

/**
 * Create a template expression that runs when a job succeeds
 * @param jobName Optional job name to check (if omitted, checks current job)
 * @param content The content to include on success
 * @returns TemplateExpression with succeeded condition
 *
 * @example
 * ```typescript
 * OnSuccess("BuildJob", new BashStep({ bash: "echo 'Build passed!'" }))
 * OnSuccess(new BashStep({ bash: "echo 'Current job passed!'" }))
 * ```
 */
export function OnSuccess<T>(jobNameOrContent: string | T | T[], content?: T | T[]): TemplateExpression<T> {
	if (typeof jobNameOrContent === "string") {
		return If(succeeded(jobNameOrContent), content!);
	}
	return If(succeeded(), jobNameOrContent);
}

/**
 * Create a template expression that runs when a job fails
 * @param jobName Optional job name to check (if omitted, checks current job)
 * @param content The content to include on failure
 * @returns TemplateExpression with failed condition
 *
 * @example
 * ```typescript
 * OnFailure("BuildJob", new BashStep({ bash: "echo 'Build failed!'" }))
 * OnFailure(new BashStep({ bash: "echo 'Current job failed!'" }))
 * ```
 */
export function OnFailure<T>(jobNameOrContent: string | T | T[], content?: T | T[]): TemplateExpression<T> {
	if (typeof jobNameOrContent === "string") {
		return If(failed(jobNameOrContent), content!);
	}
	return If(failed(), jobNameOrContent);
}

/**
 * Create a template expression that always runs
 * @param content The content to always include
 * @returns TemplateExpression with always condition
 *
 * @example
 * ```typescript
 * Always(new BashStep({ bash: "cleanup resources" }))
 * ```
 */
export function Always<T>(content: T | T[]): TemplateExpression<T> {
	return If(always(), content);
}

/**
 * Create a template expression for when variable equals a value
 * @param variableName The variable name (without variables. prefix)
 * @param value The value to compare against
 * @param content The content to include if condition is true
 * @returns TemplateExpression with equality condition
 *
 * @example
 * ```typescript
 * WhenVar("environment", "production", new BashStep({ bash: "deploy to prod" }))
 * ```
 */
export function WhenVar<T>(variableName: string, value: string | number | boolean, content: T | T[]): TemplateExpression<T> {
	return If(new Eq(variables.get(variableName), value), content);
}

/**
 * Create a template expression for when variable does NOT equal a value
 * @param variableName The variable name (without variables. prefix)
 * @param value The value to compare against
 * @param content The content to include if condition is true
 * @returns TemplateExpression with not-equal condition
 *
 * @example
 * ```typescript
 * WhenNotVar("environment", "production", new BashStep({ bash: "run dev script" }))
 * ```
 */
export function WhenNotVar<T>(variableName: string, value: string | number | boolean, content: T | T[]): TemplateExpression<T> {
	return If(new Ne(variables.get(variableName), value), content);
}

/**
 * Create a template expression for when parameter equals a value
 * @param parameterName The parameter name (without parameters. prefix)
 * @param value The value to compare against
 * @param content The content to include if condition is true
 * @returns TemplateExpression with equality condition
 *
 * @example
 * ```typescript
 * WhenParam("deployTarget", "production", new BashStep({ bash: "deploy to prod" }))
 * ```
 */
export function WhenParam<T>(parameterName: string, value: string | number | boolean, content: T | T[]): TemplateExpression<T> {
	return If(new Eq(parameters.get(parameterName), value), content);
}

/**
 * Create a template expression that runs in specific environments
 * @param environments Array of environment names or single environment name
 * @param content The content to include for these environments
 * @returns TemplateExpression with environment condition
 *
 * @example
 * ```typescript
 * ForEnvironments("production", new BashStep({ bash: "prod script" }))
 * ForEnvironments(["staging", "production"], new BashStep({ bash: "deploy script" }))
 * ```
 */
export function ForEnvironments<T>(environments: string | string[], content: T | T[]): TemplateExpression<T> {
	if (typeof environments === "string") {
		return WhenVar("environment", environments, content);
	}

	const conditions = environments.map((env) => new Eq(variables.get("environment"), env));
	let condition: Condition = conditions[0];
	for (let i = 1; i < conditions.length; i++) {
		condition = condition.or(conditions[i]);
	}
	return If(condition, content);
}

/**
 * Create a template expression that runs for specific platforms
 * @param platforms Array of platform names or single platform name
 * @param content The content to include for these platforms
 * @returns TemplateExpression with platform condition
 *
 * @example
 * ```typescript
 * ForPlatforms("windows", new PowerShellStep({ powershell: "Windows script" }))
 * ForPlatforms(["windows", "linux"], new BashStep({ bash: "cross-platform script" }))
 * ```
 */
export function ForPlatforms<T>(platforms: string | string[], content: T | T[]): TemplateExpression<T> {
	if (typeof platforms === "string") {
		return WhenVar("targetPlatform", platforms, content);
	}

	const conditions = platforms.map((platform) => new Eq(variables.get("targetPlatform"), platform));
	let condition: Condition = conditions[0];
	for (let i = 1; i < conditions.length; i++) {
		condition = condition.or(conditions[i]);
	}
	return If(condition, content);
}

/**
 * Create a template expression that runs when tests should be executed
 * @param content The content to include when tests should run
 * @returns TemplateExpression checking runTests variable
 *
 * @example
 * ```typescript
 * WhenTesting(new BashStep({ bash: "npm test" }))
 * ```
 */
export function WhenTesting<T>(content: T | T[]): TemplateExpression<T> {
	return WhenVar("runTests", "true", content);
}

/**
 * Create a template expression that runs when deployment should happen
 * @param target Optional deployment target (staging, production, etc.)
 * @param content The content to include when deploying
 * @returns TemplateExpression checking deployment variables
 *
 * @example
 * ```typescript
 * WhenDeploying("staging", new BashStep({ bash: "deploy to staging" }))
 * WhenDeploying(new BashStep({ bash: "deploy anywhere" }))
 * ```
 */
export function WhenDeploying<T>(targetOrContent: string | T | T[], content?: T | T[]): TemplateExpression<T> {
	if (typeof targetOrContent === "string") {
		return WhenVar(`deployTo${targetOrContent.charAt(0).toUpperCase()}${targetOrContent.slice(1)}`, "true", content!);
	}

	// Check if any deployment variable is true
	const condition = new Eq(variables.get("deployToStaging"), "true")
		.or(new Eq(variables.get("deployToProduction"), "true"))
		.or(new Eq(variables.get("deployToDevelopment"), "true"));

	return If(condition, targetOrContent);
}

// Re-export needed dependencies for convenience
import { Eq, Ne, And, Or, Not, succeeded, failed, always, variables, parameters } from "./conditions";
export { Eq, Ne, And, Or, Not, succeeded, failed, always, variables, parameters };
