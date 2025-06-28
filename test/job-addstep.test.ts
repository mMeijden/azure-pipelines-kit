import { Job } from "../src/jobs/job";
import { BashStep } from "../src/steps/bash-step";
import { PowerShellStep } from "../src/steps/powershell-step";
import { TemplateExpression } from "../src/expressions/template-expression";

describe("Job addStep functionality", () => {
	describe("addStep method", () => {
		it("should allow adding steps after job creation", () => {
			const job = new Job({
				job: "test-job",
				displayName: "Test Job"
			});

			// Initially no steps
			expect(job.steps).toEqual([]);

			// Add a bash step
			const bashStep = new BashStep({
				bash: "echo 'Hello World'"
			});
			job.addStep(bashStep);

			expect(job.steps).toHaveLength(1);
			expect(job.steps[0]).toBe(bashStep);

			// Add a PowerShell step
			const powershellStep = new PowerShellStep({
				powershell: "Write-Host 'Hello PowerShell'"
			});
			job.addStep(powershellStep);

			expect(job.steps).toHaveLength(2);
			expect(job.steps[1]).toBe(powershellStep);
		});

		it("should allow adding template expression steps", () => {
			const job = new Job({
				job: "conditional-job",
				displayName: "Job with conditional steps"
			});

			// Add a conditional step using template expression
			const conditionalStep = TemplateExpression.eq(
				"variables.Build.Reason",
				"PullRequest",
				new BashStep({
					bash: "echo 'Running PR validation'"
				})
			);
			job.addStep(conditionalStep);

			expect(job.steps).toHaveLength(1);
			expect(job.steps[0]).toBe(conditionalStep);
		});

		it("should work with jobs that have initial steps", () => {
			const initialStep = new BashStep({
				bash: "echo 'Initial step'"
			});

			const job = new Job({
				job: "job-with-initial-steps",
				displayName: "Job with initial steps",
				steps: [initialStep]
			});

			// Should have the initial step
			expect(job.steps).toHaveLength(1);
			expect(job.steps[0]).toBe(initialStep);

			// Add another step
			const additionalStep = new PowerShellStep({
				powershell: "Write-Host 'Additional step'"
			});
			job.addStep(additionalStep);

			expect(job.steps).toHaveLength(2);
			expect(job.steps[1]).toBe(additionalStep);
		});

		it("should synthesize correctly with added steps", () => {
			const job = new Job({
				job: "synthesis-test",
				displayName: "Synthesis Test Job"
			});

			// Add steps
			job.addStep(
				new BashStep({
					bash: "echo 'Step 1'"
				})
			);

			job.addStep(
				TemplateExpression.eq(
					"variables.testCondition",
					"true",
					new PowerShellStep({
						powershell: "Write-Host 'Conditional step'"
					})
				)
			);

			const synthesized = job.synthesize();

			expect(synthesized.job).toBe("synthesis-test");
			expect(synthesized.displayName).toBe("Synthesis Test Job");
			expect(synthesized.steps).toHaveLength(2);

			// First step should be a regular bash step
			expect(synthesized.steps[0]).toEqual({
				bash: "echo 'Step 1'"
			});

			// Second step should be a conditional template expression
			expect(synthesized.steps[1]).toEqual({
				"${{ if eq(variables.testCondition, 'true') }}": {
					powershell: "Write-Host 'Conditional step'"
				}
			});
		});

		it("should handle mixed step types correctly", () => {
			const job = new Job({
				job: "mixed-steps-job"
			});

			// Add various types of steps
			job.addStep(
				new BashStep({
					bash: "echo 'Bash step'"
				})
			);

			job.addStep(
				TemplateExpression.eq(
					"variables.os",
					"windows",
					new PowerShellStep({
						powershell: "Write-Host 'Windows only'"
					})
				)
			);

			job.addStep(
				new PowerShellStep({
					powershell: "Write-Host 'Always runs'"
				})
			);

			job.addStep(
				TemplateExpression.ne(
					"variables.environment",
					"production",
					new BashStep({
						bash: "echo 'Non-production only'"
					})
				)
			);

			expect(job.steps).toHaveLength(4);

			const synthesized = job.synthesize();
			expect(synthesized.steps).toHaveLength(4);

			// Verify the structure
			expect(synthesized.steps[0]).toEqual({
				bash: "echo 'Bash step'"
			});

			expect(synthesized.steps[1]).toEqual({
				"${{ if eq(variables.os, 'windows') }}": {
					powershell: "Write-Host 'Windows only'"
				}
			});

			expect(synthesized.steps[2]).toEqual({
				powershell: "Write-Host 'Always runs'"
			});

			expect(synthesized.steps[3]).toEqual({
				"${{ if ne(variables.environment, 'production') }}": {
					bash: "echo 'Non-production only'"
				}
			});
		});
	});

	describe("backwards compatibility", () => {
		it("should maintain backwards compatibility with constructor-provided steps", () => {
			const step1 = new BashStep({
				bash: "echo 'Step 1'"
			});

			const step2 = new PowerShellStep({
				powershell: "Write-Host 'Step 2'"
			});

			const job = new Job({
				job: "backwards-compat-job",
				steps: [step1, step2]
			});

			expect(job.steps).toHaveLength(2);
			expect(job.steps[0]).toBe(step1);
			expect(job.steps[1]).toBe(step2);

			const synthesized = job.synthesize();
			expect(synthesized.steps).toHaveLength(2);
		});

		it("should work with empty steps array in constructor", () => {
			const job = new Job({
				job: "empty-steps-job",
				steps: []
			});

			expect(job.steps).toEqual([]);

			// Add a step
			job.addStep(
				new BashStep({
					bash: "echo 'Added step'"
				})
			);

			expect(job.steps).toHaveLength(1);
		});

		it("should work with undefined steps in constructor", () => {
			const job = new Job({
				job: "undefined-steps-job"
				// steps is undefined
			});

			expect(job.steps).toEqual([]);

			// Add a step
			job.addStep(
				new BashStep({
					bash: "echo 'Added step'"
				})
			);

			expect(job.steps).toHaveLength(1);
		});
	});
});
