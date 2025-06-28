#!/usr/bin/env node

import { Pipeline } from "../src/pipeline/pipeline";
import { Stage } from "../src/pipeline/stage";
import { Job } from "../src/jobs/job";
import { BashStep, PublishStep } from "../src/steps";
import { If, Unless, WhenVar, ForEnvironments, WhenTesting, WhenDeploying, OnSuccess, OnFailure, Always } from "../src";
import { Eq, Ne, And, Or, variables, succeeded, failed } from "../src/expressions/conditions";

/**
 * Microservices deployment pipeline
 * Demonstrates: Multi-service builds, environment-specific deployments, advanced conditionals
 */

const pipeline = new Pipeline({
	trigger: {
		branches: {
			include: ["main", "develop", "feature/*"]
		},
		paths: {
			include: [
				"services/user-service/*",
				"services/order-service/*",
				"services/payment-service/*",
				"infrastructure/*",
				"docker-compose.yml"
			]
		}
	},
	variables: {
		dockerRegistry: "myregistry.azurecr.io",
		kubernetesNamespace: "production",
		environment: "staging",
		deployUserService: "true",
		deployOrderService: "true",
		deployPaymentService: "true",
		runIntegrationTests: "true",
		runPerformanceTests: "false",
		deployToProduction: "false",
		rollbackOnFailure: "true"
	}
});

// === BUILD STAGE ===
const buildStage = new Stage("BuildServices");

// User Service Build
const userServiceJob = new Job({
	job: "BuildUserService",
	displayName: "Build User Service",
	pool: "ubuntu-latest"
});

userServiceJob.addStep(
	new BashStep({
		displayName: "Check for User Service Changes",
		bash: `
		echo "Checking if user service needs to be built..."
		git diff --name-only HEAD~1 HEAD | grep "services/user-service" || echo "No changes detected"
	`
	})
);

userServiceJob.addStep(
	WhenVar(
		"deployUserService",
		"true",
		new BashStep({
			displayName: "Build User Service Docker Image",
			bash: `
				echo "Building user service..."
				cd services/user-service
				docker build -t $(dockerRegistry)/user-service:$(Build.BuildId) .
				docker push $(dockerRegistry)/user-service:$(Build.BuildId)
			`
		})
	)
);

userServiceJob.addStep(
	WhenTesting(
		new BashStep({
			displayName: "Test User Service",
			bash: `
				echo "Running user service tests..."
				cd services/user-service
				npm test
				npm run test:integration
			`
		})
	)
);

buildStage.addJob(userServiceJob);

// Order Service Build
const orderServiceJob = new Job({
	job: "BuildOrderService",
	displayName: "Build Order Service",
	pool: "ubuntu-latest"
});

orderServiceJob.addStep(
	WhenVar(
		"deployOrderService",
		"true",
		new BashStep({
			displayName: "Build Order Service Docker Image",
			bash: `
				echo "Building order service..."
				cd services/order-service
				docker build -t $(dockerRegistry)/order-service:$(Build.BuildId) .
				docker push $(dockerRegistry)/order-service:$(Build.BuildId)
			`
		})
	)
);

orderServiceJob.addStep(
	WhenTesting(
		new BashStep({
			displayName: "Test Order Service",
			bash: `
				echo "Running order service tests..."
				cd services/order-service
				go test ./...
				go test -tags=integration ./...
			`
		})
	)
);

buildStage.addJob(orderServiceJob);

// Payment Service Build
const paymentServiceJob = new Job({
	job: "BuildPaymentService",
	displayName: "Build Payment Service",
	pool: "ubuntu-latest"
});

paymentServiceJob.addStep(
	WhenVar(
		"deployPaymentService",
		"true",
		new BashStep({
			displayName: "Build Payment Service Docker Image",
			bash: `
				echo "Building payment service..."
				cd services/payment-service
				docker build -t $(dockerRegistry)/payment-service:$(Build.BuildId) .
				docker push $(dockerRegistry)/payment-service:$(Build.BuildId)
			`
		})
	)
);

paymentServiceJob.addStep(
	WhenTesting(
		new BashStep({
			displayName: "Test Payment Service with Security Scan",
			bash: `
				echo "Running payment service tests..."
				cd services/payment-service
				python -m pytest tests/
				echo "Running security scans..."
				bandit -r src/
			`
		})
	)
);

buildStage.addJob(paymentServiceJob);
pipeline.addStage(buildStage);

// === INTEGRATION TEST STAGE ===
const integrationStage = new Stage("Integration");

const integrationJob = new Job({
	job: "IntegrationTests",
	displayName: "Microservices Integration Tests",
	pool: "ubuntu-latest",
	dependsOn: ["BuildUserService", "BuildOrderService", "BuildPaymentService"]
});

integrationJob.addStep(
	If(
		succeeded("BuildUserService").and(succeeded("BuildOrderService")).and(succeeded("BuildPaymentService")),
		new BashStep({
			displayName: "Start Test Environment",
			bash: `
				echo "Starting integration test environment..."
				docker-compose -f docker-compose.test.yml up -d
				sleep 30  # Wait for services to start
			`
		})
	)
);

integrationJob.addStep(
	WhenVar(
		"runIntegrationTests",
		"true",
		new BashStep({
			displayName: "Run End-to-End Tests",
			bash: `
				echo "Running end-to-end integration tests..."
				npm run test:e2e
				echo "Testing service-to-service communication..."
				npm run test:contract
			`
		})
	)
);

integrationJob.addStep(
	If(
		new Eq(variables.get("runPerformanceTests"), "true").and(new Ne(variables.get("Build.Reason"), "PullRequest")),
		new BashStep({
			displayName: "Run Performance Tests",
			bash: `
				echo "Running performance tests..."
				k6 run tests/performance/load-test.js
				echo "Running stress tests..."
				k6 run tests/performance/stress-test.js
			`
		})
	)
);

integrationJob.addStep(
	Always(
		new BashStep({
			displayName: "Cleanup Test Environment",
			bash: `
				echo "Cleaning up test environment..."
				docker-compose -f docker-compose.test.yml down
				docker system prune -f
			`
		})
	)
);

integrationStage.addJob(integrationJob);
pipeline.addStage(integrationStage);

// === STAGING DEPLOYMENT ===
const stagingStage = new Stage("DeployStaging");

const stagingJob = new Job({
	job: "DeployToStaging",
	displayName: "Deploy to Staging Environment",
	pool: "ubuntu-latest",
	dependsOn: ["IntegrationTests"]
});

stagingJob.addStep(
	ForEnvironments(
		"staging",
		new BashStep({
			displayName: "Deploy User Service to Staging",
			bash: `
				echo "Deploying user service to staging..."
				kubectl set image deployment/user-service user-service=$(dockerRegistry)/user-service:$(Build.BuildId) -n staging
				kubectl rollout status deployment/user-service -n staging
			`
		})
	)
);

stagingJob.addStep(
	ForEnvironments(
		"staging",
		new BashStep({
			displayName: "Deploy Order Service to Staging",
			bash: `
				echo "Deploying order service to staging..."
				kubectl set image deployment/order-service order-service=$(dockerRegistry)/order-service:$(Build.BuildId) -n staging
				kubectl rollout status deployment/order-service -n staging
			`
		})
	)
);

stagingJob.addStep(
	ForEnvironments(
		"staging",
		new BashStep({
			displayName: "Deploy Payment Service to Staging",
			bash: `
				echo "Deploying payment service to staging..."
				kubectl set image deployment/payment-service payment-service=$(dockerRegistry)/payment-service:$(Build.BuildId) -n staging
				kubectl rollout status deployment/payment-service -n staging
			`
		})
	)
);

stagingJob.addStep(
	OnSuccess(
		"DeployToStaging",
		new BashStep({
			displayName: "Run Staging Smoke Tests",
			bash: `
				echo "Running smoke tests on staging..."
				curl -f http://staging.myapp.com/health/user-service
				curl -f http://staging.myapp.com/health/order-service  
				curl -f http://staging.myapp.com/health/payment-service
			`
		})
	)
);

stagingStage.addJob(stagingJob);
pipeline.addStage(stagingStage);

// === PRODUCTION DEPLOYMENT ===
const productionStage = new Stage("DeployProduction");

const productionJob = new Job({
	job: "DeployToProduction",
	displayName: "Deploy to Production Environment",
	pool: "ubuntu-latest",
	dependsOn: ["DeployToStaging"]
});

productionJob.addStep(
	If(
		new Eq(variables.get("deployToProduction"), "true").and(new Eq(variables.get("Build.SourceBranch"), "refs/heads/main")),
		new BashStep({
			displayName: "Production Deployment Gate",
			bash: `
				echo "Starting production deployment..."
				echo "Checking deployment approvals..."
				echo "Validating production readiness..."
			`
		})
	)
);

productionJob.addStep(
	WhenDeploying(
		"production",
		new BashStep({
			displayName: "Blue-Green Deployment to Production",
			bash: `
				echo "Starting blue-green deployment..."
				
				# Deploy to green environment
				kubectl apply -f k8s/production/green/ -n production
				
				# Wait for green environment to be ready
				kubectl wait --for=condition=available deployment --all -n production-green --timeout=300s
				
				# Switch traffic to green
				kubectl patch service frontend -p '{"spec":{"selector":{"version":"green"}}}' -n production
				
				echo "Traffic switched to green environment"
			`
		})
	)
);

productionJob.addStep(
	OnSuccess(
		"DeployToProduction",
		new BashStep({
			displayName: "Production Health Check",
			bash: `
				echo "Running production health checks..."
				curl -f https://api.myapp.com/health
				echo "Monitoring deployment metrics..."
				sleep 60  # Monitor for 1 minute
			`
		})
	)
);

productionJob.addStep(
	OnFailure(
		"DeployToProduction",
		new BashStep({
			displayName: "Production Rollback",
			bash: `
				echo "Production deployment failed - initiating rollback..."
				kubectl rollout undo deployment/user-service -n production
				kubectl rollout undo deployment/order-service -n production  
				kubectl rollout undo deployment/payment-service -n production
				echo "Rollback completed"
			`
		})
	)
);

productionStage.addJob(productionJob);
pipeline.addStage(productionStage);

// === POST-DEPLOYMENT ===
const postDeployStage = new Stage("PostDeployment");

const notificationJob = new Job({
	job: "PostDeploymentTasks",
	displayName: "Post-Deployment Notifications and Monitoring",
	pool: "ubuntu-latest",
	dependsOn: ["DeployToProduction"]
});

notificationJob.addStep(
	OnSuccess(
		"DeployToProduction",
		new BashStep({
			displayName: "Success Notifications",
			bash: `
				echo "Sending success notifications..."
				curl -X POST -H "Content-Type: application/json" \\
					-d '{"status": "success", "environment": "$(environment)", "build": "$(Build.BuildId)"}' \\
					$SLACK_WEBHOOK_URL
			`
		})
	)
);

notificationJob.addStep(
	OnFailure(
		"DeployToProduction",
		new BashStep({
			displayName: "Failure Notifications",
			bash: `
				echo "Sending failure notifications..."
				curl -X POST -H "Content-Type: application/json" \\
					-d '{"status": "failure", "environment": "$(environment)", "build": "$(Build.BuildId)"}' \\
					$SLACK_WEBHOOK_URL
			`
		})
	)
);

notificationJob.addStep(
	Always(
		new BashStep({
			displayName: "Update Deployment Dashboard",
			bash: `
				echo "Updating deployment dashboard..."
				echo "Recording deployment metrics..."
			`
		})
	)
);

postDeployStage.addJob(notificationJob);
pipeline.addStage(postDeployStage);

// Synthesize and output YAML for CLI
if (require.main === module) {
	const yaml = pipeline.synthesize();
	console.log(yaml);
}

export default pipeline;
