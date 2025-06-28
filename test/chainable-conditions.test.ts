import { Job } from "../src/jobs/job";
import { BashStep } from "../src/steps/bash-step";
import { PowerShellStep } from "../src/steps/powershell-step";
import { TemplateExpression } from "../src/expressions/template-expression";
import {
	Condition,
	Eq,
	Ne,
	Gt,
	Ge,
	Lt,
	Le,
	And,
	Or,
	Not,
	Contains,
	ContainsValue,
	StartsWith,
	EndsWith,
	Custom,
	succeeded,
	failed,
	always,
	variables,
	parameters
} from "../src/expressions/conditions";

describe("Chainable Conditions", () => {
	describe("Basic conditions", () => {
		it("should create Eq condition", () => {
			const condition = new Eq(variables.get("buildConfiguration"), "Release");
			expect(condition.toCondition()).toEqual({
				type: "eq",
				left: "variables.buildConfiguration",
				right: "Release"
			});
		});

		it("should create Ne condition", () => {
			const condition = new Ne(variables.get("environment"), "production");
			expect(condition.toCondition()).toEqual({
				type: "ne",
				left: "variables.environment",
				right: "production"
			});
		});

		it("should create numeric comparison conditions", () => {
			const gtCondition = new Gt(variables.get("buildNumber"), 100);
			const geCondition = new Ge(variables.get("retryCount"), 3);
			const ltCondition = new Lt(variables.get("timeout"), 60);
			const leCondition = new Le(variables.get("maxAttempts"), 5);

			expect(gtCondition.toCondition()).toEqual({
				type: "gt",
				left: "variables.buildNumber",
				right: 100
			});

			expect(geCondition.toCondition()).toEqual({
				type: "ge",
				left: "variables.retryCount",
				right: 3
			});

			expect(ltCondition.toCondition()).toEqual({
				type: "lt",
				left: "variables.timeout",
				right: 60
			});

			expect(leCondition.toCondition()).toEqual({
				type: "le",
				left: "variables.maxAttempts",
				right: 5
			});
		});
	});

	describe("Logical conditions", () => {
		it("should create And condition", () => {
			const condition = new And(new Eq(variables.get("runTests"), "true"), new Eq(variables.get("targetPlatform"), "linux"));

			expect(condition.toCondition()).toEqual({
				type: "and",
				conditions: [
					{ type: "eq", left: "variables.runTests", right: "true" },
					{ type: "eq", left: "variables.targetPlatform", right: "linux" }
				]
			});
		});

		it("should create Or condition", () => {
			const condition = new Or(new Eq(variables.get("deployToStaging"), "true"), new Eq(variables.get("deployToProduction"), "true"));

			expect(condition.toCondition()).toEqual({
				type: "or",
				conditions: [
					{ type: "eq", left: "variables.deployToStaging", right: "true" },
					{ type: "eq", left: "variables.deployToProduction", right: "true" }
				]
			});
		});

		it("should create Not condition", () => {
			const condition = new Not(new Eq(variables.get("skipBuild"), "true"));

			expect(condition.toCondition()).toEqual({
				type: "not",
				condition: {
					type: "eq",
					left: "variables.skipBuild",
					right: "true"
				}
			});
		});
	});

	describe("Chainable methods", () => {
		it("should chain conditions with and()", () => {
			const condition = new Eq(variables.get("runTests"), "true")
				.and(new Eq(variables.get("targetPlatform"), "linux"))
				.and(new Ne(variables.get("environment"), "production"));

			expect(condition.toCondition()).toEqual({
				type: "and",
				conditions: [
					{ type: "eq", left: "variables.runTests", right: "true" },
					{ type: "eq", left: "variables.targetPlatform", right: "linux" },
					{ type: "ne", left: "variables.environment", right: "production" }
				]
			});
		});

		it("should chain conditions with or()", () => {
			const condition = new Eq(variables.get("buildConfiguration"), "Release").or(new Eq(variables.get("buildConfiguration"), "Debug"));

			expect(condition.toCondition()).toEqual({
				type: "or",
				conditions: [
					{ type: "eq", left: "variables.buildConfiguration", right: "Release" },
					{ type: "eq", left: "variables.buildConfiguration", right: "Debug" }
				]
			});
		});

		it("should use not() method", () => {
			const condition = new Eq(variables.get("skipTests"), "true").not();

			expect(condition.toCondition()).toEqual({
				type: "not",
				condition: {
					type: "eq",
					left: "variables.skipTests",
					right: "true"
				}
			});
		});

		it("should create complex nested conditions", () => {
			const condition = new Eq(variables.get("runTests"), "true")
				.and(new Eq(variables.get("targetPlatform"), "windows").or(new Eq(variables.get("targetPlatform"), "linux")))
				.and(new Ne(variables.get("environment"), "production").not());

			const result = condition.toCondition();
			expect(result.type).toBe("and");
			expect((result as any).conditions).toHaveLength(3);
		});
	});

	describe("String conditions", () => {
		it("should create Contains condition", () => {
			const condition = new Contains(variables.get("branchName"), "feature/");
			expect(condition.toCondition()).toEqual({
				type: "contains",
				haystack: "variables.branchName",
				needle: "feature/"
			});
		});

		it("should create ContainsValue condition", () => {
			const condition = new ContainsValue(variables.get("tags"), "release");
			expect(condition.toCondition()).toEqual({
				type: "containsValue",
				object: "variables.tags",
				value: "release"
			});
		});

		it("should create StartsWith condition", () => {
			const condition = new StartsWith(variables.get("branchName"), "release/");
			expect(condition.toCondition()).toEqual({
				type: "startsWith",
				string: "variables.branchName",
				prefix: "release/"
			});
		});

		it("should create EndsWith condition", () => {
			const condition = new EndsWith(variables.get("fileName"), ".dll");
			expect(condition.toCondition()).toEqual({
				type: "endsWith",
				string: "variables.fileName",
				suffix: ".dll"
			});
		});
	});

	describe("Custom conditions", () => {
		it("should create Custom condition", () => {
			const condition = new Custom("succeeded('BuildStage')");
			expect(condition.toCondition()).toEqual({
				type: "custom",
				expression: "succeeded('BuildStage')"
			});
		});

		it("should use convenience functions", () => {
			expect(succeeded().toCondition()).toEqual({
				type: "custom",
				expression: "succeeded()"
			});

			expect(succeeded("BuildStage").toCondition()).toEqual({
				type: "custom",
				expression: "succeeded('BuildStage')"
			});

			expect(failed().toCondition()).toEqual({
				type: "custom",
				expression: "failed()"
			});

			expect(always().toCondition()).toEqual({
				type: "custom",
				expression: "always()"
			});
		});
	});

	describe("Variables and parameters helpers", () => {
		it("should create variable references", () => {
			expect(variables.get("buildConfiguration")).toBe("variables.buildConfiguration");
			expect(variables.getBracket("System.TeamProject")).toBe("variables['System.TeamProject']");
		});

		it("should create parameter references", () => {
			expect(parameters.get("environment")).toBe("parameters.environment");
			expect(parameters.getBracket("deploy.staging")).toBe("parameters['deploy.staging']");
		});
	});

	describe("Integration with TemplateExpression", () => {
		it("should work with TemplateExpression.from()", () => {
			const condition = new Eq(variables.get("runTests"), "true");
			const step = new BashStep({
				bash: "echo 'Running tests'"
			});

			const templateExpression = TemplateExpression.from(condition, step);

			expect(templateExpression.condition).toEqual({
				type: "eq",
				left: "variables.runTests",
				right: "true"
			});
			expect(templateExpression.content).toBe(step);
		});

		it("should work with TemplateExpression constructor", () => {
			const condition = new Eq(variables.get("buildConfiguration"), "Release").and(new Ne(variables.get("environment"), "production"));

			const step = new PowerShellStep({
				powershell: "Write-Host 'Building...'"
			});

			const templateExpression = new TemplateExpression(condition, step);

			expect(templateExpression.condition.type).toBe("and");
			expect(templateExpression.content).toBe(step);
		});
	});

	describe("Job with chainable conditions", () => {
		it("should work with addStep using chainable conditions", () => {
			const job = new Job({
				job: "test-job",
				displayName: "Test Job with Chainable Conditions"
			});

			// Add a step with a simple condition
			job.addStep(
				TemplateExpression.from(
					new Eq(variables.get("runTests"), "true"),
					new BashStep({
						bash: "echo 'Running tests'"
					})
				)
			);

			// Add a step with a complex chained condition
			job.addStep(
				TemplateExpression.from(
					new Eq(variables.get("targetPlatform"), "windows")
						.and(new Ne(variables.get("environment"), "production"))
						.and(succeeded("BuildStage")),
					new PowerShellStep({
						powershell: "Write-Host 'Windows deployment'"
					})
				)
			);

			expect(job.steps).toHaveLength(2);

			const synthesized = job.synthesize();
			expect(synthesized.steps).toHaveLength(2);

			// First step should have simple condition
			expect(synthesized.steps[0]).toEqual({
				"${{ if eq(variables.runTests, 'true') }}": {
					bash: "echo 'Running tests'"
				}
			});

			// Second step should have complex condition
			expect(synthesized.steps[1]).toEqual({
				"${{ if and(eq(variables.targetPlatform, 'windows'), ne(variables.environment, 'production'), succeeded('BuildStage')) }}": {
					powershell: "Write-Host 'Windows deployment'"
				}
			});
		});
	});
});
