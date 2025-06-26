import { Resource, BaseResourceProps } from "./resource";

/**
 * Properties for Container resource
 */
export interface ContainerResourceProps extends BaseResourceProps {
	/** Container image name */
	readonly image: string;
	/** Container registry endpoint */
	readonly endpoint?: string;
	/** Environment variables */
	readonly env?: Record<string, string>;
	/** Port mappings */
	readonly ports?: string[];
	/** Volume mappings */
	readonly volumes?: string[];
	/** Container options */
	readonly options?: string;
	/** Local path to Dockerfile */
	readonly localImage?: string;
	/** Map volumes */
	readonly mapDockerSocket?: boolean;
	/** Working directory */
	readonly workingDirectory?: string;
}

/**
 * Container resource construct
 *
 * Defines container images for use in pipeline jobs
 */
export class ContainerResource extends Resource {
	public readonly image: string;
	public readonly endpoint?: string;
	public readonly env?: Record<string, string>;
	public readonly ports?: string[];
	public readonly volumes?: string[];
	public readonly options?: string;
	public readonly localImage?: string;
	public readonly mapDockerSocket?: boolean;
	public readonly workingDirectory?: string;

	constructor(props: ContainerResourceProps) {
		super(props.name);
		this.image = props.image;
		this.endpoint = props.endpoint;
		this.env = props.env;
		this.ports = props.ports;
		this.volumes = props.volumes;
		this.options = props.options;
		this.localImage = props.localImage;
		this.mapDockerSocket = props.mapDockerSocket;
		this.workingDirectory = props.workingDirectory;
	}

	synthesize(): any {
		const result: any = {
			container: this.name,
			image: this.image
		};

		if (this.endpoint !== undefined) {
			result.endpoint = this.endpoint;
		}
		if (this.env !== undefined && Object.keys(this.env).length > 0) {
			result.env = this.env;
		}
		if (this.ports !== undefined && this.ports.length > 0) {
			result.ports = this.ports;
		}
		if (this.volumes !== undefined && this.volumes.length > 0) {
			result.volumes = this.volumes;
		}
		if (this.options !== undefined) {
			result.options = this.options;
		}
		if (this.localImage !== undefined) {
			result.localImage = this.localImage;
		}
		if (this.mapDockerSocket !== undefined) {
			result.mapDockerSocket = this.mapDockerSocket;
		}
		if (this.workingDirectory !== undefined) {
			result.workingDirectory = this.workingDirectory;
		}

		return result;
	}

	/**
	 * Create a simple container resource
	 */
	static create(name: string, image: string): ContainerResource {
		return new ContainerResource({ name, image });
	}

	/**
	 * Create a container with environment variables
	 */
	static withEnv(name: string, image: string, env: Record<string, string>): ContainerResource {
		return new ContainerResource({ name, image, env });
	}

	/**
	 * Create a container with port mappings
	 */
	static withPorts(name: string, image: string, ports: string[]): ContainerResource {
		return new ContainerResource({ name, image, ports });
	}

	/**
	 * Create a container from Docker Hub
	 */
	static dockerHub(name: string, image: string): ContainerResource {
		return new ContainerResource({ name, image });
	}

	/**
	 * Create a container from Azure Container Registry
	 */
	static acr(name: string, image: string, endpoint: string): ContainerResource {
		return new ContainerResource({ name, image, endpoint });
	}
}
