import { Pipeline } from "../../src/pipeline/pipeline";
import { Stage } from "../../src/pipeline/stage";
import { Job } from "../../src/jobs/job";
import { PowerShellStep, BashStep, CheckoutStep } from "../../src/steps";
import { 
	If, Unless, OnSuccess, OnFailure, Always, 
	WhenVar, WhenNotVar, WhenParam, ForEnvironments, 
	ForPlatforms, WhenTesting, WhenDeploying,
	Eq, Ne, variables, parameters, succeeded, failed
} from "../../src";

/**
 * Example demonstrating direct template expression functions
 * This shows the most ergonomic way to create conditional pipeline elements
 */


// Create the main pipeline with variables
const pipeline = new Pipeline({
	variables: {
		environment: "staging",
		targetPlatform: "linux",
		runTests: "true",
		deployToStaging: "true",
		deployToProduction: "false",
		buildConfiguration: "Release",
		runIntegrationTests: "true",
		deployTarget: "staging"
	}
});

// === BUILD STAGE ===
const buildStage = new Stage("Build");

const buildJob = new Job({
	job: "BuildApplication", 
	displayName: "Build with Direct Expression Functions",
	pool: "ubuntu-latest"
});

// Always checkout code
buildJob.addStep(new CheckoutStep({ checkout: "self" }));

// Example 1: Basic If() function
buildJob.addStep(
	If(new Eq(variables.get("runTests"), "true"),
		new BashStep({
			displayName: "Run Unit Tests",
			bash: `
				echo "Running unit tests..."
				npm test
			`
		})
	)
);

// Example 2: Unless() for negative conditions  
buildJob.addStep(
	Unless(new Eq(variables.get("environment"), "production"),
		new BashStep({
			displayName: "Install Dev Dependencies",
			bash: `
				echo "Installing development dependencies..."
				npm install --include=dev
			`
		})
	)
);

// Example 3: WhenVar() convenience function
buildJob.addStep(
	WhenVar("buildConfiguration", "Debug", 
		new BashStep({
			displayName: "Enable Debug Logging",
			bash: `
				echo "Debug build detected - enabling verbose logging"
				export DEBUG=*
			`
		})
	)
);

// Example 4: WhenVar() for configuration-based conditions
buildJob.addStep(
	WhenVar("runIntegrationTests", "true",
		new BashStep({
			displayName: "Run Integration Tests", 
			bash: `
				echo "Running integration tests..."
				npm run test:integration
			`
		})
	)
);

buildStage.addJob(buildJob);
pipeline.addStage(buildStage);

// === DEPLOYMENT STAGE ===
const deployStage = new Stage("Deploy");

const deployJob = new Job({
	job: "DeployApplication",
	displayName: "Deploy with Conditional Logic",
	pool: "ubuntu-latest"
});

// Example 5: ForEnvironments() for environment-specific steps
deployJob.addStep(
	ForEnvironments("staging",
		new BashStep({
			displayName: "Deploy to Staging",
			bash: `
				echo "Deploying to staging environment..."
				kubectl apply -f k8s/staging/
			`
		})
	)
);

deployJob.addStep(
	ForEnvironments("production",
		new BashStep({
			displayName: "Deploy to Production",
			bash: `
				echo "Deploying to production environment..."
				kubectl apply -f k8s/production/
			`
		})
	)
);

// Example 6: ForPlatforms() for platform-specific builds
deployJob.addStep(
	ForPlatforms("windows",
		new PowerShellStep({
			displayName: "Windows-specific Deployment",
			powershell: `
				Write-Host "Deploying Windows-specific components..."
				Deploy-WindowsService -ServiceName "MyApp"
			`
		})
	)
);

deployJob.addStep(
	ForPlatforms(["linux", "darwin"],
		new BashStep({
			displayName: "Unix-like Deployment", 
			bash: `
				echo "Deploying to Unix-like system..."
				systemctl restart myapp
			`
		})
	)
);

// Example 7: WhenTesting() convenience
deployJob.addStep(
	WhenTesting(
		new BashStep({
			displayName: "Run Smoke Tests",
			bash: `
				echo "Running smoke tests after deployment..."
				npm run test:smoke
			`
		})
	)
);

// Example 8: WhenDeploying() with specific targets
deployJob.addStep(
	WhenDeploying("staging",
		new BashStep({
			displayName: "Staging Post-Deployment Tasks",
			bash: `
				echo "Running staging-specific post-deployment tasks..."
				npm run seed:staging-data
			`
		})
	)
);

deployJob.addStep(
	WhenDeploying("production", 
		new BashStep({
			displayName: "Production Post-Deployment Tasks",
			bash: `
				echo "Running production post-deployment tasks..."
				npm run warm-cache
				npm run health-check
			`
		})
	)
);

deployStage.addJob(deployJob);
pipeline.addStage(deployStage);

// === CLEANUP STAGE ===
const cleanupStage = new Stage("Cleanup");

const cleanupJob = new Job({
	job: "Cleanup",
	displayName: "Cleanup with Status-Based Conditions",
	pool: "ubuntu-latest"
});

// Example 9: OnSuccess() and OnFailure() functions
cleanupJob.addStep(
	OnSuccess("BuildApplication",
		new BashStep({
			displayName: "Success Notification",
			bash: `
				echo "Build succeeded! Sending success notification..."
				curl -X POST -H "Content-Type: application/json" \\
					-d '{"status": "success", "stage": "build"}' \\
					$WEBHOOK_URL
			`
		})
	)
);

cleanupJob.addStep(
	OnFailure("DeployApplication",
		new BashStep({
			displayName: "Failure Rollback",
			bash: `
				echo "Deployment failed! Rolling back..."
				kubectl rollout undo deployment/myapp
			`
		})
	)
);

// Example 10: Always() for guaranteed execution
cleanupJob.addStep(
	Always(
		new BashStep({
			displayName: "Cleanup Temporary Files",
			bash: `
				echo "Cleaning up temporary files..."
				rm -rf /tmp/build-artifacts
				docker system prune -f
			`
		})
	)
);

// Example 11: Complex chained conditions with If()
cleanupJob.addStep(
	If(new Eq(variables.get("environment"), "production")
		.and(succeeded("DeployApplication"))
		.and(new Ne(variables.get("deployTarget"), "none")),
		new BashStep({
			displayName: "Production Success Actions",
			bash: `
				echo "Production deployment succeeded!"
				echo "Updating deployment dashboard..."
				echo "Scheduling performance tests..."
			`
		})
	)
);

cleanupStage.addJob(cleanupJob);
pipeline.addStage(cleanupStage);

// === COMPLEX NESTED CONDITIONS ===

const complexConditionStep = If(
	new Eq(variables.get("environment"), "staging")
		.and(new Eq(variables.get("runIntegrationTests"), "true"))
		.and(succeeded("BuildApplication"))
		.or(
			new Eq(variables.get("environment"), "production")
				.and(new Eq(variables.get("deployTarget"), "production"))
				.and(new Ne(variables.get("deployToProduction"), "false"))
		),
	new BashStep({
		displayName: "Complex Conditional Step",
		bash: `
			echo "This step runs when:"
			echo "  (environment is staging AND runIntegrationTests is true AND build succeeded)"
			echo "  OR"
			echo "  (environment is production AND deployTarget is production AND deployToProduction is not false)"
		`
	})
);

cleanupJob.addStep(complexConditionStep);

// === COMPARISON EXAMPLES ===

TemplateExpression.from(
  new Eq(variables.get("environment"), "production"),
  new BashStep({ bash: "deploy to prod" })
)
`);

WhenVar("environment", "production", 
  new BashStep({ bash: "deploy to prod" }))

// Or even simpler:
ForEnvironments("production",
  new BashStep({ bash: "deploy to prod" }))
`);


// Export the pipeline for use in other files
export { pipeline };

// Synthesize pipeline when run as main module
if (require.main === module) {
	try {
		const yaml = pipeline.synthesize();
		// Write to YAML file instead of console output
		require('fs').writeFileSync(__dirname + '/direct-expressions-example.yml', yaml);
	} catch (error) {
		console.error("Error generating YAML:", error);
	}
}
