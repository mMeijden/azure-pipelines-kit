# Example Pipelines

This directory contains comprehensive example pipelines demonstrating the Azure Pipelines CDK's capabilities. Each example showcases different scenarios and uses the new direct template expression functions like `If()`, `Unless()`, `WhenVar()`, etc.

## 📁 Example Categories

### 🌐 Web Applications (`web-applications/`)

- **nodejs-basic** - Simple Node.js CI/CD pipeline with testing and deployment

### 🖥️ Cross-Platform (`cross-platform/`)

- **dotnet-multiplatform** - .NET builds across Windows, Linux, and macOS

### 🐳 Microservices (`microservices/`)

- **kubernetes-deployment** - Complex microservices deployment with Kubernetes

### 🤖 Machine Learning (`machine-learning/`)

- **model-training** - Complete ML workflow from data to production

### 🏗️ Infrastructure (`infrastructure/`)

- **terraform-deployment** - Infrastructure as Code with Terraform

### 🚀 Advanced (`advanced/`)

- **template-expressions-demo** - Comprehensive template expression showcase (conceptual)
- **direct-expressions-example** - Ergonomic template expression functions
- **chainable-conditions-example** - Chainable condition syntax patterns
- **all-resources-examples** - Complete resource type demonstrations
- **all-steps-examples** - Examples of all available step types
- And more advanced feature demonstrations

> **Note:** Advanced examples may include conceptual APIs still under development and are primarily for learning about the library's capabilities.

## 📋 Example Details

### 1. **Node.js Basic Application** (`web-applications/nodejs-basic.ts`)

**Scenario:** Basic CI/CD for a Node.js application  
**Features:**

- Basic build and test workflow
- Conditional testing with `WhenVar()`
- Artifact publishing
- Environment-based deployment

**Key Template Expressions:**

```typescript
WhenVar("runTests", "true", testStep);
If(new Eq(variables.get("deployToStaging"), "true"), deployStep);
OnSuccess("BuildApp", healthCheckStep);
Always(cleanupStep);
```

### 2. **Multi-Platform .NET Application** (`cross-platform/dotnet-multiplatform.ts`)

**Scenario:** Cross-platform builds for Windows, Linux, and macOS  
**Features:**

- Platform-specific build jobs
- Conditional logic based on platform
- Cross-platform integration tests
- Complex nested conditions

**Key Template Expressions:**

```typescript
ForPlatforms("windows", windowsStep)
ForPlatforms(["linux", "darwin"], unixStep)
Unless(new Or(...), conditionalStep)
If(succeeded("BuildWindows").and(succeeded("BuildLinux")), integrationStep)
```

### 3. **Microservices Kubernetes Deployment** (`microservices/kubernetes-deployment.ts`)

**Scenario:** Complex microservices deployment with multiple services  
**Features:**

- Multi-service builds (User, Order, Payment services)
- Environment-specific deployments
- Blue-green production deployment
- Advanced failure handling and rollback

**Key Template Expressions:**

```typescript
WhenVar("deployUserService", "true", userServiceStep);
ForEnvironments("staging", stagingStep);
WhenDeploying("production", productionStep);
OnFailure("DeployToProduction", rollbackStep);
```

### 4. **Machine Learning Model Training** (`machine-learning/model-training.ts`)

**Scenario:** Complete ML workflow from data to production  
**Features:**

- Data preparation and validation
- Model training with MLflow integration
- Model evaluation and comparison
- A/B testing deployment
- Performance monitoring setup

**Key Template Expressions:**

```typescript
WhenVar("runTraining", "true", trainingStep);
Unless(new Eq(variables.get("Build.Reason"), "PullRequest"), evaluationStep);
If(new Eq(variables.get("environment"), "production"), abTestingStep);
OnSuccess("TrainModel", validationStep);
```

### 5. **Infrastructure as Code** (`infrastructure/terraform-deployment.ts`)

**Scenario:** Terraform-based infrastructure deployment  
**Features:**

- Terraform validation and security scanning
- Multi-environment infrastructure deployment
- Manual approval gates for production
- Infrastructure monitoring setup

**Key Template Expressions:**

```typescript
WhenVar("runSecurityScan", "true", securityScanStep);
ForEnvironments("staging", stagingDeployStep);
If(condition.and(succeeded("DeployToStaging")), productionStep);
OnSuccess("DeployToProduction", monitoringStep);
```

## 🚀 How to Use

### 1. **View the Examples**

Each example consists of two files:

- **`.ts` file** - TypeScript pipeline definition
- **`.yml` file** - Generated Azure DevOps YAML

### 2. **Run an Example**

```bash
# Execute a TypeScript pipeline to see the output
npx ts-node examples/web-applications/nodejs-basic.ts
```

### 3. **Generate YAML**

```bash
# Generate YAML from any example
npx ts-node cli/index.ts examples/web-applications/nodejs-basic.ts --output my-pipeline.yml

# With verbose output
npx ts-node cli/index.ts examples/microservices/kubernetes-deployment.ts --output my-pipeline.yml --verbose
```

### 4. **Copy and Customize**

1. Copy an example that matches your scenario
2. Customize variables and steps for your needs
3. Add your specific build/test/deploy commands
4. Generate YAML using the CLI
5. Commit the YAML to your Azure DevOps repository

## ✨ Direct Template Expression Functions

These examples demonstrate the new ergonomic template expression API:

### Basic Conditionals

- `If(condition, content)` - Execute when condition is true
- `Unless(condition, content)` - Execute when condition is false

### Convenience Functions

- `WhenVar(name, value, content)` - When variable equals value
- `WhenNotVar(name, value, content)` - When variable does not equal value
- `WhenParam(name, value, content)` - When parameter equals value

### Environment & Platform

- `ForEnvironments(env, content)` - For specific environments
- `ForPlatforms(platform, content)` - For specific platforms

### Workflow Status

- `OnSuccess(job, content)` - After job succeeds
- `OnFailure(job, content)` - After job fails
- `Always(content)` - Always execute

### Domain-Specific

- `WhenTesting(content)` - When tests should run
- `WhenDeploying(target, content)` - When deploying

## 🔗 Chainable Conditions

For complex logic, use chainable condition classes:

```typescript
import { Eq, Ne, And, Or, variables, succeeded } from "../../src/expressions/conditions";

// Complex chained condition
const complexCondition = new Eq(variables.get("environment"), "production")
	.and(succeeded("BuildStage"))
	.and(new Ne(variables.get("skipDeployment"), "true"))
	.or(new Eq(variables.get("forceDeployment"), "true"));

If(complexCondition, deploymentStep);
```

## 📚 Learning Path

1. **Start with:** `web-applications/nodejs-basic.ts` - Simple concepts
2. **Progress to:** `cross-platform/dotnet-multiplatform.ts` - Platform logic
3. **Advance to:** `microservices/kubernetes-deployment.ts` - Complex workflows
4. **Explore:** `machine-learning/model-training.ts` - Domain-specific patterns
5. **Master:** `infrastructure/terraform-deployment.ts` - Advanced conditionals

## 🎯 Benefits of TypeScript + Template Expressions

- ✅ **Type Safety**: Catch errors at compile time
- ✅ **IntelliSense**: Auto-completion for all APIs
- ✅ **Reusability**: Share pipeline components across projects
- ✅ **Composability**: Build complex workflows from simple parts
- ✅ **Maintainability**: Refactor safely with IDE support
- ✅ **Readability**: Natural language-like conditional syntax
- ✅ **Testing**: Unit test your pipeline logic

## 🔗 Next Steps

- Explore the [Template Expressions Documentation](../docs/template-expressions.md)
- Check out the [Chainable Conditions Guide](../docs/chainable-conditions.md)
- Review the [API Reference](../docs/api.md)
- Run the examples and modify them for your use cases

Each example is self-contained and production-ready. Copy, customize, and deploy!
