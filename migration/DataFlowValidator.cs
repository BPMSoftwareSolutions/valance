using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RX.Architecture.Validator.Console.Models;

namespace RX.Architecture.Validator.Console.Validators;

/// <summary>
/// Validates complete data flow from convenience functions through conductor transformations to handler expectations
/// Simulates the data transformation pipeline and identifies mismatches
/// </summary>
public class DataFlowValidator
{
    private readonly bool _verbose;

    public DataFlowValidator(bool verbose = false)
    {
        _verbose = verbose;
    }

    /// <summary>
    /// Validate complete data flow for a symphony
    /// </summary>
    public async Task<DataFlowValidationResult> ValidateDataFlow(
        List<ConvenienceFunctionContract> convenienceContracts,
        List<ConductorTransformation> transformations,
        List<HandlerContract> handlerContracts,
        List<string> sequenceEvents)
    {
        if (_verbose)
            System.Console.WriteLine("🔍 Starting data flow validation...");

        var result = new DataFlowValidationResult
        {
            Analysis = new DataFlowAnalysis
            {
                TotalConvenienceFunctions = convenienceContracts.Count,
                TotalTransformations = transformations.Count,
                TotalHandlers = handlerContracts.Count,
                EventTypesAnalyzed = sequenceEvents,
                SpecialHandlingCases = transformations.Count(t => t.HasSpecialHandling),
                DefaultTransformations = transformations.Count(t => !t.HasSpecialHandling)
            }
        };

        var violations = new List<DataFlowViolation>();

        // Validate each convenience function's data flow
        foreach (var convenienceContract in convenienceContracts)
        {
            if (_verbose)
                System.Console.WriteLine($"  📋 Validating {convenienceContract.FunctionName}...");

            var contractViolations = await ValidateConvenienceFunctionDataFlow(
                convenienceContract, transformations, handlerContracts, sequenceEvents);
            violations.AddRange(contractViolations);
        }

        // Categorize violations by severity
        result.Violations = violations;
        result.CriticalViolations = violations.Count(v => v.Severity == ViolationSeverity.Critical);
        result.ErrorViolations = violations.Count(v => v.Severity == ViolationSeverity.Error);
        result.WarningViolations = violations.Count(v => v.Severity == ViolationSeverity.Warning);
        result.HasDataFlowViolations = violations.Any();

        // Generate recommendations
        result.Recommendations = GenerateRecommendations(violations);

        // Determine confidence level
        result.Confidence = DetermineValidationConfidence(convenienceContracts, transformations, handlerContracts);

        // Update analysis with violation statistics
        result.Analysis.ViolationsByType = violations
            .GroupBy(v => v.Type.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        if (_verbose)
        {
            System.Console.WriteLine($"✅ Data flow validation complete:");
            System.Console.WriteLine($"   Critical: {result.CriticalViolations}");
            System.Console.WriteLine($"   Errors: {result.ErrorViolations}");
            System.Console.WriteLine($"   Warnings: {result.WarningViolations}");
            System.Console.WriteLine($"   Confidence: {result.Confidence}");
        }

        return result;
    }

    /// <summary>
    /// Validate data flow for a single convenience function
    /// </summary>
    private async Task<List<DataFlowViolation>> ValidateConvenienceFunctionDataFlow(
        ConvenienceFunctionContract convenienceContract,
        List<ConductorTransformation> transformations,
        List<HandlerContract> handlerContracts,
        List<string> sequenceEvents)
    {
        var violations = new List<DataFlowViolation>();

        // Get the sequence events for this convenience function's sequence
        var relevantEvents = sequenceEvents.Where(e => 
            handlerContracts.Any(h => h.EventType == e)).ToList();

        foreach (var eventType in relevantEvents)
        {
            // Find the transformation for this event type
            var transformation = FindTransformationForEvent(eventType, transformations);
            
            // Find the handler contract for this event type
            var handlerContract = handlerContracts.FirstOrDefault(h => h.EventType == eventType);

            if (transformation != null && handlerContract != null)
            {
                var eventViolations = ValidateEventDataFlow(
                    convenienceContract, transformation, handlerContract, eventType);
                violations.AddRange(eventViolations);
            }
        }

        return violations;
    }

    /// <summary>
    /// Find the appropriate transformation for an event type
    /// </summary>
    private ConductorTransformation? FindTransformationForEvent(string eventType, List<ConductorTransformation> transformations)
    {
        // First, look for specific event handling
        var specificTransformation = transformations.FirstOrDefault(t => t.EventType == eventType);
        if (specificTransformation != null)
            return specificTransformation;

        // Fall back to default transformation
        return transformations.FirstOrDefault(t => t.EventType == "*");
    }

    /// <summary>
    /// Validate data flow for a specific event
    /// </summary>
    private List<DataFlowViolation> ValidateEventDataFlow(
        ConvenienceFunctionContract convenienceContract,
        ConductorTransformation transformation,
        HandlerContract handlerContract,
        string eventType)
    {
        var violations = new List<DataFlowViolation>();

        // Simulate the data transformation
        var simulatedData = SimulateDataTransformation(convenienceContract, transformation);

        // Check if transformed data satisfies handler requirements
        violations.AddRange(ValidateHandlerRequirements(
            convenienceContract, transformation, handlerContract, simulatedData, eventType));

        return violations;
    }

    /// <summary>
    /// Simulate data transformation from convenience function through conductor
    /// </summary>
    private Dictionary<string, object> SimulateDataTransformation(
        ConvenienceFunctionContract convenienceContract,
        ConductorTransformation transformation)
    {
        var simulatedData = new Dictionary<string, object>();

        // Start with convenience function data
        foreach (var property in convenienceContract.DataProperties)
        {
            simulatedData[property.Name] = new { Type = property.Type, Source = property.Source };
        }

        // Apply conductor transformation
        if (transformation.HasSpecialHandling)
        {
            // Apply special handling transformation
            ApplySpecialHandlingTransformation(simulatedData, transformation);
        }
        else
        {
            // Apply default transformation (spread + added properties)
            ApplyDefaultTransformation(simulatedData, transformation);
        }

        return simulatedData;
    }

    /// <summary>
    /// Apply special handling transformation
    /// </summary>
    private void ApplySpecialHandlingTransformation(Dictionary<string, object> data, ConductorTransformation transformation)
    {
        // Remove properties that are not included in special handling
        var outputProperties = transformation.OutputMappings.Keys.ToList();
        var keysToRemove = data.Keys.Where(k => !outputProperties.Contains(k)).ToList();
        
        foreach (var key in keysToRemove)
        {
            data.Remove(key);
        }

        // Add properties from output mappings
        foreach (var mapping in transformation.OutputMappings)
        {
            data[mapping.Key] = new { Type = "transformed", Source = mapping.Value };
        }

        // Add execution context properties
        foreach (var addedProperty in transformation.AddedProperties)
        {
            data[addedProperty] = new { Type = "generated", Source = "execution_context" };
        }
    }

    /// <summary>
    /// Apply default transformation (spread + execution context)
    /// </summary>
    private void ApplyDefaultTransformation(Dictionary<string, object> data, ConductorTransformation transformation)
    {
        // Default transformation spreads all input data
        // Add execution context properties
        foreach (var addedProperty in transformation.AddedProperties)
        {
            data[addedProperty] = new { Type = "generated", Source = "execution_context" };
        }
    }

    /// <summary>
    /// Validate that transformed data satisfies handler requirements
    /// </summary>
    private List<DataFlowViolation> ValidateHandlerRequirements(
        ConvenienceFunctionContract convenienceContract,
        ConductorTransformation transformation,
        HandlerContract handlerContract,
        Dictionary<string, object> transformedData,
        string eventType)
    {
        var violations = new List<DataFlowViolation>();

        // Check required properties
        foreach (var requiredProperty in handlerContract.RequiredProperties)
        {
            if (!transformedData.ContainsKey(requiredProperty.Name))
            {
                // Check if it's available as a nested property
                if (!IsNestedPropertyAvailable(requiredProperty, transformedData))
                {
                    violations.Add(new DataFlowViolation
                    {
                        Type = ViolationType.MissingAfterTransformation,
                        StartFunction = convenienceContract.FunctionName,
                        EventType = eventType,
                        HandlerName = handlerContract.HandlerName,
                        MissingProperty = requiredProperty.Name,
                        Description = $"Handler expects '{requiredProperty.Name}' but it's not available after transformation",
                        StartData = convenienceContract.DataTransformation,
                        TransformedData = transformedData,
                        Severity = ViolationSeverity.Critical,
                        FixSuggestion = GenerateFixSuggestion(requiredProperty, convenienceContract, transformation),
                        FilePath = handlerContract.FilePath,
                        LineNumber = handlerContract.LineNumber
                    });
                }
            }
        }

        // Check nested properties
        foreach (var nestedProperty in handlerContract.NestedProperties)
        {
            if (!IsNestedPropertyPathAvailable(nestedProperty.FullPath, transformedData))
            {
                violations.Add(new DataFlowViolation
                {
                    Type = ViolationType.NestedPropertyMismatch,
                    StartFunction = convenienceContract.FunctionName,
                    EventType = eventType,
                    HandlerName = handlerContract.HandlerName,
                    MissingProperty = nestedProperty.FullPath,
                    Description = $"Handler expects nested property '{nestedProperty.FullPath}' but it's not available",
                    StartData = convenienceContract.DataTransformation,
                    TransformedData = transformedData,
                    Severity = nestedProperty.IsRequired ? ViolationSeverity.Error : ViolationSeverity.Warning,
                    FixSuggestion = GenerateNestedPropertyFixSuggestion(nestedProperty, convenienceContract),
                    FilePath = handlerContract.FilePath,
                    LineNumber = handlerContract.LineNumber
                });
            }
        }

        return violations;
    }

    /// <summary>
    /// Check if a nested property is available in the transformed data
    /// </summary>
    private bool IsNestedPropertyAvailable(RequiredProperty requiredProperty, Dictionary<string, object> transformedData)
    {
        if (requiredProperty.IsNested)
        {
            return IsNestedPropertyPathAvailable(requiredProperty.NestedPath, transformedData);
        }
        return false;
    }

    /// <summary>
    /// Check if a nested property path is available
    /// </summary>
    private bool IsNestedPropertyPathAvailable(string propertyPath, Dictionary<string, object> transformedData)
    {
        var pathParts = propertyPath.Split('.');
        if (pathParts.Length > 1)
        {
            var rootProperty = pathParts[0];
            return transformedData.ContainsKey(rootProperty);
        }
        return false;
    }

    /// <summary>
    /// Generate fix suggestion for missing property
    /// </summary>
    private string GenerateFixSuggestion(RequiredProperty requiredProperty, ConvenienceFunctionContract convenienceContract, ConductorTransformation transformation)
    {
        if (transformation.HasSpecialHandling)
        {
            return $"Add '{requiredProperty.Name}' to the special handling transformation for event '{transformation.EventType}' in MusicalConductor.prepareEventData()";
        }
        else
        {
            return $"Add '{requiredProperty.Name}' to the data object in convenience function '{convenienceContract.FunctionName}'";
        }
    }

    /// <summary>
    /// Generate fix suggestion for nested property
    /// </summary>
    private string GenerateNestedPropertyFixSuggestion(NestedProperty nestedProperty, ConvenienceFunctionContract convenienceContract)
    {
        return $"Ensure '{nestedProperty.ParentProperty}' object contains '{nestedProperty.Name}' property in convenience function '{convenienceContract.FunctionName}'";
    }

    /// <summary>
    /// Generate recommendations for fixing violations
    /// </summary>
    private List<DataFlowRecommendation> GenerateRecommendations(List<DataFlowViolation> violations)
    {
        var recommendations = new List<DataFlowRecommendation>();

        var violationGroups = violations.GroupBy(v => v.Type);

        foreach (var group in violationGroups)
        {
            var violationType = group.Key;
            var violationList = group.ToList();

            var recommendation = violationType switch
            {
                ViolationType.MissingAfterTransformation => new DataFlowRecommendation
                {
                    Type = "Missing Property Fix",
                    Description = $"Add missing properties to convenience functions or conductor transformations ({violationList.Count} instances)",
                    CodeSuggestion = "Review convenience function data objects and conductor special handling cases",
                    Priority = ViolationSeverity.Critical
                },
                ViolationType.NestedPropertyMismatch => new DataFlowRecommendation
                {
                    Type = "Nested Property Fix",
                    Description = $"Fix nested property structure mismatches ({violationList.Count} instances)",
                    CodeSuggestion = "Ensure nested objects are properly structured in convenience functions",
                    Priority = ViolationSeverity.Error
                },
                _ => new DataFlowRecommendation
                {
                    Type = "General Fix",
                    Description = $"Address {violationType} violations ({violationList.Count} instances)",
                    CodeSuggestion = "Review data flow patterns and fix mismatches",
                    Priority = ViolationSeverity.Warning
                }
            };

            recommendations.Add(recommendation);
        }

        return recommendations;
    }

    /// <summary>
    /// Determine validation confidence level
    /// </summary>
    private ValidationConfidence DetermineValidationConfidence(
        List<ConvenienceFunctionContract> convenienceContracts,
        List<ConductorTransformation> transformations,
        List<HandlerContract> handlerContracts)
    {
        var totalAnalyzed = convenienceContracts.Count + transformations.Count + handlerContracts.Count;
        var specialHandlingCases = transformations.Count(t => t.HasSpecialHandling);
        var complexPatterns = handlerContracts.Count(h => h.NestedProperties.Any());

        if (totalAnalyzed == 0)
            return ValidationConfidence.Unknown;

        var complexityRatio = (double)(specialHandlingCases + complexPatterns) / totalAnalyzed;

        return complexityRatio switch
        {
            < 0.2 => ValidationConfidence.High,
            < 0.5 => ValidationConfidence.Medium,
            < 0.8 => ValidationConfidence.Low,
            _ => ValidationConfidence.Unknown
        };
    }
}
