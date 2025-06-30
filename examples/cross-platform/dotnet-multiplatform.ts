#!/usr/bin/env node

import { Pipeline } from "../../src/pipeline/pipeline";
import { Stage } from "../../src/pipeline/stage";
import { Job } from "../../src/jobs/job";
import { BashStep, PowerShellStep, PublishStep } from "../../src/steps";
import { If, Unless, ForPlatforms, WhenVar, OnSuccess } from "../../src";
import { Eq, Or, variables, succeeded } from "../../src/expressions/conditions";

/**
 * Multi-platform .NET application pipeline
 *
 * This example demonstrates:
 * - Cross-platform builds (Windows, Linux, macOS)
 * - Platform-specific steps with ForPlatforms()
 * - Complex nested conditions
 * - Integration testing across platforms
 */

const pipeline = new Pipeline({
	trigger: {
		branches: {
			include: ["main", "release/*"]
		},
		paths: {
			include: ["src/*", "tests/*", "*.json"]
		}
	},
	variables: {
		buildConfiguration: "Release",
		dotnetVersion: "8.x",
		runTests: "true",
		publishArtifacts: "true"
	}
});

// Build Stage
const buildStage = new Stage("CrossPlatformBuild");

// Windows Build Job
const windowsBuildJob = new Job({
	job: "BuildWindows",
	displayName: "Build on Windows",
	pool: "windows-latest"
});

windowsBuildJob.addStep(
	ForPlatforms(
		"windows",
		new PowerShellStep({
			displayName: "Setup .NET on Windows",
			powershell: `
				Write-Host "Setting up .NET $(dotnetVersion) on Windows"
				dotnet --version
				Write-Host "Restoring packages..."
				dotnet restore
			`
		})
	)
);

windowsBuildJob.addStep(
	ForPlatforms(
		"windows",
		new PowerShellStep({
			displayName: "Build Windows Application",
			powershell: `
				Write-Host "Building for Windows..."
				dotnet build --configuration $(buildConfiguration) --runtime win-x64
			`
		})
	)
);

windowsBuildJob.addStep(
	WhenVar(
		"runTests",
		"true",
		new PowerShellStep({
			displayName: "Run Windows Tests",
			powershell: `
				Write-Host "Running tests on Windows..."
				dotnet test --configuration $(buildConfiguration) --logger trx
			`
		})
	)
);

windowsBuildJob.addStep(
	WhenVar(
		"publishArtifacts",
		"true",
		new PublishStep({
			displayName: "Publish Windows Artifacts",
			publish: "bin/Release/net8.0/win-x64/",
			artifact: "windows-build"
		})
	)
);

buildStage.addJob(windowsBuildJob);

// Linux Build Job
const linuxBuildJob = new Job({
	job: "BuildLinux",
	displayName: "Build on Linux",
	pool: "ubuntu-latest"
});

linuxBuildJob.addStep(
	ForPlatforms(
		"linux",
		new BashStep({
			displayName: "Setup .NET on Linux",
			bash: `
				echo "Setting up .NET $(dotnetVersion) on Linux"
				dotnet --version
				echo "Restoring packages..."
				dotnet restore
			`
		})
	)
);

linuxBuildJob.addStep(
	ForPlatforms(
		"linux",
		new BashStep({
			displayName: "Build Linux Application",
			bash: `
				echo "Building for Linux..."
				dotnet build --configuration $(buildConfiguration) --runtime linux-x64
			`
		})
	)
);

linuxBuildJob.addStep(
	WhenVar(
		"runTests",
		"true",
		new BashStep({
			displayName: "Run Linux Tests",
			bash: `
				echo "Running tests on Linux..."
				dotnet test --configuration $(buildConfiguration) --logger trx
			`
		})
	)
);

linuxBuildJob.addStep(
	WhenVar(
		"publishArtifacts",
		"true",
		new PublishStep({
			displayName: "Publish Linux Artifacts",
			publish: "bin/Release/net8.0/linux-x64/",
			artifact: "linux-build"
		})
	)
);

buildStage.addJob(linuxBuildJob);

// macOS Build Job
const macosBuildJob = new Job({
	job: "BuildMacOS",
	displayName: "Build on macOS",
	pool: "macos-latest"
});

macosBuildJob.addStep(
	ForPlatforms(
		"macos",
		new BashStep({
			displayName: "Setup .NET on macOS",
			bash: `
				echo "Setting up .NET $(dotnetVersion) on macOS"
				dotnet --version
				echo "Restoring packages..."
				dotnet restore
			`
		})
	)
);

macosBuildJob.addStep(
	ForPlatforms(
		"macos",
		new BashStep({
			displayName: "Build macOS Application",
			bash: `
				echo "Building for macOS..."
				dotnet build --configuration $(buildConfiguration) --runtime osx-x64
			`
		})
	)
);

macosBuildJob.addStep(
	WhenVar(
		"runTests",
		"true",
		new BashStep({
			displayName: "Run macOS Tests",
			bash: `
				echo "Running tests on macOS..."
				dotnet test --configuration $(buildConfiguration) --logger trx
			`
		})
	)
);

macosBuildJob.addStep(
	WhenVar(
		"publishArtifacts",
		"true",
		new PublishStep({
			displayName: "Publish macOS Artifacts",
			publish: "bin/Release/net8.0/osx-x64/",
			artifact: "macos-build"
		})
	)
);

buildStage.addJob(macosBuildJob);
pipeline.addStage(buildStage);

// Integration Test Stage
const integrationStage = new Stage("Integration");

const integrationJob = new Job({
	job: "IntegrationTests",
	displayName: "Cross-Platform Integration Tests",
	pool: "ubuntu-latest",
	dependsOn: ["BuildWindows", "BuildLinux", "BuildMacOS"]
});

integrationJob.addStep(
	If(
		succeeded("BuildWindows").and(succeeded("BuildLinux")).and(succeeded("BuildMacOS")),
		new BashStep({
			displayName: "Download All Platform Artifacts",
			bash: `
				echo "Downloading artifacts from all platforms..."
				# Download Windows artifacts
				# Download Linux artifacts  
				# Download macOS artifacts
			`
		})
	)
);

integrationJob.addStep(
	Unless(
		new Or(new Eq(variables.get("Build.Reason"), "PullRequest"), new Eq(variables.get("buildConfiguration"), "Debug")),
		new BashStep({
			displayName: "Run Cross-Platform Integration Tests",
			bash: `
				echo "Running integration tests across platforms..."
				echo "Testing Windows build compatibility..."
				echo "Testing Linux build compatibility..."
				echo "Testing macOS build compatibility..."
			`
		})
	)
);

integrationStage.addJob(integrationJob);
pipeline.addStage(integrationStage);

// Synthesize pipeline when run as main module
if (require.main === module) {
	const yaml = pipeline.synthesize();

	// If CLI_MODE env var is set, output to console for CLI processing
	if (process.env.CLI_MODE) {
		console.log(yaml);
	} else {
		// Write to YAML file instead of console output
		require("fs").writeFileSync(__dirname + "/dotnet-multiplatform.yml", yaml);
	}
}

export default pipeline;
