import { Pipeline } from "../src/pipeline/pipeline";
import { Stage } from "../src/pipeline/stage";
import { Job } from "../src/jobs/job";
import { PowerShellStep, BashStep } from "../src/steps";
import { TemplateExpression } from "../src/expressions/template-expression";
import { Eq, Ne, And, Or, Not, Custom, succeeded, failed, always, variables, parameters } from "../src/expressions/conditions";

/**
 * Example demonstrating chainable condition classes for template expressions
 * This shows how the new fluent API makes conditions more readable and type-safe
 */

console.log("=== Chainable Conditions Example ===");
console.log("");

// Create the main pipeline
const pipeline = new Pipeline({
	variables: {
		buildConfiguration: "Release",
		runTests: "true",
		deployToStaging: "false",
		deployToProduction: "false",
		targetPlatform: "windows",
		environment: "development"
	}
});

// === BUILD STAGE ===
const buildStage = new Stage("Build");

const buildJob = new Job({
	job: "BuildApplication",
	displayName: "Build Application with Chainable Conditions",
	pool: "ubuntu-latest"
});

// Example 1: Simple equality condition
console.log("Example 1: Simple equality condition");
const simpleCondition = new Eq(variables.get("runTests"), "true");
console.log("Condition:", simpleCondition.toCondition());

buildJob.addStep(
	TemplateExpression.from(
		simpleCondition,
		new BashStep({
			displayName: "Run Unit Tests",
			bash: "echo 'Running unit tests because runTests is true'"
		})
	)
);

// Example 2: Chained AND conditions
console.log("\nExample 2: Chained AND conditions");
const chainedAndCondition = new Eq(variables.get("buildConfiguration"), "Release")
	.and(new Ne(variables.get("environment"), "production"))
	.and(new Eq(variables.get("runTests"), "true"));

console.log("Condition:", chainedAndCondition.toCondition());

buildJob.addStep(
	TemplateExpression.from(
		chainedAndCondition,
		new BashStep({
			displayName: "Release Build Tests (Non-Production)",
			bash: "echo 'Running release build tests in non-production environment'"
		})
	)
);

// Example 3: Complex nested conditions with OR and NOT
console.log("\nExample 3: Complex nested conditions");
const complexCondition = new Eq(variables.get("targetPlatform"), "windows")
	.or(new Eq(variables.get("targetPlatform"), "linux"))
	.and(new Eq(variables.get("deployToStaging"), "true").or(new Eq(variables.get("deployToProduction"), "true")))
	.and(new Eq(variables.get("environment"), "production").not());

console.log("Condition:", complexCondition.toCondition());

buildJob.addStep(
	TemplateExpression.from(
		complexCondition,
		new BashStep({
			displayName: "Deploy to Non-Production",
			bash: "echo 'Deploying to staging or production (but not prod environment)'"
		})
	)
);

// Example 4: Using custom expressions with convenience functions
console.log("\nExample 4: Custom expressions with convenience functions");
const customCondition = succeeded("PreviousStage").and(new Eq(variables.get("deployToProduction"), "true"));

console.log("Condition:", customCondition.toCondition());

buildJob.addStep(
	TemplateExpression.from(
		customCondition,
		new PowerShellStep({
			displayName: "Production Deployment",
			powershell: "Write-Host 'Deploying to production after successful previous stage'"
		})
	)
);

// Example 5: Using variables with bracket notation for complex names
console.log("\nExample 5: Complex variable names with bracket notation");
const bracketCondition = new Eq(variables.getBracket("System.TeamProject"), "MyProject").and(
	new Eq(variables.getBracket("Build.Reason"), "PullRequest")
);

console.log("Condition:", bracketCondition.toCondition());

buildJob.addStep(
	TemplateExpression.from(
		bracketCondition,
		new BashStep({
			displayName: "PR Validation",
			bash: "echo 'Running PR validation for MyProject'"
		})
	)
);

// Example 6: String operations
console.log("\nExample 6: String operations");
const stringCondition = new Eq(variables.get("targetPlatform"), "windows").and(
	new Custom("contains(variables['Build.SourceBranch'], 'refs/heads/release/')")
);

console.log("Condition:", stringCondition.toCondition());

buildJob.addStep(
	TemplateExpression.from(
		stringCondition,
		new PowerShellStep({
			displayName: "Windows Release Build",
			powershell: "Write-Host 'Building Windows release from release branch'"
		})
	)
);

// Example 7: Failure handling
console.log("\nExample 7: Failure handling");
const failureCondition = failed().or(new Custom("canceled()"));

console.log("Condition:", failureCondition.toCondition());

buildJob.addStep(
	TemplateExpression.from(
		failureCondition,
		new BashStep({
			displayName: "Cleanup on Failure",
			bash: "echo 'Cleaning up resources after failure or cancellation'"
		})
	)
);

// Example 8: Always run cleanup
console.log("\nExample 8: Always run condition");
const alwaysCondition = always();

console.log("Condition:", alwaysCondition.toCondition());

buildJob.addStep(
	TemplateExpression.from(
		alwaysCondition,
		new BashStep({
			displayName: "Final Cleanup",
			bash: "echo 'Always run this cleanup step'"
		})
	)
);

buildStage.addJob(buildJob);
pipeline.addStage(buildStage);

// === COMPARISON EXAMPLES ===
console.log("\n=== Comparison: Old vs New Syntax ===");
console.log("");

console.log("OLD SYNTAX (string-based):");
console.log("TemplateExpression.and([");
console.log('  { type: "eq", left: "variables.runTests", right: "true" },');
console.log('  { type: "eq", left: "variables.targetPlatform", right: "linux" }');
console.log("], content)");

console.log("\nNEW SYNTAX (chainable classes):");
console.log("TemplateExpression.from(");
console.log('  new Eq(variables.get("runTests"), "true")');
console.log('    .and(new Eq(variables.get("targetPlatform"), "linux")),');
console.log("  content");
console.log(")");

console.log("\nEVEN CLEANER with method chaining:");
const readableCondition = new Eq(variables.get("runTests"), "true")
	.and(new Eq(variables.get("targetPlatform"), "linux"))
	.and(succeeded("BuildStage"))
	.and(new Ne(variables.get("environment"), "production"));

console.log('new Eq(variables.get("runTests"), "true")');
console.log('  .and(new Eq(variables.get("targetPlatform"), "linux"))');
console.log('  .and(succeeded("BuildStage"))');
console.log('  .and(new Ne(variables.get("environment"), "production"))');

console.log("\nGenerated condition object:");
console.log(JSON.stringify(readableCondition.toCondition(), null, 2));

// === BENEFITS ===
console.log("\n=== Benefits of Chainable Conditions ===");
console.log("✅ Type Safety: TypeScript can catch errors at compile time");
console.log("✅ IntelliSense: Auto-completion for condition methods and properties");
console.log("✅ Readability: Fluent API reads like natural language");
console.log("✅ Composability: Easy to build complex conditions step by step");
console.log("✅ Reusability: Conditions can be stored in variables and reused");
console.log("✅ Testability: Each condition can be unit tested independently");
console.log("✅ Refactoring: IDE can safely refactor condition usage across the codebase");

// === SYNTHESIS EXAMPLE ===
console.log("\n=== Generated YAML Pipeline ===");
try {
	const yaml = pipeline.synthesize();
	console.log(yaml);
} catch (error) {
	console.log("Error generating YAML:", error);
}

// Export the pipeline for use in other files
export { pipeline };
