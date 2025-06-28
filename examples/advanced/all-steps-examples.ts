import {
	Script,
	BashStep,
	PowerShellStep,
	PwshStep,
	TaskStep,
	CheckoutStep,
	DownloadStep,
	DownloadBuildStep,
	GetPackageStep,
	PublishStep,
	TemplateStep,
	ReviewAppStep,
	StepsBuilder
} from "../../src/steps";

/**
 * Example showcasing all available Azure DevOps step types
 */

// === Script-based Steps ===

// Script step (runs on default shell)
const scriptStep = new Script("echo 'Hello from default shell'");
const scriptWithOptions = new Script({
	script: `echo "Building application..."
npm install
npm run build`,
	displayName: "Build Application",
	workingDirectory: "$(System.DefaultWorkingDirectory)/app",
	timeoutInMinutes: 10
});

// Bash step (explicitly runs in bash)
const bashStep = new BashStep("echo 'Hello from bash'");
const bashFromFile = BashStep.fromFile("./scripts/build.sh", "Run Build Script");

// PowerShell step (Windows PowerShell)
const powershellStep = new PowerShellStep("Write-Host 'Hello from PowerShell'");
const powershellWithOptions = PowerShellStep.create(
	`
Write-Host "Starting deployment..."
$result = Invoke-RestMethod -Uri $env:API_ENDPOINT
Write-Host "Deployment completed: $result"
`,
	"Deploy via API"
);

// PowerShell Core step (cross-platform)
const pwshStep = new PwshStep("Write-Host 'Hello from PowerShell Core'");
const pwshFromFile = PwshStep.fromFile("./scripts/deploy.ps1", "Deploy Application");

// === Task Steps ===

// Azure Web App deployment
const webAppTask = TaskStep.create(
	"AzureWebApp@1",
	{
		azureSubscription: "$(serviceConnection)",
		appName: "$(webAppName)",
		package: "$(System.DefaultWorkingDirectory)/drop/*.zip"
	},
	"Deploy to Azure Web App"
);

// Publish test results
const publishTestResults = new TaskStep({
	task: "PublishTestResults@2",
	inputs: {
		testResultsFormat: "JUnit",
		testResultsFiles: "**/*.xml",
		searchFolder: "$(Agent.TempDirectory)"
	},
	displayName: "Publish Test Results"
});

// === Source Control Steps ===

// Checkout current repository
const checkoutSelf = CheckoutStep.self();

// Checkout with specific options
const checkoutWithOptions = new CheckoutStep({
	checkout: "self",
	clean: true,
	fetchDepth: 1,
	lfs: true,
	displayName: "Checkout Source Code"
});

// === Artifact Management Steps ===

// Download from current pipeline
const downloadCurrent = new DownloadStep({
	download: "current",
	artifact: "drop",
	path: "$(System.ArtifactsDirectory)"
});

// Download from specific pipeline
const downloadPipeline = new DownloadStep({
	download: "MyPipelineResource",
	artifact: "drop"
});

// Download build artifacts
const downloadBuild = new DownloadBuildStep({
	buildDefinition: "MyBuildPipeline",
	artifactName: "drop",
	buildVersionToDownload: "latest",
	displayName: "Download Latest Build"
});

// Download from branch
const downloadFromBranch = DownloadBuildStep.fromBranch("MyBuildPipeline", "refs/heads/release", "Download Release Build");

// === Package Management Steps ===

// Download NPM package
const npmPackage = GetPackageStep.npm("MyFeed", "@myorg/shared-components", "1.2.3", "Download Shared Components");

// Download NuGet package
const nugetPackage = GetPackageStep.nuget("MyFeed", "MyCompany.SharedLibrary", "2.1.0", "Download Shared Library");

// Download with extraction
const extractedPackage = GetPackageStep.withExtract(
	"npm",
	"MyFeed",
	"@myorg/build-tools",
	"latest",
	"$(System.DefaultWorkingDirectory)/tools",
	"Download and Extract Build Tools"
);

// === Publishing Steps ===

// Publish test results
const publishResults = new PublishStep({
	publish: "$(Agent.TempDirectory)/TestResults",
	artifact: "TestResults",
	displayName: "Publish Test Results"
});

// Publish build output
const publishBuild = PublishStep.artifact("BuildOutput", "$(System.DefaultWorkingDirectory)/dist", "Publish Build Artifacts");

// === Template Steps ===

// Use template with parameters
const templateStep = new TemplateStep({
	template: "templates/build-steps.yml",
	parameters: {
		buildConfiguration: "Release",
		platform: "x64",
		skipTests: false
	}
});

// Simple template usage
const simpleTemplate = TemplateStep.create("templates/common-steps.yml");

// === Review App Steps ===

// Kubernetes review app
const k8sReviewApp = ReviewAppStep.kubernetes("review-$(Build.BuildId)", "Create Kubernetes Review Environment");

// Container instance review app
const containerReviewApp = ReviewAppStep.containerInstance("review-app-$(Build.BuildId)", "Create Container Review Environment");

// === Using StepsBuilder ===

const buildSteps = new StepsBuilder()
	.add(checkoutSelf)
	.add(Script.create("echo 'Starting build process...'", "Start Build"))
	.add(bashFromFile)
	.add(publishTestResults)
	.build();

const deploySteps = new StepsBuilder()
	.add(downloadCurrent)
	.add(webAppTask)
	.add(Script.create("echo 'Deployment completed!'", "Complete"))
	.build();

// Export for use in pipeline definitions
export {
	// Script steps
	scriptStep,
	scriptWithOptions,
	bashStep,
	bashFromFile,
	powershellStep,
	powershellWithOptions,
	pwshStep,
	pwshFromFile,

	// Task steps
	webAppTask,
	publishTestResults,

	// Source control
	checkoutSelf,
	checkoutWithOptions,

	// Artifacts
	downloadCurrent,
	downloadPipeline,
	downloadBuild,
	downloadFromBranch,

	// Packages
	npmPackage,
	nugetPackage,
	extractedPackage,

	// Publishing
	publishResults,
	publishBuild,

	// Templates
	templateStep,
	simpleTemplate,

	// Review apps
	k8sReviewApp,
	containerReviewApp,

	// Step collections
	buildSteps,
	deploySteps
};
