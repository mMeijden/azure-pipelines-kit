#!/usr/bin/env node

import { Pipeline } from "../src/pipeline/pipeline";
import { Stage } from "../src/pipeline/stage";
import { Job } from "../src/jobs/job";
import { BashStep, PublishStep } from "../src/steps";
import { If, WhenVar, OnSuccess, Always } from "../src";
import { Eq, variables } from "../src/expressions/conditions";

/**
 * Simple Node.js application pipeline
 * Demonstrates: Basic CI/CD for a Node.js app with testing and deployment
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

// === BUILD STAGE ===
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

// === DEPLOY STAGE ===
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

// Synthesize and output YAML for CLI
if (require.main === module) {
	const yaml = pipeline.synthesize();
	console.log(yaml);
}

export default pipeline;
