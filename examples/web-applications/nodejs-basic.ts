#!/usr/bin/env node

import { Pipeline } from "../../src/pipeline/pipeline";
import { Stage } from "../../src/pipeline/stage";
import { Job } from "../../src/jobs/job";
import { BashStep, PublishStep } from "../../src/steps";
import { If, WhenVar, OnSuccess, Always } from "../../src";
import { Eq, variables } from "../../src/expressions/conditions";

/**
 * Simple Node.js application CI/CD pipeline
 *
 * This example demonstrates:
 * - Basic build and test workflow
 * - Conditional testing with WhenVar()
 * - Artifact publishing
 * - Environment-based deployment
 * - Success/failure handling
 */

const pipeline = new Pipeline({
	trigger: {
		branches: {
			include: ["main", "develop"]
		}
	},
	variables: {
		nodeVersion: "18.x",
		buildConfiguration: "production",
		runTests: "true",
		deployToStaging: "true"
	}
});

// Build Stage
const buildStage = new Stage("Build");

const buildJob = new Job({
	job: "BuildApp",
	displayName: "Build Node.js Application",
	pool: "ubuntu-latest"
});

buildJob.addStep(
	new BashStep({
		displayName: "Setup Node.js",
		bash: `
		echo "Setting up Node.js $(nodeVersion)"
		nvm use $(nodeVersion)
		node --version
		npm --version
	`
	})
);

buildJob.addStep(
	new BashStep({
		displayName: "Install Dependencies",
		bash: `
		echo "Installing dependencies..."
		npm ci
	`
	})
);

buildJob.addStep(
	new BashStep({
		displayName: "Build Application",
		bash: `
		echo "Building application..."
		npm run build
	`
	})
);

buildJob.addStep(
	WhenVar(
		"runTests",
		"true",
		new BashStep({
			displayName: "Run Tests",
			bash: `
				echo "Running unit tests..."
				npm test
				echo "Running linting..."
				npm run lint
			`
		})
	)
);

buildJob.addStep(
	new PublishStep({
		displayName: "Publish Build Artifacts",
		publish: "dist/",
		artifact: "webapp"
	})
);

buildStage.addJob(buildJob);
pipeline.addStage(buildStage);

// Deploy Stage
const deployStage = new Stage("Deploy");

const deployJob = new Job({
	job: "DeployApp",
	displayName: "Deploy to Staging",
	pool: "ubuntu-latest",
	dependsOn: ["BuildApp"]
});

deployJob.addStep(
	OnSuccess(
		"BuildApp",
		new BashStep({
			displayName: "Download Build Artifacts",
			bash: `
				echo "Downloading build artifacts..."
				# Download artifacts from previous job
			`
		})
	)
);

deployJob.addStep(
	If(
		new Eq(variables.get("deployToStaging"), "true"),
		new BashStep({
			displayName: "Deploy to Staging Environment",
			bash: `
				echo "Deploying to staging..."
				echo "Copying files to staging server..."
				echo "Restarting application services..."
				echo "Running smoke tests..."
			`
		})
	)
);

deployJob.addStep(
	Always(
		new BashStep({
			displayName: "Cleanup",
			bash: `
				echo "Cleaning up temporary files..."
				rm -rf temp/
			`
		})
	)
);

deployStage.addJob(deployJob);
pipeline.addStage(deployStage);

// Synthesize pipeline when run as main module
if (require.main === module) {
	const yaml = pipeline.synthesize();
	// Write to YAML file instead of console output
	require("fs").writeFileSync(__dirname + "/nodejs-basic.yml", yaml);
}

export default pipeline;
