import {
	Resources,
	RepositoryResource,
	PipelineResource,
	ContainerResource,
	BuildResource,
	PackageResource,
	WebhookResource
} from "../../src/resources";
import * as YAML from "yaml";

/**
 * Example showcasing all available Azure DevOps resource types
 */

// === Repository Resources ===

// GitHub repository
const githubRepo = RepositoryResource.github("myapp-frontend", "myorg/frontend-app", "github-connection");

// Bitbucket repository with trigger
const bitbucketRepo = new RepositoryResource({
	name: "shared-library",
	type: "bitbucket",
	repository: "myorg/shared-lib",
	endpoint: "bitbucket-connection",
	ref: "refs/heads/main",
	trigger: {
		enabled: true,
		branches: ["main", "develop"],
		paths: ["src/**", "tests/**"]
	}
});

// Git repository
const gitRepo = RepositoryResource.git("templates", "https://github.com/myorg/pipeline-templates.git");

// === Pipeline Resources ===

// Simple pipeline reference
const buildPipeline = PipelineResource.create("build-pipeline", "MyApp-Build", "MyProject");

// Pipeline with trigger
const deployPipeline = PipelineResource.withTrigger("deploy-pipeline", "MyApp-Deploy", ["main", "release/*"], "MyProject");

// Complex pipeline resource
const ciPipeline = new PipelineResource({
	name: "ci-pipeline",
	pipeline: "MyApp-CI",
	project: "MyProject",
	source: "azurePipelines",
	branch: "main",
	trigger: {
		enabled: true,
		branches: ["main"],
		stages: ["Build", "Test"]
	}
});

// === Container Resources ===

// Simple Docker Hub container
const nodeContainer = ContainerResource.dockerHub("node", "node:18-alpine");

// Azure Container Registry
const appContainer = ContainerResource.acr("myapp", "myapp:latest", "myacr-connection");

// Container with environment and ports
const webContainer = new ContainerResource({
	name: "web-server",
	image: "nginx:alpine",
	ports: ["80:8080", "443:8443"],
	env: {
		NGINX_HOST: "localhost",
		NGINX_PORT: "80"
	},
	volumes: ["/var/www:/usr/share/nginx/html:ro"]
});

// Container with advanced options
const testContainer = ContainerResource.withEnv("test-runner", "mcr.microsoft.com/playwright:latest", {
	NODE_ENV: "test",
	DISPLAY: ":99"
});

// === Build Resources ===

// Simple build reference
const libBuild = BuildResource.create("shared-lib-build", "SharedLibrary-Build", "SharedProject");

// Build with trigger
const apiBuild = BuildResource.withTrigger("api-build", "MyAPI-Build", ["main", "develop"], "MyProject");

// Complex build resource
const mobileBuild = new BuildResource({
	name: "mobile-build",
	definition: "MobileApp-Build",
	project: "MobileProject",
	branch: "release",
	tags: ["mobile", "ios", "android"],
	trigger: {
		enabled: true,
		branches: ["main", "release/*"],
		tags: ["v*"]
	}
});

// === Package Resources ===

// NPM package
const npmPackage = PackageResource.npm("shared-components", "@myorg/ui-components", "^2.1.0", "npm-feed");

// NuGet package
const nugetPackage = PackageResource.nuget("core-library", "MyOrg.Core.Library", "1.5.0", "nuget-feed");

// PyPI package
const pypiPackage = PackageResource.pypi("ml-models", "myorg-ml-models", ">=1.0.0", "pypi-feed");

// Package with trigger
const triggerPackage = PackageResource.withTrigger("trigger-pkg", "npm", "@myorg/shared-lib", ["latest", "stable"]);

// === Webhook Resources ===

// Simple webhook
const githubWebhook = WebhookResource.create("github-webhook", "github-webhook-connection");

// Webhook with filters
const customWebhook = WebhookResource.withFilters("custom-webhook", "custom-webhook-connection", [
	{ path: "action", value: "opened" },
	{ path: "pull_request.base.ref", value: "main" }
]);

// === Resources Collection ===

const resources = new Resources();

// Add all repository resources
resources.addRepository(githubRepo);
resources.addRepository(bitbucketRepo);
resources.addRepository(gitRepo);

// Add all pipeline resources
resources.addPipeline(buildPipeline);
resources.addPipeline(deployPipeline);
resources.addPipeline(ciPipeline);

// Add all container resources
resources.addContainer(nodeContainer);
resources.addContainer(appContainer);
resources.addContainer(webContainer);
resources.addContainer(testContainer);

// Add all build resources
resources.addBuild(libBuild);
resources.addBuild(apiBuild);
resources.addBuild(mobileBuild);

// Add all package resources
resources.addPackage(npmPackage);
resources.addPackage(nugetPackage);
resources.addPackage(pypiPackage);
resources.addPackage(triggerPackage);

// Add all webhook resources
resources.addWebhook(githubWebhook);
resources.addWebhook(customWebhook);

// Generate YAML output

// Export for use in pipeline definitions
export {
	// Repository resources
	githubRepo,
	bitbucketRepo,
	gitRepo,

	// Pipeline resources
	buildPipeline,
	deployPipeline,
	ciPipeline,

	// Container resources
	nodeContainer,
	appContainer,
	webContainer,
	testContainer,

	// Build resources
	libBuild,
	apiBuild,
	mobileBuild,

	// Package resources
	npmPackage,
	nugetPackage,
	pypiPackage,
	triggerPackage,

	// Webhook resources
	githubWebhook,
	customWebhook,

	// Complete resources collection
	resources
};
