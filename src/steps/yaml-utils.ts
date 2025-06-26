import * as YAML from "yaml";

/**
 * Creates a YAML scalar that will be serialized in block literal format (|-)
 * This ensures that script content is always formatted with pipes for multiline scripts
 * and handles template literal indentation properly
 */
export function createBlockLiteralScalar(content: string): any {
	// Check if the content has multiple lines
	if (content.includes("\n")) {
		// Split into lines and handle template literal formatting
		let lines = content.split("\n");

		// Remove leading and trailing empty lines
		while (lines.length > 0 && lines[0].trim() === "") {
			lines.shift();
		}
		while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
			lines.pop();
		}

		if (lines.length === 0) {
			return "";
		}

		// Find the minimum indentation from non-empty lines
		const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
		if (nonEmptyLines.length === 0) {
			return lines.join("\n");
		}

		let minIndent = Infinity;
		for (const line of nonEmptyLines) {
			const leadingWhitespace = line.match(/^[ \t]*/)?.[0] || "";
			minIndent = Math.min(minIndent, leadingWhitespace.length);
		}

		// Remove the common indentation from all lines
		const normalizedLines = lines.map((line) => {
			if (line.trim().length === 0) {
				return ""; // Keep empty lines as empty
			}
			// Remove the minimum indentation, but preserve any additional indentation
			return line.slice(minIndent);
		});

		const normalizedContent = normalizedLines.join("\n");

		const scalar = new YAML.Scalar(normalizedContent);
		scalar.type = YAML.Scalar.BLOCK_LITERAL;
		return scalar;
	}

	// For single line content, return as regular string
	return content.trim();
}
