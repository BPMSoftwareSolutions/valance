using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using RX.Architecture.Validator.Console.Models;

namespace RX.Architecture.Validator.Console.Validators;

/// <summary>
/// Analyzes how MusicalConductor.prepareEventData() transforms data for each event type
/// Extracts special handling cases and default transformation logic
/// </summary>
public class ConductorTransformationAnalyzer
{
    private readonly bool _verbose;

    // Regex patterns for extracting transformation logic
    private readonly Regex[] _transformationPatterns = {
        // Special handling blocks (if statements for specific events)
        new Regex(@"if\s*\(\s*beat\.event\s*===\s*['""]([^'""]+)['""].*?\)\s*{(.*?)return\s*({.*?});", RegexOptions.Singleline | RegexOptions.Compiled),
        
        // Default transformation pattern
        new Regex(@"const\s+eventData\s*=\s*({.*?});", RegexOptions.Singleline | RegexOptions.Compiled),
        
        // Data spreading patterns
        new Regex(@"\.\.\.(\w+)", RegexOptions.Compiled),
        
        // Property assignments in return objects
        new Regex(@"(\w+):\s*([^,\n}]+)", RegexOptions.Compiled),
    };

    public ConductorTransformationAnalyzer(bool verbose = false)
    {
        _verbose = verbose;
    }

    /// <summary>
    /// Extract transformations from MusicalConductor.ts prepareEventData method
    /// </summary>
    public async Task<List<ConductorTransformation>> ExtractTransformations(string conductorPath)
    {
        var transformations = new List<ConductorTransformation>();
        
        if (!File.Exists(conductorPath))
        {
            if (_verbose)
                System.Console.WriteLine($"⚠️ MusicalConductor file not found: {conductorPath}");
            return transformations;
        }

        var content = await File.ReadAllTextAsync(conductorPath);
        
        if (_verbose)
            System.Console.WriteLine($"🔍 Analyzing MusicalConductor transformations in: {Path.GetFileName(conductorPath)}");

        // Extract prepareEventData method
        var prepareEventDataMatch = Regex.Match(content,
            @"prepareEventData\s*\([^)]+\)\s*{(.*?)^  }",
            RegexOptions.Multiline | RegexOptions.Singleline);

        if (prepareEventDataMatch.Success)
        {
            var methodBody = prepareEventDataMatch.Groups[1].Value;
            transformations = ExtractTransformationLogic(methodBody);
            
            if (_verbose)
                System.Console.WriteLine($"✅ Extracted {transformations.Count} transformation patterns");
        }
        else
        {
            if (_verbose)
                System.Console.WriteLine("❌ Could not find prepareEventData method");
        }

        return transformations;
    }

    /// <summary>
    /// Extract transformation logic from prepareEventData method body
    /// </summary>
    private List<ConductorTransformation> ExtractTransformationLogic(string methodBody)
    {
        var transformations = new List<ConductorTransformation>();
        
        // Extract special handling cases first
        var specialHandlingTransformations = ExtractSpecialHandlingCases(methodBody);
        transformations.AddRange(specialHandlingTransformations);
        
        // Extract default transformation
        var defaultTransformation = ExtractDefaultTransformation(methodBody);
        if (defaultTransformation != null)
        {
            transformations.Add(defaultTransformation);
        }
        
        return transformations;
    }

    /// <summary>
    /// Extract special handling cases (if statements for specific events)
    /// </summary>
    private List<ConductorTransformation> ExtractSpecialHandlingCases(string methodBody)
    {
        var transformations = new List<ConductorTransformation>();
        
        // Pattern for special handling blocks
        var specialHandlingPattern = new Regex(
            @"if\s*\(\s*beat\.event\s*===\s*['""]([^'""]+)['""](?:\s*&&\s*([^)]+))?\s*\)\s*{(.*?)return\s*({.*?});",
            RegexOptions.Singleline | RegexOptions.IgnoreCase);
        
        var matches = specialHandlingPattern.Matches(methodBody);
        
        foreach (Match match in matches)
        {
            var eventType = match.Groups[1].Value;
            var condition = match.Groups[2].Value;
            var blockContent = match.Groups[3].Value;
            var returnObject = match.Groups[4].Value;
            
            if (_verbose)
                System.Console.WriteLine($"  📋 Found special handling for: {eventType}");
            
            var transformation = new ConductorTransformation
            {
                EventType = eventType,
                Type = TransformationType.SpecialHandling,
                HasSpecialHandling = true,
                SpecialHandlingCondition = condition,
                TransformationCode = returnObject,
                InputMappings = ExtractInputMappings(returnObject),
                OutputMappings = ExtractOutputMappings(returnObject),
                AddedProperties = ExtractAddedProperties(returnObject),
                RemovedProperties = ExtractRemovedProperties(blockContent, returnObject)
            };
            
            transformations.Add(transformation);
        }
        
        return transformations;
    }

    /// <summary>
    /// Extract default transformation (the final return statement)
    /// </summary>
    private ConductorTransformation? ExtractDefaultTransformation(string methodBody)
    {
        // Look for the final default transformation pattern
        var defaultPattern = new Regex(
            @"const\s+eventData\s*=\s*({.*?});.*?return\s+eventData;",
            RegexOptions.Singleline | RegexOptions.IgnoreCase);
        
        var match = defaultPattern.Match(methodBody);
        
        if (match.Success)
        {
            var returnObject = match.Groups[1].Value;
            
            if (_verbose)
                System.Console.WriteLine("  📋 Found default transformation pattern");
            
            return new ConductorTransformation
            {
                EventType = "*", // Represents default for all events
                Type = TransformationType.DefaultTransform,
                HasSpecialHandling = false,
                TransformationCode = returnObject,
                InputMappings = ExtractInputMappings(returnObject),
                OutputMappings = ExtractOutputMappings(returnObject),
                AddedProperties = ExtractAddedProperties(returnObject)
            };
        }
        
        return null;
    }

    /// <summary>
    /// Extract input mappings from transformation code
    /// </summary>
    private Dictionary<string, string> ExtractInputMappings(string transformationCode)
    {
        var mappings = new Dictionary<string, string>();
        
        // Look for spread operations
        var spreadMatches = Regex.Matches(transformationCode, @"\.\.\.(\w+)");
        foreach (Match match in spreadMatches)
        {
            var sourceObject = match.Groups[1].Value;
            mappings[$"spread_{sourceObject}"] = sourceObject;
        }
        
        // Look for direct property access
        var propertyMatches = Regex.Matches(transformationCode, @"(\w+):\s*(\w+)\.(\w+)");
        foreach (Match match in propertyMatches)
        {
            var targetProperty = match.Groups[1].Value;
            var sourceObject = match.Groups[2].Value;
            var sourceProperty = match.Groups[3].Value;
            mappings[targetProperty] = $"{sourceObject}.{sourceProperty}";
        }
        
        return mappings;
    }

    /// <summary>
    /// Extract output mappings from transformation code
    /// </summary>
    private Dictionary<string, string> ExtractOutputMappings(string transformationCode)
    {
        var mappings = new Dictionary<string, string>();
        
        // Extract property assignments
        var propertyMatches = Regex.Matches(transformationCode, @"(\w+):\s*([^,\n}]+)");
        foreach (Match match in propertyMatches)
        {
            var propertyName = match.Groups[1].Value;
            var propertyValue = match.Groups[2].Value.Trim();
            mappings[propertyName] = propertyValue;
        }
        
        return mappings;
    }

    /// <summary>
    /// Extract properties that are added by the transformation
    /// </summary>
    private List<string> ExtractAddedProperties(string transformationCode)
    {
        var addedProperties = new List<string>();
        
        // Look for execution context properties
        if (transformationCode.Contains("executionContext.id"))
            addedProperties.Add("sequenceId");
        if (transformationCode.Contains("executionContext.sequenceName"))
            addedProperties.Add("sequenceName");
        if (transformationCode.Contains("beat.beat"))
            addedProperties.Add("beat");
        if (transformationCode.Contains("beat.timing"))
            addedProperties.Add("timing");
        if (transformationCode.Contains("beat.dynamic"))
            addedProperties.Add("priority");
        if (transformationCode.Contains("Date.now()"))
            addedProperties.Add("timestamp");
        
        // Look for other generated properties
        var propertyMatches = Regex.Matches(transformationCode, @"(\w+):\s*[^,\n}]+");
        foreach (Match match in propertyMatches)
        {
            var propertyName = match.Groups[1].Value;
            if (!addedProperties.Contains(propertyName))
            {
                // Check if this is a new property (not from spread)
                if (!transformationCode.Contains($"...sequenceData") || 
                    IsGeneratedProperty(propertyName, transformationCode))
                {
                    addedProperties.Add(propertyName);
                }
            }
        }
        
        return addedProperties;
    }

    /// <summary>
    /// Extract properties that are removed by the transformation
    /// </summary>
    private List<string> ExtractRemovedProperties(string blockContent, string returnObject)
    {
        var removedProperties = new List<string>();
        
        // This is complex to determine without runtime analysis
        // For now, we'll identify obvious cases where properties are explicitly excluded
        
        // Look for comments indicating removed properties
        var commentMatches = Regex.Matches(blockContent, @"//.*?(?:remove|exclude|skip)\s+(\w+)");
        foreach (Match match in commentMatches)
        {
            removedProperties.Add(match.Groups[1].Value);
        }
        
        return removedProperties;
    }

    /// <summary>
    /// Check if a property is generated (not from input data)
    /// </summary>
    private bool IsGeneratedProperty(string propertyName, string transformationCode)
    {
        var generatedPatterns = new[]
        {
            "Date.now()",
            "Math.random()",
            "executionContext",
            "beat.",
            "`", // Template literals
            "source:",
            "timestamp:",
            "sequence:"
        };
        
        // Find the property assignment
        var propertyPattern = new Regex($@"{propertyName}:\s*([^,\n}}]+)");
        var match = propertyPattern.Match(transformationCode);
        
        if (match.Success)
        {
            var propertyValue = match.Groups[1].Value;
            return generatedPatterns.Any(pattern => propertyValue.Contains(pattern));
        }
        
        return false;
    }

    /// <summary>
    /// Analyze conditional transformations
    /// </summary>
    public List<ConductorTransformation> AnalyzeConditionalTransformations(string methodBody)
    {
        var transformations = new List<ConductorTransformation>();
        
        // Look for complex conditional logic
        var conditionalPattern = new Regex(
            @"if\s*\(([^)]+)\)\s*{(.*?)}\s*else\s*if\s*\(([^)]+)\)\s*{(.*?)}",
            RegexOptions.Singleline);
        
        var matches = conditionalPattern.Matches(methodBody);
        
        foreach (Match match in matches)
        {
            var condition1 = match.Groups[1].Value;
            var block1 = match.Groups[2].Value;
            var condition2 = match.Groups[3].Value;
            var block2 = match.Groups[4].Value;
            
            // Extract event types from conditions
            var eventType1 = ExtractEventTypeFromCondition(condition1);
            var eventType2 = ExtractEventTypeFromCondition(condition2);
            
            if (!string.IsNullOrEmpty(eventType1))
            {
                transformations.Add(CreateConditionalTransformation(eventType1, condition1, block1));
            }
            
            if (!string.IsNullOrEmpty(eventType2))
            {
                transformations.Add(CreateConditionalTransformation(eventType2, condition2, block2));
            }
        }
        
        return transformations;
    }

    /// <summary>
    /// Extract event type from condition
    /// </summary>
    private string ExtractEventTypeFromCondition(string condition)
    {
        var eventTypeMatch = Regex.Match(condition, @"beat\.event\s*===\s*['""]([^'""]+)['""]");
        return eventTypeMatch.Success ? eventTypeMatch.Groups[1].Value : string.Empty;
    }

    /// <summary>
    /// Create conditional transformation
    /// </summary>
    private ConductorTransformation CreateConditionalTransformation(string eventType, string condition, string block)
    {
        return new ConductorTransformation
        {
            EventType = eventType,
            Type = TransformationType.ConditionalTransform,
            HasSpecialHandling = true,
            SpecialHandlingCondition = condition,
            TransformationCode = block,
            InputMappings = ExtractInputMappings(block),
            OutputMappings = ExtractOutputMappings(block),
            AddedProperties = ExtractAddedProperties(block)
        };
    }
}
