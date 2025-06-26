# Troubleshooting

## Common Issues

### File is not a module

- Ensure every file you want to import from has at least one `export` statement.

### YAML output includes `_node: {}`

- Make sure your step classes do **not** inherit from `Construct` or any CDK base class.
- Use plain objects/classes for steps.

### Scripts not using block literal in YAML

- All script steps now use the `|-` block literal format for clean multi-line output.

### File-based script step not working

- Ensure the file path is correct and accessible.
- Use `Script.fromFile("./path/to/script.sh")` or `BashStep.fromFile(...)`.

### TypeScript errors about missing properties

- Check the API reference for correct property names and types.

## Getting Help

- Check the [API Reference](./api-reference.md)
- See [Examples](../examples/)
- Open an issue or discussion on GitHub
