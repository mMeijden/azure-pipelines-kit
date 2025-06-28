# Chainable Conditions

Azure Pipelines Kit now supports chainable condition classes that provide a fluent, type-safe API for building complex template expressions. This approach replaces string-based conditions with strongly-typed, composable classes.

## Overview

Instead of writing string-based conditions like:

```typescript
"and(eq(variables.runTests, 'true'), eq(variables.targetPlatform, 'linux'))";
```

You can now use chainable condition classes:

```typescript
new Eq(variables.get("runTests"), "true").and(new Eq(variables.get("targetPlatform"), "linux"));
```

## Benefits

✅ **Type Safety**: TypeScript catches errors at compile time  
✅ **IntelliSense**: Auto-completion for condition methods and properties  
✅ **Readability**: Fluent API reads like natural language  
✅ **Composability**: Easy to build complex conditions step by step  
✅ **Reusability**: Conditions can be stored in variables and reused  
✅ **Testability**: Each condition can be unit tested independently  
✅ **Refactoring**: IDE can safely refactor condition usage across the codebase

## Basic Conditions

### Equality and Comparison

```typescript
import { Eq, Ne, Gt, Ge, Lt, Le, variables } from "azure-pipelines-kit";

// Equality
const isRelease = new Eq(variables.get("buildConfiguration"), "Release");

// Not equal
const notProduction = new Ne(variables.get("environment"), "production");

// Numeric comparisons
const highBuildNumber = new Gt(variables.get("buildNumber"), 100);
const maxRetries = new Le(variables.get("retryCount"), 5);
```

### String Operations

```typescript
import { Contains, ContainsValue, StartsWith, EndsWith } from "azure-pipelines-kit";

// Check if branch contains text
const isFeatureBranch = new Contains(variables.get("branchName"), "feature/");

// Check if tags contain a value
const hasReleaseTag = new ContainsValue(variables.get("tags"), "release");

// Check prefix/suffix
const isReleaseBranch = new StartsWith(variables.get("branchName"), "release/");
const isDllFile = new EndsWith(variables.get("fileName"), ".dll");
```

## Logical Operations

### AND Conditions

```typescript
import { And } from "azure-pipelines-kit";

// Multiple conditions with AND
const condition = new And(
	new Eq(variables.get("runTests"), "true"),
	new Eq(variables.get("targetPlatform"), "linux"),
	new Ne(variables.get("environment"), "production")
);

// Or use method chaining (preferred)
const chainedCondition = new Eq(variables.get("runTests"), "true")
	.and(new Eq(variables.get("targetPlatform"), "linux"))
	.and(new Ne(variables.get("environment"), "production"));
```

### OR Conditions

```typescript
import { Or } from "azure-pipelines-kit";

// Multiple conditions with OR
const condition = new Or(new Eq(variables.get("deployToStaging"), "true"), new Eq(variables.get("deployToProduction"), "true"));

// Or use method chaining
const chainedCondition = new Eq(variables.get("buildConfiguration"), "Release").or(new Eq(variables.get("buildConfiguration"), "Debug"));
```

### NOT Conditions

```typescript
import { Not } from "azure-pipelines-kit";

// Negate a condition
const condition = new Not(new Eq(variables.get("skipBuild"), "true"));

// Or use method chaining (preferred)
const chainedCondition = new Eq(variables.get("skipBuild"), "true").not();
```

## Custom Expressions

For complex Azure DevOps expressions like `succeeded()`, `failed()`, etc.:

```typescript
import { Custom, succeeded, failed, always } from "azure-pipelines-kit";

// Built-in convenience functions
const successCondition = succeeded(); // succeeded()
const successWithStage = succeeded("BuildStage"); // succeeded('BuildStage')
const failureCondition = failed(); // failed()
const alwaysCondition = always(); // always()

// Custom expressions
const customCondition = new Custom("contains(variables['Build.SourceBranch'], 'refs/heads/main')");
```

## Variable and Parameter Helpers

```typescript
import { variables, parameters } from "azure-pipelines-kit";

// Simple variable names
const buildConfig = variables.get("buildConfiguration"); // variables.buildConfiguration

// Complex variable names with special characters
const teamProject = variables.getBracket("System.TeamProject"); // variables['System.TeamProject']

// Parameters
const envParam = parameters.get("environment"); // parameters.environment
const deployParam = parameters.getBracket("deploy.staging"); // parameters['deploy.staging']
```

## Complex Examples

### Multi-Platform Build Condition

```typescript
const multiPlatformCondition = new Eq(variables.get("runTests"), "true")
	.and(
		new Eq(variables.get("targetPlatform"), "windows")
			.or(new Eq(variables.get("targetPlatform"), "linux"))
			.or(new Eq(variables.get("targetPlatform"), "macos"))
	)
	.and(new Ne(variables.get("environment"), "production"));
```

### Deployment Readiness Check

```typescript
const deploymentReady = new Eq(variables.get("buildConfiguration"), "Release")
	.and(succeeded("UnitTests"))
	.and(succeeded("IntegrationTests"))
	.and(new Eq(variables.get("deployToStaging"), "true").or(new Eq(variables.get("deployToProduction"), "true")))
	.and(new Eq(variables.getBracket("Build.Reason"), "Manual").or(new Eq(variables.getBracket("Build.Reason"), "IndividualCI")));
```

### Failure Handling

```typescript
const cleanupCondition = failed().or(new Custom("canceled()")).or(new Custom("succeededOrFailed()"));
```

## Usage with Template Expressions

### Using TemplateExpression.from()

```typescript
import { TemplateExpression, Eq, variables } from "azure-pipelines-kit";
import { BashStep } from "azure-pipelines-kit";

const condition = new Eq(variables.get("runTests"), "true");
const step = new BashStep({ bash: "echo 'Running tests'" });

const templateExpression = TemplateExpression.from(condition, step);
```

### Using with Job.addStep()

```typescript
import { Job, TemplateExpression, Eq, succeeded, variables } from "azure-pipelines-kit";

const job = new Job({
	job: "deploy",
	displayName: "Deploy Application"
});

// Simple condition
job.addStep(
	TemplateExpression.from(new Eq(variables.get("deployToStaging"), "true"), new BashStep({ bash: "echo 'Deploying to staging'" }))
);

// Complex chained condition
job.addStep(
	TemplateExpression.from(
		new Eq(variables.get("targetPlatform"), "windows").and(succeeded("BuildStage")).and(new Ne(variables.get("environment"), "production")),
		new PowerShellStep({ powershell: "Write-Host 'Windows deployment'" })
	)
);
```

### Multiple Steps with Conditions

```typescript
const job = new Job({ job: "test", displayName: "Test Job" });

// Test condition that can be reused
const shouldRunTests = new Eq(variables.get("runTests"), "true").and(new Ne(variables.get("skipCI"), "true"));

// Unit tests
job.addStep(
	TemplateExpression.from(shouldRunTests.and(new Eq(variables.get("testType"), "unit")), new BashStep({ bash: "npm run test:unit" }))
);

// Integration tests
job.addStep(
	TemplateExpression.from(
		shouldRunTests.and(new Eq(variables.get("testType"), "integration")),
		new BashStep({ bash: "npm run test:integration" })
	)
);
```

## Migration from String-Based Conditions

### Before (String-Based)

```typescript
// Old way with string-based conditions
TemplateExpression.and(
	[
		{ type: "eq", left: "variables.runTests", right: "true" },
		{ type: "eq", left: "variables.targetPlatform", right: "linux" },
		{ type: "ne", left: "variables.environment", right: "production" }
	],
	step
);
```

### After (Chainable Classes)

```typescript
// New way with chainable condition classes
TemplateExpression.from(
	new Eq(variables.get("runTests"), "true")
		.and(new Eq(variables.get("targetPlatform"), "linux"))
		.and(new Ne(variables.get("environment"), "production")),
	step
);
```

## Best Practices

### 1. Use Method Chaining for Readability

```typescript
// Preferred: Method chaining
const condition = new Eq(variables.get("runTests"), "true")
	.and(new Eq(variables.get("environment"), "staging"))
	.and(succeeded("BuildStage"));

// Avoid: Nested constructors
const condition = new And(
	new Eq(variables.get("runTests"), "true"),
	new And(new Eq(variables.get("environment"), "staging"), succeeded("BuildStage"))
);
```

### 2. Extract Complex Conditions to Variables

```typescript
// Extract reusable conditions
const isTestEnvironment = new Eq(variables.get("environment"), "test").or(new Eq(variables.get("environment"), "staging"));

const buildSucceeded = succeeded("BuildStage").and(succeeded("UnitTests"));

// Combine them
const deployCondition = isTestEnvironment.and(buildSucceeded).and(new Eq(variables.get("autoDeploy"), "true"));
```

### 3. Use Descriptive Variable Names

```typescript
// Good: Descriptive names
const shouldDeployToProduction = new Eq(variables.get("environment"), "production")
	.and(new Eq(variables.get("deploymentApproved"), "true"))
	.and(succeeded("SecurityScan"));

// Avoid: Generic names
const condition1 = new Eq(variables.get("environment"), "production");
```

### 4. Combine with Helper Functions

```typescript
const variables = {
	get: (name: string) => `variables.${name}`,
	getBracket: (name: string) => `variables['${name}']`
};

// Create helper functions for common patterns
const isPullRequest = () => new Eq(variables.getBracket("Build.Reason"), "PullRequest");
const isMainBranch = () => new Eq(variables.getBracket("Build.SourceBranch"), "refs/heads/main");
const isReleaseCandidate = () => new StartsWith(variables.getBracket("Build.SourceBranch"), "refs/heads/release/");

// Use in conditions
const shouldRunFullSuite = isPullRequest().or(isMainBranch()).or(isReleaseCandidate());
```

## API Reference

### Condition Classes

| Class           | Description           | Example                            |
| --------------- | --------------------- | ---------------------------------- |
| `Eq`            | Equality check        | `new Eq(left, right)`              |
| `Ne`            | Not equal check       | `new Ne(left, right)`              |
| `Gt`            | Greater than          | `new Gt(left, number)`             |
| `Ge`            | Greater than or equal | `new Ge(left, number)`             |
| `Lt`            | Less than             | `new Lt(left, number)`             |
| `Le`            | Less than or equal    | `new Le(left, number)`             |
| `And`           | Logical AND           | `new And(...conditions)`           |
| `Or`            | Logical OR            | `new Or(...conditions)`            |
| `Not`           | Logical NOT           | `new Not(condition)`               |
| `Contains`      | String contains       | `new Contains(haystack, needle)`   |
| `ContainsValue` | Object contains value | `new ContainsValue(object, value)` |
| `StartsWith`    | String starts with    | `new StartsWith(string, prefix)`   |
| `EndsWith`      | String ends with      | `new EndsWith(string, suffix)`     |
| `Custom`        | Custom expression     | `new Custom(expression)`           |

### Helper Functions

| Function                  | Description         | Example                                      |
| ------------------------- | ------------------- | -------------------------------------------- |
| `succeeded()`             | Job succeeded       | `succeeded()` or `succeeded('JobName')`      |
| `failed()`                | Job failed          | `failed()` or `failed('JobName')`            |
| `always()`                | Always run          | `always()`                                   |
| `variables.get()`         | Variable reference  | `variables.get('name')`                      |
| `variables.getBracket()`  | Bracketed variable  | `variables.getBracket('System.TeamProject')` |
| `parameters.get()`        | Parameter reference | `parameters.get('name')`                     |
| `parameters.getBracket()` | Bracketed parameter | `parameters.getBracket('deploy.staging')`    |

### Chainable Methods

All condition classes support these chainable methods:

| Method            | Description                 | Example                         |
| ----------------- | --------------------------- | ------------------------------- |
| `.and(condition)` | Add AND condition           | `condition.and(otherCondition)` |
| `.or(condition)`  | Add OR condition            | `condition.or(otherCondition)`  |
| `.not()`          | Negate condition            | `condition.not()`               |
| `.toCondition()`  | Convert to condition object | `condition.toCondition()`       |

This new chainable condition system provides a powerful, type-safe way to build complex template expressions while maintaining readability and composability.
