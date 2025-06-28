import { WebhookResource } from "../src/resources/webhook-resource";

describe("WebhookResource", () => {
	describe("constructor", () => {
		it("should create a basic webhook resource", () => {
			const webhookResource = new WebhookResource({
				name: "github-webhook",
				connection: "github-connection"
			});

			expect(webhookResource).toBeInstanceOf(WebhookResource);
			expect(webhookResource.name).toBe("github-webhook");
			expect(webhookResource.connection).toBe("github-connection");
		});

		it("should create a webhook resource with all properties", () => {
			const webhookResource = new WebhookResource({
				name: "complex-webhook",
				connection: "external-webhook",
				type: "incoming-webhook",
				filters: [
					{ path: "$.action", value: "opened" },
					{ path: "$.pull_request.base.ref", value: "main" }
				]
			});

			expect(webhookResource.name).toBe("complex-webhook");
			expect(webhookResource.connection).toBe("external-webhook");
			expect(webhookResource.type).toBe("incoming-webhook");
			expect(webhookResource.filters).toEqual([
				{ path: "$.action", value: "opened" },
				{ path: "$.pull_request.base.ref", value: "main" }
			]);
		});
	});

	describe("static factory methods", () => {
		it("should create simple webhook resource", () => {
			const webhookResource = WebhookResource.create("simple-webhook", "my-connection");

			expect(webhookResource.name).toBe("simple-webhook");
			expect(webhookResource.connection).toBe("my-connection");
			expect(webhookResource.type).toBeUndefined();
			expect(webhookResource.filters).toBeUndefined();
		});

		it("should create webhook resource with filters", () => {
			const filters = [
				{ path: "$.event_type", value: "push" },
				{ path: "$.ref", value: "refs/heads/main" }
			];
			const webhookResource = WebhookResource.withFilters("filtered-webhook", "github-conn", filters);

			expect(webhookResource.name).toBe("filtered-webhook");
			expect(webhookResource.connection).toBe("github-conn");
			expect(webhookResource.filters).toEqual(filters);
		});
	});

	describe("synthesize", () => {
		it("should synthesize basic webhook resource", () => {
			const webhookResource = new WebhookResource({
				name: "basic-webhook",
				connection: "webhook-connection"
			});

			const result = webhookResource.synthesize();

			expect(result).toEqual({
				webhook: "basic-webhook",
				connection: "webhook-connection"
			});
		});

		it("should synthesize webhook resource with type", () => {
			const webhookResource = new WebhookResource({
				name: "typed-webhook",
				connection: "webhook-connection",
				type: "generic-webhook"
			});

			const result = webhookResource.synthesize();

			expect(result).toEqual({
				webhook: "typed-webhook",
				connection: "webhook-connection",
				type: "generic-webhook"
			});
		});

		it("should synthesize webhook resource with filters", () => {
			const webhookResource = new WebhookResource({
				name: "filtered-webhook",
				connection: "webhook-connection",
				filters: [
					{ path: "$.action", value: "created" },
					{ path: "$.issue.state", value: "open" }
				]
			});

			const result = webhookResource.synthesize();

			expect(result).toEqual({
				webhook: "filtered-webhook",
				connection: "webhook-connection",
				filters: [
					{ path: "$.action", value: "created" },
					{ path: "$.issue.state", value: "open" }
				]
			});
		});

		it("should synthesize webhook resource with all properties", () => {
			const webhookResource = new WebhookResource({
				name: "complete-webhook",
				connection: "external-system",
				type: "custom-webhook",
				filters: [
					{ path: "$.deployment.status", value: "success" },
					{ path: "$.deployment.environment", value: "production" }
				]
			});

			const result = webhookResource.synthesize();

			expect(result).toEqual({
				webhook: "complete-webhook",
				connection: "external-system",
				type: "custom-webhook",
				filters: [
					{ path: "$.deployment.status", value: "success" },
					{ path: "$.deployment.environment", value: "production" }
				]
			});
		});

		it("should omit undefined properties in synthesis", () => {
			const webhookResource = new WebhookResource({
				name: "minimal-webhook",
				connection: "webhook-connection",
				type: undefined,
				filters: undefined
			});

			const result = webhookResource.synthesize();

			expect(result).toEqual({
				webhook: "minimal-webhook",
				connection: "webhook-connection"
			});
			expect(result).not.toHaveProperty("type");
			expect(result).not.toHaveProperty("filters");
		});
	});

	describe("edge cases", () => {
		it("should handle empty filters array", () => {
			const webhookResource = new WebhookResource({
				name: "empty-filters",
				connection: "webhook-connection",
				filters: []
			});

			const result = webhookResource.synthesize();
			// Empty filters array should not be included in the result
			expect(result).not.toHaveProperty("filters");
		});

		it("should handle filters with only path", () => {
			const webhookResource = new WebhookResource({
				name: "path-only-filters",
				connection: "webhook-connection",
				filters: [{ path: "$.event_type" }, { path: "$.repository.name" }]
			});

			const result = webhookResource.synthesize();
			expect(result.filters).toEqual([{ path: "$.event_type" }, { path: "$.repository.name" }]);
		});

		it("should handle filters with only value", () => {
			const webhookResource = new WebhookResource({
				name: "value-only-filters",
				connection: "webhook-connection",
				filters: [{ value: "push" }, { value: "main" }]
			});

			const result = webhookResource.synthesize();
			expect(result.filters).toEqual([{ value: "push" }, { value: "main" }]);
		});

		it("should handle mixed filter configurations", () => {
			const webhookResource = new WebhookResource({
				name: "mixed-filters",
				connection: "webhook-connection",
				filters: [{ path: "$.action", value: "opened" }, { path: "$.pull_request.draft" }, { value: "false" }, {}]
			});

			const result = webhookResource.synthesize();
			expect(result.filters).toEqual([{ path: "$.action", value: "opened" }, { path: "$.pull_request.draft" }, { value: "false" }, {}]);
		});

		it("should handle complex JSON path expressions", () => {
			const webhookResource = new WebhookResource({
				name: "complex-paths",
				connection: "webhook-connection",
				filters: [
					{ path: "$.commits[*].modified[?(@ =~ /^src\\/.*\\.ts$/)]", value: "true" },
					{ path: "$.pull_request.labels[*].name", value: "ready-for-review" },
					{ path: "$.repository.full_name", value: "myorg/myrepo" }
				]
			});

			const result = webhookResource.synthesize();
			expect(result.filters).toEqual([
				{ path: "$.commits[*].modified[?(@ =~ /^src\\/.*\\.ts$/)]", value: "true" },
				{ path: "$.pull_request.labels[*].name", value: "ready-for-review" },
				{ path: "$.repository.full_name", value: "myorg/myrepo" }
			]);
		});

		it("should handle special characters in connection names", () => {
			const webhookResource = new WebhookResource({
				name: "special-connection",
				connection: "my-external-system_v2.webhook-endpoint"
			});

			const result = webhookResource.synthesize();
			expect(result.connection).toBe("my-external-system_v2.webhook-endpoint");
		});

		it("should handle webhook types with special characters", () => {
			const webhookResource = new WebhookResource({
				name: "special-type",
				connection: "webhook-connection",
				type: "custom-webhook-v1.2"
			});

			const result = webhookResource.synthesize();
			expect(result.type).toBe("custom-webhook-v1.2");
		});

		it("should handle GitHub-specific webhook filters", () => {
			const webhookResource = new WebhookResource({
				name: "github-webhook",
				connection: "github-connection",
				type: "github",
				filters: [
					{ path: "$.action", value: "synchronize" },
					{ path: "$.pull_request.head.ref", value: "feature/*" },
					{ path: "$.pull_request.base.ref", value: "develop" },
					{ path: "$.pull_request.draft", value: "false" }
				]
			});

			const result = webhookResource.synthesize();
			expect(result).toEqual({
				webhook: "github-webhook",
				connection: "github-connection",
				type: "github",
				filters: [
					{ path: "$.action", value: "synchronize" },
					{ path: "$.pull_request.head.ref", value: "feature/*" },
					{ path: "$.pull_request.base.ref", value: "develop" },
					{ path: "$.pull_request.draft", value: "false" }
				]
			});
		});

		it("should handle Azure DevOps service hook filters", () => {
			const webhookResource = new WebhookResource({
				name: "azdo-webhook",
				connection: "azdo-connection",
				type: "azuredevops",
				filters: [
					{ path: "$.eventType", value: "git.push" },
					{ path: "$.resource.refUpdates[0].name", value: "refs/heads/main" },
					{ path: "$.resource.repository.name", value: "MyRepository" }
				]
			});

			const result = webhookResource.synthesize();
			expect(result.filters).toEqual([
				{ path: "$.eventType", value: "git.push" },
				{ path: "$.resource.refUpdates[0].name", value: "refs/heads/main" },
				{ path: "$.resource.repository.name", value: "MyRepository" }
			]);
		});
	});
});
