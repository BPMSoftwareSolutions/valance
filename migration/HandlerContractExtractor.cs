using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using RX.Architecture.Validator.Console.Models;

namespace RX.Architecture.Validator.Console.Validators;

/// <summary>
/// Extracts expected data structures from handler functions
/// Analyzes destructuring patterns, property access, and validation logic
/// </summary>
public class HandlerContractExtractor
{
    private readonly bool _verbose;

    // Regex patterns for extracting handler expectations
    private readonly Regex[] _validationPatterns = {
        // Validation checks: if (!data.property)
        new Regex(@"if\s*\(\s*!data\.(\w+)", RegexOptions.Compiled),
        
        // Fallback patterns: data.property ||
        new Regex(@"data\.(\w+)\s*\|\|\s*", RegexOptions.Compiled),
        
        // Destructuring: const { props } = data
        new Regex(@"const\s*{\s*([^}]+)\s*}\s*=\s*data", RegexOptions.Compiled),
        
        // Nested property access: data.prop.subprop
        new Regex(@"data\.(\w+)\.(\w+)", RegexOptions.Compiled),
        
        // Direct property access: data.property
        new Regex(@"data\.(\w+)(?!\w)", RegexOptions.Compiled),
        
        // Type checks: typeof data.property
        new Regex(@"typeof\s+data\.(\w+)", RegexOptions.Compiled),
        
        // Array checks: Array.isArray(data.property)
        new Regex(@"Array\.isArray\s*\(\s*data\.(\w+)\s*\)", RegexOptions.Compiled),
    };

    public HandlerContractExtractor(bool verbose = false)
    {
        _verbose = verbose;
    }

    /// <summary>
    /// Extract handler contracts from a handlers.ts file
    /// </summary>
    public async Task<List<HandlerContract>> ExtractContracts(string handlersPath)
    {
        var contracts = new List<HandlerContract>();
        
        if (!File.Exists(handlersPath))
        {
            if (_verbose)
                System.Console.WriteLine($"⚠️ Handlers file not found: {handlersPath}");
            return contracts;
        }

        var content = await File.ReadAllTextAsync(handlersPath);
        
        if (_verbose)
            System.Console.WriteLine($"🔍 Analyzing handler contracts in: {Path.GetFileName(handlersPath)}");

        // Extract all handler functions
        var handlerMatches = Regex.Matches(content,
            @"export\s+const\s+(handle\w+)\s*=\s*\(([^)]*)\)\s*=>\s*{(.*?)^};",
            RegexOptions.Multiline | RegexOptions.Singleline);

        foreach (Match match in handlerMatches)
        {
            var handlerName = match.Groups[1].Value;
            var parameters = match.Groups[2].Value;
            var body = match.Groups[3].Value;
            var lineNumber = GetLineNumber(content, match.Index);

            if (_verbose)
                System.Console.WriteLine($"  📋 Found handler: {handlerName}");

            var contract = ExtractHandlerContract(handlerName, parameters, body, handlersPath, lineNumber);
            if (contract != null)
            {
                contracts.Add(contract);
            }
        }

        if (_verbose)
            System.Console.WriteLine($"✅ Extracted {contracts.Count} handler contracts");

        return contracts;
    }

    /// <summary>
    /// Extract a single handler contract
    /// </summary>
    private HandlerContract? ExtractHandlerContract(
        string handlerName, string parameters, string body, string filePath, int lineNumber)
    {
        try
        {
            // Determine event type from handler name
            var eventType = DetermineEventType(handlerName);
            
            var contract = new HandlerContract
            {
                HandlerName = handlerName,
                EventType = eventType,
                RequiredProperties = ExtractRequiredProperties(body),
                OptionalProperties = ExtractOptionalProperties(body),
                NestedProperties = ExtractNestedProperties(body),
                ValidationRules = ExtractValidationRules(body),
                FilePath = filePath,
                LineNumber = lineNumber
            };

            if (_verbose)
                System.Console.WriteLine($"    ✅ Extracted contract for {handlerName} (Event: {eventType})");

            return contract;
        }
        catch (Exception ex)
        {
            if (_verbose)
                System.Console.WriteLine($"    ❌ Error extracting contract for {handlerName}: {ex.Message}");
        }

        return null;
    }

    /// <summary>
    /// Determine event type from handler name
    /// </summary>
    private string DetermineEventType(string handlerName)
    {
        // Convert handler name to event type
        // handleCanvasElementSelected -> canvas-element-selected
        var eventName = handlerName.Replace("handle", "").Replace("Handle", "");
        
        // Convert PascalCase to kebab-case
        var kebabCase = Regex.Replace(eventName, "([a-z])([A-Z])", "$1-$2").ToLower();
        
        return kebabCase;
    }

    /// <summary>
    /// Extract required properties from handler body
    /// </summary>
    private List<RequiredProperty> ExtractRequiredProperties(string body)
    {
        var requiredProperties = new List<RequiredProperty>();
        
        // Extract from destructuring patterns
        var destructuringMatches = Regex.Matches(body, @"const\s*{\s*([^}]+)\s*}\s*=\s*data");
        foreach (Match match in destructuringMatches)
        {
            var destructuredProps = match.Groups[1].Value;
            var properties = ParseDestructuredProperties(destructuredProps);
            
            foreach (var prop in properties)
            {
                requiredProperties.Add(new RequiredProperty
                {
                    Name = prop,
                    Type = "unknown",
                    AccessPattern = "destructuring",
                    IsNested = false
                });
            }
        }
        
        // Extract from validation checks
        var validationMatches = Regex.Matches(body, @"if\s*\(\s*!data\.(\w+)");
        foreach (Match match in validationMatches)
        {
            var propertyName = match.Groups[1].Value;
            if (!requiredProperties.Any(p => p.Name == propertyName))
            {
                requiredProperties.Add(new RequiredProperty
                {
                    Name = propertyName,
                    Type = "unknown",
                    AccessPattern = "validation_check",
                    IsNested = false,
                    ValidationPattern = match.Value
                });
            }
        }
        
        // Extract from direct property access (without fallbacks)
        var directAccessMatches = Regex.Matches(body, @"data\.(\w+)(?!\s*\|\|)(?!\.)");
        foreach (Match match in directAccessMatches)
        {
            var propertyName = match.Groups[1].Value;
            if (!requiredProperties.Any(p => p.Name == propertyName) &&
                !IsOptionalProperty(propertyName, body))
            {
                requiredProperties.Add(new RequiredProperty
                {
                    Name = propertyName,
                    Type = InferPropertyType(propertyName, body),
                    AccessPattern = "property_access",
                    IsNested = false
                });
            }
        }
        
        return requiredProperties;
    }

    /// <summary>
    /// Extract optional properties from handler body
    /// </summary>
    private List<OptionalProperty> ExtractOptionalProperties(string body)
    {
        var optionalProperties = new List<OptionalProperty>();
        
        // Extract from fallback patterns: data.property || defaultValue
        var fallbackMatches = Regex.Matches(body, @"data\.(\w+)\s*\|\|\s*([^,\n;)]+)");
        foreach (Match match in fallbackMatches)
        {
            var propertyName = match.Groups[1].Value;
            var defaultValue = match.Groups[2].Value.Trim();
            
            optionalProperties.Add(new OptionalProperty
            {
                Name = propertyName,
                Type = InferPropertyType(propertyName, body),
                DefaultValue = defaultValue,
                AccessPattern = "fallback",
                HasFallback = true,
                FallbackPattern = match.Value
            });
        }
        
        // Extract from optional chaining: data.property?.subprop
        var optionalChainingMatches = Regex.Matches(body, @"data\.(\w+)\?\.(\w+)");
        foreach (Match match in optionalChainingMatches)
        {
            var propertyName = match.Groups[1].Value;
            if (!optionalProperties.Any(p => p.Name == propertyName))
            {
                optionalProperties.Add(new OptionalProperty
                {
                    Name = propertyName,
                    Type = "object",
                    AccessPattern = "optional_chaining",
                    HasFallback = false
                });
            }
        }
        
        return optionalProperties;
    }

    /// <summary>
    /// Extract nested properties from handler body
    /// </summary>
    private List<NestedProperty> ExtractNestedProperties(string body)
    {
        var nestedProperties = new List<NestedProperty>();
        
        // Extract nested property access: data.parent.child
        var nestedMatches = Regex.Matches(body, @"data\.(\w+)\.(\w+)");
        foreach (Match match in nestedMatches)
        {
            var parentProperty = match.Groups[1].Value;
            var childProperty = match.Groups[2].Value;
            
            nestedProperties.Add(new NestedProperty
            {
                Name = childProperty,
                ParentProperty = parentProperty,
                FullPath = $"{parentProperty}.{childProperty}",
                Type = InferPropertyType(childProperty, body),
                IsRequired = !IsOptionalProperty($"{parentProperty}.{childProperty}", body)
            });
        }
        
        // Extract deeper nesting: data.parent.child.grandchild
        var deepNestedMatches = Regex.Matches(body, @"data\.(\w+)\.(\w+)\.(\w+)");
        foreach (Match match in deepNestedMatches)
        {
            var parentProperty = match.Groups[1].Value;
            var childProperty = match.Groups[2].Value;
            var grandchildProperty = match.Groups[3].Value;
            
            nestedProperties.Add(new NestedProperty
            {
                Name = grandchildProperty,
                ParentProperty = $"{parentProperty}.{childProperty}",
                FullPath = $"{parentProperty}.{childProperty}.{grandchildProperty}",
                Type = InferPropertyType(grandchildProperty, body),
                IsRequired = !IsOptionalProperty($"{parentProperty}.{childProperty}.{grandchildProperty}", body)
            });
        }
        
        return nestedProperties;
    }

    /// <summary>
    /// Extract validation rules from handler body
    /// </summary>
    private DataValidationRules ExtractValidationRules(string body)
    {
        var rules = new DataValidationRules();
        
        // Required checks
        var requiredChecks = Regex.Matches(body, @"if\s*\(\s*!data\.(\w+)");
        rules.RequiredChecks = requiredChecks.Cast<Match>().Select(m => m.Value).ToList();
        
        // Type checks
        var typeChecks = Regex.Matches(body, @"typeof\s+data\.(\w+)");
        rules.TypeChecks = typeChecks.Cast<Match>().Select(m => m.Value).ToList();
        
        // Null checks
        var nullChecks = Regex.Matches(body, @"data\.(\w+)\s*===?\s*null");
        rules.NullChecks = nullChecks.Cast<Match>().Select(m => m.Value).ToList();
        
        // Conditional logic
        var conditionalLogic = Regex.Matches(body, @"if\s*\([^)]*data\.[^)]*\)");
        rules.ConditionalLogic = conditionalLogic.Cast<Match>().Select(m => m.Value).ToList();
        
        return rules;
    }

    /// <summary>
    /// Parse destructured properties from destructuring assignment
    /// </summary>
    private List<string> ParseDestructuredProperties(string destructuredProps)
    {
        var properties = new List<string>();
        
        // Split by comma and clean up
        var propList = destructuredProps.Split(',');
        foreach (var prop in propList)
        {
            var cleanProp = prop.Trim();
            
            // Handle renamed destructuring: { oldName: newName }
            if (cleanProp.Contains(':'))
            {
                var parts = cleanProp.Split(':');
                if (parts.Length == 2)
                {
                    properties.Add(parts[0].Trim());
                }
            }
            else
            {
                properties.Add(cleanProp);
            }
        }
        
        return properties;
    }

    /// <summary>
    /// Check if a property is optional based on usage patterns
    /// </summary>
    private bool IsOptionalProperty(string propertyName, string body)
    {
        // Check for fallback patterns
        if (body.Contains($"data.{propertyName} ||"))
            return true;
            
        // Check for optional chaining
        if (body.Contains($"data.{propertyName}?."))
            return true;
            
        // Check for conditional usage
        if (body.Contains($"if (data.{propertyName})"))
            return true;
            
        return false;
    }

    /// <summary>
    /// Infer property type from usage context
    /// </summary>
    private string InferPropertyType(string propertyName, string body)
    {
        var lowerName = propertyName.ToLower();
        
        // Type inference based on name patterns
        if (lowerName.Contains("id") || lowerName.Contains("name") || lowerName.Contains("type"))
            return "string";
        if (lowerName.Contains("count") || lowerName.Contains("index") || lowerName.Contains("length"))
            return "number";
        if (lowerName.Contains("is") || lowerName.Contains("has") || lowerName.Contains("enabled"))
            return "boolean";
        if (lowerName.Contains("element") || lowerName.Contains("data") || lowerName.Contains("context"))
            return "object";
        if (lowerName.Contains("list") || lowerName.Contains("items") || lowerName.Contains("children"))
            return "array";
            
        // Type inference based on usage patterns
        if (body.Contains($"Array.isArray(data.{propertyName})"))
            return "array";
        if (body.Contains($"typeof data.{propertyName} === 'string'"))
            return "string";
        if (body.Contains($"typeof data.{propertyName} === 'number'"))
            return "number";
        if (body.Contains($"typeof data.{propertyName} === 'boolean'"))
            return "boolean";
        if (body.Contains($"typeof data.{propertyName} === 'object'"))
            return "object";
            
        return "unknown";
    }

    /// <summary>
    /// Get line number for a match index in content
    /// </summary>
    private int GetLineNumber(string content, int index)
    {
        return content.Take(index).Count(c => c == '\n') + 1;
    }
}
