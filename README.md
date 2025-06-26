# Azure Pipelines CDK

A TypeScript library for building Azure DevOps YAML pipelines programmatically, with type safety, modularity, and code reuse.

## Features

- **Type-safe pipeline construction**
- **All Azure DevOps step types** (script, bash, pwsh, task, checkout, download, publish, template, reviewApp, etc.)
- **Resources support** (repositories, containers, pipelines, builds, packages, webhooks)
- **Jobs, deployments, strategies, environments**
- **Reusable templates and parameterization**
- **Block literal YAML output for scripts**
- **File-based script step support**
- **Extensive examples and API docs**

## Installation

```
npm install azure-pipelines-cdk
```

## Quick Start Example

```typescript
import { Pipeline, Script, BashStep, TaskStep } from "azure-pipelines-cdk";

const pipeline = new Pipeline({ name: "My Build Pipeline" });
pipeline.add(new Script("echo 'Starting build'"));
pipeline.add(BashStep.fromFile("./scripts/install.sh"));
pipeline.add(TaskStep.create("DotNetCoreCLI@2", { command: "build" }));

console.log(pipeline.synthesize());
```

## Example: Full Pipeline with Resources

```typescript
import { Pipeline, Resources, RepositoryResource, ContainerResource, PipelineResource, Script } from "azure-pipelines-cdk";

const resources = new Resources();
resources.addRepository(RepositoryResource.github("templates", "myorg/templates", "github-conn"));
resources.addContainer(ContainerResource.dockerHub("node", "node:18"));
resources.addPipeline(PipelineResource.create("build", "MyBuild"));

const pipeline = new Pipeline({ name: "CI Pipeline" });
pipeline.addResources(resources);
pipeline.add(new Script("echo 'Hello from pipeline with resources!'", { displayName: "Greet" }));

console.log(pipeline.synthesize());
```

## Supported Step Types

- `script`, `bash`, `pwsh`, `powershell`
- `task`, `checkout`, `download`, `downloadBuild`, `getPackage`, `publish`, `template`, `reviewApp`

## Supported Resource Types

- `repositories` (git, github, bitbucket, etc.)
- `containers` (Docker Hub, ACR, custom)
- `pipelines` (other Azure pipelines)
- `builds` (build definitions)
- `packages` (npm, nuget, pypi, maven, upack)
- `webhooks` (external triggers)

## Advanced Usage

- **Deployment jobs and strategies** (runOnce, rolling, canary)
- **Environments and approvals**
- **Reusable templates with parameters**
- **Matrix and parallel jobs**
- **File-based script steps**

## Documentation

- [Getting Started](./docs/getting-started.md)
- [API Reference](./docs/api-reference.md)
- [Examples](./examples/)
- [Troubleshooting](./docs/troubleshooting.md)
- [Migration Guide](./docs/migration.md)

## Contributing

Contributions are welcome! Please open issues or pull requests.

## License

MIT
