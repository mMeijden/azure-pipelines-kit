# Migration Guide: YAML to Azure Pipelines CDK

## Why migrate?

- Type safety and IDE support
- Code reuse and modularity
- Easier maintenance and refactoring

## Example: Simple Script Step

**YAML:**

```yaml
steps:
  - script: echo Hello
    displayName: Say Hello
```

**CDK:**

```typescript
pipeline.add(new Script("echo Hello", { displayName: "Say Hello" }));
```

## Example: Resources

**YAML:**

```yaml
resources:
  repositories:
    - repository: templates
      type: github
      name: myorg/templates
```

**CDK:**

```typescript
resources.addRepository(RepositoryResource.github("templates", "myorg/templates"));
```

## Tips

- Use `.fromFile()` for large scripts
- Use factory methods for common resource types
- Use `StepsBuilder` for complex step arrays
