# Template Expressions

Template expressions allow you to conditionally include or exclude parts of your Azure DevOps pipeline based on runtime values like parameters, variables, and system properties.

## 🎯 **Overview**

Template expressions in Azure DevOps use the `${{ if condition }}:` syntax to conditionally render pipeline elements. Our CDK provides a type-safe, intuitive API for creating these conditions.

## 📋 **Basic Usage**

### **Import the Template Expression System**

```typescript
import { If, TemplateExpression } from "azure-pipelines-kit";
import { Job, TaskStep } from "azure-pipelines-kit";
```

### **Simple Conditional Steps**

```typescript
const job = new Job({
	job: "ConditionalBuild",
	displayName: "Build with Conditions",
	steps: [
		// Always run
		new TaskStep({
			task: "PowerShell@2",
			displayName: "Setup",
			inputs: { script: 'Write-Host "Setting up"' }
		}),

		// Conditional: Only run for MSBuild
		If.eq("parameters.toolset", "msbuild", [
			new TaskStep({
				task: "VSBuild@1",
				displayName: "Build with MSBuild",
				inputs: { solution: "**/*.sln" }
			}),
			new TaskStep({
				task: "VSTest@2",
				displayName: "Run MSBuild Tests",
				inputs: { testSelector: "testAssemblies" }
			})
		]),

		// Conditional: Only run for .NET CLI
		If.eq(
			"parameters.toolset",
			"dotnet",
			new TaskStep({
				task: "DotNetCoreCLI@2",
				displayName: "Build with .NET CLI",
				inputs: { command: "build" }
			})
		)
	]
});
```

## 🧮 **Condition Types**

### **Equality and Comparison**

```typescript
// Equality
If.eq("parameters.environment", "production", steps);
If.ne("variables.Build.Reason", "PullRequest", steps);

// Numeric comparison
If.gt("variables.buildNumber", 100, steps);
If.ge("variables.retryCount", 1, steps);
If.lt("variables.maxAttempts", 5, steps);
If.le("variables.timeout", 3600, steps);

// Boolean values
If.eq("parameters.deployToProduction", true, steps);
If.eq("parameters.skipTests", false, steps);
```

### **String Operations**

```typescript
// Contains
If.contains("variables.Build.SourceBranch", "feature/", steps);

// Starts/Ends with
If.startsWith("variables.Build.SourceBranch", "refs/heads/release/", steps);
If.endsWith("variables.artifactName", ".zip", steps);

// Contains value (for arrays/objects)
If.containsValue("variables.tags", "production", steps);
```

### **Logical Operations**

```typescript
// AND condition
If.and(
	[
		{ type: "eq", left: "variables.Build.SourceBranch", right: "refs/heads/main" },
		{ type: "ne", left: "variables.Build.Reason", right: "PullRequest" },
		{ type: "eq", left: "parameters.runTests", right: true }
	],
	steps
);

// OR condition
If.or(
	[
		{ type: "eq", left: "variables.Build.SourceBranch", right: "refs/heads/main" },
		{ type: "startsWith", string: "variables.Build.SourceBranch", prefix: "refs/heads/release/" }
	],
	steps
);

// NOT condition
If.not({ type: "eq", left: "variables.Build.Reason", right: "PullRequest" }, steps);
```

### **Custom Expressions**

```typescript
// For complex expressions that aren't covered by the built-in types
If.custom("and(succeeded(), eq(variables.Build.SourceBranch, variables.targetBranch))", steps);
```

## 🏗️ **Real-World Examples**

### **Multi-Platform Build**

```typescript
const multiPlatformJob = new Job({
	job: "Build",
	displayName: "Multi-Platform Build",
	steps: [
		// Common setup
		new TaskStep({
			task: "UseDotNet@2",
			displayName: "Setup .NET",
			inputs: { version: "8.x" }
		}),

		// Windows-specific
		If.eq("variables.Agent.OS", "Windows_NT", [
			new TaskStep({
				task: "PowerShell@2",
				displayName: "Windows Build",
				inputs: { script: "dotnet build --configuration Release --runtime win-x64" }
			}),
			new TaskStep({
				task: "PowerShell@2",
				displayName: "Windows Test",
				inputs: { script: "dotnet test --logger trx --results-directory TestResults" }
			})
		]),

		// Linux-specific
		If.eq("variables.Agent.OS", "Linux", [
			new TaskStep({
				task: "Bash@3",
				displayName: "Linux Build",
				inputs: { script: "dotnet build --configuration Release --runtime linux-x64" }
			}),
			new TaskStep({
				task: "Bash@3",
				displayName: "Linux Test",
				inputs: { script: "dotnet test --logger trx --results-directory TestResults" }
			})
		]),

		// macOS-specific
		If.eq(
			"variables.Agent.OS",
			"Darwin",
			new TaskStep({
				task: "Bash@3",
				displayName: "macOS Build",
				inputs: { script: "dotnet build --configuration Release --runtime osx-x64" }
			})
		)
	]
});
```

### **Environment-Based Deployment**

```typescript
const deploymentJob = new Job({
	job: "Deploy",
	displayName: "Deploy Application",
	steps: [
		// Development deployment (always allowed)
		If.eq(
			"parameters.environment",
			"development",
			new TaskStep({
				task: "AzureWebApp@1",
				displayName: "Deploy to Development",
				inputs: {
					azureSubscription: "dev-subscription",
					appName: "myapp-dev"
				}
			})
		),

		// Staging deployment (requires approval)
		If.and(
			[
				{ type: "eq", left: "parameters.environment", right: "staging" },
				{ type: "eq", left: "parameters.approvalReceived", right: true }
			],
			new TaskStep({
				task: "AzureWebApp@1",
				displayName: "Deploy to Staging",
				inputs: {
					azureSubscription: "staging-subscription",
					appName: "myapp-staging"
				}
			})
		),

		// Production deployment (main branch only, no PR, approval required)
		If.and(
			[
				{ type: "eq", left: "parameters.environment", right: "production" },
				{ type: "eq", left: "variables.Build.SourceBranch", right: "refs/heads/main" },
				{ type: "ne", left: "variables.Build.Reason", right: "PullRequest" },
				{ type: "eq", left: "parameters.productionApproved", right: true }
			],
			[
				new TaskStep({
					task: "AzureWebApp@1",
					displayName: "Deploy to Production",
					inputs: {
						azureSubscription: "prod-subscription",
						appName: "myapp-prod"
					}
				}),
				new TaskStep({
					task: "PowerShell@2",
					displayName: "Notify Team",
					inputs: { script: 'Write-Host "Production deployment completed!"' }
				})
			]
		)
	]
});
```

### **Feature Branch Processing**

```typescript
const featureBranchJob = new Job({
	job: "FeatureValidation",
	displayName: "Feature Branch Validation",
	steps: [
		// Always run basic validation
		new TaskStep({
			task: "DotNetCoreCLI@2",
			displayName: "Build",
			inputs: { command: "build" }
		}),

		// Feature branch specific tests
		If.contains("variables.Build.SourceBranch", "refs/heads/feature/", [
			new TaskStep({
				task: "DotNetCoreCLI@2",
				displayName: "Run Unit Tests",
				inputs: { command: "test" }
			}),
			new TaskStep({
				task: "PowerShell@2",
				displayName: "Run Code Analysis",
				inputs: { script: "Invoke-CodeAnalysis" }
			})
		]),

		// Release branch specific validation
		If.startsWith("variables.Build.SourceBranch", "refs/heads/release/", [
			new TaskStep({
				task: "DotNetCoreCLI@2",
				displayName: "Run Integration Tests",
				inputs: { command: "test --configuration Release" }
			}),
			new TaskStep({
				task: "PowerShell@2",
				displayName: "Generate Release Notes",
				inputs: { script: "Generate-ReleaseNotes" }
			})
		]),

		// Hotfix branch handling
		If.startsWith(
			"variables.Build.SourceBranch",
			"refs/heads/hotfix/",
			new TaskStep({
				task: "PowerShell@2",
				displayName: "Emergency Validation",
				inputs: { script: "Invoke-EmergencyValidation" }
			})
		)
	]
});
```

## 📤 **Generated YAML Output**

The template expressions generate standard Azure DevOps YAML:

```yaml
# Input TypeScript
If.eq('parameters.toolset', 'msbuild', [
  new TaskStep({ task: 'VSBuild@1', displayName: 'Build' }),
  new TaskStep({ task: 'VSTest@2', displayName: 'Test' })
])

# Generated YAML
steps:
- ${{ if eq(parameters.toolset, 'msbuild') }}:
  - task: VSBuild@1
    displayName: Build
  - task: VSTest@2
    displayName: Test
```

## 🔧 **Advanced Features**

### **Nested Conditions**

```typescript
If.and(
	[
		{
			type: "or",
			conditions: [
				{ type: "eq", left: "variables.branch", right: "main" },
				{ type: "eq", left: "variables.branch", right: "develop" }
			]
		},
		{ type: "ne", left: "variables.Build.Reason", right: "PullRequest" }
	],
	steps
);
```

### **Complex Variable References**

```typescript
// Array/object access
If.eq("variables['Build.SourceBranch']", "main", steps);

// Nested properties
If.eq("variables.deployment.environment", "production", steps);
```

### **Type Safety**

The system is fully type-safe:

```typescript
// ✅ Valid
If.eq("parameters.count", 42, steps); // number
If.eq("parameters.name", "test", steps); // string
If.eq("parameters.enabled", true, steps); // boolean

// ❌ Type error
If.gt("parameters.name", "test", steps); // Can't use gt with string
```

## 🎯 **Best Practices**

1. **Use descriptive variable names** in conditions
2. **Group related conditional steps** together
3. **Prefer built-in condition types** over custom expressions
4. **Test conditions thoroughly** with different parameter values
5. **Document complex conditions** with comments

## 🔗 **Integration**

Template expressions work seamlessly with all Azure Pipelines CDK constructs:

- ✅ **Jobs** - Conditional job execution
- ✅ **Steps** - Conditional step execution
- ✅ **Tasks** - Any task can be conditional
- ✅ **Deployments** - Environment-specific deployments
- ✅ **Resources** - Conditional resource usage

This provides a powerful, type-safe way to create dynamic, flexible Azure DevOps pipelines! 🚀
