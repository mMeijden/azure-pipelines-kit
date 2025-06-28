import { ContainerResource } from "../src/resources/container-resource";

describe("ContainerResource", () => {
	describe("constructor", () => {
		it("should create a basic container resource", () => {
			const container = new ContainerResource({
				name: "test-container",
				image: "ubuntu:20.04"
			});

			expect(container).toBeInstanceOf(ContainerResource);
			expect(container.name).toBe("test-container");
			expect(container.image).toBe("ubuntu:20.04");
		});

		it("should create a container resource with all properties", () => {
			const container = new ContainerResource({
				name: "full-container",
				image: "mcr.microsoft.com/dotnet/sdk:6.0",
				endpoint: "my-registry",
				env: {
					NODE_ENV: "production",
					DEBUG: "true"
				},
				ports: ["8080:8080", "3000:3000"],
				volumes: ["/host/path:/container/path", "/logs:/app/logs"],
				options: "--privileged --rm",
				localImage: "./Dockerfile",
				mapDockerSocket: true,
				workingDirectory: "/app"
			});

			expect(container.name).toBe("full-container");
			expect(container.image).toBe("mcr.microsoft.com/dotnet/sdk:6.0");
			expect(container.endpoint).toBe("my-registry");
			expect(container.env).toEqual({
				NODE_ENV: "production",
				DEBUG: "true"
			});
			expect(container.ports).toEqual(["8080:8080", "3000:3000"]);
			expect(container.volumes).toEqual(["/host/path:/container/path", "/logs:/app/logs"]);
			expect(container.options).toBe("--privileged --rm");
			expect(container.localImage).toBe("./Dockerfile");
			expect(container.mapDockerSocket).toBe(true);
			expect(container.workingDirectory).toBe("/app");
		});
	});

	describe("static factory methods", () => {
		it("should create basic container with create method", () => {
			const container = ContainerResource.create("simple-container", "alpine:latest");

			expect(container.name).toBe("simple-container");
			expect(container.image).toBe("alpine:latest");
			expect(container.endpoint).toBeUndefined();
		});

		it("should create Docker Hub container", () => {
			const container = ContainerResource.dockerHub("node-container", "node:18-alpine");

			expect(container.name).toBe("node-container");
			expect(container.image).toBe("node:18-alpine");
			expect(container.endpoint).toBeUndefined();
		});

		it("should create Azure Container Registry container", () => {
			const container = ContainerResource.acr("my-app", "myregistry.azurecr.io/myapp:latest", "acr-connection");

			expect(container.name).toBe("my-app");
			expect(container.image).toBe("myregistry.azurecr.io/myapp:latest");
			expect(container.endpoint).toBe("acr-connection");
		});

		it("should create container with environment variables", () => {
			const container = ContainerResource.withEnv("env-container", "node:18", {
				NODE_ENV: "production",
				PORT: "3000"
			});

			expect(container.name).toBe("env-container");
			expect(container.image).toBe("node:18");
			expect(container.env).toEqual({
				NODE_ENV: "production",
				PORT: "3000"
			});
		});

		it("should create container with port mappings", () => {
			const container = ContainerResource.withPorts("web-container", "nginx:alpine", ["80:8080", "443:8443"]);

			expect(container.name).toBe("web-container");
			expect(container.image).toBe("nginx:alpine");
			expect(container.ports).toEqual(["80:8080", "443:8443"]);
		});
	});

	describe("synthesize", () => {
		it("should synthesize basic container resource", () => {
			const container = new ContainerResource({
				name: "basic-container",
				image: "ubuntu:20.04"
			});

			const result = container.synthesize();

			expect(result).toEqual({
				container: "basic-container",
				image: "ubuntu:20.04"
			});
		});

		it("should synthesize container resource with environment variables", () => {
			const container = new ContainerResource({
				name: "env-container",
				image: "node:18",
				env: {
					NODE_ENV: "development",
					PORT: "3000",
					DEBUG: "app:*"
				}
			});

			const result = container.synthesize();

			expect(result).toEqual({
				container: "env-container",
				image: "node:18",
				env: {
					NODE_ENV: "development",
					PORT: "3000",
					DEBUG: "app:*"
				}
			});
		});

		it("should synthesize container resource with ports and volumes", () => {
			const container = new ContainerResource({
				name: "web-container",
				image: "nginx:alpine",
				ports: ["80:8080", "443:8443"],
				volumes: ["/host/www:/usr/share/nginx/html:ro", "/host/logs:/var/log/nginx"]
			});

			const result = container.synthesize();

			expect(result).toEqual({
				container: "web-container",
				image: "nginx:alpine",
				ports: ["80:8080", "443:8443"],
				volumes: ["/host/www:/usr/share/nginx/html:ro", "/host/logs:/var/log/nginx"]
			});
		});

		it("should synthesize container resource with all properties", () => {
			const container = new ContainerResource({
				name: "full-container",
				image: "myapp:latest",
				endpoint: "my-registry",
				env: { APP_ENV: "test" },
				ports: ["8080:8080"],
				volumes: ["/data:/app/data"],
				options: "--memory=2g --cpus=1.5",
				workingDirectory: "/app"
			});

			const result = container.synthesize();

			expect(result).toEqual({
				container: "full-container",
				image: "myapp:latest",
				endpoint: "my-registry",
				env: { APP_ENV: "test" },
				ports: ["8080:8080"],
				volumes: ["/data:/app/data"],
				options: "--memory=2g --cpus=1.5",
				workingDirectory: "/app"
			});
		});

		it("should synthesize local Dockerfile container", () => {
			const container = new ContainerResource({
				name: "local-container",
				image: "", // Required but empty for local builds
				localImage: "./Dockerfile.dev"
			});

			const result = container.synthesize();

			expect(result).toEqual({
				container: "local-container",
				image: "",
				localImage: "./Dockerfile.dev"
			});
		});

		it("should omit undefined properties in synthesis", () => {
			const container = new ContainerResource({
				name: "minimal-container",
				image: "alpine:latest",
				endpoint: undefined,
				env: undefined,
				ports: undefined,
				volumes: undefined
			});

			const result = container.synthesize();

			expect(result).toEqual({
				container: "minimal-container",
				image: "alpine:latest"
			});
			expect(result).not.toHaveProperty("endpoint");
			expect(result).not.toHaveProperty("env");
			expect(result).not.toHaveProperty("ports");
			expect(result).not.toHaveProperty("volumes");
		});
	});

	describe("edge cases", () => {
		it("should handle empty environment variables object", () => {
			const container = new ContainerResource({
				name: "empty-env",
				image: "ubuntu:20.04",
				env: {}
			});

			const result = container.synthesize();
			// Empty env object should not be included in the result
			expect(result).not.toHaveProperty("env");
		});

		it("should handle empty arrays", () => {
			const container = new ContainerResource({
				name: "empty-arrays",
				image: "ubuntu:20.04",
				ports: [],
				volumes: []
			});

			const result = container.synthesize();
			// Empty arrays should not be included in the result
			expect(result).not.toHaveProperty("ports");
			expect(result).not.toHaveProperty("volumes");
		});

		it("should handle mapDockerSocket option", () => {
			const container = new ContainerResource({
				name: "docker-socket",
				image: "docker:dind",
				mapDockerSocket: true
			});

			const result = container.synthesize();
			expect(result.mapDockerSocket).toBe(true);
		});

		it("should handle special characters in image names", () => {
			const container = new ContainerResource({
				name: "special-image",
				image: "myregistry.azurecr.io/my-app/service:v1.2.3-alpha.1+build.123"
			});

			const result = container.synthesize();
			expect(result.image).toBe("myregistry.azurecr.io/my-app/service:v1.2.3-alpha.1+build.123");
		});
	});
});
