import { Construct } from "../construct";
import { RepositoryResource } from "./repository";
import { PipelineResource } from "./pipeline-resource";
import { ContainerResource } from "./container-resource";
import { BuildResource } from "./build-resource";
import { PackageResource } from "./package-resource";
import { WebhookResource } from "./webhook-resource";

/**
 * Resources construct
 *
 * Manages all pipeline resources including repositories, containers, pipelines, etc.
 */
export class Resources extends Construct {
	private repositories: RepositoryResource[] = [];
	private pipelines: PipelineResource[] = [];
	private containers: ContainerResource[] = [];
	private builds: BuildResource[] = [];
	private packages: PackageResource[] = [];
	private webhooks: WebhookResource[] = [];

	constructor() {
		super();
	}

	/**
	 * Add a repository resource
	 */
	addRepository(repository: RepositoryResource): void {
		this.repositories.push(repository);
	}

	/**
	 * Add a pipeline resource
	 */
	addPipeline(pipeline: PipelineResource): void {
		this.pipelines.push(pipeline);
	}

	/**
	 * Add a container resource
	 */
	addContainer(container: ContainerResource): void {
		this.containers.push(container);
	}

	/**
	 * Add a build resource
	 */
	addBuild(build: BuildResource): void {
		this.builds.push(build);
	}

	/**
	 * Add a package resource
	 */
	addPackage(packageResource: PackageResource): void {
		this.packages.push(packageResource);
	}

	/**
	 * Add a webhook resource
	 */
	addWebhook(webhook: WebhookResource): void {
		this.webhooks.push(webhook);
	}

	synthesize(): any {
		const result: any = {};

		if (this.repositories.length > 0) {
			result.repositories = this.repositories.map((repo) => repo.synthesize());
		}

		if (this.pipelines.length > 0) {
			result.pipelines = this.pipelines.map((pipeline) => pipeline.synthesize());
		}

		if (this.containers.length > 0) {
			result.containers = this.containers.map((container) => container.synthesize());
		}

		if (this.builds.length > 0) {
			result.builds = this.builds.map((build) => build.synthesize());
		}

		if (this.packages.length > 0) {
			result.packages = this.packages.map((pkg) => pkg.synthesize());
		}

		if (this.webhooks.length > 0) {
			result.webhooks = this.webhooks.map((webhook) => webhook.synthesize());
		}

		return Object.keys(result).length > 0 ? result : undefined;
	}
}
