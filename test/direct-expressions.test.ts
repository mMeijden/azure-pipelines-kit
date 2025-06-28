import { Job } from "../src/jobs/job";
import { BashStep } from "../src/steps/bash-step";
import { PowerShellStep } from "../src/steps/powershell-step";
import {
	If,
	Unless,
	OnSuccess,
	OnFailure,
	Always,
	WhenVar,
	WhenNotVar,
	WhenParam,
	ForEnvironments,
	ForPlatforms,
	WhenTesting,
	WhenDeploying,
	Eq,
	variables
} from "../src/expressions/direct-expressions";

describe("Direct Template Expressions", () => {
	describe("If function", () => {
		it("should create a template expression with If", () => {
			const condition = new Eq(variables.get("runTests"), "true");
			const step = new BashStep({ bash: "npm test" });

			const templateExpression = If(condition, step);

			expect(templateExpression.condition).toEqual({
				type: "eq",
				left: "variables.runTests",
				right: "true"
			});
			expect(templateExpression.content).toBe(step);
		});
	});

	describe("Unless function", () => {
		it("should create a negated template expression", () => {
			const condition = new Eq(variables.get("skipTests"), "true");
			const step = new BashStep({ bash: "npm test" });

			const templateExpression = Unless(condition, step);

			expect(templateExpression.condition).toEqual({
				type: "not",
				condition: {
					type: "eq",
					left: "variables.skipTests",
					right: "true"
				}
			});
		});
	});

	describe("OnSuccess function", () => {
		it("should create template expression for job success", () => {
			const step = new BashStep({ bash: "echo 'Success!'" });

			const templateExpression = OnSuccess("BuildJob", step);

			expect(templateExpression.condition).toEqual({
				type: "custom",
				expression: "succeeded('BuildJob')"
			});
		});

		it("should create template expression for current job success", () => {
			const step = new BashStep({ bash: "echo 'Success!'" });

			const templateExpression = OnSuccess(step);

			expect(templateExpression.condition).toEqual({
				type: "custom",
				expression: "succeeded()"
			});
		});
	});

	describe("OnFailure function", () => {
		it("should create template expression for job failure", () => {
			const step = new BashStep({ bash: "echo 'Failed!'" });

			const templateExpression = OnFailure("BuildJob", step);

			expect(templateExpression.condition).toEqual({
				type: "custom",
				expression: "failed('BuildJob')"
			});
		});

		it("should create template expression for current job failure", () => {
			const step = new BashStep({ bash: "echo 'Failed!'" });

			const templateExpression = OnFailure(step);

			expect(templateExpression.condition).toEqual({
				type: "custom",
				expression: "failed()"
			});
		});
	});

	describe("Always function", () => {
		it("should create template expression that always runs", () => {
			const step = new BashStep({ bash: "cleanup" });

			const templateExpression = Always(step);

			expect(templateExpression.condition).toEqual({
				type: "custom",
				expression: "always()"
			});
		});
	});

	describe("WhenVar function", () => {
		it("should create template expression for variable equality", () => {
			const step = new BashStep({ bash: "deploy" });

			const templateExpression = WhenVar("environment", "production", step);

			expect(templateExpression.condition).toEqual({
				type: "eq",
				left: "variables.environment",
				right: "production"
			});
		});
	});

	describe("WhenNotVar function", () => {
		it("should create template expression for variable inequality", () => {
			const step = new BashStep({ bash: "dev script" });

			const templateExpression = WhenNotVar("environment", "production", step);

			expect(templateExpression.condition).toEqual({
				type: "ne",
				left: "variables.environment",
				right: "production"
			});
		});
	});

	describe("WhenParam function", () => {
		it("should create template expression for parameter equality", () => {
			const step = new BashStep({ bash: "deploy" });

			const templateExpression = WhenParam("deployTarget", "production", step);

			expect(templateExpression.condition).toEqual({
				type: "eq",
				left: "parameters.deployTarget",
				right: "production"
			});
		});
	});

	describe("ForEnvironments function", () => {
		it("should create template expression for single environment", () => {
			const step = new BashStep({ bash: "prod script" });

			const templateExpression = ForEnvironments("production", step);

			expect(templateExpression.condition).toEqual({
				type: "eq",
				left: "variables.environment",
				right: "production"
			});
		});

		it("should create template expression for multiple environments", () => {
			const step = new BashStep({ bash: "deploy script" });

			const templateExpression = ForEnvironments(["staging", "production"], step);

			expect(templateExpression.condition).toEqual({
				type: "or",
				conditions: [
					{ type: "eq", left: "variables.environment", right: "staging" },
					{ type: "eq", left: "variables.environment", right: "production" }
				]
			});
		});

		it("should handle three environments", () => {
			const step = new BashStep({ bash: "deploy script" });

			const templateExpression = ForEnvironments(["dev", "staging", "production"], step);

			expect(templateExpression.condition.type).toBe("or");
			expect((templateExpression.condition as any).conditions).toHaveLength(3);
		});
	});

	describe("ForPlatforms function", () => {
		it("should create template expression for single platform", () => {
			const step = new PowerShellStep({ powershell: "Windows script" });

			const templateExpression = ForPlatforms("windows", step);

			expect(templateExpression.condition).toEqual({
				type: "eq",
				left: "variables.targetPlatform",
				right: "windows"
			});
		});

		it("should create template expression for multiple platforms", () => {
			const step = new BashStep({ bash: "cross-platform script" });

			const templateExpression = ForPlatforms(["windows", "linux"], step);

			expect(templateExpression.condition).toEqual({
				type: "or",
				conditions: [
					{ type: "eq", left: "variables.targetPlatform", right: "windows" },
					{ type: "eq", left: "variables.targetPlatform", right: "linux" }
				]
			});
		});
	});

	describe("WhenTesting function", () => {
		it("should create template expression for when tests should run", () => {
			const step = new BashStep({ bash: "npm test" });

			const templateExpression = WhenTesting(step);

			expect(templateExpression.condition).toEqual({
				type: "eq",
				left: "variables.runTests",
				right: "true"
			});
		});
	});

	describe("WhenDeploying function", () => {
		it("should create template expression for specific deployment target", () => {
			const step = new BashStep({ bash: "deploy to staging" });

			const templateExpression = WhenDeploying("staging", step);

			expect(templateExpression.condition).toEqual({
				type: "eq",
				left: "variables.deployToStaging",
				right: "true"
			});
		});

		it("should create template expression for any deployment", () => {
			const step = new BashStep({ bash: "deploy anywhere" });

			const templateExpression = WhenDeploying(step);

			expect(templateExpression.condition.type).toBe("or");
			expect((templateExpression.condition as any).conditions).toHaveLength(3);
		});
	});

	describe("Integration with Job", () => {
		it("should work with Job.addStep using direct expressions", () => {
			const job = new Job({
				job: "test-job",
				displayName: "Test Job with Direct Expressions"
			});

			// Add various steps using direct expressions
			job.addStep(WhenTesting(new BashStep({ bash: "npm test" })));

			job.addStep(ForPlatforms("windows", new PowerShellStep({ powershell: "Windows-specific script" })));

			job.addStep(OnSuccess("BuildJob", new BashStep({ bash: "Build succeeded!" })));

			job.addStep(Always(new BashStep({ bash: "Always cleanup" })));

			expect(job.steps).toHaveLength(4);

			const synthesized = job.synthesize();
			expect(synthesized.steps).toHaveLength(4);

			// Check first step (testing)
			expect(synthesized.steps[0]).toEqual({
				"${{ if eq(variables.runTests, 'true') }}": {
					bash: "npm test"
				}
			});

			// Check second step (platform)
			expect(synthesized.steps[1]).toEqual({
				"${{ if eq(variables.targetPlatform, 'windows') }}": {
					powershell: "Windows-specific script"
				}
			});

			// Check third step (success)
			expect(synthesized.steps[2]).toEqual({
				"${{ if succeeded('BuildJob') }}": {
					bash: "Build succeeded!"
				}
			});

			// Check fourth step (always)
			expect(synthesized.steps[3]).toEqual({
				"${{ if always() }}": {
					bash: "Always cleanup"
				}
			});
		});
	});
});
