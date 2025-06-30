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
		let yamlOutput = "";

		// First, try to run the file directly (for files with console.log synthesis)
		try {
			const result = execSync(`npx ts-node "${inputPath}"`, {
				cwd: projectRoot,
				encoding: "utf8",
				stdio: ["pipe", "pipe", "pipe"], // capture all output
				timeout: 30000
			});
			yamlOutput = result.trim();

			if (verbose && yamlOutput) {
				console.log("✅ Pipeline synthesized via direct execution");
			}
		} catch (directRunError) {
			if (verbose) {
				console.log("⚠️  Direct execution didn't produce output, trying import approach...");
			}
		}

		// If direct execution didn't work, try importing and calling synthesize
		if (!yamlOutput) {
			if (verbose) {
				console.log("🔄 Attempting to import and synthesize pipeline...");
			}

			// Create a temporary script to import and synthesize the pipeline
			const tempScript = `
const path = require('path');
const fs = require('fs');

// Configure TypeScript compilation
require('ts-node').register({
	compilerOptions: {
		module: 'commonjs',
		target: 'es2020',
		esModuleInterop: true,
		allowSyntheticDefaultImports: true,
		skipLibCheck: true
	}
});

async function synthesizePipeline() {
	try {
		// Import the pipeline module
		const pipelineModule = require('${inputPath.replace(/\\/g, "\\\\")}');
		
		// Try different export patterns
		let pipeline = pipelineModule.default || pipelineModule.pipeline;
		
		// If no direct pipeline export, look for any object with a synthesize method
		if (!pipeline || typeof pipeline.synthesize !== 'function') {
			const exports = Object.values(pipelineModule);
			pipeline = exports.find(exp => exp && typeof exp.synthesize === 'function');
		}
		
		if (!pipeline || typeof pipeline.synthesize !== 'function') {
			console.error('Error: No pipeline object with synthesize() method found.');
			console.error('Expected exports: "default", "pipeline", or any object with synthesize() method.');
			console.error('Available exports:', Object.keys(pipelineModule));
			process.exit(1);
		}
		
		const yaml = pipeline.synthesize();
		console.log(yaml);
	} catch (error) {
		console.error('Import/synthesis error:', error.message);
		if (error.stack) {
			console.error(error.stack);
		}
		process.exit(1);
	}
}

synthesizePipeline();
			`;

			const tempScriptPath = path.join(projectRoot, ".temp-synthesize.js");
			fs.writeFileSync(tempScriptPath, tempScript);

			try {
				const result = execSync(`node "${tempScriptPath}"`, {
					cwd: projectRoot,
					encoding: "utf8",
					stdio: ["pipe", "pipe", "inherit"], // inherit stderr for errors
					timeout: 30000
				});
				yamlOutput = result.trim();

				if (verbose && yamlOutput) {
					console.log("✅ Pipeline synthesized via import");
				}
			} finally {
				// Clean up temp file
				if (fs.existsSync(tempScriptPath)) {
					fs.unlinkSync(tempScriptPath);
				}
			}
		}

		if (!yamlOutput) {
			throw new Error(`No YAML output was generated. Make sure your pipeline file:

1. Exports a pipeline object as 'default' or 'pipeline', OR
2. Exports any object with a synthesize() method, OR  
3. Calls pipeline.synthesize() and console.log(result) when run directly

Example patterns:

// Pattern 1: Default export
const pipeline = new Pipeline({ ... });
export default pipeline;

// Pattern 2: Named export  
export const pipeline = new Pipeline({ ... });

// Pattern 3: Direct synthesis (legacy)
if (require.main === module) {
  console.log(pipeline.synthesize());
}`);
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
