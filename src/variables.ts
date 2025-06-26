import { Construct } from "./construct";
import { Variable, VariableDefinition } from "./variable";

type VariableGroup = { group: string };
type VariableTemplate = { template: string };
type VariableItem = Variable | VariableGroup | VariableTemplate;

export class Variables extends Construct {
	private variableList: VariableItem[];

	constructor() {
		super();
		this.variableList = [];
	}

	addVariable(props: VariableDefinition) {
		this.variableList.push(new Variable(props));
	}
	// addVariable(variable: Variable) {
	// 	this.variableList.push(variable);
	// }

	addGroup(groupName: string) {
		this.variableList.push({ group: groupName });
	}

	addTemplate(templateName: string) {
		this.variableList.push({ template: templateName });
	}

	synthesize() {
		return {
			variables: this.variableList.map((item) => (item instanceof Variable ? item.synthesize() : item))
		};
	}
}
