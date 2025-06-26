#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { Command } from "commander";
import { execSync } from "child_process";

const program = new Command();

program
	.name("azure-pipelines-cdk")
	.description("CLI tool for generating Azure DevOps YAML from TypeScript pipeline definitions")
	.version("1.0.0");

program
	.argument("<input>", "Input TypeScript file containing pipeline definition")
	.option("-o, --output <file>", "Output YAML file path", "azure-pipelines.yml")
	.option("--verbose", "Show verbose output")
	.action(async (input: string, options) => {
		try {
			await generatePipelineYAML(input, options);
		} catch (error: any) {
			console.error("Error:", error.message);
			process.exit(1);
		}
	});

interface CLIOptions {
	output: string;
	verbose: boolean;
	watch?: boolean;
}

async function generatePipelineYAML(inputFile: string, options: CLIOptions) {
	const { output, verbose } = options;

	if (verbose) {
		console.log(`🚀 Generating Azure DevOps YAML from ${inputFile}`);
	}

	// Validate input file exists
	if (!fs.existsSync(inputFile)) {
		throw new Error(`Input file not found: ${inputFile}`);
	}

	// Get absolute paths
	const inputPath = path.resolve(inputFile);
	const outputPath = path.resolve(output);

	if (verbose) {
		console.log(`📁 Input: ${inputPath}`);
		console.log(`📁 Output: ${outputPath}`);
	}

	// Find project root
	const projectRoot = findProjectRoot(path.dirname(inputPath));
	if (!projectRoot) {
		throw new Error("Could not find project root (package.json or tsconfig.json). Make sure you run this from your project directory.");
	}

	if (verbose) {
		console.log(`📁 Project root: ${projectRoot}`);
		console.log("▶️  Executing pipeline definition...");
	}

	try {
		// Simple approach: just run ts-node with the file
		const result = execSync(`npx ts-node "${inputPath}"`, {
			cwd: projectRoot,
			encoding: "utf8",
			stdio: ["pipe", "pipe", "inherit"], // inherit stderr for errors
			timeout: 30000
		});

		const yamlOutput = result.trim();

		if (!yamlOutput) {
			throw new Error("No YAML output was generated. Make sure your pipeline calls pipeline.synthesize() and logs the result.");
		}

		// Write YAML to output file
		const outputDir = path.dirname(outputPath);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		fs.writeFileSync(outputPath, yamlOutput);

		console.log(`✅ Successfully generated Azure DevOps YAML: ${outputPath}`);

		if (verbose) {
			console.log("\n📋 Generated YAML:");
			console.log("---");
			console.log(yamlOutput);
			console.log("---");
		}
	} catch (error: any) {
		if (error.status) {
			throw new Error(`Failed to execute pipeline: Process exited with code ${error.status}`);
		} else {
			throw new Error(`Failed to execute pipeline: ${error.message}`);
		}
	}
}

function findProjectRoot(startDir: string): string | null {
	let currentDir = startDir;

	while (currentDir !== path.dirname(currentDir)) {
		const packageJsonPath = path.join(currentDir, "package.json");
		const tsConfigPath = path.join(currentDir, "tsconfig.json");

		if (fs.existsSync(packageJsonPath) || fs.existsSync(tsConfigPath)) {
			return currentDir;
		}
		currentDir = path.dirname(currentDir);
	}

	return null;
}

// Handle uncaught errors
process.on("uncaughtException", (error) => {
	console.error("❌ Uncaught error:", error.message);
	process.exit(1);
});

process.on("unhandledRejection", (error: any) => {
	console.error("❌ Unhandled rejection:", error.message);
	process.exit(1);
});

program.parse();
