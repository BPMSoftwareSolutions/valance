using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using RX.Architecture.Validator.Console.Models;

namespace RX.Architecture.Validator.Console.Validators
{
    /// <summary>
    /// Validates runtime function bindings and scope issues that could cause
    /// "function is not defined" errors at runtime
    /// </summary>
    public class RuntimeBindingValidator
    {
        public async Task<RuntimeBindingValidationResult> ValidateRuntimeBindings(string symphonyPath)
        {
            var result = new RuntimeBindingValidationResult();

            try
            {
                // Get all TypeScript/JavaScript files in the symphony
                var files = Directory.GetFiles(symphonyPath, "*.ts")
                    .Concat(Directory.GetFiles(symphonyPath, "*.js"))
                    .ToList();

                // Also check related application files that might use symphony components
                var projectRoot = FindProjectRoot(symphonyPath);
                if (projectRoot != null)
                {
                    var appFiles = Directory.GetFiles(Path.Combine(projectRoot, "src"), "*.tsx", SearchOption.AllDirectories)
                        .Concat(Directory.GetFiles(Path.Combine(projectRoot, "src"), "*.ts", SearchOption.AllDirectories))
                        .Where(f => Path.GetFileName(f).Equals("App.tsx", StringComparison.OrdinalIgnoreCase) ||
                                   Path.GetFileName(f).Contains("Canvas"))
                        .ToList();

                    files.AddRange(appFiles);
                }

                foreach (var filePath in files)
                {
                    System.Console.WriteLine($"[DEBUG] Analyzing file: {Path.GetFileName(filePath)}");
                    var fileResult = await ValidateFileBindings(filePath);
                    result.FileResults.Add(fileResult);
                    result.TotalViolations += fileResult.Violations.Count;
                    System.Console.WriteLine($"[DEBUG] Found {fileResult.Violations.Count} violations in {Path.GetFileName(filePath)}");
                }

                result.IsCompliant = result.TotalViolations == 0;
                result.FilesChecked = files.Count;
            }
            catch (Exception ex)
            {
                result.ValidationErrors.Add($"Runtime binding validation failed: {ex.Message}");
            }

            return result;
        }

        private string? FindProjectRoot(string symphonyPath)
        {
            var current = new DirectoryInfo(symphonyPath);
            while (current != null)
            {
                if (current.GetFiles("package.json").Any() ||
                    current.GetDirectories("src").Any())
                {
                    return current.FullName;
                }
                current = current.Parent;
            }
            return null;
        }

        private async Task<RuntimeBindingFileResult> ValidateFileBindings(string filePath)
        {
            var result = new RuntimeBindingFileResult
            {
                FilePath = filePath,
                FileName = Path.GetFileName(filePath)
            };

            try
            {
                var content = await File.ReadAllTextAsync(filePath);

                // Extract function definitions in this file with their component scope
                var definedFunctions = ExtractFunctionDefinitions(content);
                var componentScopes = ExtractComponentScopes(content);

                // Extract function calls/references with their component context
                var functionReferences = ExtractFunctionReferences(content);

                if (result.FileName.Contains("App.tsx"))
                {
                    System.Console.WriteLine($"[DEBUG] App.tsx - Found {definedFunctions.Count} functions, {componentScopes.Count} components, {functionReferences.Count} references");
                    foreach (var scope in componentScopes)
                    {
                        System.Console.WriteLine($"[DEBUG] Component: {scope.ComponentName} (lines {scope.StartLine}-{scope.EndLine})");
                    }
                    foreach (var func in definedFunctions.Where(f => f.Name.Contains("handleCanvas")))
                    {
                        System.Console.WriteLine($"[DEBUG] Found handleCanvas definition: {func.Name} at line {func.LineNumber}");
                        var containingScope = componentScopes.FirstOrDefault(s => func.LineNumber >= s.StartLine && func.LineNumber <= s.EndLine);
                        if (containingScope != null)
                        {
                            System.Console.WriteLine($"[DEBUG] Function {func.Name} is defined in component {containingScope.ComponentName}");
                        }
                        else
                        {
                            System.Console.WriteLine($"[DEBUG] Function {func.Name} is defined globally (outside any component)");
                        }
                    }
                    foreach (var reference in functionReferences.Where(r => r.FunctionName.Contains("handleCanvas")))
                    {
                        System.Console.WriteLine($"[DEBUG] Found handleCanvas reference: {reference.FunctionName} at line {reference.LineNumber}");
                        var containingScope = componentScopes.FirstOrDefault(s => reference.LineNumber >= s.StartLine && reference.LineNumber <= s.EndLine);
                        if (containingScope != null)
                        {
                            System.Console.WriteLine($"[DEBUG] Reference {reference.FunctionName} is in component {containingScope.ComponentName}");
                        }
                        else
                        {
                            System.Console.WriteLine($"[DEBUG] Reference {reference.FunctionName} is outside any component");
                        }
                    }
                }

                // Check for undefined function references
                foreach (var reference in functionReferences)
                {
                    if (!IsFunctionAccessibleInScope(reference, definedFunctions, componentScopes, content))
                    {
                        System.Console.WriteLine($"[DEBUG] Found undefined function: {reference.FunctionName} at line {reference.LineNumber} in {result.FileName}");
                        result.Violations.Add(new RuntimeBindingViolation
                        {
                            Type = "UndefinedFunction",
                            FunctionName = reference.FunctionName,
                            LineNumber = reference.LineNumber,
                            Description = $"Function '{reference.FunctionName}' is referenced but not defined in accessible scope",
                            Severity = "Critical",
                            SuggestedFix = $"Define '{reference.FunctionName}' in the same component scope or pass it as a prop"
                        });
                    }
                }

                result.IsCompliant = result.Violations.Count == 0;
            }
            catch (Exception ex)
            {
                result.ValidationErrors.Add($"Error validating {filePath}: {ex.Message}");
            }

            return result;
        }

        private List<FunctionDefinition> ExtractFunctionDefinitions(string content)
        {
            var functions = new List<FunctionDefinition>();
            
            // Pattern for function declarations: const functionName = (...) => { ... }
            var constFunctionPattern = @"const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>\s*\{|\([^)]*\)\s*:\s*[^=]*=>\s*\{)";
            var constMatches = Regex.Matches(content, constFunctionPattern);
            
            foreach (Match match in constMatches)
            {
                functions.Add(new FunctionDefinition
                {
                    Name = match.Groups[1].Value,
                    LineNumber = GetLineNumber(content, match.Index),
                    Type = "ArrowFunction"
                });
            }

            // Pattern for regular function declarations: function functionName(...) { ... }
            var functionPattern = @"function\s+(\w+)\s*\([^)]*\)\s*\{";
            var functionMatches = Regex.Matches(content, functionPattern);

            foreach (Match match in functionMatches)
            {
                functions.Add(new FunctionDefinition
                {
                    Name = match.Groups[1].Value,
                    LineNumber = GetLineNumber(content, match.Index),
                    Type = "FunctionDeclaration"
                });
            }

            // Pattern for exported function declarations: export function functionName(...) { ... }
            var exportFunctionPattern = @"export\s+function\s+(\w+)\s*\([^)]*\)\s*\{";
            var exportFunctionMatches = Regex.Matches(content, exportFunctionPattern);

            foreach (Match match in exportFunctionMatches)
            {
                functions.Add(new FunctionDefinition
                {
                    Name = match.Groups[1].Value,
                    LineNumber = GetLineNumber(content, match.Index),
                    Type = "ExportedFunctionDeclaration"
                });
            }

            return functions;
        }

        private List<FunctionReference> ExtractFunctionReferences(string content)
        {
            var references = new List<FunctionReference>();

            // Pattern for event handler references: onDragStart={(e) => functionName(e, ...)}
            var eventHandlerPattern = @"on\w+\s*=\s*\{[^}]*(\w+)\s*\([^)]*\)[^}]*\}";
            var eventMatches = Regex.Matches(content, eventHandlerPattern);

            foreach (Match match in eventMatches)
            {
                var functionName = match.Groups[1].Value;
                // Skip common React event handler patterns and built-in functions
                if (!IsBuiltInFunction(functionName))
                {
                    references.Add(new FunctionReference
                    {
                        FunctionName = functionName,
                        LineNumber = GetLineNumber(content, match.Index),
                        Context = "EventHandler"
                    });
                }
            }

            // More specific pattern for React event handlers: onDragStart={(e) => handleCanvasElementDragStart(e, element)}
            var reactEventPattern = @"on\w+\s*=\s*\{\s*\([^)]*\)\s*=>\s*(\w+)\s*\(";
            var reactMatches = Regex.Matches(content, reactEventPattern);

            foreach (Match match in reactMatches)
            {
                var functionName = match.Groups[1].Value;
                if (!IsBuiltInFunction(functionName))
                {
                    references.Add(new FunctionReference
                    {
                        FunctionName = functionName,
                        LineNumber = GetLineNumber(content, match.Index),
                        Context = "ReactEventHandler"
                    });
                }
            }

            // Pattern for direct function calls: functionName(...) but exclude method calls like obj.method()
            // Use a simpler approach to avoid regex issues
            var functionCallPattern = @"(\w+)\s*\(";
            var callMatches = Regex.Matches(content, functionCallPattern);

            foreach (Match match in callMatches)
            {
                var functionName = match.Groups[1].Value;

                // Skip if it's a built-in function or React keyword
                if (IsBuiltInFunction(functionName) || IsReactKeyword(functionName))
                    continue;

                // Skip if it's a function declaration
                var beforeMatch = match.Index > 5 ? content.Substring(match.Index - 5, 5) : "";
                if (beforeMatch.Contains("function") || beforeMatch.Contains("const") || beforeMatch.Contains("let") || beforeMatch.Contains("var"))
                    continue;

                // Skip if it's a method call (preceded by a dot)
                var charBeforeMatch = match.Index > 0 ? content[match.Index - 1] : ' ';
                if (charBeforeMatch == '.')
                    continue;

                // Skip if it's preceded by a dot with possible whitespace
                var beforeContext = match.Index > 10 ? content.Substring(match.Index - 10, 10) : "";
                if (beforeContext.TrimEnd().EndsWith("."))
                    continue;

                // Skip if it's a method call on a known object (e.g., Date.now(), Math.floor())
                var beforeWord = match.Index > 20 ? content.Substring(match.Index - 20, 20) : "";
                if (Regex.IsMatch(beforeWord, @"\b(Date|Math|JSON|Object|Array|String|Number|console|document|window|localStorage|sessionStorage)\s*\.\s*$"))
                    continue;

                references.Add(new FunctionReference
                {
                    FunctionName = functionName,
                    LineNumber = GetLineNumber(content, match.Index),
                    Context = "FunctionCall"
                });
            }

            return references;
        }

        private bool IsFunctionAccessible(FunctionReference reference, List<FunctionDefinition> definedFunctions, string content)
        {
            // Check if function is defined in the same file
            if (definedFunctions.Any(f => f.Name == reference.FunctionName))
            {
                return true;
            }

            // Check if function is imported
            var importPattern = $@"import\s*\{{[^}}]*{reference.FunctionName}[^}}]*\}}\s*from";
            if (Regex.IsMatch(content, importPattern))
            {
                return true;
            }

            // Check if it's a prop (passed from parent component) - more comprehensive patterns
            var propPatterns = new[]
            {
                $@"{reference.FunctionName}\s*[,\s]", // In parameter list
                $@"{reference.FunctionName}\s*:", // In object destructuring
                $@"{reference.FunctionName}\s*=", // As assignment
                $@"const\s*\{{\s*[^}}]*{reference.FunctionName}[^}}]*\}}\s*=", // Destructuring
                $@"function\s*\([^)]*{reference.FunctionName}[^)]*\)", // Function parameter
                $@"\([^)]*{reference.FunctionName}[^)]*\)\s*=>" // Arrow function parameter
            };

            foreach (var pattern in propPatterns)
            {
                if (Regex.IsMatch(content, pattern))
                {
                    return true;
                }
            }

            // Check if it's defined in a parent scope (React component pattern)
            var componentPattern = @"const\s+\w+\s*:\s*React\.FC.*=.*\(\s*\{[^}]*\}\s*\)\s*=>";
            if (Regex.IsMatch(content, componentPattern))
            {
                // This is a React functional component, check if function is in props
                var propsPattern = $@"\{{\s*[^}}]*{reference.FunctionName}[^}}]*\}}";
                if (Regex.IsMatch(content, propsPattern))
                {
                    return true;
                }
            }

            return false;
        }

        private bool IsBuiltInFunction(string functionName)
        {
            var builtInFunctions = new HashSet<string>
            {
                // JavaScript built-ins
                "console", "setTimeout", "setInterval", "clearTimeout", "clearInterval",
                "parseInt", "parseFloat", "isNaN", "isFinite", "encodeURIComponent",
                "decodeURIComponent", "Math", "Date", "JSON", "Object", "Array",
                "String", "Number", "Boolean", "RegExp", "Error", "Promise", "Set", "Map", "WeakSet", "WeakMap",
                "e", "event", "preventDefault", "stopPropagation", "target", "currentTarget",
                "require", "import", "export", "return", "if", "else", "for", "while",
                "switch", "case", "break", "continue", "try", "catch", "finally", "throw",

                // JavaScript object methods (commonly used without explicit object reference)
                "log", "warn", "error", "info", "debug", // console methods
                "round", "floor", "ceil", "abs", "max", "min", "random", // Math methods
                "parse", "stringify", // JSON methods
                "keys", "values", "entries", "assign", "create", "freeze", // Object methods
                "isArray", "from", "of", // Array methods
                "push", "pop", "shift", "unshift", "slice", "splice", "concat", "join",
                "map", "filter", "reduce", "forEach", "find", "findIndex", "includes",
                "indexOf", "lastIndexOf", "sort", "reverse", "every", "some",

                // Date methods
                "toISOString", "toDateString", "toTimeString", "toLocaleDateString", "toLocaleTimeString",
                "getTime", "getFullYear", "getMonth", "getDate", "getDay", "getHours", "getMinutes", "getSeconds",
                "setFullYear", "setMonth", "setDate", "setHours", "setMinutes", "setSeconds",

                // DOM methods and properties
                "getElementById", "querySelector", "querySelectorAll", "createElement",
                "appendChild", "removeChild", "addEventListener", "removeEventListener",
                "getBoundingClientRect", "getComputedStyle", "setAttribute", "getAttribute",
                "classList", "className", "innerHTML", "textContent", "value",
                "focus", "blur", "click", "submit", "reset", "remove", "add", "toggle", "contains",
                "removeItem", "setItem", "getItem", "clear", // localStorage/sessionStorage methods

                // Common utility functions that might be globally available
                "now", "clear", "set", "get", "has", "delete", "size", "length",
                "toString", "valueOf", "hasOwnProperty", "propertyIsEnumerable",

                // Event-related
                "setData", "getData", "clearData", "effectAllowed", "dropEffect",

                // CSS functions (used in template literals and style objects)
                "rgba", "rgb", "hsl", "hsla", "calc", "var", "url", "linear-gradient", "radial-gradient",
                "translateX", "translateY", "translate", "scale", "rotate", "skew", "matrix",

                // RenderX specific functions that might be globally available
                "defineSequence", "startSequence", "startCanvasLibraryDropFlow"
            };

            return builtInFunctions.Contains(functionName);
        }

        private bool IsReactKeyword(string functionName)
        {
            var reactKeywords = new HashSet<string>
            {
                "React", "useState", "useEffect", "useCallback", "useMemo", "useRef",
                "useContext", "useReducer", "useLayoutEffect", "useImperativeHandle",
                "createElement", "Fragment", "Component", "PureComponent", "memo",
                "forwardRef", "lazy", "Suspense", "StrictMode", "createContext",
                "createRef", "cloneElement", "isValidElement", "Children"
            };

            return reactKeywords.Contains(functionName);
        }

        private bool IsReactStateSetterPattern(string functionName, string content)
        {
            // Check if this follows the React useState setter pattern: set[StateName]
            if (!functionName.StartsWith("set") || functionName.Length <= 3)
                return false;

            // Look for corresponding useState declaration
            var stateName = functionName.Substring(3); // Remove "set" prefix
            var lowerStateName = char.ToLower(stateName[0]) + stateName.Substring(1);

            // Pattern: const [stateName, setStateName] = useState(...)
            var useStatePattern = $@"const\s*\[\s*{lowerStateName}\s*,\s*{functionName}\s*\]\s*=\s*useState";
            return Regex.IsMatch(content, useStatePattern);
        }

        private List<ComponentScope> ExtractComponentScopes(string content)
        {
            var scopes = new List<ComponentScope>();

            // Pattern for React functional components: const ComponentName: React.FC = (...) => {
            var componentPattern = @"const\s+(\w+)\s*:\s*React\.FC[^=]*=\s*\([^)]*\)\s*=>\s*\{";
            var matches = Regex.Matches(content, componentPattern);

            foreach (Match match in matches)
            {
                var componentName = match.Groups[1].Value;
                var startLine = GetLineNumber(content, match.Index);
                var endLine = FindComponentEndLine(content, match.Index);

                scopes.Add(new ComponentScope
                {
                    ComponentName = componentName,
                    StartLine = startLine,
                    EndLine = endLine
                });
            }

            return scopes;
        }

        private int FindComponentEndLine(string content, int startIndex)
        {
            // Find the arrow function start: => {
            var arrowIndex = content.IndexOf("=> {", startIndex);
            if (arrowIndex == -1) return GetLineNumber(content, content.Length);

            // Start counting braces from the arrow function opening brace
            var braceCount = 0;
            var foundOpeningBrace = false;

            for (int i = arrowIndex; i < content.Length; i++)
            {
                if (content[i] == '{')
                {
                    braceCount++;
                    foundOpeningBrace = true;
                }
                else if (content[i] == '}')
                {
                    braceCount--;
                    if (foundOpeningBrace && braceCount == 0)
                    {
                        // Look for the semicolon that ends the component declaration
                        for (int j = i + 1; j < content.Length && j < i + 10; j++)
                        {
                            if (content[j] == ';')
                            {
                                return GetLineNumber(content, j);
                            }
                        }
                        return GetLineNumber(content, i);
                    }
                }
            }

            return GetLineNumber(content, content.Length);
        }

        private bool IsFunctionAccessibleInScope(FunctionReference reference, List<FunctionDefinition> definedFunctions,
            List<ComponentScope> componentScopes, string content)
        {
            // First check if it's a built-in function
            if (IsBuiltInFunction(reference.FunctionName) || IsReactKeyword(reference.FunctionName))
            {
                return true;
            }

            // Check if it's a React useState setter pattern
            if (IsReactStateSetterPattern(reference.FunctionName, content))
            {
                return true;
            }

            // Find which component scope the reference is in
            var referenceScope = componentScopes.FirstOrDefault(scope =>
                reference.LineNumber >= scope.StartLine && reference.LineNumber <= scope.EndLine);

            // Check if function is defined in the same component scope
            if (referenceScope != null)
            {
                var functionsInScope = definedFunctions.Where(f =>
                    f.LineNumber >= referenceScope.StartLine && f.LineNumber <= referenceScope.EndLine).ToList();

                if (functionsInScope.Any(f => f.Name == reference.FunctionName))
                {
                    return true;
                }
            }

            // Check if function is defined globally (outside any component)
            var globalFunctions = definedFunctions.Where(f =>
                !componentScopes.Any(scope => f.LineNumber >= scope.StartLine && f.LineNumber <= scope.EndLine)).ToList();

            if (globalFunctions.Any(f => f.Name == reference.FunctionName))
            {
                return true;
            }

            // Check if function is defined in a different component (this should be a violation)
            var functionDefinition = definedFunctions.FirstOrDefault(f => f.Name == reference.FunctionName);
            if (functionDefinition != null)
            {
                var functionScope = componentScopes.FirstOrDefault(scope =>
                    functionDefinition.LineNumber >= scope.StartLine && functionDefinition.LineNumber <= scope.EndLine);

                if (functionScope != null && referenceScope != null && functionScope.ComponentName != referenceScope.ComponentName)
                {
                    // Function is defined in a different component - this is a scope violation
                    return false;
                }
            }

            // Use the original accessibility check for imports, props, etc.
            return IsFunctionAccessible(reference, definedFunctions, content);
        }

        private int GetLineNumber(string content, int index)
        {
            return content.Substring(0, index).Count(c => c == '\n') + 1;
        }
    }

    // Supporting classes
    public class RuntimeBindingValidationResult
    {
        public bool IsCompliant { get; set; }
        public int FilesChecked { get; set; }
        public int TotalViolations { get; set; }
        public List<RuntimeBindingFileResult> FileResults { get; set; } = new();
        public List<string> ValidationErrors { get; set; } = new();
    }

    public class RuntimeBindingFileResult
    {
        public string FilePath { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public bool IsCompliant { get; set; }
        public List<RuntimeBindingViolation> Violations { get; set; } = new();
        public List<string> ValidationErrors { get; set; } = new();
    }

    public class RuntimeBindingViolation
    {
        public string Type { get; set; } = string.Empty;
        public string FunctionName { get; set; } = string.Empty;
        public int LineNumber { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string SuggestedFix { get; set; } = string.Empty;
    }

    public class FunctionDefinition
    {
        public string Name { get; set; } = string.Empty;
        public int LineNumber { get; set; }
        public string Type { get; set; } = string.Empty;
    }

    public class FunctionReference
    {
        public string FunctionName { get; set; } = string.Empty;
        public int LineNumber { get; set; }
        public string Context { get; set; } = string.Empty;
    }

    public class ComponentScope
    {
        public string ComponentName { get; set; } = string.Empty;
        public int StartLine { get; set; }
        public int EndLine { get; set; }
    }
}
