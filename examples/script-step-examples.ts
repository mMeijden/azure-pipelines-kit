import { Script, StepsBuilder } from "../src/steps";

// Example: Simple ScriptStep usage

// 1. Most simple usage - just pass a string
const simpleScript = new Script("echo hello world");

// 2. Simple with display name using factory method
const namedScript = Script.create("echo hello world", "Say Hello");

// 3. Full configuration
const complexScript = new Script({
	script: `
    echo "Starting build process..."
    npm install
    npm run build
    echo "Build completed!"
  `,
	displayName: "Build Application",
	workingDirectory: "$(System.DefaultWorkingDirectory)/app",
	env: {
		NODE_ENV: "production",
		BUILD_NUMBER: "$(Build.BuildNumber)"
	},
	timeoutInMinutes: 10,
	continueOnError: false
});

// 4. Using factory methods
const scriptWithEnv = Script.withEnv("echo $MY_VAR", { MY_VAR: "Hello from environment!" }, "Echo Environment Variable");

const scriptInDir = Script.withWorkingDir("ls -la", "/tmp", "List Files");

const continueOnErrorScript = Script.continueOnError(
	"exit 1", // This will fail but pipeline continues
	"This Step May Fail"
);

// 5. Using in a StepsBuilder
const buildSteps = StepsBuilder.create()
	.add(new Script("echo Starting pipeline..."))
	.add(Script.create("git --version", "Check Git Version"))
	.add(Script.withEnv("echo Building with Node version: $NODE_VERSION", { NODE_VERSION: "$(nodeVersion)" }, "Show Node Version"))
	.build();

// Example outputs:
console.log("Simple script:", simpleScript.synthesize());
console.log("Complex script:", complexScript.synthesize());
console.log("All build steps:", buildSteps);

// The synthesized outputs will be:
// Simple script: { script: "echo hello world" }
// Complex script: {
//   script: "...",
//   displayName: "Build Application",
//   workingDirectory: "...",
//   env: {...},
//   timeoutInMinutes: 10
// }
