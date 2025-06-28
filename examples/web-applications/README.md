# Web Applications Examples

This folder contains examples for web application CI/CD pipelines.

## Examples

### nodejs-basic.ts

A comprehensive Node.js application pipeline demonstrating:

- **Build Process**: Node.js setup, dependency installation, and building
- **Testing**: Conditional test execution using `WhenVar()`
- **Artifact Management**: Publishing build artifacts
- **Deployment**: Staging deployment with conditional logic
- **Cleanup**: Always-run cleanup steps

**Template Expressions Used:**

- `WhenVar("runTests", "true", testStep)` - Conditional testing
- `If(condition, deployStep)` - Conditional deployment
- `OnSuccess("BuildApp", downloadStep)` - Success-based execution
- `Always(cleanupStep)` - Guaranteed cleanup

**YAML Output:** `nodejs-basic.yml` - Ready to use in Azure DevOps

This example is perfect for:

- Node.js/JavaScript/TypeScript applications
- React, Vue, Angular applications
- Express.js APIs
- Static site generators (Gatsby, Next.js, etc.)

## Getting Started

1. **Copy the example:**

   ```bash
   cp examples/web-applications/nodejs-basic.ts my-app-pipeline.ts
   ```

2. **Customize variables:**

   ```typescript
   variables: {
     nodeVersion: "18.x",        // Your Node.js version
     buildConfiguration: "production",
     runTests: "true",           // Enable/disable tests
     deployToStaging: "true"     // Enable/disable deployment
   }
   ```

3. **Update build commands:**

   ```typescript
   new BashStep({
   	displayName: "Build Application",
   	bash: `
       npm run build        # Your build command
       npm run lint         # Your linting command
     `
   });
   ```

4. **Generate YAML:**

   ```bash
   npx ts-node cli/index.ts my-app-pipeline.ts --output azure-pipelines.yml
   ```

5. **Deploy to Azure DevOps:** Copy the generated YAML to your repository

## Customization Tips

- **Multiple environments**: Add more stages for testing, staging, production
- **Docker builds**: Add Docker build and push steps
- **Security scanning**: Include npm audit, security scanning tools
- **Performance testing**: Add Lighthouse, load testing steps
- **Deployment targets**: Customize for Azure App Service, AWS, etc.
