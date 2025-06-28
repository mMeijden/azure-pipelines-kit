import { Job } from "../../src/jobs/job";
import { TaskStep } from "../../src/steps/task-step";
import { If } from "../../src/expressions/direct-expressions";
import { Eq, And, Or, Not, Contains, Custom, StartsWith, parameters, variables } from "../../src/expressions/conditions";
import { Pipeline } from "../../src/pipeline/pipeline";

// Example 1: Conditional Steps based on toolset parameter
const exampleJob = new Job({
	job: "BuildJob",
	displayName: "Build and Test",
	steps: [
		// Always run this step
		new TaskStep({
			task: "PowerShell@2",
			displayName: "Setup Environment",
			inputs: {
				script: 'Write-Host "Setting up build environment"'
			}
		}),

		// Conditional: MSBuild toolset
		If(new Eq(parameters.get("toolset"), "msbuild"), [
			new TaskStep({
				task: "VSBuild@1",
				displayName: "Build with MSBuild",
				inputs: {
					solution: "**/*.sln",
					configuration: "Release"
				}
			}),
			new TaskStep({
				task: "VSTest@2",
				displayName: "Run MSBuild Tests",
				inputs: {
					testSelector: "testAssemblies",
					testAssemblyVer2: "**/*test*.dll"
				}
			})
		]),

		// Conditional: .NET CLI toolset
		If(new Eq(parameters.get("toolset"), "dotnet"), [
			new TaskStep({
				task: "DotNetCoreCLI@2",
				displayName: "Build with .NET CLI",
				inputs: {
					command: "build",
					configuration: "Release"
				}
			}),
			new TaskStep({
				task: "DotNetCoreCLI@2",
				displayName: "Run .NET Tests",
				inputs: {
					command: "test",
					configuration: "Release"
				}
			})
		]),

		// Conditional: Complex condition
		If(
			new Eq(variables.get("isMain"), true)
				.and(new Eq(variables.get("Build.Reason"), "PullRequest").not()),
			new TaskStep({
				task: "PowerShell@2",
				displayName: "Deploy to Production",
				inputs: {
					script: 'Write-Host "Deploying to production"'
				}
			})
		),

		// Another conditional: OS-specific steps
		If(new Eq(variables.get("Agent.OS"), "Windows_NT"),
			new TaskStep({
				task: "PowerShell@2",
				displayName: "Windows-specific setup",
				inputs: {
					script: 'Write-Host "Running on Windows"'
				}
			})
		),

		If(new Eq(variables.get("Agent.OS"), "Linux"),
			new TaskStep({
				task: "Bash@3",
				displayName: "Linux-specific setup",
				inputs: {
					targetType: "inline",
					script: 'echo "Running on Linux"'
				}
			})
		)
	]
});

// Example 2: More complex conditions
const complexConditionExample = [
	// Multiple AND conditions
	If(
		new Eq(variables.get("Build.SourceBranch"), "refs/heads/main")
			.and(new Eq(variables.get("Build.Reason"), "PullRequest").not())
			.and(new Eq(parameters.get("runIntegrationTests"), true)),
		new TaskStep({
			task: "PowerShell@2",
			displayName: "Run Integration Tests",
			inputs: {
				script: 'Write-Host "Running integration tests"'
			}
		})
	),

	// OR conditions
	If(
		new Eq(variables.get("Build.SourceBranch"), "refs/heads/main")
			.or(new StartsWith(variables.get("Build.SourceBranch"), "refs/heads/release/")),
		new TaskStep({
			task: "PowerShell@2",
			displayName: "Tag Release",
			inputs: {
				script: 'Write-Host "Tagging release"'
			}
		})
	),

	// NOT condition
	If(
		new Eq(variables.get("Build.Reason"), "PullRequest").not(),
		new TaskStep({
			task: "PowerShell@2",
			displayName: "Publish Artifacts",
			inputs: {
				script: 'Write-Host "Publishing artifacts"'
			}
		})
	),

	// Contains condition
	If(
		new Contains(variables.get("Build.SourceBranch"), "feature/"),
		new TaskStep({
			task: "PowerShell@2",
			displayName: "Feature Branch Processing",
			inputs: {
				script: 'Write-Host "Processing feature branch"'
			}
		})
	),

	// Custom expression
	If(
		new Custom("and(succeeded(), eq(variables.Build.SourceBranch, variables.System.DefaultWorkingDirectory))"),
		new TaskStep({
			task: "PowerShell@2",
			displayName: "Custom Condition",
			inputs: {
				script: 'Write-Host "Custom condition met"'
			}
		})
	)
];

export { exampleJob, complexConditionExample };
