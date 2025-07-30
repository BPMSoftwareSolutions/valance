using RX.Architecture.Validator.Console.Models;
using RX.Architecture.Validator.Console.Core;
using RX.Architecture.Validator.Console.Parsers;
using System.Text.RegularExpressions;

namespace RX.Architecture.Validator.Console.Validators;

public class EventTypeValidator
{
    private readonly ImportResolver _importResolver;
    private readonly EventTypesParser _eventTypesParser;

    public EventTypeValidator()
    {
        _importResolver = new ImportResolver();
        _eventTypesParser = new EventTypesParser();
    }

    /// <summary>
    /// Validates event types using semantic analysis instead of syntactic analysis
    /// Follows the actual import chain to verify EVENT_TYPES resolve to real values
    /// </summary>
    public async Task<List<EventTypeViolation>> ValidateEventTypes(string symphonyPath)
    {
        var violations = new List<EventTypeViolation>();

        // Get sequence.ts file
        var sequenceFile = Path.Combine(symphonyPath, "sequence.ts");
        if (!File.Exists(sequenceFile))
        {
            return violations;
        }

        var sequenceContent = await File.ReadAllTextAsync(sequenceFile);

        // SEMANTIC ANALYSIS: Follow actual import chain instead of hardcoded lists
        violations.AddRange(await ValidateEventTypeReferencesSemanticAnalysis(sequenceFile, sequenceContent));

        return violations;
    }

    /// <summary>
    /// SEMANTIC ANALYSIS: Validates event type references by following actual import chains
    /// This replaces the old syntactic analysis that used hardcoded event lists
    /// </summary>
    private async Task<List<EventTypeViolation>> ValidateEventTypeReferencesSemanticAnalysis(string sequenceFile, string sequenceContent)
    {
        var violations = new List<EventTypeViolation>();

        // Find all EVENT_TYPES references in the sequence file
        // Pattern matches: event: EVENT_TYPES.DIV_CHILD_DROP_DETECTED
        var eventTypePattern = @"event:\s*EVENT_TYPES\.([A-Z_]+)";
        var matches = Regex.Matches(sequenceContent, eventTypePattern);

        // Also check dependencies array: dependencies: [EVENT_TYPES.DIV_CHILD_DROP_DETECTED]
        var dependencyPattern = @"EVENT_TYPES\.([A-Z_]+)";
        var dependencyMatches = Regex.Matches(sequenceContent, dependencyPattern);

        // Combine both sets of matches
        var allMatches = matches.Cast<Match>().Concat(dependencyMatches.Cast<Match>()).ToList();

        foreach (Match match in allMatches)
        {
            var eventTypeName = match.Groups[1].Value;
            var lineNumber = GetLineNumber(sequenceContent, match.Index);

            try
            {
                // SEMANTIC ANALYSIS: Follow the actual import chain
                var eventTypesFile = await _importResolver.ResolveImportChain(sequenceFile, "EVENT_TYPES");

                if (eventTypesFile == null)
                {
                    violations.Add(new EventTypeViolation
                    {
                        RuleName = "IMPORT_CHAIN_BROKEN",
                        Description = $"Cannot resolve EVENT_TYPES import chain from sequence file",
                        FilePath = sequenceFile,
                        LineNumber = lineNumber,
                        EventTypeName = eventTypeName,
                        Severity = ViolationSeverity.Critical
                    });
                    continue;
                }

                // Parse the actual EVENT_TYPES object to get the real value
                var eventValue = await _eventTypesParser.ExtractEventValue(eventTypesFile, eventTypeName);

                if (eventValue == null)
                {
                    violations.Add(new EventTypeViolation
                    {
                        RuleName = "UNDEFINED_EVENT_REFERENCE",
                        Description = $"Event type '{eventTypeName}' resolves to undefined at runtime",
                        FilePath = sequenceFile,
                        LineNumber = lineNumber,
                        EventTypeName = eventTypeName,
                        Severity = ViolationSeverity.Critical,
                        AvailableEventTypes = await GetAvailableEventTypesFromFile(eventTypesFile)
                    });
                }
            }
            catch (CircularImportException ex)
            {
                violations.Add(new EventTypeViolation
                {
                    RuleName = "CIRCULAR_IMPORT",
                    Description = $"Circular import detected in EVENT_TYPES resolution: {ex.Message}",
                    FilePath = sequenceFile,
                    LineNumber = lineNumber,
                    EventTypeName = eventTypeName,
                    Severity = ViolationSeverity.Critical
                });
            }
            catch (Exception ex)
            {
                violations.Add(new EventTypeViolation
                {
                    RuleName = "SEMANTIC_ANALYSIS_ERROR",
                    Description = $"Error during semantic analysis of '{eventTypeName}': {ex.Message}",
                    FilePath = sequenceFile,
                    LineNumber = lineNumber,
                    EventTypeName = eventTypeName,
                    Severity = ViolationSeverity.Error
                });
            }
        }

        return violations;
    }

    /// <summary>
    /// Gets available event types from the resolved EVENT_TYPES file for error reporting
    /// </summary>
    private async Task<List<string>> GetAvailableEventTypesFromFile(string eventTypesFile)
    {
        try
        {
            var eventTypesObject = await _eventTypesParser.GetEventTypesObject(eventTypesFile);
            return eventTypesObject.Keys.Take(10).ToList(); // Limit for error message readability
        }
        catch
        {
            return new List<string>();
        }
    }

    // LEGACY METHODS - Keep for backward compatibility but mark as obsolete
    [Obsolete("This method uses syntactic analysis. Use ValidateEventTypeReferencesSemanticAnalysis instead.")]
    private async Task<HashSet<string>> GetAvailableEventTypes(string symphonyPath)
    {
        var eventTypes = new HashSet<string>();

        // RenderX uses domain-based event organization. We need to follow the resolution chain:
        // SequenceTypes.ts → EventBus.ts → event-types/index.ts → domain-specific files

        // First, try to get event types from the aggregated event-types/index.ts
        var eventTypesIndexPath = Path.Combine(symphonyPath, "../../../../event-types/index.ts");
        var eventTypesFullPath = Path.GetFullPath(eventTypesIndexPath);

        if (File.Exists(eventTypesFullPath))
        {
            var eventTypesContent = await File.ReadAllTextAsync(eventTypesFullPath);
            eventTypes.UnionWith(await ExtractEventTypesFromAggregatedFile(eventTypesContent));
        }

        // Fallback: Check SequenceTypes.ts (corrected path - should be 3 levels up, not 4)
        var sequenceTypesPath = Path.Combine(symphonyPath, "../../../core/SequenceTypes.ts");
        var sequenceTypesFullPath = Path.GetFullPath(sequenceTypesPath);

        if (File.Exists(sequenceTypesFullPath))
        {
            var sequenceTypesContent = await File.ReadAllTextAsync(sequenceTypesFullPath);
            eventTypes.UnionWith(await ExtractEventTypesFromSequenceTypes(sequenceTypesContent));
        }

        // Additional fallback: Check domain-specific event type files
        var domainEventTypes = await GetDomainSpecificEventTypes(symphonyPath);
        eventTypes.UnionWith(domainEventTypes);

        return eventTypes;
    }

    [Obsolete("This method uses syntactic analysis. Use EventTypesParser instead.")]
    private async Task<HashSet<string>> ExtractEventTypesFromAggregatedFile(string content)
    {
        var eventTypes = new HashSet<string>();

        // Look for the unified EVENT_TYPES object definition
        var eventTypesObjectPattern = @"export\s+const\s+EVENT_TYPES\s*=\s*\{([\s\S]*?)\};";
        var objectMatch = Regex.Match(content, eventTypesObjectPattern);

        if (objectMatch.Success)
        {
            var objectContent = objectMatch.Groups[1].Value;

            // Extract individual event type definitions
            var eventTypePattern = @"([A-Z_][A-Z0-9_]*)\s*:\s*['""]([^'""]+)['""]";
            var matches = Regex.Matches(objectContent, eventTypePattern);

            foreach (Match match in matches)
            {
                eventTypes.Add(match.Groups[1].Value);
            }
        }

        // Also look for spread operator imports (...CANVAS_EVENT_TYPES, etc.)
        var spreadPattern = @"\.\.\.([A-Z_]+_EVENT_TYPES)";
        var spreadMatches = Regex.Matches(content, spreadPattern);

        foreach (Match match in spreadMatches)
        {
            // For spread imports, we need to look at the imported domain files
            var domainEventTypes = await GetEventTypesFromDomainImport(content, match.Groups[1].Value);
            eventTypes.UnionWith(domainEventTypes);
        }

        return eventTypes;
    }

    [Obsolete("This method uses syntactic analysis. Use EventTypesParser instead.")]
    private async Task<HashSet<string>> ExtractEventTypesFromSequenceTypes(string content)
    {
        var eventTypes = new HashSet<string>();

        // SequenceTypes.ts typically re-exports EVENT_TYPES, so we look for direct definitions
        // This is the fallback method for the old approach
        var eventTypePattern = @"([A-Z_][A-Z0-9_]*)\s*:\s*['""]([^'""]+)['""]";
        var matches = Regex.Matches(content, eventTypePattern);

        foreach (Match match in matches)
        {
            var eventTypeName = match.Groups[1].Value;
            // Filter out non-event constants (MUSICAL_DYNAMICS, MUSICAL_TIMING, etc.)
            if (IsLikelyEventType(eventTypeName))
            {
                eventTypes.Add(eventTypeName);
            }
        }

        return eventTypes;
    }

    private bool IsLikelyEventType(string constantName)
    {
        // Filter out known non-event constants
        var nonEventConstants = new HashSet<string>
        {
            "PIANISSIMO", "PIANO", "MEZZO_PIANO", "MEZZO_FORTE", "FORTE", "FORTISSIMO", // MUSICAL_DYNAMICS
            "IMMEDIATE", "AFTER_BEAT", "DELAYED", "SYNCHRONIZED", // MUSICAL_TIMING
            "COMPONENT_UI", "COMPONENT_LAYOUT", "COMPONENT_CANVAS", "SYSTEM_CANVAS", // SEQUENCE_CATEGORIES
            "SYSTEM_LIBRARY", "SYSTEM_GLOBAL", "PATTERN_ACCESSIBILITY", "PATTERN_INTERACTION",
            "PATTERN_SELECTION", "PATTERN_COORDINATION", // More SEQUENCE_CATEGORIES
            "ABORT_SEQUENCE", "RETRY_ONCE", "RETRY_WITH_BACKOFF", "LOG_AND_CONTINUE", // ERROR_HANDLING_STRATEGIES
            "FALLBACK_TO_DEFAULT", "ROLLBACK_STATE"
        };

        return !nonEventConstants.Contains(constantName);
    }

    [Obsolete("This method uses syntactic analysis. Use ValidateEventTypeReferencesSemanticAnalysis instead.")]
    private async Task<List<EventTypeViolation>> ValidateEventTypeReferences(string filePath, string content, HashSet<string> availableEventTypes)
    {
        var violations = new List<EventTypeViolation>();
        
        // Find all EVENT_TYPES references
        var eventTypePattern = @"event:\s*EVENT_TYPES\.([A-Z_]+)";
        var matches = Regex.Matches(content, eventTypePattern);
        
        foreach (Match match in matches)
        {
            var eventTypeName = match.Groups[1].Value;
            var lineNumber = GetLineNumber(content, match.Index);
            
            if (!availableEventTypes.Contains(eventTypeName))
            {
                violations.Add(new EventTypeViolation
                {
                    RuleName = "UNDEFINED_EVENT_REFERENCE",
                    Description = $"Event type '{eventTypeName}' is not defined in SequenceTypes.ts",
                    FilePath = filePath,
                    LineNumber = lineNumber,
                    EventTypeName = eventTypeName,
                    AvailableEventTypes = availableEventTypes.ToList(),
                    Severity = ViolationSeverity.Critical
                });
            }
        }
        
        return violations;
    }

    private async Task<HashSet<string>> GetEventTypesFromDomainImport(string content, string domainEventTypeName)
    {
        var eventTypes = new HashSet<string>();

        // Look for the import statement for this domain event type
        var importPattern = $@"import\s*\{{\s*{domainEventTypeName}\s*\}}\s*from\s*['""]([^'""]+)['""]";
        var importMatch = Regex.Match(content, importPattern);

        if (importMatch.Success)
        {
            var importPath = importMatch.Groups[1].Value;
            // This would require resolving the import path and reading the domain file
            // For now, we'll use a simplified approach based on known domain patterns
            eventTypes.UnionWith(GetKnownEventTypesForDomain(domainEventTypeName));
        }

        return eventTypes;
    }

    private HashSet<string> GetKnownEventTypesForDomain(string domainEventTypeName)
    {
        var eventTypes = new HashSet<string>();

        // Based on the domain name, return known event types
        // This is a simplified approach - in a full implementation, we'd parse the actual domain files
        switch (domainEventTypeName)
        {
            case "CANVAS_EVENT_TYPES":
                eventTypes.UnionWith(new[]
                {
                    "CANVAS_ELEMENT_ADDED", "CANVAS_ELEMENT_SELECTED", "CANVAS_ELEMENT_MOVED", "CANVAS_ELEMENT_DELETED",
                    "CANVAS_ZOOM_CHANGED", "CANVAS_PAN_CHANGED", "CANVAS_DROP", "CANVAS_DRAG_OVER", "CANVAS_DRAG_LEAVE",
                    "CANVAS_CLICK", "CANVAS_DOUBLE_CLICK", "CANVAS_DROP_VALIDATION", "CANVAS_LIBRARY_DROP_DETECTED",
                    "CANVAS_LIBRARY_ELEMENT_POSITIONING", "CANVAS_LIBRARY_ELEMENT_INTEGRATION", "CANVAS_LIBRARY_DROP_COORDINATION"
                });
                break;
            case "CONTROL_PANEL_EVENT_TYPES":
                eventTypes.UnionWith(new[]
                {
                    "CONTROL_PANEL_UPDATE", "CONTROL_PANEL_PROPERTY_CHANGED", "CONTROL_PANEL_RESET", "CONTROL_PANEL_REFRESH",
                    "CONTROL_PANEL_PROPERTY_CHANGE_DETECTED", "CONTROL_PANEL_PROPERTY_VALIDATION", "CONTROL_PANEL_VISUAL_FEEDBACK",
                    "CONTROL_PANEL_VALIDATION_REQUEST", "CONTROL_PANEL_VALIDATION_RESPONSE", "CONTROL_PANEL_VALIDATION_ERROR",
                    "CONTROL_PANEL_COMPONENT_COORDINATION", "CONTROL_PANEL_SYNC_REQUEST", "PROPERTY_VALUE_CHANGED",
                    "PROPERTY_VALIDATION_COMPLETE", "PROPERTY_UPDATE_COMPLETE", "CONTROL_PANEL_STATE_SYNC"
                });
                break;
            case "DIV_EVENT_TYPES":
                eventTypes.UnionWith(new[]
                {
                    "DIV_CREATED", "DIV_UPDATED", "DIV_DELETED", "DIV_SELECTED", "DIV_DESELECTED", "DIV_FOCUSED", "DIV_BLURRED",
                    "DIV_CHILD_DROP_DETECTED", "DIV_CHILD_VALIDATION", "DIV_CHILD_POSITIONING", "DIV_LAYOUT_UPDATE", "DIV_CHILD_SELECTED", "DIV_VISUAL_TOOLS_RENDER",
                    "DIV_CHILD_ADDED", "DIV_CHILD_REMOVED", "DIV_CHILD_MOVED", "DIV_CHILD_RESIZED",
                    "DIV_CLICKED", "DIV_DOUBLE_CLICKED", "DIV_CONTEXT_MENU", "DIV_DRAG_START", "DIV_DRAG_MOVE", "DIV_DRAG_END",
                    "DIV_CHILD_DRAG_START", "DIV_DRAG_MODE_ACTIVATE", "DIV_CHILD_POSITION_UPDATE", "DIV_CHILD_DRAG_END",
                    "DIV_RESIZE_START", "DIV_RESIZE_MOVE", "DIV_RESIZE_END"
                });
                break;
            case "DRAG_EVENT_TYPES":
                eventTypes.UnionWith(new[]
                {
                    "DRAG_START", "DRAG_MOVE", "DRAG_END", "DRAG_CANCEL"
                });
                break;
            case "RESIZE_EVENT_TYPES":
                eventTypes.UnionWith(new[]
                {
                    "RESIZE_START", "RESIZE_MOVE", "RESIZE_END", "RESIZE_CANCEL"
                });
                break;
            // Add more domains as needed
        }

        return eventTypes;
    }

    private async Task<HashSet<string>> GetDomainSpecificEventTypes(string symphonyPath)
    {
        var eventTypes = new HashSet<string>();

        // Check common domain-specific event type files
        var domainFiles = new[]
        {
            "../../../../event-types/core/canvas.event-types.ts",
            "../../../../event-types/interactions/drag.event-types.ts",
            "../../../../event-types/interactions/resize.event-types.ts",
            "../../../../event-types/interactions/selection.event-types.ts"
        };

        foreach (var domainFile in domainFiles)
        {
            var domainPath = Path.Combine(symphonyPath, domainFile);
            var fullDomainPath = Path.GetFullPath(domainPath);

            if (File.Exists(fullDomainPath))
            {
                var domainContent = await File.ReadAllTextAsync(fullDomainPath);
                eventTypes.UnionWith(await ExtractEventTypesFromDomainFile(domainContent));
            }
        }

        return eventTypes;
    }

    private async Task<HashSet<string>> ExtractEventTypesFromDomainFile(string content)
    {
        var eventTypes = new HashSet<string>();

        // Look for export const DOMAIN_EVENT_TYPES = { ... } pattern
        var eventTypesObjectPattern = @"export\s+const\s+[A-Z_]+_EVENT_TYPES\s*=\s*\{([\s\S]*?)\};";
        var objectMatch = Regex.Match(content, eventTypesObjectPattern);

        if (objectMatch.Success)
        {
            var objectContent = objectMatch.Groups[1].Value;

            // Extract individual event type definitions
            var eventTypePattern = @"([A-Z_][A-Z0-9_]*)\s*:\s*['""]([^'""]+)['""]";
            var matches = Regex.Matches(objectContent, eventTypePattern);

            foreach (Match match in matches)
            {
                eventTypes.Add(match.Groups[1].Value);
            }
        }

        return eventTypes;
    }

    private int GetLineNumber(string content, int characterIndex)
    {
        return content.Substring(0, characterIndex).Count(c => c == '\n') + 1;
    }
}

public class EventTypeViolation
{
    public string RuleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public int LineNumber { get; set; }
    public string EventTypeName { get; set; } = string.Empty;
    public List<string> AvailableEventTypes { get; set; } = new();
    public ViolationSeverity Severity { get; set; }
}
