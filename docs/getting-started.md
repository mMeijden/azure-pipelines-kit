# Getting Started with Azure Pipelines CDK

## Installation

```
npm install azure-pipelines-cdk
```

## Basic Example

```typescript
import { Pipeline, Script } from "azure-pipelines-cdk";

const pipeline = new Pipeline({ name: "Hello Pipeline" });
pipeline.add(new Script("echo 'Hello, world!'", { displayName: "Say Hello" }));

console.log(pipeline.synthesize());
```

## Using Steps from Files

```typescript
import { BashStep } from "azure-pipelines-cdk";

const bashStep = BashStep.fromFile("./scripts/build.sh", "Build Project");
```

## Adding Resources

```typescript
import { Resources, RepositoryResource } from "azure-pipelines-cdk";

const resources = new Resources();
resources.addRepository(RepositoryResource.github("templates", "myorg/templates"));
```

## Next Steps

- Explore the [API Reference](./api-reference.md)
- See more [Examples](../examples/)
- Learn about [Advanced Usage](./advanced.md)
