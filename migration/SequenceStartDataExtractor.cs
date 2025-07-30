using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using RX.Architecture.Validator.Console.Models;

namespace RX.Architecture.Validator.Console.Validators;

/// <summary>
/// Extracts data structures from convenience functions that call startSequence()
/// Focuses on analyzing how convenience functions transform input parameters into startSequence data
/// </summary>
public class SequenceStartDataExtractor
{
    private readonly bool _verbose;

    // Regex patterns for extracting convenience function patterns
    private readonly Regex[] _convenienceFunctionPatterns = {
        // Convenience function definitions (e.g., startCanvasComponentFlow)
        new Regex(@"export\s+const\s+(start\w+Flow)\s*=\s*\(([^)]+)\)\s*=>\s*{([^}]+)}", RegexOptions.Singleline | RegexOptions.Compiled),
        
        // startSequence calls within convenience functions
        new Regex(@"conductorEventBus\.startSequence\s*\(\s*['""]([^'""]+)['""],\s*({.*?})\s*\)", RegexOptions.Singleline | RegexOptions.Compiled),
        
        // Data object construction within convenience functions
        new Regex(@"return\s+conductorEventBus\.startSequence\s*\([^,]+,\s*({.*?})\s*\)", RegexOptions.Singleline | RegexOptions.Compiled),
        
        // Parameter mapping and data transformation within convenience functions
        new Regex(@"(\w+):\s*([^,\n}]+)", RegexOptions.Compiled),
    };

    public SequenceStartDataExtractor(bool verbose = false)
    {
        _verbose = verbose;
    }

    /// <summary>
    /// Extract convenience function contracts from a sequence.ts file
    /// </summary>
    public async Task<List<ConvenienceFunctionContract>> ExtractConvenienceContracts(string sequencePath)
    {
        var contracts = new List<ConvenienceFunctionContract>();
        
        if (!File.Exists(sequencePath))
        {
            if (_verbose)
                System.Console.WriteLine($"⚠️ Sequence file not found: {sequencePath}");
            return contracts;
        }

        var content = await File.ReadAllTextAsync(sequencePath);
        
        if (_verbose)
            System.Console.WriteLine($"🔍 Analyzing convenience functions in: {Path.GetFileName(sequencePath)}");

        // Extract ALL convenience functions (start*Flow functions)
        // First try to find the function declaration and then extract its body separately
        var functionDeclarationMatches = Regex.Matches(content,
            @"export\s+const\s+(start\w+Flow)\s*=\s*\(([^)]+)\)\s*=>\s*{",
            RegexOptions.Multiline);

        var functionMatches = new List<Match>();

        foreach (Match declMatch in functionDeclarationMatches)
        {
            var startIndex = declMatch.Index;
            var braceCount = 0;
            var bodyStart = -1;
            var bodyEnd = -1;

            // Find the opening brace and then match braces to find the end
            for (int i = startIndex; i < content.Length; i++)
            {
                if (content[i] == '{')
                {
                    if (bodyStart == -1) bodyStart = i + 1;
                    braceCount++;
                }
                else if (content[i] == '}')
                {
                    braceCount--;
                    if (braceCount == 0)
                    {
                        bodyEnd = i;
                        break;
                    }
                }
            }

            if (bodyStart != -1 && bodyEnd != -1)
            {
                var functionName = declMatch.Groups[1].Value;
                var parameters = declMatch.Groups[2].Value;
                var body = content.Substring(bodyStart, bodyEnd - bodyStart);

                // Create a synthetic match for compatibility
                var syntheticMatch = new { Groups = new[] {
                    new { Value = declMatch.Value + body + "}" },
                    new { Value = functionName },
                    new { Value = parameters },
                    new { Value = body }
                }, Index = declMatch.Index };

                if (_verbose)
                    System.Console.WriteLine($"  📋 Found convenience function: {functionName}");

                var contract = ExtractConvenienceFunctionContract(functionName, parameters, body, sequencePath, GetLineNumber(content, declMatch.Index));
                if (contract != null)
                {
                    contracts.Add(contract);
                }
            }
        }



        if (_verbose)
            System.Console.WriteLine($"✅ Extracted {contracts.Count} convenience function contracts");

        return contracts;
    }

    /// <summary>
    /// Extract a single convenience function contract
    /// </summary>
    private ConvenienceFunctionContract? ExtractConvenienceFunctionContract(
        string functionName, string parameters, string body, string filePath, int lineNumber)
    {
        try
        {
            // Parse input parameters (e.g., conductorEventBus, element, eventData)
            var inputParams = ParseInputParameters(parameters);

            // Extract startSequence call and data object
            var startSequenceMatch = Regex.Match(body,
                @"conductorEventBus\.startSequence\s*\(\s*['""]([^'""]+)['""],\s*({.*?})\s*\)",
                RegexOptions.Singleline | RegexOptions.Multiline);

            if (startSequenceMatch.Success)
            {
                var sequenceName = startSequenceMatch.Groups[1].Value;
                var dataObject = startSequenceMatch.Groups[2].Value;

                var contract = new ConvenienceFunctionContract
                {
                    FunctionName = functionName,
                    SequenceName = sequenceName,
                    InputParameters = inputParams,
                    DataTransformation = ParseDataTransformation(dataObject),
                    ParameterMapping = ExtractParameterMapping(parameters, dataObject),
                    DataProperties = ExtractDataProperties(dataObject, inputParams),
                    FilePath = filePath,
                    LineNumber = lineNumber
                };

                if (_verbose)
                    System.Console.WriteLine($"    ✅ Extracted contract for {functionName} → {sequenceName}");

                return contract;
            }
            else
            {
                if (_verbose)
                    System.Console.WriteLine($"    ⚠️ No startSequence call found in {functionName}");
            }
        }
        catch (Exception ex)
        {
            if (_verbose)
                System.Console.WriteLine($"    ❌ Error extracting contract for {functionName}: {ex.Message}");
        }

        return null;
    }

    /// <summary>
    /// Parse input parameters from function signature
    /// </summary>
    private List<InputParameter> ParseInputParameters(string parameters)
    {
        var inputParams = new List<InputParameter>();
        
        // Split parameters by comma, handling nested structures
        var paramList = SplitParameters(parameters);
        
        foreach (var param in paramList)
        {
            var trimmedParam = param.Trim();
            if (string.IsNullOrEmpty(trimmedParam) || trimmedParam == "conductorEventBus")
                continue;

            inputParams.Add(new InputParameter
            {
                Name = trimmedParam,
                Type = InferParameterType(trimmedParam),
                IsRequired = !trimmedParam.Contains("?") && !trimmedParam.Contains("="),
                Usage = "direct" // Will be updated based on usage analysis
            });
        }

        return inputParams;
    }

    /// <summary>
    /// Split parameters handling nested structures
    /// </summary>
    private List<string> SplitParameters(string parameters)
    {
        var result = new List<string>();
        var current = "";
        var depth = 0;
        
        for (int i = 0; i < parameters.Length; i++)
        {
            var c = parameters[i];
            
            if (c == '(' || c == '{' || c == '[')
                depth++;
            else if (c == ')' || c == '}' || c == ']')
                depth--;
            else if (c == ',' && depth == 0)
            {
                result.Add(current.Trim());
                current = "";
                continue;
            }
            
            current += c;
        }
        
        if (!string.IsNullOrEmpty(current.Trim()))
            result.Add(current.Trim());
            
        return result;
    }

    /// <summary>
    /// Infer parameter type from name and context
    /// </summary>
    private string InferParameterType(string paramName)
    {
        return paramName.ToLower() switch
        {
            var name when name.Contains("element") => "object",
            var name when name.Contains("event") => "object",
            var name when name.Contains("data") => "object",
            var name when name.Contains("position") => "object",
            var name when name.Contains("bounds") => "object",
            var name when name.Contains("id") => "string",
            var name when name.Contains("type") => "string",
            _ => "unknown"
        };
    }

    /// <summary>
    /// Parse data transformation object
    /// </summary>
    private Dictionary<string, object> ParseDataTransformation(string dataObject)
    {
        var transformation = new Dictionary<string, object>();
        
        // Remove outer braces
        var content = dataObject.Trim().TrimStart('{').TrimEnd('}');
        
        // Extract property mappings
        var propertyMatches = Regex.Matches(content, @"(\w+):\s*([^,\n}]+)", RegexOptions.Compiled);
        
        foreach (Match match in propertyMatches)
        {
            var propertyName = match.Groups[1].Value;
            var propertyValue = match.Groups[2].Value.Trim();
            
            transformation[propertyName] = AnalyzePropertyValue(propertyValue);
        }
        
        return transformation;
    }

    /// <summary>
    /// Analyze property value to determine its type and source
    /// </summary>
    private object AnalyzePropertyValue(string value)
    {
        // Direct parameter reference
        if (Regex.IsMatch(value, @"^\w+$"))
            return new { Type = "parameter", Source = value };
            
        // Property access (e.g., eventData.timestamp)
        if (Regex.IsMatch(value, @"^\w+\.\w+"))
            return new { Type = "property_access", Source = value };
            
        // Function call (e.g., Date.now())
        if (value.Contains("("))
            return new { Type = "function_call", Source = value };
            
        // Template literal (e.g., `canvas-component-${Date.now()}`)
        if (value.Contains("`"))
            return new { Type = "template_literal", Source = value };
            
        // Object literal
        if (value.StartsWith("{"))
            return new { Type = "object_literal", Source = value };
            
        // Fallback or conditional (e.g., eventData.timestamp || Date.now())
        if (value.Contains("||"))
            return new { Type = "conditional", Source = value };
            
        return new { Type = "literal", Source = value };
    }

    /// <summary>
    /// Extract parameter mapping from function parameters to data object
    /// </summary>
    private Dictionary<string, string> ExtractParameterMapping(string parameters, string dataObject)
    {
        var mapping = new Dictionary<string, string>();
        var paramList = SplitParameters(parameters);
        
        foreach (var param in paramList)
        {
            var trimmedParam = param.Trim();
            if (string.IsNullOrEmpty(trimmedParam) || trimmedParam == "conductorEventBus")
                continue;
                
            // Find how this parameter is used in the data object
            var usagePattern = FindParameterUsage(trimmedParam, dataObject);
            if (!string.IsNullOrEmpty(usagePattern))
            {
                mapping[trimmedParam] = usagePattern;
            }
        }
        
        return mapping;
    }

    /// <summary>
    /// Find how a parameter is used in the data object
    /// </summary>
    private string FindParameterUsage(string paramName, string dataObject)
    {
        // Direct mapping (element: element)
        if (Regex.IsMatch(dataObject, $@"\b{paramName}:\s*{paramName}\b"))
            return "direct";
            
        // Renamed mapping (event: eventData)
        if (Regex.IsMatch(dataObject, $@"\w+:\s*{paramName}\b"))
            return "renamed";
            
        // Property access (elementId: element.id)
        if (Regex.IsMatch(dataObject, $@"\w+:\s*{paramName}\.\w+"))
            return "property_access";
            
        // Nested usage (context: { elementId: element.id })
        if (dataObject.Contains(paramName))
            return "nested";
            
        return "unused";
    }

    /// <summary>
    /// Extract data properties from the data object
    /// </summary>
    private List<DataProperty> ExtractDataProperties(string dataObject, List<InputParameter> inputParams)
    {
        var properties = new List<DataProperty>();
        
        // Remove outer braces
        var content = dataObject.Trim().TrimStart('{').TrimEnd('}');
        
        // Extract property definitions
        var propertyMatches = Regex.Matches(content, @"(\w+):\s*([^,\n}]+)", RegexOptions.Compiled);
        
        foreach (Match match in propertyMatches)
        {
            var propertyName = match.Groups[1].Value;
            var propertyValue = match.Groups[2].Value.Trim();
            
            var property = new DataProperty
            {
                Name = propertyName,
                Type = InferPropertyType(propertyValue),
                Source = DeterminePropertySource(propertyValue, inputParams),
                SourceParameter = FindSourceParameter(propertyValue, inputParams),
                IsNested = propertyValue.StartsWith("{"),
                IsRequired = !propertyValue.Contains("||") && !propertyValue.Contains("?")
            };
            
            properties.Add(property);
        }
        
        return properties;
    }

    /// <summary>
    /// Infer property type from its value
    /// </summary>
    private string InferPropertyType(string value)
    {
        if (value.StartsWith("{")) return "object";
        if (value.StartsWith("[")) return "array";
        if (value.StartsWith("'") || value.StartsWith("\"") || value.Contains("`")) return "string";
        if (Regex.IsMatch(value, @"^\d+$")) return "number";
        if (value == "true" || value == "false") return "boolean";
        if (value.Contains("Date.now()")) return "number";
        return "unknown";
    }

    /// <summary>
    /// Determine the source of a property value
    /// </summary>
    private string DeterminePropertySource(string value, List<InputParameter> inputParams)
    {
        var paramNames = inputParams.Select(p => p.Name).ToList();
        
        if (paramNames.Any(p => value.Contains(p)))
            return "parameter";
        if (value.Contains("Date.now()") || value.Contains("Math.random()"))
            return "generated";
        if (value.Contains("||") || value.Contains("?"))
            return "transformed";
        return "literal";
    }

    /// <summary>
    /// Find which input parameter is the source for a property value
    /// </summary>
    private string FindSourceParameter(string value, List<InputParameter> inputParams)
    {
        foreach (var param in inputParams)
        {
            if (value.Contains(param.Name))
                return param.Name;
        }
        return string.Empty;
    }

    /// <summary>
    /// Get line number for a match index in content
    /// </summary>
    private int GetLineNumber(string content, int index)
    {
        return content.Take(index).Count(c => c == '\n') + 1;
    }
}
