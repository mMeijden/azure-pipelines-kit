import { Construct } from "../construct";
import { Deployment, Job } from "../jobs";
import { Template } from "./template";

export class Stage extends Construct {
	private name: string;
	private jobs: (Job | Deployment | Template)[];

	constructor(name: string) {
		super();
		this.name = name;
		this.jobs = [];
	}

	addJob(job: Job | Deployment | Template) {
		this.jobs.push(job);
	}

	synthesize() {
		return {
			stage: this.name,
			jobs: this.jobs.map((job) => job.synthesize())
		};
	}
}
