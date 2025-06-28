# Cross-Platform Examples

This folder contains examples for cross-platform application builds.

## Examples

### dotnet-multiplatform.ts

A comprehensive .NET application pipeline demonstrating:

- **Multi-Platform Builds**: Windows, Linux, and macOS builds in parallel
- **Platform-Specific Logic**: Using `ForPlatforms()` for platform-specific steps
- **Cross-Platform Testing**: Running tests on each platform
- **Integration Testing**: Combining artifacts from all platforms
- **Complex Conditions**: Advanced conditional logic with chainable conditions

**Template Expressions Used:**

- `ForPlatforms("windows", windowsStep)` - Windows-specific steps
- `ForPlatforms("linux", linuxStep)` - Linux-specific steps
- `ForPlatforms("macos", macosStep)` - macOS-specific steps
- `Unless(complexCondition, step)` - Negative conditional logic
- `If(succeeded().and().and(), step)` - Complex success conditions

**YAML Output:** `dotnet-multiplatform.yml` - Ready to use in Azure DevOps

This example is perfect for:

- .NET Core/.NET 5+ applications
- Cross-platform desktop applications (WPF, MAUI, Avalonia)
- Cross-platform libraries and NuGet packages
- Console applications that need to run on multiple platforms

## Getting Started

1. **Copy the example:**

   ```bash
   cp examples/cross-platform/dotnet-multiplatform.ts my-dotnet-pipeline.ts
   ```

2. **Customize variables:**

   ```typescript
   variables: {
     dotnetVersion: "8.x",           // Your .NET version
     buildConfiguration: "Release",   // Build configuration
     runTests: "true",               // Enable/disable tests
     publishArtifacts: "true"        // Enable/disable artifact publishing
   }
   ```

3. **Update platform targets:**

   ```typescript
   // Add or remove platforms as needed
   ForPlatforms("windows", windowsSpecificStep);
   ForPlatforms(["linux", "darwin"], unixLikeStep);
   ```

4. **Customize build commands:**

   ```typescript
   new BashStep({
   	displayName: "Build Linux Application",
   	bash: `
       dotnet build --configuration $(buildConfiguration) --runtime linux-x64
       dotnet publish --configuration $(buildConfiguration) --runtime linux-x64 --self-contained
     `
   });
   ```

5. **Generate YAML:**
   ```bash
   npx ts-node cli/index.ts my-dotnet-pipeline.ts --output azure-pipelines.yml
   ```

## Platform-Specific Considerations

### Windows-Specific Steps

- Use PowerShell for Windows-specific commands
- Build Windows-specific runtimes (win-x64, win-x86, win-arm64)
- Package as MSI or MSIX if needed

### Linux-Specific Steps

- Use Bash for Linux-specific commands
- Build Linux-specific runtimes (linux-x64, linux-arm64)
- Create .deb or .rpm packages if needed

### macOS-Specific Steps

- Use Bash for macOS-specific commands
- Build macOS-specific runtimes (osx-x64, osx-arm64)
- Code signing and notarization for macOS apps

## Advanced Patterns

### Runtime Matrix Strategy

```typescript
// Build for multiple runtimes per platform
const runtimes = ["win-x64", "linux-x64", "osx-x64"];
runtimes.forEach((runtime) => {
	buildJob.addStep(
		If(
			new Eq(variables.get("targetRuntime"), runtime),
			new BashStep({
				displayName: `Build for ${runtime}`,
				bash: `dotnet publish --runtime ${runtime}`
			})
		)
	);
});
```

### Conditional Platform Testing

```typescript
// Run platform-specific tests only when needed
Unless(
	new Eq(variables.get("Build.Reason"), "PullRequest"),
	ForPlatforms(
		"windows",
		new PowerShellStep({
			displayName: "Windows Integration Tests",
			powershell: "dotnet test --filter Category=WindowsOnly"
		})
	)
);
```

## Customization Tips

- **Add more platforms**: Support for ARM architectures
- **Container builds**: Add Docker multi-arch builds
- **Package management**: Create platform-specific packages
- **Distribution**: Upload to platform-specific stores or repositories
- **Testing strategies**: Platform-specific test suites
