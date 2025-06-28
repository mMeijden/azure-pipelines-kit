export * from "./template-expression";
export * from "./conditions";
export * from "./conditional-helpers";

// Export direct expressions with explicit naming to avoid conflicts
export {
	If,
	Unless,
	OnSuccess,
	OnFailure,
	Always,
	WhenVar,
	WhenNotVar,
	WhenParam,
	ForEnvironments,
	ForPlatforms,
	WhenTesting,
	WhenDeploying
} from "./direct-expressions";
