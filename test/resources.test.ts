import { Resources } from "../src/resources/resources";
import { RepositoryResource } from "../src/resources/repository";
import { ContainerResource } from "../src/resources/container-resource";
import { PipelineResource } from "../src/resources/pipeline-resource";
import { BuildResource } from "../src/resources/build-resource";
import { PackageResource } from "../src/resources/package-resource";
import { WebhookResource } from "../src/resources/webhook-resource";

describe("Resources", () => {
	let resources: Resources;

	beforeEach(() => {
		resources = new Resources();
	});

	describe("constructor", () => {
		it("should create an empty Resources instance", () => {
			expect(resources).toBeInstanceOf(Resources);
		});

		it("should synthesize to undefined when no resources are added", () => {
			const result = resources.synthesize();
			expect(result).toBeUndefined();
		});
	});

	describe("addRepository", () => {
		it("should add a repository resource", () => {
			const repo = new RepositoryResource({
				name: "test-repo",
				type: "git",
				repository: "myorg/myrepo"
			});

			resources.addRepository(repo);
			const result = resources.synthesize();

			expect(result).toHaveProperty("repositories");
			expect(result.repositories).toHaveLength(1);
			expect(result.repositories[0]).toHaveProperty("repository", "test-repo");
		});

		it("should add multiple repository resources", () => {
			const repo1 = new RepositoryResource({
				name: "repo1",
				type: "git",
				repository: "org/repo1"
			});
			const repo2 = new RepositoryResource({
				name: "repo2",
				type: "github",
				repository: "org/repo2"
			});

			resources.addRepository(repo1);
			resources.addRepository(repo2);
			const result = resources.synthesize();

			expect(result.repositories).toHaveLength(2);
			expect(result.repositories[0].repository).toBe("repo1");
			expect(result.repositories[1].repository).toBe("repo2");
		});
	});

	describe("addContainer", () => {
		it("should add a container resource", () => {
			const container = new ContainerResource({
				name: "test-container",
				image: "ubuntu:20.04"
			});

			resources.addContainer(container);
			const result = resources.synthesize();

			expect(result).toHaveProperty("containers");
			expect(result.containers).toHaveLength(1);
			expect(result.containers[0]).toHaveProperty("container", "test-container");
			expect(result.containers[0]).toHaveProperty("image", "ubuntu:20.04");
		});

		it("should add multiple container resources", () => {
			const container1 = new ContainerResource({
				name: "ubuntu",
				image: "ubuntu:20.04"
			});
			const container2 = new ContainerResource({
				name: "node",
				image: "node:18"
			});

			resources.addContainer(container1);
			resources.addContainer(container2);
			const result = resources.synthesize();

			expect(result.containers).toHaveLength(2);
			expect(result.containers[0].container).toBe("ubuntu");
			expect(result.containers[1].container).toBe("node");
		});
	});

	describe("addPipeline", () => {
		it("should add a pipeline resource", () => {
			const pipeline = new PipelineResource({
				name: "test-pipeline",
				source: "MyProject",
				pipeline: "shared-build"
			});

			resources.addPipeline(pipeline);
			const result = resources.synthesize();

			expect(result).toHaveProperty("pipelines");
			expect(result.pipelines).toHaveLength(1);
			expect(result.pipelines[0]).toHaveProperty("pipeline", "test-pipeline");
		});
	});

	describe("addBuild", () => {
		it("should add a build resource", () => {
			const build = new BuildResource({
				name: "test-build",
				source: "MyProject",
				definition: "build-definition"
			});

			resources.addBuild(build);
			const result = resources.synthesize();

			expect(result).toHaveProperty("builds");
			expect(result.builds).toHaveLength(1);
			expect(result.builds[0]).toHaveProperty("build", "test-build");
		});
	});

	describe("addPackage", () => {
		it("should add a package resource", () => {
			const pkg = new PackageResource({
				name: "test-package",
				type: "npm",
				connection: "npm-feed"
			});

			resources.addPackage(pkg);
			const result = resources.synthesize();

			expect(result).toHaveProperty("packages");
			expect(result.packages).toHaveLength(1);
			expect(result.packages[0]).toHaveProperty("package", "test-package");
		});
	});

	describe("addWebhook", () => {
		it("should add a webhook resource", () => {
			const webhook = new WebhookResource({
				name: "test-webhook",
				connection: "webhook-connection"
			});

			resources.addWebhook(webhook);
			const result = resources.synthesize();

			expect(result).toHaveProperty("webhooks");
			expect(result.webhooks).toHaveLength(1);
			expect(result.webhooks[0]).toHaveProperty("webhook", "test-webhook");
		});
	});

	describe("mixed resources", () => {
		it("should handle multiple types of resources", () => {
			const repo = new RepositoryResource({
				name: "repo",
				type: "git",
				repository: "org/repo"
			});
			const container = new ContainerResource({
				name: "container",
				image: "ubuntu:20.04"
			});
			const pipeline = new PipelineResource({
				name: "pipeline",
				source: "MyProject",
				pipeline: "shared"
			});

			resources.addRepository(repo);
			resources.addContainer(container);
			resources.addPipeline(pipeline);

			const result = resources.synthesize();

			expect(result).toHaveProperty("repositories");
			expect(result).toHaveProperty("containers");
			expect(result).toHaveProperty("pipelines");
			expect(result.repositories).toHaveLength(1);
			expect(result.containers).toHaveLength(1);
			expect(result.pipelines).toHaveLength(1);
		});

		it("should maintain order of resources within each type", () => {
			const repo1 = new RepositoryResource({
				name: "repo1",
				type: "git",
				repository: "org/repo1"
			});
			const repo2 = new RepositoryResource({
				name: "repo2",
				type: "git",
				repository: "org/repo2"
			});

			resources.addRepository(repo1);
			resources.addRepository(repo2);

			const result = resources.synthesize();
			expect(result.repositories[0].repository).toBe("repo1");
			expect(result.repositories[1].repository).toBe("repo2");
		});
	});
});
