/**
 * Template Expression Pipeline Example
 *
 * This example demonstrates the CONCEPT of template expressions
 * in Azure DevOps pipelines at different levels.
 *
 * Template expressions allow for conditional rendering of pipeline elements
 * based on parameters, variables, and runtime conditions.
 */


// Template expressions are conditional statements that control pipeline rendering
// They use the syntax: ${{ if condition }}: content
// And can include else clauses: ${{ else }}: alternate content


// 1. STAGE-LEVEL TEMPLATE EXPRESSIONS

// 2. JOB-LEVEL TEMPLATE EXPRESSIONS

// 3. STEP-LEVEL TEMPLATE EXPRESSIONS

// 4. COMPLEX TEMPLATE EXPRESSIONS

// 5. TEMPLATE EXPRESSION FUNCTIONS

// 6. VARIABLE AND PARAMETER REFERENCES

// 7. PRACTICAL EXAMPLES

// 8. PROPOSED CDK API


export const templateExpressionConcepts = {
	stageLevelConditions: true,
	jobLevelConditions: true,
	stepLevelConditions: true,
	complexExpressions: true,
	functions: ["eq", "ne", "and", "or", "contains", "succeeded", "failed"],
	variableReferences: true,
	parameterReferences: true,
	proposedAPI: "TemplateExpression class with if/else methods"
};

