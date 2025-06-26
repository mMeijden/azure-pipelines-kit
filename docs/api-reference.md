# API Reference

## Pipeline

- `Pipeline(options?)` - Create a new pipeline
- `add(step|job|stage|resources)` - Add steps, jobs, stages, or resources
- `addResources(resources)` - Attach resources
- `synthesize()` - Generate YAML output

## Steps

- `Script`, `BashStep`, `PowerShellStep`, `PwshStep`
- `TaskStep`, `CheckoutStep`, `DownloadStep`, `DownloadBuildStep`, `GetPackageStep`, `PublishStep`, `TemplateStep`, `ReviewAppStep`
- All steps support both simple and advanced constructors
- All script steps support `.fromFile()`

## Resources

- `Resources` - Main resources manager
- `RepositoryResource`, `ContainerResource`, `PipelineResource`, `BuildResource`, `PackageResource`, `WebhookResource`
- All resource types have static factory methods for common scenarios

## Jobs & Deployments

- `Job`, `Deployment` - Add jobs and deployment jobs
- `RunOnceStrategy`, `RollingStrategy`, `CanaryStrategy` - Deployment strategies

## Environments

- `Environment` - Target environments for deployments

## Templates

- `TemplateStep` - Use reusable step templates

## Utilities

- `StepsBuilder` - Compose step arrays

---

For full details, see the source code and examples.
