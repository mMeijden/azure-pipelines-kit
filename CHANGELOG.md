# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.0] - 2025-06-26

### Added

- **Core Pipeline Components**

  - `Pipeline` class with trigger, variable, and resource configuration
  - `Stage` class for organizing jobs
  - `Job` class with support for steps, dependencies, and conditions
  - Multi-stage pipeline support

- **All Azure DevOps Step Types**

  - `Script` - Generic script step with multiline support
  - `BashStep` - Bash scripts for Linux/macOS
  - `PowerShellStep` - PowerShell scripts for Windows
  - `PwshStep` - Cross-platform PowerShell Core
  - `TaskStep` - Azure DevOps marketplace tasks
  - `CheckoutStep` - Repository checkout with options
  - `PublishStep` - Artifact and pipeline publishing
  - `DownloadStep` - Download artifacts and files
  - `DownloadBuildStep` - Download build artifacts
  - `GetPackageStep` - Download packages
  - `TemplateStep` - Template references
  - `ReviewAppStep` - Review app deployments

- **Deployment Support**

  - `Deployment` class for deployment jobs
  - `RunOnceStrategy` - Simple deployment strategy
  - `RollingStrategy` - Rolling deployment with parallel control
  - `CanaryStrategy` - Canary deployment with incremental rollout
  - Environment targeting and approval workflows

- **Resource Management**

  - `Resources` centralized resource manager
  - `RepositoryResource` - External repository references
  - `ContainerResource` - Container image resources
  - `PipelineResource` - Pipeline dependencies
  - `BuildResource` - Build artifact resources
  - `PackageResource` - Package feed resources
  - `WebhookResource` - Webhook integrations

- **Advanced Features**

  - File-based script loading with `Script.fromFile()`
  - Template literal indentation normalization
  - Block literal YAML formatting (`|-`) for multiline scripts
  - Type-safe configuration with TypeScript interfaces
  - Expression and variable support

- **CLI Tool**

  - `azpk` command-line interface
  - TypeScript pipeline file execution
  - Custom output file paths
  - Verbose logging mode
  - Watch mode for development
  - npm package integration

- **Documentation & Examples**

  - Comprehensive API reference
  - Getting started guide
  - Troubleshooting documentation
  - Migration guide
  - Multiple working examples:
    - Basic CI pipeline
    - Cross-platform builds
    - Docker containerization
    - Microservice deployment
    - All step types demonstration
    - Resource usage examples

- **Development Tools**
  - TypeScript configuration with strict mode
  - Build scripts and development workflow
  - Comprehensive error handling
  - IntelliSense support

### Technical Highlights

- **Type Safety**: Full TypeScript support with interfaces and generics
- **Clean YAML Output**: Proper formatting with block literals for scripts
- **Modular Architecture**: Extensible design for future Azure DevOps features
- **Developer Experience**: Rich IDE support with autocompletion and validation
- **Standards Compliance**: Follows Azure DevOps YAML schema conventions

### Package Information

- **Name**: `azure-pipelines-kit`
- **Binary Commands**: `azure-pipelines-kit`, `azpk`
- **Node.js Compatibility**: ES2018+ with CommonJS modules
- **Dependencies**: `commander`, `yaml`
- **License**: MIT
