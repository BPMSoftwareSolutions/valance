using RX.Architecture.Validator.Console.Models;
using RX.Architecture.Validator.Console.Core;
using System.Text.RegularExpressions;

namespace RX.Architecture.Validator.Console.Validators;

/// <summary>
/// Validates function availability in MusicalSequencesAPI
/// Detects missing functions, typos, and export/import mismatches that cause runtime failures
/// </summary>
public class FunctionAvailabilityValidator
{
    private readonly ImportResolver _importResolver;
    private static readonly Dictionary<string, HashSet<string>> ApiNamespaceCache = new();

    public FunctionAvailabilityValidator()
    {
        _importResolver = new ImportResolver();
    }

    /// <summary>
    /// Validates function calls against MusicalSequencesAPI availability
    /// </summary>
    public async Task<List<FunctionAvailabilityViolation>> ValidateFunctionAvailability(string filePath)
    {
        var violations = new List<FunctionAvailabilityViolation>();

        if (!File.Exists(filePath))
        {
            return violations;
        }

        var fileContent = await File.ReadAllTextAsync(filePath);

        // Find MusicalSequencesAPI function calls
        var functionCalls = ExtractMusicalSequencesAPIFunctionCalls(fileContent);

        if (!functionCalls.Any())
        {
            return violations; // No API calls to validate
        }

        // Get available functions from MusicalSequencesAPI
        var availableFunctions = await GetAvailableMusicalSequencesAPIFunctions(filePath);

        // Validate each function call
        foreach (var functionCall in functionCalls)
        {
            var lineNumber = GetLineNumber(fileContent, functionCall.Position);
            
            if (!IsFunctionAvailable(functionCall, availableFunctions))
            {
                violations.Add(new FunctionAvailabilityViolation
                {
                    RuleName = "MISSING_API_FUNCTION",
                    Description = $"Function '{functionCall.FullPath}' is not available in MusicalSequencesAPI",
                    FilePath = filePath,
                    LineNumber = lineNumber,
                    FunctionName = functionCall.FunctionName,
                    Namespace = functionCall.Namespace,
                    FullPath = functionCall.FullPath,
                    Severity = ViolationSeverity.Critical,
                    AvailableFunctions = GetAvailableFunctionsForNamespace(functionCall.Namespace, availableFunctions)
                });
            }
        }

        return violations;
    }

    /// <summary>
    /// Extracts MusicalSequencesAPI function calls from file content
    /// </summary>
    private List<FunctionCall> ExtractMusicalSequencesAPIFunctionCalls(string content)
    {
        var functionCalls = new List<FunctionCall>();

        // Pattern: MusicalSequencesAPI.namespace.functionName(
        var apiCallPattern = @"MusicalSequencesAPI\.([a-zA-Z_][a-zA-Z0-9_]*)\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\(";
        var matches = Regex.Matches(content, apiCallPattern);

        foreach (Match match in matches)
        {
            var namespaceName = match.Groups[1].Value;
            var functionName = match.Groups[2].Value;
            var fullPath = $"MusicalSequencesAPI.{namespaceName}.{functionName}";

            functionCalls.Add(new FunctionCall
            {
                Namespace = namespaceName,
                FunctionName = functionName,
                FullPath = fullPath,
                Position = match.Index
            });
        }

        return functionCalls;
    }

    /// <summary>
    /// Gets available functions from MusicalSequencesAPI by parsing the sequences/index.ts file
    /// </summary>
    private async Task<Dictionary<string, HashSet<string>>> GetAvailableMusicalSequencesAPIFunctions(string currentFile)
    {
        // Find the sequences/index.ts file that contains MusicalSequencesAPI definition
        var sequencesIndexPath = await FindSequencesIndexFile(currentFile);
        
        if (sequencesIndexPath == null)
        {
            return new Dictionary<string, HashSet<string>>();
        }

        // Use cache if available
        if (ApiNamespaceCache.ContainsKey(sequencesIndexPath))
        {
            return ApiNamespaceCache[sequencesIndexPath].ToDictionary(
                ns => ns, 
                ns => ApiNamespaceCache[sequencesIndexPath]
            );
        }

        var content = await File.ReadAllTextAsync(sequencesIndexPath);
        var availableFunctions = ParseMusicalSequencesAPIDefinition(content);

        // Cache the results
        foreach (var kvp in availableFunctions)
        {
            if (!ApiNamespaceCache.ContainsKey(sequencesIndexPath))
            {
                ApiNamespaceCache[sequencesIndexPath] = new HashSet<string>();
            }
        }

        return availableFunctions;
    }

    /// <summary>
    /// Finds the sequences/index.ts file that contains MusicalSequencesAPI
    /// </summary>
    private async Task<string?> FindSequencesIndexFile(string currentFile)
    {
        try
        {
            var currentDir = Path.GetDirectoryName(currentFile);
            if (currentDir == null) return null;

            // Look for sequences/index.ts in the project structure
            var possiblePaths = new[]
            {
                Path.Combine(currentDir, "communication", "sequences", "index.ts"),
                Path.Combine(currentDir, "..", "communication", "sequences", "index.ts"),
                Path.Combine(currentDir, "..", "..", "communication", "sequences", "index.ts"),
                Path.Combine(currentDir, "..", "..", "..", "communication", "sequences", "index.ts"),
                Path.Combine(currentDir, "..", "..", "..", "..", "communication", "sequences", "index.ts"),
                Path.Combine(currentDir, "..", "..", "..", "..", "..", "communication", "sequences", "index.ts")
            };

            foreach (var path in possiblePaths)
            {
                var fullPath = Path.GetFullPath(path);
                if (File.Exists(fullPath))
                {
                    var content = await File.ReadAllTextAsync(fullPath);
                    if (content.Contains("MusicalSequencesAPI"))
                    {
                        return fullPath;
                    }
                }
            }

            return null;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Parses MusicalSequencesAPI definition from sequences/index.ts content
    /// </summary>
    private Dictionary<string, HashSet<string>> ParseMusicalSequencesAPIDefinition(string content)
    {
        var availableFunctions = new Dictionary<string, HashSet<string>>();

        // Find the MusicalSequencesAPI object definition
        var apiPattern = @"const\s+MusicalSequencesAPI\s*=\s*\{([\s\S]*?)\};";
        var apiMatch = Regex.Match(content, apiPattern);

        if (!apiMatch.Success)
        {
            return availableFunctions;
        }

        var apiContent = apiMatch.Groups[1].Value;

        // Extract namespace definitions: namespace: { function1: ..., function2: ... }
        var namespacePattern = @"([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*\{([\s\S]*?)\}";
        var namespaceMatches = Regex.Matches(apiContent, namespacePattern);

        foreach (Match namespaceMatch in namespaceMatches)
        {
            var namespaceName = namespaceMatch.Groups[1].Value;
            var namespaceContent = namespaceMatch.Groups[2].Value;

            if (!availableFunctions.ContainsKey(namespaceName))
            {
                availableFunctions[namespaceName] = new HashSet<string>();
            }

            // Extract function names from namespace content
            var functionPattern = @"([a-zA-Z_][a-zA-Z0-9_]*)\s*:";
            var functionMatches = Regex.Matches(namespaceContent, functionPattern);

            foreach (Match functionMatch in functionMatches)
            {
                var functionName = functionMatch.Groups[1].Value;
                availableFunctions[namespaceName].Add(functionName);
            }
        }

        return availableFunctions;
    }

    /// <summary>
    /// Checks if a function call is available in the API
    /// </summary>
    private bool IsFunctionAvailable(FunctionCall functionCall, Dictionary<string, HashSet<string>> availableFunctions)
    {
        if (!availableFunctions.ContainsKey(functionCall.Namespace))
        {
            return false;
        }

        return availableFunctions[functionCall.Namespace].Contains(functionCall.FunctionName);
    }

    /// <summary>
    /// Gets available functions for a specific namespace for error reporting
    /// </summary>
    private List<string> GetAvailableFunctionsForNamespace(string namespaceName, Dictionary<string, HashSet<string>> availableFunctions)
    {
        if (!availableFunctions.ContainsKey(namespaceName))
        {
            return new List<string> { $"Namespace '{namespaceName}' not found" };
        }

        return availableFunctions[namespaceName].Take(10).ToList(); // Limit for readability
    }

    /// <summary>
    /// Gets the line number for a character position in content
    /// </summary>
    private int GetLineNumber(string content, int position)
    {
        return content.Take(position).Count(c => c == '\n') + 1;
    }
}

/// <summary>
/// Represents a function call found in the code
/// </summary>
public class FunctionCall
{
    public string Namespace { get; set; } = string.Empty;
    public string FunctionName { get; set; } = string.Empty;
    public string FullPath { get; set; } = string.Empty;
    public int Position { get; set; }
}

/// <summary>
/// Represents a function availability violation
/// </summary>
public class FunctionAvailabilityViolation
{
    public string RuleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public int LineNumber { get; set; }
    public string FunctionName { get; set; } = string.Empty;
    public string Namespace { get; set; } = string.Empty;
    public string FullPath { get; set; } = string.Empty;
    public ViolationSeverity Severity { get; set; }
    public List<string> AvailableFunctions { get; set; } = new();
}
