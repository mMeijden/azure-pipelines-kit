import { PackageResource } from "../src/resources/package-resource";

describe("PackageResource", () => {
	describe("constructor", () => {
		it("should create a basic package resource", () => {
			const packageResource = new PackageResource({
				name: "my-package",
				type: "npm"
			});

			expect(packageResource).toBeInstanceOf(PackageResource);
			expect(packageResource.name).toBe("my-package");
			expect(packageResource.type).toBe("npm");
		});

		it("should create a package resource with all properties", () => {
			const packageResource = new PackageResource({
				name: "complex-package",
				type: "npm",
				connection: "npm-feed",
				packageName: "@myorg/my-package",
				version: "1.2.3",
				scope: "@myorg",
				source: "https://registry.npmjs.org",
				trigger: {
					enabled: true,
					tags: ["latest", "stable"]
				}
			});

			expect(packageResource.name).toBe("complex-package");
			expect(packageResource.type).toBe("npm");
			expect(packageResource.connection).toBe("npm-feed");
			expect(packageResource.packageName).toBe("@myorg/my-package");
			expect(packageResource.version).toBe("1.2.3");
			expect(packageResource.scope).toBe("@myorg");
			expect(packageResource.source).toBe("https://registry.npmjs.org");
			expect(packageResource.trigger).toEqual({
				enabled: true,
				tags: ["latest", "stable"]
			});
		});

		it("should support all package types", () => {
			const types = ["npm", "nuget", "pypi", "maven", "cargo", "pip", "composer"] as const;

			types.forEach((type) => {
				const packageResource = new PackageResource({
					name: `${type}-package`,
					type
				});

				expect(packageResource.type).toBe(type);
			});
		});
	});

	describe("static factory methods", () => {
		it("should create NPM package resource", () => {
			const packageResource = PackageResource.npm("lodash-pkg", "lodash");

			expect(packageResource.name).toBe("lodash-pkg");
			expect(packageResource.type).toBe("npm");
			expect(packageResource.packageName).toBe("lodash");
			expect(packageResource.version).toBeUndefined();
			expect(packageResource.connection).toBeUndefined();
		});

		it("should create NPM package resource with version", () => {
			const packageResource = PackageResource.npm("react-pkg", "react", "^18.0.0");

			expect(packageResource.name).toBe("react-pkg");
			expect(packageResource.type).toBe("npm");
			expect(packageResource.packageName).toBe("react");
			expect(packageResource.version).toBe("^18.0.0");
		});

		it("should create NPM package resource with version and connection", () => {
			const packageResource = PackageResource.npm("private-pkg", "@myorg/private", "1.0.0", "private-npm");

			expect(packageResource.name).toBe("private-pkg");
			expect(packageResource.type).toBe("npm");
			expect(packageResource.packageName).toBe("@myorg/private");
			expect(packageResource.version).toBe("1.0.0");
			expect(packageResource.connection).toBe("private-npm");
		});

		it("should create NuGet package resource", () => {
			const packageResource = PackageResource.nuget("newtonsoft-pkg", "Newtonsoft.Json");

			expect(packageResource.name).toBe("newtonsoft-pkg");
			expect(packageResource.type).toBe("nuget");
			expect(packageResource.packageName).toBe("Newtonsoft.Json");
		});

		it("should create NuGet package resource with version and connection", () => {
			const packageResource = PackageResource.nuget("ef-pkg", "Microsoft.EntityFrameworkCore", "7.0.0", "nuget-feed");

			expect(packageResource.name).toBe("ef-pkg");
			expect(packageResource.type).toBe("nuget");
			expect(packageResource.packageName).toBe("Microsoft.EntityFrameworkCore");
			expect(packageResource.version).toBe("7.0.0");
			expect(packageResource.connection).toBe("nuget-feed");
		});

		it("should create PyPI package resource", () => {
			const packageResource = PackageResource.pypi("requests-pkg", "requests");

			expect(packageResource.name).toBe("requests-pkg");
			expect(packageResource.type).toBe("pypi");
			expect(packageResource.packageName).toBe("requests");
		});

		it("should create PyPI package resource with version and connection", () => {
			const packageResource = PackageResource.pypi("django-pkg", "Django", "4.2.0", "private-pypi");

			expect(packageResource.name).toBe("django-pkg");
			expect(packageResource.type).toBe("pypi");
			expect(packageResource.packageName).toBe("Django");
			expect(packageResource.version).toBe("4.2.0");
			expect(packageResource.connection).toBe("private-pypi");
		});

		it("should create Maven package resource", () => {
			const packageResource = PackageResource.maven("junit-pkg", "junit:junit");

			expect(packageResource.name).toBe("junit-pkg");
			expect(packageResource.type).toBe("maven");
			expect(packageResource.packageName).toBe("junit:junit");
		});

		it("should create Maven package resource with version and connection", () => {
			const packageResource = PackageResource.maven("spring-pkg", "org.springframework:spring-core", "6.0.0", "maven-central");

			expect(packageResource.name).toBe("spring-pkg");
			expect(packageResource.type).toBe("maven");
			expect(packageResource.packageName).toBe("org.springframework:spring-core");
			expect(packageResource.version).toBe("6.0.0");
			expect(packageResource.connection).toBe("maven-central");
		});

		it("should create package resource with trigger", () => {
			const packageResource = PackageResource.withTrigger("triggered-npm", "npm", "my-package", ["latest", "beta"]);

			expect(packageResource.name).toBe("triggered-npm");
			expect(packageResource.type).toBe("npm");
			expect(packageResource.packageName).toBe("my-package");
			expect(packageResource.trigger).toEqual({
				enabled: true,
				tags: ["latest", "beta"]
			});
		});
	});

	describe("synthesize", () => {
		it("should synthesize basic package resource", () => {
			const packageResource = new PackageResource({
				name: "basic-package",
				type: "npm"
			});

			const result = packageResource.synthesize();

			expect(result).toEqual({
				package: "basic-package",
				type: "npm"
			});
		});

		it("should synthesize package resource with package name", () => {
			const packageResource = new PackageResource({
				name: "named-package",
				type: "npm",
				packageName: "lodash"
			});

			const result = packageResource.synthesize();

			expect(result).toEqual({
				package: "named-package",
				type: "npm",
				name: "lodash"
			});
		});

		it("should synthesize package resource with version", () => {
			const packageResource = new PackageResource({
				name: "versioned-package",
				type: "nuget",
				packageName: "Newtonsoft.Json",
				version: "13.0.3"
			});

			const result = packageResource.synthesize();

			expect(result).toEqual({
				package: "versioned-package",
				type: "nuget",
				name: "Newtonsoft.Json",
				version: "13.0.3"
			});
		});

		it("should synthesize package resource with connection", () => {
			const packageResource = new PackageResource({
				name: "private-package",
				type: "npm",
				packageName: "@myorg/private-lib",
				connection: "private-npm-feed"
			});

			const result = packageResource.synthesize();

			expect(result).toEqual({
				package: "private-package",
				type: "npm",
				name: "@myorg/private-lib",
				connection: "private-npm-feed"
			});
		});

		it("should synthesize package resource with scope", () => {
			const packageResource = new PackageResource({
				name: "scoped-package",
				type: "npm",
				packageName: "@myorg/my-package",
				scope: "@myorg"
			});

			const result = packageResource.synthesize();

			expect(result).toEqual({
				package: "scoped-package",
				type: "npm",
				name: "@myorg/my-package",
				scope: "@myorg"
			});
		});

		it("should synthesize package resource with source", () => {
			const packageResource = new PackageResource({
				name: "custom-source-package",
				type: "pypi",
				packageName: "my-package",
				source: "https://my-private-pypi.com"
			});

			const result = packageResource.synthesize();

			expect(result).toEqual({
				package: "custom-source-package",
				type: "pypi",
				name: "my-package",
				source: "https://my-private-pypi.com"
			});
		});

		it("should synthesize package resource with trigger", () => {
			const packageResource = new PackageResource({
				name: "triggered-package",
				type: "npm",
				packageName: "my-lib",
				trigger: {
					enabled: true,
					tags: ["latest", "stable"]
				}
			});

			const result = packageResource.synthesize();

			expect(result).toEqual({
				package: "triggered-package",
				type: "npm",
				name: "my-lib",
				trigger: {
					enabled: true,
					tags: ["latest", "stable"]
				}
			});
		});

		it("should synthesize package resource with all properties", () => {
			const packageResource = new PackageResource({
				name: "complete-package",
				type: "maven",
				connection: "maven-feed",
				packageName: "com.example:my-lib",
				version: "2.1.0",
				scope: "com.example",
				source: "https://repo1.maven.org/maven2",
				trigger: {
					enabled: false,
					tags: ["release"]
				}
			});

			const result = packageResource.synthesize();

			expect(result).toEqual({
				package: "complete-package",
				type: "maven",
				connection: "maven-feed",
				name: "com.example:my-lib",
				version: "2.1.0",
				scope: "com.example",
				source: "https://repo1.maven.org/maven2",
				trigger: {
					enabled: false,
					tags: ["release"]
				}
			});
		});

		it("should omit undefined properties in synthesis", () => {
			const packageResource = new PackageResource({
				name: "minimal-package",
				type: "pip",
				connection: undefined,
				packageName: undefined,
				version: undefined,
				scope: undefined,
				source: undefined,
				trigger: undefined
			});

			const result = packageResource.synthesize();

			expect(result).toEqual({
				package: "minimal-package",
				type: "pip"
			});
			expect(result).not.toHaveProperty("connection");
			expect(result).not.toHaveProperty("name");
			expect(result).not.toHaveProperty("version");
			expect(result).not.toHaveProperty("scope");
			expect(result).not.toHaveProperty("source");
			expect(result).not.toHaveProperty("trigger");
		});
	});

	describe("edge cases", () => {
		it("should handle scoped NPM packages", () => {
			const packageResource = new PackageResource({
				name: "scoped-npm",
				type: "npm",
				packageName: "@types/node",
				scope: "@types"
			});

			const result = packageResource.synthesize();
			expect(result.name).toBe("@types/node");
			expect(result.scope).toBe("@types");
		});

		it("should handle Maven coordinates", () => {
			const packageResource = new PackageResource({
				name: "maven-coords",
				type: "maven",
				packageName: "org.apache.commons:commons-lang3",
				version: "3.12.0"
			});

			const result = packageResource.synthesize();
			expect(result.name).toBe("org.apache.commons:commons-lang3");
			expect(result.version).toBe("3.12.0");
		});

		it("should handle semantic versioning ranges", () => {
			const packageResource = new PackageResource({
				name: "semver-range",
				type: "npm",
				packageName: "lodash",
				version: "^4.17.0"
			});

			const result = packageResource.synthesize();
			expect(result.version).toBe("^4.17.0");
		});

		it("should handle pre-release versions", () => {
			const packageResource = new PackageResource({
				name: "prerelease",
				type: "npm",
				packageName: "react",
				version: "18.0.0-rc.3"
			});

			const result = packageResource.synthesize();
			expect(result.version).toBe("18.0.0-rc.3");
		});

		it("should handle disabled trigger", () => {
			const packageResource = new PackageResource({
				name: "disabled-trigger",
				type: "nuget",
				packageName: "MyPackage",
				trigger: {
					enabled: false,
					tags: ["dev"]
				}
			});

			const result = packageResource.synthesize();
			expect(result.trigger).toEqual({
				enabled: false,
				tags: ["dev"]
			});
		});

		it("should handle Cargo package type", () => {
			const packageResource = new PackageResource({
				name: "rust-package",
				type: "cargo",
				packageName: "serde",
				version: "1.0"
			});

			const result = packageResource.synthesize();
			expect(result.type).toBe("cargo");
			expect(result.name).toBe("serde");
		});

		it("should handle Composer package type", () => {
			const packageResource = new PackageResource({
				name: "php-package",
				type: "composer",
				packageName: "symfony/console",
				version: "^6.0"
			});

			const result = packageResource.synthesize();
			expect(result.type).toBe("composer");
			expect(result.name).toBe("symfony/console");
		});

		it("should handle complex private registry URLs", () => {
			const packageResource = new PackageResource({
				name: "complex-registry",
				type: "npm",
				packageName: "@myorg/my-package",
				source: "https://npm.my-company.com/api/npm/npm-private/"
			});

			const result = packageResource.synthesize();
			expect(result.source).toBe("https://npm.my-company.com/api/npm/npm-private/");
		});
	});
});
