import { Pipeline } from "../../src/pipeline/pipeline";
import { Stage } from "../../src/pipeline/stage";
import { Job } from "../../src/jobs/job";
import { PowerShellStep, BashStep } from "../../src/steps";

/**
 * Template Expression Pipeline Example
 *
 * This example demonstrates how template expressions would work
 * at different levels of an Azure DevOps pipeline.
 *
 * Note: This is a conceptual example showing the proposed API.
 * The TemplateExpression functionality is still being implemented.
 */

// Create pipeline with variables that control behavior
const pipeline = new Pipeline({
	variables: {
		buildConfiguration: "Release",
		runTests: "true",
		deployToStaging: "false",
		deployToProduction: "false",
		targetPlatform: "windows",
		isEnterprise: "false"
	}
});

// 🎯 This pipeline demonstrates template expressions at multiple levels:

// === BUILD STAGE ===
// 📦 BUILD STAGE - Platform-specific builds with conditional steps

const buildStage = new Stage("Build");

// Windows Build Job - Conditional at job level
const windowsBuildJob = new Job({
	job: "BuildWindows",
	displayName: "Build on Windows",
	pool: "windows-latest",
	condition: "eq(variables.targetPlatform, 'windows')" // Job-level condition
});

// Add steps to Windows job
windowsBuildJob.addStep(
	new PowerShellStep({
		displayName: "Setup Windows Environment",
		powershell: `
    Write-Host "🔧 Setting up Windows build environment"
    Write-Host "Build Configuration: $(buildConfiguration)"
    $env:DOTNET_CLI_TELEMETRY_OPTOUT = 1
  `
	})
);

// This would be a conditional step if TemplateExpression was implemented:
// windowsBuildJob.addStep(
//   TemplateExpression.if(
//     "eq(variables.buildConfiguration, 'Release')",
//     new PowerShellStep({ ... release build ... }),
//     new PowerShellStep({ ... debug build ... })
//   )
// );

windowsBuildJob.addStep(
	new PowerShellStep({
		displayName: "Build Application",
		powershell: `
    Write-Host "🏗️ Building application in $(buildConfiguration) mode"
    # dotnet build --configuration $(buildConfiguration)
  `
	})
);

// Conditional test step (conceptual)
windowsBuildJob.addStep(
	new PowerShellStep({
		displayName: "Run Tests (Conditional)",
		condition: "eq(variables.runTests, 'true')", // Step-level condition
		powershell: `
    Write-Host "🧪 Running unit tests"
    # dotnet test --configuration $(buildConfiguration)
  `
	})
);

buildStage.addJob(windowsBuildJob);

// Linux Build Job - Also conditional
const linuxBuildJob = new Job({
	job: "BuildLinux",
	displayName: "Build on Linux",
	pool: "ubuntu-latest",
	condition: "eq(variables.targetPlatform, 'linux')" // Job-level condition
});

linuxBuildJob.addStep(
	new BashStep({
		displayName: "Setup Linux Environment",
		bash: `
    echo "🔧 Setting up Linux build environment"
    echo "Build Configuration: $(buildConfiguration)"
    export DOTNET_CLI_TELEMETRY_OPTOUT=1
  `
	})
);

linuxBuildJob.addStep(
	new BashStep({
		displayName: "Build Application",
		bash: `
    echo "🏗️ Building application on Linux"
    # dotnet build --configuration $(buildConfiguration)
  `
	})
);

linuxBuildJob.addStep(
	new BashStep({
		displayName: "Run Linux Tests (Conditional)",
		condition: "and(eq(variables.runTests, 'true'), eq(variables.targetPlatform, 'linux'))",
		bash: `
    echo "🧪 Running Linux-specific tests"
    # dotnet test --configuration $(buildConfiguration)
  `
	})
);

buildStage.addJob(linuxBuildJob);
pipeline.addStage(buildStage);

// === STAGING DEPLOYMENT STAGE ===

const stagingStage = new Stage("DeployStaging");

const stagingJob = new Job({
	job: "DeployToStaging",
	displayName: "Deploy to Staging Environment",
	pool: "ubuntu-latest",
	condition: "eq(variables.deployToStaging, 'true')", // Job-level condition
	dependsOn: "Build"
});

// Platform-specific deployment (conceptual)

stagingJob.addStep(
	new BashStep({
		displayName: "Platform-specific Deployment",
		bash: `
    echo "🚀 Deploying to staging environment"
    echo "Target Platform: $(targetPlatform)"
    
    # This would be conditional in real implementation:
    if [ "$(targetPlatform)" = "windows" ]; then
      echo "🪟 Deploying Windows application"
    else
      echo "🐧 Deploying Linux application"
    fi
  `
	})
);

stagingJob.addStep(
	new BashStep({
		displayName: "Run Staging Smoke Tests",
		condition: "eq(variables.runTests, 'true')",
		bash: `
    echo "🧪 Running smoke tests against staging"
    # curl -f http://staging.myapp.com/health
    echo "✅ Smoke tests completed"
  `
	})
);

stagingStage.addJob(stagingJob);
pipeline.addStage(stagingStage);

// === PRODUCTION DEPLOYMENT STAGE ===

const productionStage = new Stage("DeployProduction");

const productionJob = new Job({
	job: "DeployToProduction",
	displayName: "Deploy to Production Environment",
	pool: "ubuntu-latest",
	condition: "and(eq(variables.deployToProduction, 'true'), succeeded('DeployStaging'))",
	dependsOn: "DeployStaging"
});

productionJob.addStep(
	new BashStep({
		displayName: "Pre-deployment Validation",
		bash: `
    echo "✅ Validating production readiness"
    echo "🔍 Checking prerequisites..."
  `
	})
);

// Conditional deployment strategy (conceptual)

productionJob.addStep(
	new BashStep({
		displayName: "Enterprise vs Standard Deployment",
		bash: `
    echo "🚀 Starting production deployment"
    
    # This would use TemplateExpression.if() in real implementation:
    if [ "$(isEnterprise)" = "true" ]; then
      echo "🔵🟢 Performing blue-green deployment for enterprise"
      echo "🔄 Switching traffic to new deployment..."
    else
      echo "📈 Performing standard rolling deployment"
      echo "📦 Updating application..."
    fi
  `
	})
);

productionJob.addStep(
	new BashStep({
		displayName: "Post-deployment Health Check",
		condition: "and(eq(variables.runTests, 'true'), succeeded())",
		bash: `
    echo "🏥 Running production health checks"
    # curl -f https://api.myapp.com/health
    echo "✅ Production deployment verified!"
  `
	})
);

// Conditional notifications (conceptual)

productionJob.addStep(
	new BashStep({
		displayName: "Deployment Notifications",
		bash: `
    # This would use TemplateExpression.if(succeeded(), ..., ...) in real implementation:
    echo "📢 Sending deployment notification"
    
    if [ "$AGENT_JOBSTATUS" = "Succeeded" ]; then
      echo "✅ Deployment successful! Notifying team."
    else
      echo "❌ Deployment failed! Sending failure notification and rollback instructions."
    fi
  `
	})
);

productionStage.addJob(productionJob);
pipeline.addStage(productionStage);

// === CLEANUP STAGE ===

const cleanupStage = new Stage("Cleanup");

const cleanupJob = new Job({
	job: "CleanupResources",
	displayName: "Cleanup Resources",
	pool: "ubuntu-latest",
	condition: "always()", // Always run cleanup
	dependsOn: "DeployProduction"
});

cleanupJob.addStep(
	new BashStep({
		displayName: "Conditional Cleanup",
		bash: `
    echo "🧹 Performing cleanup operations"
    
    # This would use TemplateExpression.if() for different cleanup strategies:
    if [ "$AGENT_JOBSTATUS" = "Succeeded" ]; then
      echo "✅ Pipeline succeeded - performing success cleanup"
      echo "📦 Cleaning up temporary resources"
    else
      echo "❌ Pipeline failed - performing failure cleanup"
      echo "🔍 Preserving logs for investigation"
    fi
  `
	})
);

cleanupStage.addJob(cleanupJob);
pipeline.addStage(cleanupStage);

// Display template expression concepts

// Export the pipeline
export { pipeline };

// Synthesize pipeline when run as main module
if (require.main === module) {
	try {
		const yaml = pipeline.synthesize();
		// Write to YAML file instead of console output
		require("fs").writeFileSync(__dirname + "/template-expressions-demo.yml", yaml);
	} catch (error) {
		console.error("YAML generation will work once the template expression system is fully implemented.");
	}
}
