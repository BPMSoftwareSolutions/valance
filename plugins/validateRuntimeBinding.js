/**
 * Runtime Binding Validation Plugin
 * Migrated from C# RuntimeBindingValidator.cs
 * Validates runtime function bindings and scope issues that could cause
 * "function is not defined" errors at runtime
 */

import { promises as fs } from 'fs';
import path from 'path';

export const operator = "validateRuntimeBinding";

export async function evaluate(content, rule, context) {
  const violations = [];
  const verbose = rule.verbose || false;
  
  if (verbose) {
    console.log(`🔗 Validating runtime bindings for ${context.filePath}...`);
  }

  try {
    // Extract function definitions and references
    const functionDefinitions = extractFunctionDefinitions(content, verbose);
    const functionReferences = extractFunctionReferences(content, verbose);
    const componentScopes = extractComponentScopes(content, verbose);
    const importedFunctions = extractImportedFunctions(content, verbose);

    if (verbose) {
      console.log(`🔍 [DEBUG] Found ${functionDefinitions.length} function definitions`);
      console.log(`🔍 [DEBUG] Found ${functionReferences.length} function references`);
      console.log(`🔍 [DEBUG] Found ${componentScopes.length} component scopes`);
      console.log(`🔍 [DEBUG] Found ${importedFunctions.length} imported functions`);
    }

    // Check for undefined function references
    for (const reference of functionReferences) {
      if (!isFunctionAccessibleInScope(reference, functionDefinitions, componentScopes, importedFunctions, content, verbose)) {
        const confidence = calculateBindingConfidence(reference, functionDefinitions, componentScopes, content);
        
        violations.push({
          type: 'UndefinedFunction',
          functionName: reference.functionName,
          lineNumber: reference.lineNumber,
          message: `Function '${reference.functionName}' is referenced but not defined in accessible scope`,
          severity: 'error',
          confidence,
          impact: 'Runtime error: function is not defined',
          details: {
            functionName: reference.functionName,
            callLocation: `Line ${reference.lineNumber}`,
            suggestedFix: getSuggestedFix(reference, functionDefinitions, componentScopes, importedFunctions),
            scopeAnalysis: analyzeFunctionScope(reference, componentScopes, content)
          }
        });
      }
    }

    // Check for scope violations (functions called across component boundaries)
    for (const reference of functionReferences) {
      const scopeViolation = checkScopeViolation(reference, functionDefinitions, componentScopes, verbose);
      if (scopeViolation) {
        violations.push({
          type: 'ScopeViolation',
          functionName: reference.functionName,
          lineNumber: reference.lineNumber,
          message: `Function '${reference.functionName}' is called across component boundaries`,
          severity: 'warning',
          confidence: 0.85,
          impact: 'Potential runtime error if component is not rendered',
          details: {
            functionName: reference.functionName,
            callLocation: `Line ${reference.lineNumber}`,
            definitionLocation: scopeViolation.definitionLocation,
            suggestedFix: 'Pass function as prop or move to shared scope',
            scopeAnalysis: scopeViolation.analysis
          }
        });
      }
    }

  } catch (error) {
    violations.push({
      type: 'ValidationError',
      message: `Runtime binding validation failed: ${error.message}`,
      severity: 'error',
      confidence: 1.0,
      impact: 'Unable to validate runtime bindings'
    });
  }

  if (violations.length > 0) {
    return {
      passed: false,
      violations: violations
    };
  }

  return { passed: true };
}

/**
 * Extract function definitions from content
 */
function extractFunctionDefinitions(content, verbose) {
  const definitions = [];
  const lines = content.split('\n');
  
  // Patterns for function definitions
  const patterns = [
    /^\s*function\s+(\w+)\s*\(/,                    // function name()
    /^\s*const\s+(\w+)\s*=\s*\(/,                   // const name = (
    /^\s*const\s+(\w+)\s*=\s*async\s*\(/,           // const name = async (
    /^\s*const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/,       // const name = () =>
    /^\s*(\w+)\s*:\s*\([^)]*\)\s*=>/,               // name: () =>
    /^\s*async\s+(\w+)\s*\(/,                       // async name()
    /^\s*export\s+function\s+(\w+)\s*\(/,           // export function name()
    /^\s*export\s+const\s+(\w+)\s*=/,               // export const name =
    /^function\s+(\w+)\s*\(/                        // function name() (no leading whitespace)
  ];

  lines.forEach((line, index) => {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        definitions.push({
          name: match[1],
          lineNumber: index + 1,
          type: 'function',
          scope: 'local'
        });
        if (verbose) {
          console.log(`🔍 [DEBUG] Found function definition: ${match[1]} at line ${index + 1}`);
        }
        break;
      }
    }
  });

  return definitions;
}

/**
 * Extract function references from content
 */
function extractFunctionReferences(content, verbose) {
  const references = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Skip comments, imports, and strings
    if (line.trim().startsWith('//') ||
        line.trim().startsWith('*') ||
        line.trim().startsWith('/*') ||
        line.trim().startsWith('import ') ||
        line.trim().startsWith('export ')) {
      return;
    }

    // More precise pattern for function calls (not method calls)
    const functionCallPattern = /(?:^|[^.\w])(\w+)\s*\(/g;

    let match;
    while ((match = functionCallPattern.exec(line)) !== null) {
      const functionName = match[1];

      // Skip common JavaScript/React built-ins and keywords
      if (isBuiltInFunction(functionName)) {
        continue;
      }

      // Skip if it's clearly a method call (preceded by dot)
      const beforeMatch = line.substring(0, match.index);
      if (beforeMatch.endsWith('.')) {
        continue;
      }

      // Skip if it's a React component (starts with uppercase)
      if (functionName[0] === functionName[0].toUpperCase()) {
        continue;
      }

      // Skip if it's in a string literal
      const beforeFunction = line.substring(0, match.index);
      const singleQuotes = (beforeFunction.match(/'/g) || []).length;
      const doubleQuotes = (beforeFunction.match(/"/g) || []).length;
      const backticks = (beforeFunction.match(/`/g) || []).length;

      if (singleQuotes % 2 === 1 || doubleQuotes % 2 === 1 || backticks % 2 === 1) {
        continue; // Inside a string
      }

      references.push({
        functionName,
        lineNumber: index + 1,
        context: line.trim()
      });

      if (verbose) {
        console.log(`🔍 [DEBUG] Found function reference: ${functionName} at line ${index + 1}`);
      }
    }
  });

  return references;
}

/**
 * Extract component scopes from content
 */
function extractComponentScopes(content, verbose) {
  const scopes = [];
  const lines = content.split('\n');
  
  // Patterns for React components
  const componentPatterns = [
    /^\s*(?:export\s+)?(?:default\s+)?(?:const|function)\s+(\w+)\s*[=\(]/,
    /^\s*(?:export\s+)?class\s+(\w+)/,
    /^\s*const\s+(\w+)\s*=\s*React\.forwardRef/,
    /^\s*const\s+(\w+)\s*=\s*memo\s*\(/
  ];

  let currentScope = null;
  let braceCount = 0;

  lines.forEach((line, index) => {
    // Check for component start
    if (!currentScope) {
      for (const pattern of componentPatterns) {
        const match = line.match(pattern);
        if (match) {
          currentScope = {
            componentName: match[1],
            startLine: index + 1,
            endLine: -1
          };
          braceCount = 0;
          if (verbose) {
            console.log(`🔍 [DEBUG] Found component scope: ${match[1]} starting at line ${index + 1}`);
          }
          break;
        }
      }
    }

    // Track braces to find component end
    if (currentScope) {
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceCount += openBraces - closeBraces;

      if (braceCount <= 0 && openBraces === 0 && closeBraces > 0) {
        currentScope.endLine = index + 1;
        scopes.push(currentScope);
        if (verbose) {
          console.log(`🔍 [DEBUG] Component scope ${currentScope.componentName} ends at line ${index + 1}`);
        }
        currentScope = null;
      }
    }
  });

  // Handle unclosed scopes
  if (currentScope) {
    currentScope.endLine = lines.length;
    scopes.push(currentScope);
  }

  return scopes;
}

/**
 * Extract imported functions from content
 */
function extractImportedFunctions(content, verbose) {
  const imported = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Match import statements
    const importMatch = line.match(/import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))\s+from/);
    if (importMatch) {
      if (importMatch[1]) {
        // Named imports: import { func1, func2 } from 'module'
        const namedImports = importMatch[1].split(',').map(name => name.trim());
        namedImports.forEach(name => {
          imported.push({
            name: name.replace(/\s+as\s+\w+/, ''), // Remove 'as alias'
            type: 'named',
            lineNumber: index + 1
          });
        });
      } else if (importMatch[2]) {
        // Namespace import: import * as name from 'module'
        imported.push({
          name: importMatch[2],
          type: 'namespace',
          lineNumber: index + 1
        });
      } else if (importMatch[3]) {
        // Default import: import name from 'module'
        imported.push({
          name: importMatch[3],
          type: 'default',
          lineNumber: index + 1
        });
      }
    }
  });

  if (verbose) {
    console.log(`🔍 [DEBUG] Found ${imported.length} imported functions`);
  }

  return imported;
}

/**
 * Check if function is accessible in scope
 */
function isFunctionAccessibleInScope(reference, definitions, scopes, imported, content, verbose) {
  const { functionName, lineNumber } = reference;

  // Check if it's an imported function
  if (imported.some(imp => imp.name === functionName)) {
    return true;
  }

  // Check if it's a built-in function
  if (isBuiltInFunction(functionName)) {
    return true;
  }

  // Check for React hooks (useState returns setter functions)
  if (functionName.startsWith('set') && functionName.length > 3) {
    // Check if it's a useState setter
    if (content.includes(`useState`) || content.includes(`const [`) || content.includes(`let [`)) {
      return true;
    }

    // Check for specific state variable patterns
    const stateVar = functionName.substring(3);
    const camelCaseVar = stateVar.charAt(0).toLowerCase() + stateVar.slice(1);
    if (content.includes(`[${camelCaseVar},`) || content.includes(`${camelCaseVar}:`)) {
      return true;
    }
  }

  // Check for props or destructured variables
  if (content.includes(`props.${functionName}`) ||
      content.includes(`{${functionName}}`) ||
      content.includes(`const { ${functionName} }`) ||
      content.includes(`let { ${functionName} }`) ||
      content.includes(`var { ${functionName} }`)) {
    return true;
  }

  // Check for function passed as prop
  if (content.includes(`${functionName}={`) ||
      content.includes(`${functionName}: `)) {
    return true;
  }

  // Find the scope where this reference occurs
  const referenceScope = scopes.find(scope =>
    lineNumber >= scope.startLine && lineNumber <= scope.endLine
  );

  // Check if function is defined in the same scope
  const functionDefinition = definitions.find(def => def.name === functionName);
  if (functionDefinition) {
    if (!referenceScope) {
      return true; // Global scope
    }

    const definitionScope = scopes.find(scope =>
      functionDefinition.lineNumber >= scope.startLine &&
      functionDefinition.lineNumber <= scope.endLine
    );

    // Same component scope or global scope (function defined outside any component)
    if (!definitionScope || !referenceScope ||
        definitionScope.componentName === referenceScope.componentName) {
      return true;
    }

    // Global function (defined outside any component scope) is accessible everywhere
    if (!definitionScope) {
      return true;
    }
  }

  // Check if it's a callback or event handler pattern
  if (functionName.startsWith('handle') || functionName.startsWith('on')) {
    // These are often passed as props or defined locally
    return true;
  }

  // Check if it's likely an imported utility function
  if (functionName.includes('CSS') ||
      functionName.includes('Style') ||
      functionName.includes('inject') ||
      functionName.includes('generate') ||
      functionName.includes('initialize') ||
      functionName.includes('Communication')) {
    return true;
  }

  // Check if it's a common utility pattern
  if (functionName.endsWith('System') ||
      functionName.endsWith('Service') ||
      functionName.endsWith('Manager') ||
      functionName.endsWith('Handler')) {
    return true;
  }

  return false;
}

/**
 * Check for scope violations
 */
function checkScopeViolation(reference, definitions, scopes, verbose) {
  const { functionName, lineNumber } = reference;
  
  const functionDefinition = definitions.find(def => def.name === functionName);
  if (!functionDefinition) return null;

  const referenceScope = scopes.find(scope => 
    lineNumber >= scope.startLine && lineNumber <= scope.endLine
  );
  
  const definitionScope = scopes.find(scope =>
    functionDefinition.lineNumber >= scope.startLine && 
    functionDefinition.lineNumber <= scope.endLine
  );

  if (referenceScope && definitionScope && 
      referenceScope.componentName !== definitionScope.componentName) {
    return {
      definitionLocation: `${definitionScope.componentName} (Line ${functionDefinition.lineNumber})`,
      analysis: `Function defined in ${definitionScope.componentName} but called in ${referenceScope.componentName}`
    };
  }

  return null;
}

/**
 * Calculate confidence score for binding violation
 */
function calculateBindingConfidence(reference, definitions, scopes, content) {
  let confidence = 0.9; // Base confidence

  // Lower confidence if function name is very common
  const commonNames = ['handle', 'on', 'set', 'get', 'is', 'has', 'can'];
  if (commonNames.some(common => reference.functionName.toLowerCase().includes(common))) {
    confidence -= 0.1;
  }

  // Higher confidence if function looks like a custom function
  if (reference.functionName.includes('Canvas') || 
      reference.functionName.includes('Symphony') ||
      reference.functionName.includes('Sequence')) {
    confidence += 0.05;
  }

  // Lower confidence if it might be a prop
  if (content.includes(`{${reference.functionName}}`) || 
      content.includes(`props.${reference.functionName}`)) {
    confidence -= 0.2;
  }

  return Math.max(0.6, Math.min(1.0, confidence));
}

/**
 * Get suggested fix for undefined function
 */
function getSuggestedFix(reference, definitions, scopes, imported) {
  const { functionName } = reference;

  // Check if function exists in another scope
  const definition = definitions.find(def => def.name === functionName);
  if (definition) {
    return `Pass '${functionName}' as a prop or move to shared scope`;
  }

  // Check if it might be an import
  if (functionName[0] === functionName[0].toLowerCase()) {
    return `Import '${functionName}' from appropriate module`;
  }

  return `Define '${functionName}' in the same component scope or pass as prop`;
}

/**
 * Analyze function scope context
 */
function analyzeFunctionScope(reference, scopes, content) {
  const scope = scopes.find(s => 
    reference.lineNumber >= s.startLine && reference.lineNumber <= s.endLine
  );

  if (scope) {
    return `Called within ${scope.componentName} component (lines ${scope.startLine}-${scope.endLine})`;
  }

  return 'Called in global scope';
}

/**
 * Check if function is a built-in JavaScript/React function
 */
function isBuiltInFunction(name) {
  const builtIns = [
    // JavaScript built-ins
    'console', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
    'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent',
    'JSON', 'Math', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean',
    'Promise', 'fetch', 'alert', 'confirm', 'prompt', 'return', 'throw', 'typeof',

    // React built-ins
    'useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 'useMemo',
    'useRef', 'useImperativeHandle', 'useLayoutEffect', 'useDebugValue',
    'createElement', 'cloneElement', 'isValidElement', 'Fragment',

    // DOM methods and properties
    'addEventListener', 'removeEventListener', 'querySelector', 'querySelectorAll',
    'getElementById', 'getElementsByClassName', 'getElementsByTagName',
    'appendChild', 'removeChild', 'insertBefore', 'replaceChild',
    'getBoundingClientRect', 'scrollIntoView', 'focus', 'blur', 'click',
    'preventDefault', 'stopPropagation', 'target', 'currentTarget',

    // Common utility functions and methods
    'map', 'filter', 'reduce', 'forEach', 'find', 'some', 'every', 'includes',
    'push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'concat', 'join',
    'toString', 'valueOf', 'hasOwnProperty', 'propertyIsEnumerable',
    'split', 'replace', 'match', 'search', 'indexOf', 'lastIndexOf',
    'substring', 'substr', 'charAt', 'charCodeAt', 'toLowerCase', 'toUpperCase',
    'trim', 'trimStart', 'trimEnd', 'padStart', 'padEnd',

    // Common object methods
    'keys', 'values', 'entries', 'assign', 'create', 'defineProperty',
    'getOwnPropertyNames', 'getPrototypeOf', 'setPrototypeOf',

    // Console methods
    'log', 'error', 'warn', 'info', 'debug', 'trace', 'table', 'group', 'groupEnd',

    // Event methods
    'clientX', 'clientY', 'pageX', 'pageY', 'screenX', 'screenY',
    'button', 'buttons', 'which', 'keyCode', 'charCode', 'key', 'code',

    // Common React patterns
    'props', 'state', 'setState', 'forceUpdate', 'render',

    // Keywords and operators (should not be treated as function calls)
    'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
    'try', 'catch', 'finally', 'throw', 'return', 'break', 'continue',
    'var', 'let', 'const', 'function', 'class', 'extends', 'import', 'export',
    'new', 'delete', 'in', 'of', 'instanceof', 'typeof', 'void', 'async', 'await'
  ];

  // Skip very short names (likely operators or keywords)
  if (name.length <= 2) {
    return true;
  }

  // Skip names that start with uppercase (likely constructors or components)
  if (name[0] === name[0].toUpperCase()) {
    return true;
  }

  return builtIns.includes(name);
}
