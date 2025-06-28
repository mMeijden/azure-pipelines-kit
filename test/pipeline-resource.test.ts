import { PipelineResource } from "../src/resources/pipeline-resource";

describe("PipelineResource", () => {
	describe("constructor", () => {
		it("should create a basic pipeline resource", () => {
			const pipelineResource = new PipelineResource({
				name: "upstream-pipeline",
				pipeline: "MyProject.BuildPipeline"
			});

			expect(pipelineResource).toBeInstanceOf(PipelineResource);
			expect(pipelineResource.name).toBe("upstream-pipeline");
			expect(pipelineResource.pipeline).toBe("MyProject.BuildPipeline");
		});

		it("should create a pipeline resource with all properties", () => {
			const pipelineResource = new PipelineResource({
				name: "complex-pipeline",
				pipeline: "shared-pipeline",
				project: "SharedProject",
				source: "azurePipelines",
				version: "1.2.3",
				branch: "release/v1.2",
				tags: ["production", "stable"],
				trigger: {
					enabled: true,
					branches: ["main", "release/*"],
					paths: ["src/**", "docs/**"],
					tags: ["v*.*.*"],
					stages: ["Build", "Test"]
				}
			});

			expect(pipelineResource.name).toBe("complex-pipeline");
			expect(pipelineResource.pipeline).toBe("shared-pipeline");
			expect(pipelineResource.project).toBe("SharedProject");
			expect(pipelineResource.source).toBe("azurePipelines");
			expect(pipelineResource.version).toBe("1.2.3");
			expect(pipelineResource.branch).toBe("release/v1.2");
			expect(pipelineResource.tags).toEqual(["production", "stable"]);
			expect(pipelineResource.trigger).toEqual({
				enabled: true,
				branches: ["main", "release/*"],
				paths: ["src/**", "docs/**"],
				tags: ["v*.*.*"],
				stages: ["Build", "Test"]
			});
		});
	});

	describe("static factory methods", () => {
		it("should create simple pipeline resource", () => {
			const pipelineResource = PipelineResource.create("simple-pipeline", "MyPipeline");

			expect(pipelineResource.name).toBe("simple-pipeline");
			expect(pipelineResource.pipeline).toBe("MyPipeline");
			expect(pipelineResource.project).toBeUndefined();
		});

		it("should create pipeline resource with project", () => {
			const pipelineResource = PipelineResource.create("cross-project", "BuildPipeline", "OtherProject");

			expect(pipelineResource.name).toBe("cross-project");
			expect(pipelineResource.pipeline).toBe("BuildPipeline");
			expect(pipelineResource.project).toBe("OtherProject");
		});

		it("should create pipeline resource with trigger", () => {
			const pipelineResource = PipelineResource.withTrigger("triggered-pipeline", "UpstreamPipeline", ["main", "develop"]);

			expect(pipelineResource.name).toBe("triggered-pipeline");
			expect(pipelineResource.pipeline).toBe("UpstreamPipeline");
			expect(pipelineResource.trigger).toEqual({
				enabled: true,
				branches: ["main", "develop"]
			});
		});

		it("should create pipeline resource with trigger and project", () => {
			const pipelineResource = PipelineResource.withTrigger("cross-project-trigger", "SharedPipeline", ["release/*"], "SharedProject");

			expect(pipelineResource.name).toBe("cross-project-trigger");
			expect(pipelineResource.pipeline).toBe("SharedPipeline");
			expect(pipelineResource.project).toBe("SharedProject");
			expect(pipelineResource.trigger).toEqual({
				enabled: true,
				branches: ["release/*"]
			});
		});
	});

	describe("synthesize", () => {
		it("should synthesize basic pipeline resource", () => {
			const pipelineResource = new PipelineResource({
				name: "basic-pipeline",
				pipeline: "SimplePipeline"
			});

			const result = pipelineResource.synthesize();

			expect(result).toEqual({
				pipeline: "basic-pipeline",
				source: "SimplePipeline"
			});
		});

		it("should synthesize pipeline resource with project", () => {
			const pipelineResource = new PipelineResource({
				name: "project-pipeline",
				pipeline: "BuildPipeline",
				project: "MyProject"
			});

			const result = pipelineResource.synthesize();

			expect(result).toEqual({
				pipeline: "project-pipeline",
				source: "BuildPipeline",
				project: "MyProject"
			});
		});

		it("should synthesize pipeline resource with version and branch", () => {
			const pipelineResource = new PipelineResource({
				name: "versioned-pipeline",
				pipeline: "ReleasePipeline",
				version: "2.1.0",
				branch: "release/v2.1"
			});

			const result = pipelineResource.synthesize();

			expect(result).toEqual({
				pipeline: "versioned-pipeline",
				source: "ReleasePipeline",
				version: "2.1.0",
				branch: "release/v2.1"
			});
		});

		it("should synthesize pipeline resource with tags", () => {
			const pipelineResource = new PipelineResource({
				name: "tagged-pipeline",
				pipeline: "ProductionPipeline",
				tags: ["production", "release", "stable"]
			});

			const result = pipelineResource.synthesize();

			expect(result).toEqual({
				pipeline: "tagged-pipeline",
				source: "ProductionPipeline",
				tags: ["production", "release", "stable"]
			});
		});

		it("should synthesize pipeline resource with trigger configuration", () => {
			const pipelineResource = new PipelineResource({
				name: "triggered-pipeline",
				pipeline: "UpstreamPipeline",
				trigger: {
					enabled: true,
					branches: ["main", "develop"],
					paths: ["src/**", "tests/**"],
					tags: ["v*"],
					stages: ["Build"]
				}
			});

			const result = pipelineResource.synthesize();

			expect(result).toEqual({
				pipeline: "triggered-pipeline",
				source: "UpstreamPipeline",
				trigger: {
					enabled: true,
					branches: ["main", "develop"],
					paths: ["src/**", "tests/**"],
					tags: ["v*"],
					stages: ["Build"]
				}
			});
		});

		it("should synthesize pipeline resource with all properties", () => {
			const pipelineResource = new PipelineResource({
				name: "complete-pipeline",
				pipeline: "CompletePipeline",
				project: "CompleteProject",
				source: "azurePipelines",
				version: "3.0.0",
				branch: "main",
				tags: ["latest"],
				trigger: {
					enabled: false,
					branches: ["feature/*"]
				}
			});

			const result = pipelineResource.synthesize();

			expect(result).toEqual({
				pipeline: "complete-pipeline",
				source: "azurePipelines",
				project: "CompleteProject",
				version: "3.0.0",
				branch: "main",
				tags: ["latest"],
				trigger: {
					enabled: false,
					branches: ["feature/*"]
				}
			});
		});

		it("should omit undefined properties in synthesis", () => {
			const pipelineResource = new PipelineResource({
				name: "minimal-pipeline",
				pipeline: "MinimalPipeline",
				project: undefined,
				version: undefined,
				branch: undefined,
				tags: undefined,
				trigger: undefined
			});

			const result = pipelineResource.synthesize();

			expect(result).toEqual({
				pipeline: "minimal-pipeline",
				source: "MinimalPipeline"
			});
			expect(result).not.toHaveProperty("project");
			expect(result).not.toHaveProperty("version");
			expect(result).not.toHaveProperty("branch");
			expect(result).not.toHaveProperty("tags");
			expect(result).not.toHaveProperty("trigger");
		});
	});

	describe("edge cases", () => {
		it("should handle empty tags array", () => {
			const pipelineResource = new PipelineResource({
				name: "empty-tags",
				pipeline: "TestPipeline",
				tags: []
			});

			const result = pipelineResource.synthesize();
			// Empty tags array should not be included in the result
			expect(result).not.toHaveProperty("tags");
		});

		it("should handle complex trigger configuration", () => {
			const pipelineResource = new PipelineResource({
				name: "complex-trigger",
				pipeline: "AdvancedPipeline",
				trigger: {
					enabled: true,
					branches: ["main", "release/*", "hotfix/*"],
					paths: ["src/**/*.ts", "package.json", "!tests/**"],
					tags: ["v*.*.*", "release-*"],
					stages: ["Build", "Test", "Deploy"]
				}
			});

			const result = pipelineResource.synthesize();
			expect(result.trigger).toEqual({
				enabled: true,
				branches: ["main", "release/*", "hotfix/*"],
				paths: ["src/**/*.ts", "package.json", "!tests/**"],
				tags: ["v*.*.*", "release-*"],
				stages: ["Build", "Test", "Deploy"]
			});
		});

		it("should handle special characters in pipeline names", () => {
			const pipelineResource = new PipelineResource({
				name: "special-pipeline",
				pipeline: "My.Project-Build_Pipeline.v2",
				project: "My-Project.Name_With.Special-Characters"
			});

			const result = pipelineResource.synthesize();
			expect(result.source).toBe("My.Project-Build_Pipeline.v2");
			expect(result.project).toBe("My-Project.Name_With.Special-Characters");
		});

		it("should handle disabled trigger", () => {
			const pipelineResource = new PipelineResource({
				name: "disabled-trigger",
				pipeline: "ManualPipeline",
				trigger: {
					enabled: false
				}
			});

			const result = pipelineResource.synthesize();
			expect(result.trigger).toEqual({
				enabled: false
			});
		});
	});
});
