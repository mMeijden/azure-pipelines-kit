#!/usr/bin/env node

import { Pipeline } from "../src/pipeline/pipeline";
import { Stage } from "../src/pipeline/stage";
import { Job } from "../src/jobs/job";
import { BashStep, PublishStep } from "../src/steps";
import { If, Unless, WhenVar, ForEnvironments, OnSuccess, Always } from "../src";
import { Eq, Ne, variables, succeeded } from "../src/expressions/conditions";

/**
 * Infrastructure as Code pipeline
 * Demonstrates: Terraform deployments, infrastructure validation, multi-environment provisioning
 */

const pipeline = new Pipeline({
	trigger: {
		branches: {
			include: ["main", "infrastructure/*"]
		},
		paths: {
			include: ["terraform/*", "scripts/*", "*.tf", "*.tfvars"]
		}
	},
	variables: {
		terraformVersion: "1.5.0",
		environment: "staging",
		deployToStaging: "true",
		deployToProduction: "false",
		runValidation: "true",
		runSecurityScan: "true",
		autoApprove: "false",
		backendConfigFile: "backend-staging.tfvars"
	}
});

// === VALIDATION STAGE ===
const validationStage = new Stage("InfrastructureValidation");

const validationJob = new Job({
	job: "ValidateInfrastructure",
	displayName: "Validate Terraform Configuration",
	pool: "ubuntu-latest"
});

validationJob.addStep(
	new BashStep({
		displayName: "Setup Terraform",
		bash: `
		echo "Installing Terraform $(terraformVersion)..."
		wget https://releases.hashicorp.com/terraform/$(terraformVersion)/terraform_$(terraformVersion)_linux_amd64.zip
		unzip terraform_$(terraformVersion)_linux_amd64.zip
		sudo mv terraform /usr/local/bin/
		terraform --version
	`
	})
);

validationJob.addStep(
	new BashStep({
		displayName: "Terraform Format Check",
		bash: `
		echo "Checking Terraform formatting..."
		terraform fmt -check=true -recursive
		echo "Format check completed"
	`
	})
);

validationJob.addStep(
	new BashStep({
		displayName: "Terraform Init and Validate",
		bash: `
		echo "Initializing Terraform..."
		terraform init -backend-config=$(backendConfigFile)
		
		echo "Validating Terraform configuration..."
		terraform validate
		echo "Validation completed"
	`
	})
);

validationJob.addStep(
	WhenVar(
		"runSecurityScan",
		"true",
		new BashStep({
			displayName: "Infrastructure Security Scan",
			bash: `
				echo "Running infrastructure security scan..."
				
				# Install tfsec
				curl -s https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash
				
				# Run security scan
				tfsec . --format json --out tfsec-report.json
				
				# Install checkov for additional scanning
				pip install checkov
				checkov -d . --framework terraform --output json --output-file checkov-report.json
				
				echo "Security scan completed"
			`
		})
	)
);

validationJob.addStep(
	new PublishStep({
		displayName: "Publish Security Reports",
		publish: "*-report.json",
		artifact: "security-reports"
	})
);

validationStage.addJob(validationJob);
pipeline.addStage(validationStage);

// === PLAN STAGE ===
const planStage = new Stage("TerraformPlan");

const planJob = new Job({
	job: "TerraformPlan",
	displayName: "Generate Terraform Plan",
	pool: "ubuntu-latest",
	dependsOn: ["ValidateInfrastructure"]
});

planJob.addStep(
	OnSuccess(
		"ValidateInfrastructure",
		new BashStep({
			displayName: "Setup Terraform for Planning",
			bash: `
				echo "Setting up Terraform for planning..."
				terraform init -backend-config=$(backendConfigFile)
			`
		})
	)
);

planJob.addStep(
	ForEnvironments(
		"staging",
		new BashStep({
			displayName: "Generate Staging Plan",
			bash: `
				echo "Generating Terraform plan for staging..."
				terraform plan -var-file="staging.tfvars" -out=staging.tfplan
				
				echo "Converting plan to JSON for analysis..."
				terraform show -json staging.tfplan > staging-plan.json
			`
		})
	)
);

planJob.addStep(
	If(
		new Eq(variables.get("deployToProduction"), "true"),
		new BashStep({
			displayName: "Generate Production Plan",
			bash: `
				echo "Generating Terraform plan for production..."
				terraform plan -var-file="production.tfvars" -out=production.tfplan
				
				echo "Converting plan to JSON for analysis..."
				terraform show -json production.tfplan > production-plan.json
			`
		})
	)
);

planJob.addStep(
	new BashStep({
		displayName: "Analyze Infrastructure Changes",
		bash: `
		echo "Analyzing infrastructure changes..."
		
		# Custom script to analyze the plan
		python scripts/analyze_plan.py --plan-file staging-plan.json --output analysis-report.json
		
		echo "Change analysis completed"
	`
	})
);

planJob.addStep(
	new PublishStep({
		displayName: "Publish Terraform Plans",
		publish: "*.tfplan",
		artifact: "terraform-plans"
	})
);

planJob.addStep(
	new PublishStep({
		displayName: "Publish Plan Analysis",
		publish: "*-plan.json",
		artifact: "plan-analysis"
	})
);

planStage.addJob(planJob);
pipeline.addStage(planStage);

// === STAGING DEPLOYMENT ===
const stagingStage = new Stage("DeployStaging");

const stagingJob = new Job({
	job: "DeployToStaging",
	displayName: "Deploy Infrastructure to Staging",
	pool: "ubuntu-latest",
	dependsOn: ["TerraformPlan"]
});

stagingJob.addStep(
	ForEnvironments(
		"staging",
		new BashStep({
			displayName: "Download Terraform Plan",
			bash: `
				echo "Downloading Terraform plan for staging..."
				# Download staging.tfplan from artifacts
			`
		})
	)
);

stagingJob.addStep(
	If(
		new Eq(variables.get("deployToStaging"), "true").and(succeeded("TerraformPlan")),
		new BashStep({
			displayName: "Apply Staging Infrastructure",
			bash: `
				echo "Applying Terraform plan to staging..."
				terraform init -backend-config=$(backendConfigFile)
				
				if [ "$(autoApprove)" = "true" ]; then
					terraform apply -auto-approve staging.tfplan
				else
					echo "Manual approval required for staging deployment"
					# In a real scenario, this would wait for manual approval
					terraform apply staging.tfplan
				fi
				
				echo "Staging infrastructure deployment completed"
			`
		})
	)
);

stagingJob.addStep(
	OnSuccess(
		"DeployToStaging",
		new BashStep({
			displayName: "Validate Staging Infrastructure",
			bash: `
				echo "Validating deployed staging infrastructure..."
				
				# Run infrastructure tests
				python tests/infrastructure_tests.py --environment staging
				
				# Test connectivity and health
				python tests/connectivity_tests.py --environment staging
				
				echo "Staging validation completed"
			`
		})
	)
);

stagingJob.addStep(
	OnSuccess(
		"DeployToStaging",
		new BashStep({
			displayName: "Update Infrastructure Documentation",
			bash: `
				echo "Updating infrastructure documentation..."
				
				# Generate documentation from Terraform
				terraform-docs markdown table . > docs/infrastructure.md
				
				# Update architecture diagrams
				python scripts/generate_diagrams.py --environment staging
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
	displayName: "Deploy Infrastructure to Production",
	pool: "ubuntu-latest",
	dependsOn: ["DeployToStaging"]
});

productionJob.addStep(
	If(
		new Eq(variables.get("deployToProduction"), "true")
			.and(new Eq(variables.get("Build.SourceBranch"), "refs/heads/main"))
			.and(succeeded("DeployToStaging")),
		new BashStep({
			displayName: "Production Deployment Pre-checks",
			bash: `
				echo "Running production deployment pre-checks..."
				
				# Check staging health
				python scripts/check_staging_health.py
				
				# Validate production readiness
				python scripts/validate_prod_readiness.py
				
				echo "Pre-checks completed"
			`
		})
	)
);

productionJob.addStep(
	If(
		new Eq(variables.get("deployToProduction"), "true"),
		new BashStep({
			displayName: "Create Infrastructure Backup",
			bash: `
				echo "Creating production infrastructure backup..."
				
				# Export current Terraform state
				terraform state pull > backup/terraform-state-$(date +%Y%m%d-%H%M%S).json
				
				# Backup critical resources
				python scripts/backup_resources.py --environment production
				
				echo "Backup completed"
			`
		})
	)
);

productionJob.addStep(
	If(
		new Eq(variables.get("deployToProduction"), "true"),
		new BashStep({
			displayName: "Apply Production Infrastructure",
			bash: `
				echo "Applying Terraform plan to production..."
				terraform init -backend-config=backend-production.tfvars
				
				# Production requires manual approval
				echo "Applying production changes..."
				terraform apply production.tfplan
				
				echo "Production infrastructure deployment completed"
			`
		})
	)
);

productionJob.addStep(
	OnSuccess(
		"DeployToProduction",
		new BashStep({
			displayName: "Production Infrastructure Validation",
			bash: `
				echo "Validating production infrastructure..."
				
				# Comprehensive production tests
				python tests/production_tests.py --environment production
				
				# Performance validation
				python tests/performance_tests.py --environment production
				
				# Security validation
				python tests/security_tests.py --environment production
				
				echo "Production validation completed"
			`
		})
	)
);

productionStage.addJob(productionJob);
pipeline.addStage(productionStage);

// === MONITORING SETUP ===
const monitoringStage = new Stage("InfrastructureMonitoring");

const monitoringJob = new Job({
	job: "SetupMonitoring",
	displayName: "Setup Infrastructure Monitoring",
	pool: "ubuntu-latest",
	dependsOn: ["DeployToProduction"]
});

monitoringJob.addStep(
	OnSuccess(
		"DeployToProduction",
		new BashStep({
			displayName: "Configure Infrastructure Monitoring",
			bash: `
				echo "Setting up infrastructure monitoring..."
				
				# Deploy monitoring stack
				kubectl apply -f monitoring/prometheus/ -n monitoring
				kubectl apply -f monitoring/grafana/ -n monitoring
				
				# Configure alerts
				python scripts/setup_alerts.py --environment $(environment)
				
				echo "Monitoring setup completed"
			`
		})
	)
);

monitoringJob.addStep(
	Always(
		new BashStep({
			displayName: "Update Infrastructure Inventory",
			bash: `
				echo "Updating infrastructure inventory..."
				
				# Generate infrastructure inventory
				terraform output -json > infrastructure-inventory.json
				
				# Update CMDB
				python scripts/update_cmdb.py --inventory infrastructure-inventory.json
				
				echo "Inventory update completed"
			`
		})
	)
);

monitoringStage.addJob(monitoringJob);
pipeline.addStage(monitoringStage);

// Synthesize and output YAML for CLI
if (require.main === module) {
	const yaml = pipeline.synthesize();
	console.log(yaml);
}

export default pipeline;
