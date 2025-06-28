import { TemplateExpression } from "../src/expressions/template-expression";
import { If } from "../src/expressions/direct-expressions";
import {
	Eq,
	Ne,
	Gt,
	Ge,
	Lt,
	Le,
	And,
	Or,
	Not,
	Contains,
	ContainsValue,
	StartsWith,
	EndsWith,
	Custom,
	parameters,
	variables
} from "../src/expressions/conditions";

describe("TemplateExpression", () => {
	describe("basic conditions", () => {
		it("should create equality condition", () => {
			const expr = If(new Eq(parameters.get("toolset"), "msbuild"), []);

			expect(expr.condition).toEqual({
				type: "eq",
				left: "parameters.toolset",
				right: "msbuild"
			});
			expect(expr.synthesizeCondition()).toBe("eq(parameters.toolset, 'msbuild')");
		});

		it("should create not-equal condition", () => {
			const expr = If(new Ne(variables.get("Build.Reason"), "PullRequest"), []);

			expect(expr.condition).toEqual({
				type: "ne",
				left: "variables.Build.Reason",
				right: "PullRequest"
			});
			expect(expr.synthesizeCondition()).toBe("ne(variables.Build.Reason, 'PullRequest')");
		});

		it("should create greater-than condition", () => {
			const expr = If(new Gt(variables.get("buildNumber"), 100), []);

			expect(expr.condition).toEqual({
				type: "gt",
				left: "variables.buildNumber",
				right: 100
			});
			expect(expr.synthesizeCondition()).toBe("gt(variables.buildNumber, 100)");
		});

		it("should create boolean condition", () => {
			const expr = If(new Eq(parameters.get("deployToProduction"), true), []);

			expect(expr.condition).toEqual({
				type: "eq",
				left: "parameters.deployToProduction",
				right: true
			});
			expect(expr.synthesizeCondition()).toBe("eq(parameters.deployToProduction, true)");
		});
	});

	describe("logical conditions", () => {
		it("should create AND condition", () => {
			const expr = If(new Eq(variables.get("isMain"), true).and(new Ne(variables.get("Build.Reason"), "PullRequest")), []);

			expect(expr.condition).toEqual({
				type: "and",
				conditions: [
					{ type: "eq", left: "variables.isMain", right: true },
					{ type: "ne", left: "variables.Build.Reason", right: "PullRequest" }
				]
			});
			expect(expr.synthesizeCondition()).toBe("and(eq(variables.isMain, true), ne(variables.Build.Reason, 'PullRequest'))");
		});

		it("should create OR condition", () => {
			const expr = If(
				new Eq(variables.get("Build.SourceBranch"), "refs/heads/main").or(
					new StartsWith(variables.get("Build.SourceBranch"), "refs/heads/release/")
				),
				[]
			);

			expect(expr.synthesizeCondition()).toBe(
				"or(eq(variables.Build.SourceBranch, 'refs/heads/main'), startsWith(variables.Build.SourceBranch, 'refs/heads/release/'))"
			);
		});

		it("should create NOT condition", () => {
			const expr = If(new Eq(variables.get("Build.Reason"), "PullRequest").not(), []);

			expect(expr.synthesizeCondition()).toBe("not(eq(variables.Build.Reason, 'PullRequest'))");
		});

		it("should create nested logical conditions", () => {
			const expr = If(
				new Eq(variables.get("branch"), "main")
					.or(new Eq(variables.get("branch"), "develop"))
					.and(new Ne(variables.get("Build.Reason"), "PullRequest")),
				[]
			);

			expect(expr.synthesizeCondition()).toBe(
				"and(or(eq(variables.branch, 'main'), eq(variables.branch, 'develop')), ne(variables.Build.Reason, 'PullRequest'))"
			);
		});
	});

	describe("string conditions", () => {
		it("should create contains condition", () => {
			const expr = If(new Contains(variables.get("Build.SourceBranch"), "feature/"), []);
			expect(expr.condition).toEqual({
				type: "contains",
				haystack: "variables.Build.SourceBranch",
				needle: "feature/"
			});
			expect(expr.synthesizeCondition()).toBe("contains(variables.Build.SourceBranch, 'feature/')");
		});

		it("should create containsValue condition", () => {
			const expr = If(new ContainsValue(variables.get("tags"), "production"), []);
			expect(expr.condition).toEqual({
				type: "containsValue",
				object: "variables.tags",
				value: "production"
			});
			expect(expr.synthesizeCondition()).toBe("containsValue(variables.tags, 'production')");
		});

		it("should create startsWith condition", () => {
			const expr = If(new StartsWith(variables.get("Build.SourceBranch"), "refs/heads/feature/"), []);

			expect(expr.condition).toEqual({
				type: "startsWith",
				string: "variables.Build.SourceBranch",
				prefix: "refs/heads/feature/"
			});
			expect(expr.synthesizeCondition()).toBe("startsWith(variables.Build.SourceBranch, 'refs/heads/feature/')");
		});

		it("should create endsWith condition", () => {
			const expr = If(new EndsWith(variables.get("artifactName"), ".zip"), []);

			expect(expr.condition).toEqual({
				type: "endsWith",
				string: "variables.artifactName",
				suffix: ".zip"
			});
			expect(expr.synthesizeCondition()).toBe("endsWith(variables.artifactName, '.zip')");
		});
	});

	describe("custom expressions", () => {
		it("should create custom expression", () => {
			const expr = If(new Custom("and(succeeded(), eq(variables.custom, true))"), []);

			expect(expr.condition).toEqual({
				type: "custom",
				expression: "and(succeeded(), eq(variables.custom, true))"
			});
			expect(expr.synthesizeCondition()).toBe("and(succeeded(), eq(variables.custom, true))");
		});
	});

	describe("content handling", () => {
		it("should handle single content item", () => {
			const expr = If(new Eq(parameters.get("test"), true), "single-item");

			expect(expr.content).toBe("single-item");
		});

		it("should handle array content", () => {
			const expr = If(new Eq(parameters.get("test"), true), ["item1", "item2"]);

			expect(expr.content).toEqual(["item1", "item2"]);
		});
	});

	describe("comparison operators", () => {
		it("should create greater-than-or-equal condition", () => {
			const expr = If(new Ge(variables.get("version"), 2), []);
			expect(expr.synthesizeCondition()).toBe("ge(variables.version, 2)");
		});

		it("should create less-than condition", () => {
			const expr = If(new Lt(variables.get("retryCount"), 3), []);
			expect(expr.synthesizeCondition()).toBe("lt(variables.retryCount, 3)");
		});

		it("should create less-than-or-equal condition", () => {
			const expr = If(new Le(variables.get("maxAttempts"), 5), []);
			expect(expr.synthesizeCondition()).toBe("le(variables.maxAttempts, 5)");
		});
	});

	describe("edge cases", () => {
		it("should handle empty string values", () => {
			const expr = If(new Eq(variables.get("environment"), ""), []);
			expect(expr.synthesizeCondition()).toBe("eq(variables.environment, '')");
		});

		it("should handle zero values", () => {
			const expr = If(new Eq(variables.get("count"), 0), []);
			expect(expr.synthesizeCondition()).toBe("eq(variables.count, 0)");
		});

		it("should handle false boolean values", () => {
			const expr = If(new Eq(parameters.get("skipTests"), false), []);
			expect(expr.synthesizeCondition()).toBe("eq(parameters.skipTests, false)");
		});

		it("should handle complex variable references", () => {
			const expr = If(new Eq("variables['Build.SourceBranch']", "main"), []);
			expect(expr.synthesizeCondition()).toBe("eq(variables['Build.SourceBranch'], 'main')");
		});

		it("should handle special characters in strings", () => {
			const expr = If(new Contains(variables.get("message"), "Hello, World!"), []);
			expect(expr.synthesizeCondition()).toBe("contains(variables.message, 'Hello, World!')");
		});
	});

	describe("TemplateExpression.from factory method", () => {
		it("should create TemplateExpression from condition object", () => {
			const condition = new Eq(variables.get("test"), "value");
			const expr = TemplateExpression.from(condition, "content");

			expect(expr.condition).toEqual({
				type: "eq",
				left: "variables.test",
				right: "value"
			});
			expect(expr.content).toBe("content");
		});

		it("should work with chainable conditions", () => {
			const condition = new Eq(variables.get("env"), "prod").and(new Ne(variables.get("skip"), "true"));
			const expr = TemplateExpression.from(condition, ["step1", "step2"]);

			expect(expr.condition).toEqual({
				type: "and",
				conditions: [
					{ type: "eq", left: "variables.env", right: "prod" },
					{ type: "ne", left: "variables.skip", right: "true" }
				]
			});
			expect(expr.content).toEqual(["step1", "step2"]);
		});
	});

	describe("real-world scenarios", () => {
		it("should handle typical branch protection scenario", () => {
			const expr = If(
				new Eq(variables.get("Build.SourceBranch"), "refs/heads/main")
					.and(new Ne(variables.get("Build.Reason"), "PullRequest"))
					.and(new Eq(variables.get("System.PullRequest.IsFork"), false)),
				[]
			);

			expect(expr.synthesizeCondition()).toBe(
				"and(eq(variables.Build.SourceBranch, 'refs/heads/main'), ne(variables.Build.Reason, 'PullRequest'), eq(variables.System.PullRequest.IsFork, false))"
			);
		});

		it("should handle environment-based deployment scenario", () => {
			const expr = If(
				new Eq(parameters.get("environment"), "production")
					.and(new Eq(parameters.get("deploymentApproved"), true))
					.or(new Eq(parameters.get("environment"), "development")),
				[]
			);

			expect(expr.synthesizeCondition()).toBe(
				"or(and(eq(parameters.environment, 'production'), eq(parameters.deploymentApproved, true)), eq(parameters.environment, 'development'))"
			);
		});

		it("should handle file path filtering scenario", () => {
			const expr = If(
				new Contains(variables.get("Build.SourcesDirectory"), "src/")
					.and(new Contains(variables.get("Build.SourcesDirectory"), "test/").not())
					.and(new EndsWith(variables.get("Build.SourcesDirectory"), ".ts")),
				[]
			);

			expect(expr.synthesizeCondition()).toBe(
				"and(contains(variables.Build.SourcesDirectory, 'src/'), not(contains(variables.Build.SourcesDirectory, 'test/')), endsWith(variables.Build.SourcesDirectory, '.ts'))"
			);
		});
	});

	describe("YAML structure", () => {
		it("should generate correct condition for simple case", () => {
			const expr = If(new Eq(variables.get("runTests"), "true"), { script: "npm test" });

			expect(expr.synthesizeCondition()).toBe("eq(variables.runTests, 'true')");
			expect(expr.content).toEqual({ script: "npm test" });
		});

		it("should generate correct condition for complex case", () => {
			const expr = If(new Eq(variables.get("env"), "production").and(new Ne(variables.get("skipDeployment"), "true")), {
				script: "deploy.sh"
			});

			expect(expr.synthesizeCondition()).toBe("and(eq(variables.env, 'production'), ne(variables.skipDeployment, 'true'))");
			expect(expr.content).toEqual({ script: "deploy.sh" });
		});

		it("should handle array content", () => {
			const expr = If(new Eq(variables.get("runTests"), "true"), [{ script: "npm test" }, { script: "npm run coverage" }]);

			expect(expr.synthesizeCondition()).toBe("eq(variables.runTests, 'true')");
			expect(expr.content).toEqual([{ script: "npm test" }, { script: "npm run coverage" }]);
		});
	});
});
