import { BuildResource } from "../src/resources/build-resource";

describe("BuildResource", () => {
	describe("constructor", () => {
		it("should create a basic build resource", () => {
			const buildResource = new BuildResource({
				name: "upstream-build",
				definition: "MyProject.BuildDefinition"
			});

			expect(buildResource).toBeInstanceOf(BuildResource);
			expect(buildResource.name).toBe("upstream-build");
			expect(buildResource.definition).toBe("MyProject.BuildDefinition");
		});

		it("should create a build resource with all properties", () => {
			const buildResource = new BuildResource({
				name: "complex-build",
				definition: "shared-build-definition",
				project: "SharedProject",
				source: "azurePipelines",
				version: "1.2.3",
				branch: "release/v1.2",
				tags: ["production", "stable"],
				trigger: {
					enabled: true,
					branches: ["main", "release/*"],
					paths: ["src/**", "docs/**"],
					tags: ["v*.*.*"]
				}
			});

			expect(buildResource.name).toBe("complex-build");
			expect(buildResource.definition).toBe("shared-build-definition");
			expect(buildResource.project).toBe("SharedProject");
			expect(buildResource.source).toBe("azurePipelines");
			expect(buildResource.version).toBe("1.2.3");
			expect(buildResource.branch).toBe("release/v1.2");
			expect(buildResource.tags).toEqual(["production", "stable"]);
			expect(buildResource.trigger).toEqual({
				enabled: true,
				branches: ["main", "release/*"],
				paths: ["src/**", "docs/**"],
				tags: ["v*.*.*"]
			});
		});
	});

	describe("static factory methods", () => {
		it("should create simple build resource", () => {
			const buildResource = BuildResource.create("simple-build", "MyBuildDefinition");

			expect(buildResource.name).toBe("simple-build");
			expect(buildResource.definition).toBe("MyBuildDefinition");
			expect(buildResource.project).toBeUndefined();
		});

		it("should create build resource with project", () => {
			const buildResource = BuildResource.create("cross-project", "BuildDefinition", "OtherProject");

			expect(buildResource.name).toBe("cross-project");
			expect(buildResource.definition).toBe("BuildDefinition");
			expect(buildResource.project).toBe("OtherProject");
		});

		it("should create build resource with trigger", () => {
			const buildResource = BuildResource.withTrigger("triggered-build", "UpstreamBuild", ["main", "develop"]);

			expect(buildResource.name).toBe("triggered-build");
			expect(buildResource.definition).toBe("UpstreamBuild");
			expect(buildResource.trigger).toEqual({
				enabled: true,
				branches: ["main", "develop"]
			});
		});

		it("should create build resource with trigger and project", () => {
			const buildResource = BuildResource.withTrigger("cross-project-trigger", "SharedBuild", ["release/*"], "SharedProject");

			expect(buildResource.name).toBe("cross-project-trigger");
			expect(buildResource.definition).toBe("SharedBuild");
			expect(buildResource.project).toBe("SharedProject");
			expect(buildResource.trigger).toEqual({
				enabled: true,
				branches: ["release/*"]
			});
		});
	});

	describe("synthesize", () => {
		it("should synthesize basic build resource", () => {
			const buildResource = new BuildResource({
				name: "basic-build",
				definition: "SimpleBuildDef"
			});

			const result = buildResource.synthesize();

			expect(result).toEqual({
				build: "basic-build",
				source: "SimpleBuildDef"
			});
		});

		it("should synthesize build resource with project", () => {
			const buildResource = new BuildResource({
				name: "project-build",
				definition: "BuildDefinition",
				project: "MyProject"
			});

			const result = buildResource.synthesize();

			expect(result).toEqual({
				build: "project-build",
				source: "BuildDefinition",
				project: "MyProject"
			});
		});

		it("should synthesize build resource with version and branch", () => {
			const buildResource = new BuildResource({
				name: "versioned-build",
				definition: "ReleaseBuild",
				version: "2.1.0",
				branch: "release/v2.1"
			});

			const result = buildResource.synthesize();

			expect(result).toEqual({
				build: "versioned-build",
				source: "ReleaseBuild",
				version: "2.1.0",
				branch: "release/v2.1"
			});
		});

		it("should synthesize build resource with tags", () => {
			const buildResource = new BuildResource({
				name: "tagged-build",
				definition: "ProductionBuild",
				tags: ["production", "release", "stable"]
			});

			const result = buildResource.synthesize();

			expect(result).toEqual({
				build: "tagged-build",
				source: "ProductionBuild",
				tags: ["production", "release", "stable"]
			});
		});

		it("should synthesize build resource with trigger configuration", () => {
			const buildResource = new BuildResource({
				name: "triggered-build",
				definition: "UpstreamBuild",
				trigger: {
					enabled: true,
					branches: ["main", "develop"],
					paths: ["src/**", "tests/**"],
					tags: ["v*"]
				}
			});

			const result = buildResource.synthesize();

			expect(result).toEqual({
				build: "triggered-build",
				source: "UpstreamBuild",
				trigger: {
					enabled: true,
					branches: ["main", "develop"],
					paths: ["src/**", "tests/**"],
					tags: ["v*"]
				}
			});
		});

		it("should synthesize build resource with custom source type", () => {
			const buildResource = new BuildResource({
				name: "custom-source-build",
				definition: "ExternalBuild",
				source: "github",
				project: "external-project"
			});

			const result = buildResource.synthesize();

			expect(result).toEqual({
				build: "custom-source-build",
				source: "github",
				project: "external-project"
			});
		});

		it("should synthesize build resource with all properties", () => {
			const buildResource = new BuildResource({
				name: "complete-build",
				definition: "CompleteBuild",
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

			const result = buildResource.synthesize();

			expect(result).toEqual({
				build: "complete-build",
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
			const buildResource = new BuildResource({
				name: "minimal-build",
				definition: "MinimalBuild",
				project: undefined,
				version: undefined,
				branch: undefined,
				tags: undefined,
				trigger: undefined
			});

			const result = buildResource.synthesize();

			expect(result).toEqual({
				build: "minimal-build",
				source: "MinimalBuild"
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
			const buildResource = new BuildResource({
				name: "empty-tags",
				definition: "TestBuild",
				tags: []
			});

			const result = buildResource.synthesize();
			// Empty tags array should not be included in the result
			expect(result).not.toHaveProperty("tags");
		});

		it("should handle numeric build definition IDs", () => {
			const buildResource = new BuildResource({
				name: "numeric-build",
				definition: "123"
			});

			const result = buildResource.synthesize();
			expect(result.source).toBe("123");
		});

		it("should handle complex trigger configuration with paths", () => {
			const buildResource = new BuildResource({
				name: "complex-trigger",
				definition: "AdvancedBuild",
				trigger: {
					enabled: true,
					branches: ["main", "release/*", "hotfix/*"],
					paths: ["src/**/*.ts", "package.json", "!tests/**"],
					tags: ["v*.*.*", "release-*"]
				}
			});

			const result = buildResource.synthesize();
			expect(result.trigger).toEqual({
				enabled: true,
				branches: ["main", "release/*", "hotfix/*"],
				paths: ["src/**/*.ts", "package.json", "!tests/**"],
				tags: ["v*.*.*", "release-*"]
			});
		});

		it("should handle special characters in build definition names", () => {
			const buildResource = new BuildResource({
				name: "special-build",
				definition: "My.Project-Build_Definition.v2",
				project: "My-Project.Name_With.Special-Characters"
			});

			const result = buildResource.synthesize();
			expect(result.source).toBe("My.Project-Build_Definition.v2");
			expect(result.project).toBe("My-Project.Name_With.Special-Characters");
		});

		it("should handle disabled trigger", () => {
			const buildResource = new BuildResource({
				name: "disabled-trigger",
				definition: "ManualBuild",
				trigger: {
					enabled: false
				}
			});

			const result = buildResource.synthesize();
			expect(result.trigger).toEqual({
				enabled: false
			});
		});

		it("should handle pre-release version tags", () => {
			const buildResource = new BuildResource({
				name: "prerelease-build",
				definition: "PrereleaseBuild",
				version: "1.0.0-alpha.1+build.123",
				tags: ["alpha", "prerelease"]
			});

			const result = buildResource.synthesize();
			expect(result.version).toBe("1.0.0-alpha.1+build.123");
			expect(result.tags).toEqual(["alpha", "prerelease"]);
		});
	});
});
