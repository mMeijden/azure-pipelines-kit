# Advanced Examples

This directory contains advanced examples and demonstrations of the Azure Pipelines CDK features. These examples showcase more complex functionality and are primarily intended for developers who want to understand the advanced capabilities of the library.

## Examples Overview

### 📋 Feature Demonstrations

- **`template-expressions-demo.ts`** - Comprehensive demonstration of template expressions at different pipeline levels (conceptual)
- **`direct-expressions-example.ts`** - Shows the ergonomic direct template expression functions
- **`chainable-conditions-example.ts`** - Demonstrates chainable condition syntax
- **`conditional-examples.ts`** - Various conditional logic patterns

### 🧩 Component Examples

- **`all-resources-examples.ts`** - Showcases all available Azure DevOps resource types
- **`all-steps-examples.ts`** - Examples of all available step types
- **`script-step-examples.ts`** - Focused examples for script steps
- **`template-expressions-concept.ts`** - Conceptual overview of template expressions

## Running Examples

To generate YAML output for any complete pipeline example:

```bash
# From the project root
npx ts-node examples/advanced/template-expressions-demo.ts
npx ts-node examples/advanced/direct-expressions-example.ts
npx ts-node examples/advanced/chainable-conditions-example.ts
```

This will create corresponding `.yml` files in the same directory.

## Note on Template Expressions

Some examples in this directory demonstrate **conceptual APIs** for template expressions that are still being implemented. These examples show the intended developer experience and API design, but may not yet be fully functional.

## For Production Use

For production-ready pipeline examples, see the organized examples in the parent directories:

- `../web-applications/` - Web application pipelines
- `../cross-platform/` - Multi-platform builds
- `../microservices/` - Microservice deployment patterns
- `../machine-learning/` - ML model training and deployment
- `../infrastructure/` - Infrastructure as Code pipelines

These advanced examples are primarily for learning about the library's capabilities and understanding the design patterns.
