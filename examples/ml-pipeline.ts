#!/usr/bin/env node

import { Pipeline } from "../src/pipeline/pipeline";
import { Stage } from "../src/pipeline/stage";
import { Job } from "../src/jobs/job";
import { BashStep, PublishStep } from "../src/steps";
import { If, Unless, WhenVar, OnSuccess, OnFailure } from "../src";
import { Eq, Ne, variables, succeeded, failed } from "../src/expressions/conditions";

/**
 * Machine Learning pipeline
 * Demonstrates: Model training, validation, deployment with conditional logic for ML workflows
 */

const pipeline = new Pipeline({
	trigger: {
		branches: {
			include: ["main", "experiment/*"]
		},
		paths: {
			include: ["models/*", "data/*", "training/*", "requirements.txt"]
		}
	},
	variables: {
		pythonVersion: "3.9",
		modelVersion: "v1.0",
		datasetVersion: "latest",
		runTraining: "true",
		runValidation: "true",
		deployModel: "false",
		minimumAccuracy: "0.85",
		environment: "staging",
		mlflowTrackingUri: "https://mlflow.mycompany.com"
	}
});

// === DATA PREPARATION STAGE ===
const dataStage = new Stage("DataPreparation");

const dataJob = new Job({
	job: "PrepareData",
	displayName: "Data Preparation and Validation",
	pool: "ubuntu-latest"
});

dataJob.addStep(
	new BashStep({
		displayName: "Setup Python Environment",
		bash: `
		echo "Setting up Python $(pythonVersion) environment..."
		python --version
		pip install --upgrade pip
		pip install -r requirements.txt
	`
	})
);

dataJob.addStep(
	new BashStep({
		displayName: "Download and Validate Dataset",
		bash: `
		echo "Downloading dataset version $(datasetVersion)..."
		python scripts/download_data.py --version $(datasetVersion)
		
		echo "Validating data quality..."
		python scripts/validate_data.py --input data/raw/
		
		echo "Data validation completed"
	`
	})
);

dataJob.addStep(
	WhenVar(
		"runTraining",
		"true",
		new BashStep({
			displayName: "Preprocess Training Data",
			bash: `
				echo "Preprocessing training data..."
				python scripts/preprocess.py --input data/raw/ --output data/processed/
				
				echo "Splitting data into train/validation/test..."
				python scripts/split_data.py --input data/processed/ --output data/splits/
			`
		})
	)
);

dataJob.addStep(
	new PublishStep({
		displayName: "Publish Processed Data",
		publish: "data/processed/",
		artifact: "processed-data"
	})
);

dataStage.addJob(dataJob);
pipeline.addStage(dataStage);

// === MODEL TRAINING STAGE ===
const trainingStage = new Stage("ModelTraining");

const trainingJob = new Job({
	job: "TrainModel",
	displayName: "Train Machine Learning Model",
	pool: "ubuntu-latest",
	dependsOn: ["PrepareData"]
});

trainingJob.addStep(
	OnSuccess(
		"PrepareData",
		new BashStep({
			displayName: "Download Processed Data",
			bash: `
				echo "Downloading processed data artifacts..."
				# Download processed data from previous stage
			`
		})
	)
);

trainingJob.addStep(
	WhenVar(
		"runTraining",
		"true",
		new BashStep({
			displayName: "Train Model",
			bash: `
				echo "Starting model training..."
				echo "MLflow Tracking URI: $(mlflowTrackingUri)"
				
				python training/train_model.py \\
					--data-path data/splits/train/ \\
					--model-version $(modelVersion) \\
					--mlflow-uri $(mlflowTrackingUri) \\
					--experiment-name "pipeline-$(Build.BuildId)"
				
				echo "Model training completed"
			`
		})
	)
);

trainingJob.addStep(
	WhenVar(
		"runValidation",
		"true",
		new BashStep({
			displayName: "Validate Model Performance",
			bash: `
				echo "Validating model performance..."
				
				python validation/validate_model.py \\
					--model-path models/$(modelVersion)/ \\
					--test-data data/splits/test/ \\
					--min-accuracy $(minimumAccuracy) \\
					--output-report validation-report.json
				
				echo "Model validation completed"
			`
		})
	)
);

trainingJob.addStep(
	new PublishStep({
		displayName: "Publish Model Artifacts",
		publish: "models/$(modelVersion)/",
		artifact: "trained-model"
	})
);

trainingJob.addStep(
	new PublishStep({
		displayName: "Publish Validation Report",
		publish: "validation-report.json",
		artifact: "validation-report"
	})
);

trainingStage.addJob(trainingJob);
pipeline.addStage(trainingStage);

// === MODEL EVALUATION STAGE ===
const evaluationStage = new Stage("ModelEvaluation");

const evaluationJob = new Job({
	job: "EvaluateModel",
	displayName: "Comprehensive Model Evaluation",
	pool: "ubuntu-latest",
	dependsOn: ["TrainModel"]
});

evaluationJob.addStep(
	OnSuccess(
		"TrainModel",
		new BashStep({
			displayName: "Download Model and Validation Report",
			bash: `
				echo "Downloading model artifacts and validation report..."
				# Download from previous stages
			`
		})
	)
);

evaluationJob.addStep(
	new BashStep({
		displayName: "Run Model Evaluation Suite",
		bash: `
		echo "Running comprehensive model evaluation..."
		
		# Performance metrics
		python evaluation/performance_metrics.py --model models/$(modelVersion)/
		
		# Bias and fairness testing
		python evaluation/bias_testing.py --model models/$(modelVersion)/
		
		# Model interpretability analysis
		python evaluation/interpretability.py --model models/$(modelVersion)/
		
		echo "Evaluation suite completed"
	`
	})
);

evaluationJob.addStep(
	If(
		new Eq(variables.get("Build.SourceBranch"), "refs/heads/main"),
		new BashStep({
			displayName: "Compare with Production Model",
			bash: `
				echo "Comparing new model with production model..."
				python evaluation/model_comparison.py \\
					--new-model models/$(modelVersion)/ \\
					--prod-model models/production/ \\
					--output comparison-report.json
			`
		})
	)
);

evaluationJob.addStep(
	Unless(
		new Eq(variables.get("Build.Reason"), "PullRequest"),
		new BashStep({
			displayName: "Register Model in MLflow",
			bash: `
				echo "Registering model in MLflow model registry..."
				python scripts/register_model.py \\
					--model-path models/$(modelVersion)/ \\
					--model-name "MyMLModel" \\
					--version $(modelVersion) \\
					--stage "Staging"
			`
		})
	)
);

evaluationStage.addJob(evaluationJob);
pipeline.addStage(evaluationStage);

// === MODEL DEPLOYMENT STAGE ===
const deploymentStage = new Stage("ModelDeployment");

const deploymentJob = new Job({
	job: "DeployModel",
	displayName: "Deploy Model to Serving Infrastructure",
	pool: "ubuntu-latest",
	dependsOn: ["EvaluateModel"]
});

deploymentJob.addStep(
	If(
		new Eq(variables.get("deployModel"), "true").and(succeeded("EvaluateModel")),
		new BashStep({
			displayName: "Deploy Model to Staging",
			bash: `
				echo "Deploying model to staging environment..."
				
				# Build model serving container
				docker build -t myregistry.azurecr.io/ml-model:$(modelVersion) .
				docker push myregistry.azurecr.io/ml-model:$(modelVersion)
				
				# Deploy to Kubernetes
				kubectl set image deployment/ml-model-service ml-model=myregistry.azurecr.io/ml-model:$(modelVersion) -n staging
				kubectl rollout status deployment/ml-model-service -n staging
			`
		})
	)
);

deploymentJob.addStep(
	OnSuccess(
		"DeployModel",
		new BashStep({
			displayName: "Run Model Serving Tests",
			bash: `
				echo "Testing model serving endpoint..."
				
				# Wait for deployment to be ready
				sleep 30
				
				# Test inference endpoint
				python tests/test_inference.py --endpoint http://staging-ml-api.mycompany.com/predict
				
				# Load testing
				python tests/load_test.py --endpoint http://staging-ml-api.mycompany.com/predict --duration 60
			`
		})
	)
);

deploymentJob.addStep(
	If(
		new Eq(variables.get("environment"), "production").and(new Eq(variables.get("Build.SourceBranch"), "refs/heads/main")),
		new BashStep({
			displayName: "Production Deployment (A/B Testing)",
			bash: `
				echo "Deploying to production with A/B testing..."
				
				# Deploy new model version alongside current production
				kubectl apply -f k8s/production/ab-deployment.yaml
				
				# Configure traffic split (10% to new model)
				kubectl patch service ml-model-service -p '{"spec":{"selector":{"version":"$(modelVersion)"}}}' -n production
				
				echo "A/B testing deployment completed - 10% traffic to new model"
			`
		})
	)
);

deploymentJob.addStep(
	OnFailure(
		"DeployModel",
		new BashStep({
			displayName: "Deployment Rollback",
			bash: `
				echo "Model deployment failed - rolling back..."
				kubectl rollout undo deployment/ml-model-service -n staging
				echo "Rollback completed"
			`
		})
	)
);

deploymentStage.addJob(deploymentJob);
pipeline.addStage(deploymentStage);

// === MONITORING STAGE ===
const monitoringStage = new Stage("ModelMonitoring");

const monitoringJob = new Job({
	job: "SetupMonitoring",
	displayName: "Setup Model Performance Monitoring",
	pool: "ubuntu-latest",
	dependsOn: ["DeployModel"]
});

monitoringJob.addStep(
	OnSuccess(
		"DeployModel",
		new BashStep({
			displayName: "Configure Model Monitoring",
			bash: `
				echo "Setting up model performance monitoring..."
				
				# Deploy data drift detection
				python monitoring/setup_drift_detection.py --model-version $(modelVersion)
				
				# Configure alerting
				python monitoring/setup_alerts.py --model-version $(modelVersion)
				
				# Setup model performance dashboard
				python monitoring/setup_dashboard.py --model-version $(modelVersion)
			`
		})
	)
);

monitoringJob.addStep(
	If(
		new Eq(variables.get("environment"), "production"),
		new BashStep({
			displayName: "Initialize Production Monitoring",
			bash: `
				echo "Initializing production model monitoring..."
				
				# Start model performance tracking
				python monitoring/start_tracking.py --environment production --model-version $(modelVersion)
				
				# Schedule periodic model validation
				python monitoring/schedule_validation.py --interval daily
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
