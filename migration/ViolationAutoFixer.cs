using RX.Architecture.Validator.Console.Models;
using System.Text.RegularExpressions;

namespace RX.Architecture.Validator.Console.Validators;

public class ViolationAutoFixer
{
    public async Task<AutoFixResult> FixViolation(ArchitectureViolation violation)
    {
        return violation.Type switch
        {
            "DIRECT_EVENTBUS_EMIT" => await FixDirectEventBusEmit(violation),
            "CONDUCTOR_EMIT_EVENT" => await FixConductorEmitEvent(violation),
            "HARDCODED_EVENT_NAMES" => await FixHardcodedEventNames(violation),
            "DIRECT_HANDLER_REGISTRATION" => await FixDirectHandlerRegistration(violation),
            _ => new AutoFixResult { Success = false, Message = "No auto-fix available" }
        };
    }
    
    private async Task<AutoFixResult> FixDirectEventBusEmit(ArchitectureViolation violation)
    {
        // Extract event name and data from the violation
        var match = Regex.Match(violation.CodeSnippet, @"eventBus\.emit\s*\(\s*['""]([^'""]+)['""](.*)");
        if (!match.Success)
            return new AutoFixResult { Success = false, Message = "Could not parse event emission" };
            
        var eventName = match.Groups[1].Value;
        var eventData = match.Groups[2].Value.Trim().TrimStart(',').Trim();
        
        // Generate replacement code
        var componentName = ExtractComponentName(violation.FilePath);
        var sequenceName = MapEventToSequence(eventName);
        
        var replacement = $"MusicalSequences.start{componentName}{sequenceName}Flow(eventBus, {eventData})";
        
        // Apply the fix
        var content = await File.ReadAllTextAsync(violation.FilePath);
        var fixedContent = content.Replace(violation.CodeSnippet, replacement);
        await File.WriteAllTextAsync(violation.FilePath, fixedContent);
        
        return new AutoFixResult 
        { 
            Success = true, 
            Message = $"Replaced direct eventBus.emit with MusicalSequences API",
            OriginalCode = violation.CodeSnippet,
            FixedCode = replacement
        };
    }

    private async Task<AutoFixResult> FixConductorEmitEvent(ArchitectureViolation violation)
    {
        // Extract event name and data from conductor.emitEvent call
        var match = Regex.Match(violation.CodeSnippet, @"conductor\.emitEvent\s*\(\s*['""]([^'""]+)['""](.*)");
        if (!match.Success)
            return new AutoFixResult { Success = false, Message = "Could not parse conductor.emitEvent call" };
            
        var eventName = match.Groups[1].Value;
        var eventData = match.Groups[2].Value.Trim().TrimStart(',').Trim();
        
        // Generate replacement code using conductor.executeBeat
        var replacement = $"conductor.executeBeat('{eventName}', {eventData})";
        
        // Apply the fix
        var content = await File.ReadAllTextAsync(violation.FilePath);
        var fixedContent = content.Replace(violation.CodeSnippet, replacement);
        await File.WriteAllTextAsync(violation.FilePath, fixedContent);
        
        return new AutoFixResult 
        { 
            Success = true, 
            Message = $"Replaced conductor.emitEvent with conductor.executeBeat",
            OriginalCode = violation.CodeSnippet,
            FixedCode = replacement
        };
    }

    private async Task<AutoFixResult> FixHardcodedEventNames(ArchitectureViolation violation)
    {
        if (string.IsNullOrEmpty(violation.EventName))
            return new AutoFixResult { Success = false, Message = "No event name found to fix" };

        // Convert event name to EVENT_TYPES constant
        var constantName = ConvertToEventTypeConstant(violation.EventName);
        var replacement = violation.CodeSnippet.Replace($"'{violation.EventName}'", $"EVENT_TYPES.{constantName}")
                                                .Replace($"\"{violation.EventName}\"", $"EVENT_TYPES.{constantName}");
        
        // Apply the fix
        var content = await File.ReadAllTextAsync(violation.FilePath);
        var fixedContent = content.Replace(violation.CodeSnippet, replacement);
        await File.WriteAllTextAsync(violation.FilePath, fixedContent);
        
        return new AutoFixResult 
        { 
            Success = true, 
            Message = $"Replaced hardcoded event name with EVENT_TYPES constant",
            OriginalCode = violation.CodeSnippet,
            FixedCode = replacement
        };
    }

    private async Task<AutoFixResult> FixDirectHandlerRegistration(ArchitectureViolation violation)
    {
        // This would require more complex analysis to move handler registration to registry files
        return new AutoFixResult 
        { 
            Success = false, 
            Message = "Direct handler registration fix requires manual intervention - move to registry.ts file" 
        };
    }

    private string ExtractComponentName(string filePath)
    {
        // Extract component name from file path
        // e.g., "Canvas" from path containing "Canvas" or "CanvasSequences"
        var fileName = Path.GetFileName(filePath);
        
        if (fileName.Contains("Canvas"))
            return "Canvas";
        if (fileName.Contains("Button"))
            return "Button";
        if (fileName.Contains("Container"))
            return "Container";
        if (fileName.Contains("Div"))
            return "Div";
            
        return "Component"; // Default fallback
    }

    private string MapEventToSequence(string eventName)
    {
        // Map event names to sequence names
        // This is a simplified mapping - in practice, this would be more sophisticated
        if (eventName.Contains("click") || eventName.Contains("select"))
            return "Component";
        if (eventName.Contains("drag"))
            return "Drag";
        if (eventName.Contains("resize"))
            return "Resize";
        if (eventName.Contains("focus") || eventName.Contains("blur"))
            return "Focus";
        if (eventName.Contains("css") || eventName.Contains("style"))
            return "CssSynchronization";
            
        return "Component"; // Default fallback
    }

    private string ConvertToEventTypeConstant(string eventName)
    {
        // Convert kebab-case or camelCase event names to UPPER_SNAKE_CASE
        return eventName.Replace("-", "_")
                       .Replace(" ", "_")
                       .ToUpperInvariant();
    }
}

public class AutoFixResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string OriginalCode { get; set; } = string.Empty;
    public string FixedCode { get; set; } = string.Empty;
}
