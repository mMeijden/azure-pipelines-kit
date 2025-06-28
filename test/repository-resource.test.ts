import { RepositoryResource } from "../src/resources/repository";

describe("RepositoryResource", () => {
	describe("constructor", () => {
		it("should create a basic repository resource", () => {
			const repo = new RepositoryResource({
				name: "test-repo",
				type: "git"
			});

			expect(repo).toBeInstanceOf(RepositoryResource);
			expect(repo.name).toBe("test-repo");
			expect(repo.type).toBe("git");
		});

		it("should create a repository resource with all properties", () => {
			const repo = new RepositoryResource({
				name: "full-repo",
				type: "github",
				endpoint: "github-connection",
				repository: "myorg/myrepo",
				ref: "refs/heads/main",
				trigger: {
					enabled: true,
					branches: ["main", "develop"],
					paths: ["src/*"],
					tags: ["v*"]
				}
			});

			expect(repo.name).toBe("full-repo");
			expect(repo.type).toBe("github");
			expect(repo.endpoint).toBe("github-connection");
			expect(repo.repository).toBe("myorg/myrepo");
			expect(repo.ref).toBe("refs/heads/main");
			expect(repo.trigger).toEqual({
				enabled: true,
				branches: ["main", "develop"],
				paths: ["src/*"],
				tags: ["v*"]
			});
		});
	});

	describe("static factory methods", () => {
		it("should create Git repository", () => {
			const repo = RepositoryResource.git("my-repo", "https://github.com/org/repo.git");

			expect(repo.name).toBe("my-repo");
			expect(repo.type).toBe("git");
			expect(repo.repository).toBe("https://github.com/org/repo.git");
		});

		it("should create GitHub repository", () => {
			const repo = RepositoryResource.github("github-repo", "myorg/myrepo", "github-connection");

			expect(repo.name).toBe("github-repo");
			expect(repo.type).toBe("github");
			expect(repo.repository).toBe("myorg/myrepo");
			expect(repo.endpoint).toBe("github-connection");
		});

		it("should create Bitbucket repository", () => {
			const repo = RepositoryResource.bitbucket("bb-repo", "myorg/myrepo", "bitbucket-connection");

			expect(repo.name).toBe("bb-repo");
			expect(repo.type).toBe("bitbucket");
			expect(repo.repository).toBe("myorg/myrepo");
			expect(repo.endpoint).toBe("bitbucket-connection");
		});

		it("should create Azure Repos repository", () => {
			const repo = new RepositoryResource({
				name: "azure-repo",
				type: "tfsgit",
				repository: "MyProject/myrepo"
			});

			expect(repo.name).toBe("azure-repo");
			expect(repo.type).toBe("tfsgit");
			expect(repo.repository).toBe("MyProject/myrepo");
		});
	});

	describe("synthesize", () => {
		it("should synthesize basic repository resource", () => {
			const repo = new RepositoryResource({
				name: "test-repo",
				type: "git",
				repository: "https://github.com/org/repo.git"
			});

			const result = repo.synthesize();

			expect(result).toEqual({
				repository: "test-repo",
				type: "git",
				name: "https://github.com/org/repo.git"
			});
		});

		it("should synthesize repository resource with all properties", () => {
			const repo = new RepositoryResource({
				name: "full-repo",
				type: "github",
				endpoint: "github-connection",
				repository: "myorg/myrepo",
				ref: "refs/heads/develop",
				trigger: {
					enabled: true,
					branches: ["main", "develop"],
					paths: ["src/*", "tests/*"],
					tags: ["v*", "release-*"]
				}
			});

			const result = repo.synthesize();

			expect(result).toEqual({
				repository: "full-repo",
				type: "github",
				endpoint: "github-connection",
				name: "myorg/myrepo",
				ref: "refs/heads/develop",
				trigger: {
					enabled: true,
					branches: ["main", "develop"],
					paths: ["src/*", "tests/*"],
					tags: ["v*", "release-*"]
				}
			});
		});

		it("should synthesize repository resource with minimal properties", () => {
			const repo = new RepositoryResource({
				name: "minimal-repo",
				type: "git"
			});

			const result = repo.synthesize();

			expect(result).toEqual({
				repository: "minimal-repo",
				type: "git"
			});
		});

		it("should omit undefined properties in synthesis", () => {
			const repo = new RepositoryResource({
				name: "test-repo",
				type: "git",
				repository: "https://github.com/org/repo.git",
				endpoint: undefined,
				ref: undefined,
				trigger: undefined
			});

			const result = repo.synthesize();

			expect(result).toEqual({
				repository: "test-repo",
				type: "git",
				name: "https://github.com/org/repo.git"
			});
			expect(result).not.toHaveProperty("endpoint");
			expect(result).not.toHaveProperty("ref");
			expect(result).not.toHaveProperty("trigger");
		});
	});

	describe("validation", () => {
		it("should accept valid repository types", () => {
			const types: Array<"git" | "github" | "githubenterprise" | "bitbucket" | "tfsgit"> = [
				"git",
				"github",
				"githubenterprise",
				"bitbucket",
				"tfsgit"
			];

			types.forEach((type) => {
				expect(
					() =>
						new RepositoryResource({
							name: `test-${type}`,
							type
						})
				).not.toThrow();
			});
		});

		it("should handle trigger configuration properly", () => {
			const repo = new RepositoryResource({
				name: "trigger-repo",
				type: "git",
				trigger: {
					enabled: false
				}
			});

			const result = repo.synthesize();
			expect(result.trigger).toEqual({ enabled: false });
		});

		it("should handle empty trigger arrays", () => {
			const repo = new RepositoryResource({
				name: "empty-trigger-repo",
				type: "git",
				trigger: {
					enabled: true,
					branches: [],
					paths: [],
					tags: []
				}
			});

			const result = repo.synthesize();
			expect(result.trigger.branches).toEqual([]);
			expect(result.trigger.paths).toEqual([]);
			expect(result.trigger.tags).toEqual([]);
		});
	});
});
