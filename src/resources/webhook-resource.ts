import { Resource, BaseResourceProps } from "./resource";

/**
 * Properties for Webhook resource
 */
export interface WebhookResourceProps extends BaseResourceProps {
	/** Webhook connection name */
	readonly connection: string;
	/** Webhook type */
	readonly type?: string;
	/** Filters for webhook triggers */
	readonly filters?: Array<{
		/** Filter path (e.g., JSON path) */
		path?: string;
		/** Expected value */
		value?: string;
	}>;
}

/**
 * Webhook resource construct
 *
 * Defines incoming webhooks for triggering pipelines
 */
export class WebhookResource extends Resource {
	public readonly connection: string;
	public readonly type?: string;
	public readonly filters?: Array<{
		path?: string;
		value?: string;
	}>;

	constructor(props: WebhookResourceProps) {
		super(props.name);
		this.connection = props.connection;
		this.type = props.type;
		this.filters = props.filters;
	}

	synthesize(): any {
		const result: any = {
			webhook: this.name,
			connection: this.connection
		};

		if (this.type !== undefined) {
			result.type = this.type;
		}
		if (this.filters !== undefined && this.filters.length > 0) {
			result.filters = this.filters;
		}

		return result;
	}

	/**
	 * Create a simple webhook resource
	 */
	static create(name: string, connection: string): WebhookResource {
		return new WebhookResource({ name, connection });
	}

	/**
	 * Create a webhook resource with filters
	 */
	static withFilters(name: string, connection: string, filters: Array<{ path?: string; value?: string }>): WebhookResource {
		return new WebhookResource({ name, connection, filters });
	}
}
