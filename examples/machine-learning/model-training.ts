#!/usr/bin/env node

import { Pipeline } from "../../src/pipeline/pipeline";
import { Stage } from "../../src/pipeline/stage";
import { Job } from "../../src/jobs/job";
import { BashStep, PublishStep } from "../../src/steps";
import { If, Unless, WhenVar, OnSuccess, OnFailure } from "../../src";
import { Eq, Ne, variables, succeeded } from "../../src/expressions/conditions";

/**
 * Machine Learning model training and deployment pipeline
 *
 * This example demonstrates:
 * - Data preparation and validation
 * - Model training with MLflow integration
 * - Model evaluation and comparison
 * - A/B testing deployment
 * - Performance monitoring setup
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

// Data Preparation Stage
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

// Model Training Stage
const trainingStage = new Stage("ModelTraining");

const trainingJob = new Job({
	job: "TrainModel",
	displayName: "Train Machine Learning Model",
	pool: "ubuntu-latest",
	dependsOn: ["PrepareData"]
});

trainingJob.addStep(
	WhenVar(
		"runTraining",
		"true",
		new BashStep({
			displayName: "Train Model",
			bash: `
				echo "Starting model training..."
				python training/train_model.py \\
					--data-path data/splits/train/ \\
					--model-version $(modelVersion) \\
					--mlflow-uri $(mlflowTrackingUri) \\
					--experiment-name "pipeline-$(Build.BuildId)"
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

// Model Evaluation Stage
const evaluationStage = new Stage("ModelEvaluation");

const evaluationJob = new Job({
	job: "EvaluateModel",
	displayName: "Comprehensive Model Evaluation",
	pool: "ubuntu-latest",
	dependsOn: ["TrainModel"]
});

evaluationJob.addStep(
	new BashStep({
		displayName: "Run Model Evaluation Suite",
		bash: `
		echo "Running comprehensive model evaluation..."
		python evaluation/performance_metrics.py --model models/$(modelVersion)/
		python evaluation/bias_testing.py --model models/$(modelVersion)/
		python evaluation/interpretability.py --model models/$(modelVersion)/
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

// Model Deployment Stage
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
				docker build -t myregistry.azurecr.io/ml-model:$(modelVersion) .
				docker push myregistry.azurecr.io/ml-model:$(modelVersion)
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
				sleep 30
				python tests/test_inference.py --endpoint http://staging-ml-api.mycompany.com/predict
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
				kubectl apply -f k8s/production/ab-deployment.yaml
				kubectl patch service ml-model-service -p '{"spec":{"selector":{"version":"$(modelVersion)"}}}' -n production
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
			`
		})
	)
);

deploymentStage.addJob(deploymentJob);
pipeline.addStage(deploymentStage);

// Synthesize pipeline when run as main module
if (require.main === module) {
	const yaml = pipeline.synthesize();
	// Write to YAML file instead of console output
	require("fs").writeFileSync(__dirname + "/model-training.yml", yaml);
}

export default pipeline;
