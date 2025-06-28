#!/usr/bin/env node

import { Pipeline } from "../../src/pipeline/pipeline";
import { Stage } from "../../src/pipeline/stage";
import { Job } from "../../src/jobs/job";
import { BashStep, PublishStep } from "../../src/steps";
import { If, Unless, WhenVar, ForEnvironments, OnSuccess, Always } from "../../src";
import { Eq, Ne, variables, succeeded } from "../../src/expressions/conditions";

/**
 * Infrastructure as Code deployment pipeline using Terraform
 *
 * This example demonstrates:
 * - Terraform validation and security scanning
 * - Multi-environment infrastructure deployment
 * - Manual approval gates for production
 * - Infrastructure monitoring setup
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

// Validation Stage
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
				curl -s https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash
				tfsec . --format json --out tfsec-report.json
				pip install checkov
				checkov -d . --framework terraform --output json --output-file checkov-report.json
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

// Plan Stage
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
		python scripts/analyze_plan.py --plan-file staging-plan.json --output analysis-report.json
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

planStage.addJob(planJob);
pipeline.addStage(planStage);

// Staging Deployment
const stagingStage = new Stage("DeployStaging");

const stagingJob = new Job({
	job: "DeployToStaging",
	displayName: "Deploy Infrastructure to Staging",
	pool: "ubuntu-latest",
	dependsOn: ["TerraformPlan"]
});

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
					terraform apply staging.tfplan
				fi
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
				python tests/infrastructure_tests.py --environment staging
				python tests/connectivity_tests.py --environment staging
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
				terraform-docs markdown table . > docs/infrastructure.md
				python scripts/generate_diagrams.py --environment staging
			`
		})
	)
);

stagingStage.addJob(stagingJob);
pipeline.addStage(stagingStage);

// Production Deployment
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
				python scripts/check_staging_health.py
				python scripts/validate_prod_readiness.py
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
				terraform state pull > backup/terraform-state-$(date +%Y%m%d-%H%M%S).json
				python scripts/backup_resources.py --environment production
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
				terraform apply production.tfplan
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
				python tests/production_tests.py --environment production
				python tests/performance_tests.py --environment production
				python tests/security_tests.py --environment production
			`
		})
	)
);

productionStage.addJob(productionJob);
pipeline.addStage(productionStage);

// Monitoring Setup
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
				kubectl apply -f monitoring/prometheus/ -n monitoring
				kubectl apply -f monitoring/grafana/ -n monitoring
				python scripts/setup_alerts.py --environment $(environment)
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
				terraform output -json > infrastructure-inventory.json
				python scripts/update_cmdb.py --inventory infrastructure-inventory.json
			`
		})
	)
);

monitoringStage.addJob(monitoringJob);
pipeline.addStage(monitoringStage);

// Synthesize pipeline when run as main module
if (require.main === module) {
	const yaml = pipeline.synthesize();
	// Write to YAML file instead of console output
	require("fs").writeFileSync(__dirname + "/terraform-deployment.yml", yaml);
}

export default pipeline;
