# Azure Pipelines CDK CLI

A command-line tool for generating Azure DevOps YAML from TypeScript pipeline definitions.

## Installation

If you have the package installed:

```bash
npm install -g azure-pipeline-cdk
```

Or run directly with npx:

```bash
npx azure-pipeline-cdk
```

## Usage

```bash
azure-pipelines-cdk <input-file> [options]
```

### Options

- `-o, --output <file>` - Output YAML file path (default: `azure-pipelines.yml`)
- `-t, --temp-dir <dir>` - Temporary directory for compilation (default: `.tmp`)
- `--no-cleanup` - Keep temporary files after generation
- `--verbose` - Show verbose output

### Examples

```bash
# Generate YAML from TypeScript pipeline
azure-pipelines-cdk src/pipeline.ts

# Specify output file
azure-pipelines-cdk src/pipeline.ts -o build-pipeline.yml

# Verbose output
azure-pipelines-cdk src/pipeline.ts --verbose

# Keep temporary files for debugging
azure-pipelines-cdk src/pipeline.ts --no-cleanup --verbose
```

## Input File Requirements

Your input TypeScript file should:

1. Import the necessary classes from `azure-pipeline-cdk`
2. Create a pipeline and call `pipeline.synthesize()`
3. Log the result with `console.log()`

### Example Input File

```typescript
import { Pipeline, Script, BashStep } from "azure-pipeline-cdk";

const pipeline = new Pipeline({ name: "My Build Pipeline" });
pipeline.add(new Script("echo 'Starting build'"));
pipeline.add(BashStep.fromFile("./scripts/build.sh"));

console.log(pipeline.synthesize());
```

## Aliases

The CLI is also available as `azcdk` for shorter commands:

```bash
azcdk src/pipeline.ts -o azure-pipelines.yml
```

## Troubleshooting

### TypeScript Compilation Errors

- Ensure your input file is valid TypeScript
- Make sure all imports are correctly resolved
- Check that all dependencies are installed

### No Output Generated

- Verify your pipeline calls `pipeline.synthesize()`
- Ensure the result is logged with `console.log()`
- Use `--verbose` flag to see detailed execution output

### Module Resolution Issues

- Make sure the CLI is run from your project root where node_modules exists
- Verify that `azure-pipeline-cdk` is installed as a dependency
