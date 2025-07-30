using RX.Architecture.Validator.Console.Models;
using RX.Architecture.Validator.Console.Services;
using System.Text.RegularExpressions;

namespace RX.Architecture.Validator.Console.Validators;

public class ArchitectureViolationDetector
{
    private readonly ConfigurationService _configService;
    private readonly Dictionary<string, ViolationPattern> _violationPatterns;

    public ArchitectureViolationDetector()
    {
        _configService = new ConfigurationService();
        _violationPatterns = InitializeViolationPatterns();
    }

    private Dictionary<string, ViolationPattern> InitializeViolationPatterns()
    {
        return new Dictionary<string, ViolationPattern>
        {
            // Direct EventBus violations
            ["DIRECT_EVENTBUS_EMIT"] = new ViolationPattern
            {
                Regex = @"eventBus\.emit\s*\(\s*['""]([^'""]+)['""]",
                Severity = ViolationSeverity.Critical,
                Description = "Direct eventBus.emit() call bypasses musical sequence architecture",
                Suggestion = "Use MusicalSequences.start{ComponentName}Flow() instead"
            },
            
            // Conductor bypass violations
            ["CONDUCTOR_EMIT_EVENT"] = new ViolationPattern
            {
                Regex = @"conductor\.emitEvent\s*\(\s*['""]([^'""]+)['""]",
                Severity = ViolationSeverity.Critical,
                Description = "conductor.emitEvent() bypasses proper beat execution",
                Suggestion = "Use conductor.executeBeat() within sequence definition"
            },
            
            // Direct conductor method violations
            ["DIRECT_EXECUTE_MOVEMENT"] = new ViolationPattern
            {
                Regex = @"conductor\.executeMovement\s*\(",
                Severity = ViolationSeverity.Critical,
                Description = "Direct conductor.executeMovement() call outside sequence context",
                Suggestion = "executeMovement() should only be called within sequence definitions"
            },
            
            ["DIRECT_EXECUTE_BEAT"] = new ViolationPattern
            {
                Regex = @"conductor\.executeBeat\s*\(",
                Severity = ViolationSeverity.Error,
                Description = "conductor.executeBeat() called outside sequence beat context",
                Suggestion = "executeBeat() should only be called within sequence beat definitions",
                AllowedContexts = new[] { "sequence.ts", "symphony.ts" }
            },

            // EventBus API Method Violations
            ["INCORRECT_EVENTBUS_METHOD"] = new ViolationPattern
            {
                Regex = @"eventBus\.(on|addEventListener|addListener|off|removeEventListener|removeListener)\s*\(",
                Severity = ViolationSeverity.Critical,
                Description = "Incorrect EventBus method - RenderX EventBus uses subscribe/unsubscribe pattern",
                Suggestion = "Replace eventBus.on() with eventBus.subscribe() and use returned unsubscribe function"
            },
            
            // Static EventBus violations
            ["STATIC_EVENTBUS_EMIT"] = new ViolationPattern
            {
                Regex = @"EventBus\.emit\s*\(",
                Severity = ViolationSeverity.Critical,
                Description = "Static EventBus.emit() call bypasses instance-based architecture",
                Suggestion = "Use eventBus instance through MusicalSequences API"
            },
            
            // Generic emit pattern violations
            ["GENERIC_EMIT_PATTERN"] = new ViolationPattern
            {
                Regex = @"\.emit\s*\(\s*['""]([^'""]+)['""]",
                Severity = ViolationSeverity.Warning,
                Description = "Generic .emit() pattern detected - verify compliance",
                Suggestion = "Ensure all event emissions flow through musical sequences"
            },
            
            // Custom event dispatch violations
            ["CUSTOM_EVENT_DISPATCH"] = new ViolationPattern
            {
                Regex = @"(dispatchEvent|fireEvent|triggerEvent|sendEvent)\s*\(",
                Severity = ViolationSeverity.Error,
                Description = "Custom event dispatch bypasses musical sequence architecture",
                Suggestion = "Use MusicalSequences API for all event coordination"
            },
            
            // Direct DOM event violations
            ["DOM_EVENT_DISPATCH"] = new ViolationPattern
            {
                Regex = @"document\.dispatchEvent\s*\(",
                Severity = ViolationSeverity.Error,
                Description = "Direct DOM event dispatch bypasses component architecture",
                Suggestion = "Use component-level event handling through musical sequences"
            },
            
            // Window event violations
            ["WINDOW_EVENT_DISPATCH"] = new ViolationPattern
            {
                Regex = @"window\.(dispatchEvent|postMessage)\s*\(",
                Severity = ViolationSeverity.Warning,
                Description = "Window-level event dispatch detected - verify necessity",
                Suggestion = "Consider using musical sequences for component communication"
            }
        };
    }

    public async Task<List<ArchitectureViolation>> DetectViolations(string filePath, string content)
    {
        var violations = new List<ArchitectureViolation>();
        var fileName = Path.GetFileName(filePath);
        var lines = content.Split('\n');
        
        for (int i = 0; i < lines.Length; i++)
        {
            var line = lines[i].Trim();
            var lineNumber = i + 1;
            
            // Skip comments and imports
            if (IsSkippableLine(line))
                continue;
                
            // Check each violation pattern
            foreach (var (patternName, pattern) in _violationPatterns)
            {
                if (IsViolation(line, pattern, fileName))
                {
                    var match = Regex.Match(line, pattern.Regex);
                    violations.Add(new ArchitectureViolation
                    {
                        Type = patternName,
                        Description = pattern.Description,
                        FilePath = filePath,
                        LineNumber = lineNumber,
                        CodeSnippet = line,
                        Suggestion = pattern.Suggestion,
                        Severity = pattern.Severity,
                        EventName = match.Groups.Count > 1 ? match.Groups[1].Value : null
                    });
                }
            }
        }
        
        return violations;
    }

    private bool IsViolation(string line, ViolationPattern pattern, string fileName)
    {
        // Check if pattern matches
        if (!Regex.IsMatch(line, pattern.Regex))
            return false;
            
        // Check allowed contexts
        if (pattern.AllowedContexts?.Any() == true)
        {
            if (!pattern.AllowedContexts.Any(context => fileName.Contains(context)))
                return true; // Violation: not in allowed context
        }
        
        // Check prohibited contexts
        if (pattern.ProhibitedContexts?.Any() == true)
        {
            if (pattern.ProhibitedContexts.Any(context => fileName.Contains(context)))
                return true; // Violation: in prohibited context
        }
        
        // Check file-specific rules
        if (pattern.AppliedToFiles?.Any() == true)
        {
            if (!pattern.AppliedToFiles.Any(file => fileName.Contains(file)))
                return false; // Not applicable to this file
        }
        
        return true; // Default: it's a violation
    }
    
    private bool IsSkippableLine(string line)
    {
        return line.StartsWith("//") || 
               line.StartsWith("/*") || 
               line.StartsWith("*") ||
               line.StartsWith("import") ||
               line.StartsWith("export") && line.Contains("from") ||
               string.IsNullOrWhiteSpace(line);
    }
}
