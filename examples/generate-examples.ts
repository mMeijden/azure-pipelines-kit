#!/usr/bin/env node

/**
 * Example runner to demonstrate converting TypeScript pipeline definitions to YAML
 * This shows how you can use the CLI to generate YAML from the example pipelines
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const examples = [
	{
		name: "Simple Node.js App",
		file: "simple-node-app.ts",
		description: "Basic CI/CD pipeline for a Node.js application with testing and deployment"
	},
	{
		name: "Multi-Platform .NET",
		file: "multi-platform-dotnet.ts",
		description: "Cross-platform builds for Windows, Linux, and macOS with conditional logic"
	},
	{
		name: "Microservices Pipeline",
		file: "microservices-pipeline.ts",
		description: "Complex microservices deployment with multiple services and advanced conditionals"
	},
	{
		name: "Machine Learning Pipeline",
		file: "ml-pipeline.ts",
		description: "ML workflow with data preparation, training, validation, and model deployment"
	},
	{
		name: "Infrastructure as Code",
		file: "infrastructure-pipeline.ts",
		description: "Terraform-based infrastructure deployment with security scanning and validation"
	}
];

function main() {
	console.log("🚀 Azure Pipelines CDK - Example Pipeline Generator");
	console.log("==================================================\n");

	// Create output directory
	const outputDir = join(__dirname, "..", "generated-yaml");
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}

	console.log("Available example pipelines:\n");

	examples.forEach((example, index) => {
		console.log(`${index + 1}. ${example.name}`);
		console.log(`   📁 ${example.file}`);
		console.log(`   📝 ${example.description}\n`);
	});

	console.log("Generating YAML for all examples...\n");

	examples.forEach((example, index) => {
		try {
			console.log(`⏳ Generating YAML for ${example.name}...`);

			const inputPath = join(__dirname, example.file);
			const outputPath = join(outputDir, example.file.replace(".ts", ".yml"));

			// Build the project first to ensure latest changes
			console.log("   📦 Building project...");
			execSync("pnpm build", { cwd: join(__dirname, ".."), stdio: "pipe" });

			// Use the CLI to generate YAML
			console.log("   🔄 Converting to YAML...");
			const command = `npx ts-node cli/index.ts ${inputPath} --output ${outputPath}`;
			execSync(command, { cwd: join(__dirname, ".."), stdio: "pipe" });

			console.log(`   ✅ Generated: ${outputPath}`);
		} catch (error) {
			console.log(`   ❌ Error generating ${example.name}:`, error instanceof Error ? error.message : String(error));
		}

		console.log("");
	});

	console.log("📋 Usage Instructions:");
	console.log("=====================\n");

	console.log("To generate YAML from a TypeScript pipeline definition:");
	console.log("```bash");
	console.log("# Generate YAML using the CLI with ts-node");
	console.log("npx ts-node cli/index.ts examples/simple-node-app.ts --output output.yml");
	console.log("```\n");

	console.log("Or use the CLI directly from the command line:");
	console.log("```bash");
	console.log("# Install globally (optional)");
	console.log("npm install -g azure-pipelines-kit");
	console.log("");
	console.log("# Generate YAML");
	console.log("azure-pipelines examples/my-pipeline.ts --output azure-pipelines.yml");
	console.log("```\n");

	console.log("📁 Generated YAML files are saved in: generated-yaml/");
	console.log("💡 You can copy these YAML files directly to your Azure DevOps repository");
	console.log("🔧 Customize the TypeScript examples and regenerate as needed");
}

if (require.main === module) {
	main();
}
