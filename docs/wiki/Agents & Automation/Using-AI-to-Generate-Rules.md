# Using AI to Generate Rules

Leverage AI agents to automatically generate Valence validation rules, making architecture governance more intelligent and adaptive.

## AI-Assisted Rule Generation

### Overview
AI agents can analyze your codebase and automatically generate appropriate validation rules, reducing the manual effort required to establish architecture governance.

### Benefits
- **Faster Setup** - Generate rules in minutes instead of hours
- **Pattern Recognition** - AI identifies architectural patterns you might miss
- **Consistency** - Ensures comprehensive rule coverage
- **Adaptation** - Rules evolve with your codebase

## Agent Prompts for Rule Generation

### Basic Rule Generation Prompt
```
Analyze this codebase and generate Valence validation rules:

Context:
- Technology: React/TypeScript
- Architecture: Component-based with hooks
- Standards: ESLint, Prettier, Jest

Requirements:
1. Component naming conventions
2. Import restrictions
3. File structure validation
4. Documentation requirements

Generate JSON validator definitions for each requirement.
```

### Sequence-Specific Rule Generation
```
Analyze these RenderX sequence files and generate comprehensive validation rules:

Files: [paste sequence file contents]

Generate validators for:
1. Required fields (name, description, key, tempo, movements)
2. Musical properties (key signatures, tempo ranges)
3. Beat structure and dependencies
4. Event type naming conventions
5. Documentation quality standards

Output: Complete JSON validator definitions with appropriate operators and plugins.
```

### Domain-Specific Rule Generation
```
Create Valence validation rules for a [DOMAIN] application:

Domain: [e.g., E-commerce, Healthcare, Financial Services]
Technology Stack: [e.g., React, Node.js, PostgreSQL]
Team Size: [e.g., 5-10 developers]
Compliance Requirements: [e.g., HIPAA, PCI-DSS, SOX]

Generate:
1. File organization rules
2. Security validation rules
3. Performance guidelines
4. Documentation standards
5. Testing requirements

Format: JSON validator definitions with explanatory comments.
```

## AI-Generated Rule Examples

### Component Structure Rules (AI Generated)
```json
// Generated by AI analysis of React codebase
{
  "name": "react-component-structure",
  "description": "AI-generated component structure validation",
  "type": "structure",
  "filePattern": "src/components/.*Component\\.(jsx|tsx)$",
  "rules": [
    {
      "operator": "fileExists",
      "value": ["index.js", "Component.jsx", "Component.test.js", "Component.stories.js"],
      "message": "Components must follow the established structure pattern"
    }
  ]
}
```

### Security Rules (AI Generated)
```json
// Generated by AI security analysis
{
  "name": "security-validation",
  "description": "AI-generated security validation rules",
  "type": "content",
  "filePattern": ".*\\.(js|ts|jsx|tsx)$",
  "rules": [
    {
      "operator": "mustNotContain",
      "value": "eval\\(|innerHTML\\s*=|document\\.write",
      "message": "Avoid potentially unsafe JavaScript patterns"
    },
    {
      "operator": "mustNotContain",
      "value": "process\\.env\\.[A-Z_]+",
      "message": "Environment variables should not be directly accessed in frontend code"
    }
  ]
}
```

### Performance Rules (AI Generated)
```json
// Generated by AI performance analysis
{
  "name": "performance-validation",
  "description": "AI-generated performance validation rules",
  "type": "content",
  "filePattern": ".*\\.(jsx|tsx)$",
  "rules": [
    {
      "operator": "mustContain",
      "value": "React\\.memo|useMemo|useCallback",
      "message": "Consider using React optimization hooks for performance"
    },
    {
      "plugin": "validateBundleSize",
      "maxSize": "50kb",
      "message": "Component bundle size exceeds recommended limit"
    }
  ]
}
```

## Interactive Rule Generation

### Conversational Rule Creation
```
Human: I need validation rules for my GraphQL API files.

AI: I'll help you create GraphQL validation rules. Let me ask a few questions:

1. What file extensions do you use? (.graphql, .gql, .js for resolvers?)
2. Do you have naming conventions for queries/mutations?
3. Are there required fields in your schema definitions?
4. Do you need validation for resolver functions?

Based on your answers, I'll generate appropriate Valence validators.
