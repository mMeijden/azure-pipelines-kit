import { Pipeline } from "../../src/pipeline/pipeline";
import { Stage } from "../../src/pipeline/stage";
import { Job } from "../../src/jobs/job";
import { PowerShellStep, BashStep } from "../../src/steps";
import { TemplateExpression } from "../../src/expressions/template-expression";
import { Eq, Ne, And, Or, Not, Custom, succeeded, failed, always, variables, parameters } from "../../src/expressions/conditions";

/**
 * Example demonstrating chainable condition classes for template expressions
 * This shows how the new fluent API makes conditions more readable and type-safe
 */

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
const simpleCondition = new Eq(variables.get("runTests"), "true");

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
const chainedAndCondition = new Eq(variables.get("buildConfiguration"), "Release")
	.and(new Ne(variables.get("environment"), "production"))
	.and(new Eq(variables.get("runTests"), "true"));

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
const complexCondition = new Eq(variables.get("targetPlatform"), "windows")
	.or(new Eq(variables.get("targetPlatform"), "linux"))
	.and(new Eq(variables.get("deployToStaging"), "true").or(new Eq(variables.get("deployToProduction"), "true")))
	.and(new Eq(variables.get("environment"), "production").not());

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
const customCondition = succeeded("PreviousStage").and(new Eq(variables.get("deployToProduction"), "true"));

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
const bracketCondition = new Eq(variables.getBracket("System.TeamProject"), "MyProject").and(
	new Eq(variables.getBracket("Build.Reason"), "PullRequest")
);

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
const stringCondition = new Eq(variables.get("targetPlatform"), "windows").and(
	new Custom("contains(variables['Build.SourceBranch'], 'refs/heads/release/')")
);

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
const failureCondition = failed().or(new Custom("canceled()"));

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
const alwaysCondition = always();

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

const readableCondition = new Eq(variables.get("runTests"), "true")
	.and(new Eq(variables.get("targetPlatform"), "linux"))
	.and(succeeded("BuildStage"))
	.and(new Ne(variables.get("environment"), "production"));

// === BENEFITS ===

// Export the pipeline for use in other files
export { pipeline };

// Synthesize pipeline when run as main module
if (require.main === module) {
	try {
		const yaml = pipeline.synthesize();
		// Write to YAML file instead of console output
		require("fs").writeFileSync(__dirname + "/chainable-conditions-example.yml", yaml);
	} catch (error) {
		console.error("Error generating YAML:", error);
	}
}
