using RX.Architecture.Validator.Console.Models;
using RX.Architecture.Validator.Console.Services;
using System.Text.RegularExpressions;

namespace RX.Architecture.Validator.Console.Validators;

public class ImportPathValidator
{
    private readonly ConfigurationService _configService;
    private readonly Dictionary<string, ImportPathRule> _importRules;

    public ImportPathValidator()
    {
        _configService = new ConfigurationService();
        _importRules = InitializeImportRules();
    }

    private Dictionary<string, ImportPathRule> InitializeImportRules()
    {
        return new Dictionary<string, ImportPathRule>
        {
            // EventBus imports (hooks.ts, registry.ts)
            ["EVENTBUS_IMPORT"] = new ImportPathRule
            {
                FilePattern = @"(hooks|registry)\.js$",
                ImportPattern = @"import[\s\S]*?from\s+['""]([^'""]*EventBus\.js)['""]",
                ExpectedPattern = "../../../../EventBus.ts",
                Description = "EventBus imports must be 4 levels up from symphony directory",
                AutoFixPattern = "../../../../EventBus.ts"
            },

            // Conductor imports (hooks.ts)
            ["CONDUCTOR_IMPORT"] = new ImportPathRule
            {
                FilePattern = @"hooks\.js$",
                ImportPattern = @"import[\s\S]*?from\s+['""]([^'""]*sequences/index\.js)['""]",
                ExpectedPattern = "../../../index.ts",
                Description = "Conductor imports must be 3 levels up from symphony directory",
                AutoFixPattern = "../../../index.ts"
            },

            // Event types imports (registry.ts, sequence.ts)
            ["EVENT_TYPES_IMPORT"] = new ImportPathRule
            {
                FilePattern = @"(registry|sequence)\.js$",
                ImportPattern = @"import[\s\S]*?from\s+['""]([^'""]*event-types/core/[^'""]*\.event-types\.js)['""]",
                ExpectedPattern = "../../../../event-types/core/{component}.event-types.ts",
                Description = "Event types imports must be 4 levels up from symphony directory",
                AutoFixPattern = "../../../../event-types/core/{component}.event-types.ts"
            },

            // CSS generation imports (business-logic.ts)
            ["CSS_GENERATION_IMPORT"] = new ImportPathRule
            {
                FilePattern = @"business-logic\.js$",
                ImportPattern = @"import[\s\S]*?from\s+['""]([^'""]*components/elements/[^/]+/[^'""]*\.utils\.js)['""]",
                ExpectedPattern = "../../../../../components/elements/{component}/{component}.utils.ts",
                Description = "CSS generation imports must be 5 levels up from symphony directory",
                AutoFixPattern = "../../../../../components/elements/{component}/{component}.utils.ts"
            },

            // Internal symphony imports
            ["INTERNAL_SYMPHONY_IMPORT"] = new ImportPathRule
            {
                FilePattern = @"(index|hooks|handlers|registry|business-logic)\.js$",
                ImportPattern = @"import[\s\S]*?from\s+['""](\./[^'""]+\.js)['""]",
                ExpectedPattern = "./{filename}.js",
                Description = "Internal symphony imports must use relative paths within symphony directory",
                AutoFixPattern = "./{filename}.js"
            },

            // Sequence types imports (sequence.ts)
            ["SEQUENCE_TYPES_IMPORT"] = new ImportPathRule
            {
                FilePattern = @"sequence\.js$",
                ImportPattern = @"import[\s\S]*?from\s+['""]([^'""]*SequenceTypes\.js)['""]",
                ExpectedPattern = "../../../core/SequenceTypes.ts",
                Description = "SequenceTypes imports must be 3 levels up from symphony directory",
                AutoFixPattern = "../../../core/SequenceTypes.ts"
            }
        };
    }

    public async Task<List<ImportPathViolation>> ValidateImportPaths(string filePath, string content)
    {
        var violations = new List<ImportPathViolation>();
        var fileName = Path.GetFileName(filePath);
        var lines = content.Split('\n');

        foreach (var (ruleName, rule) in _importRules)
        {
            // Check if rule applies to this file
            if (!Regex.IsMatch(fileName, rule.FilePattern))
                continue;

            // Find import statements matching this rule
            var matches = Regex.Matches(content, rule.ImportPattern, RegexOptions.Multiline);
            
            foreach (Match match in matches)
            {
                var actualImport = match.Groups[1].Value;
                var lineNumber = GetLineNumber(content, match.Index);
                
                if (!IsValidImportPath(actualImport, rule, fileName))
                {
                    violations.Add(new ImportPathViolation
                    {
                        RuleName = ruleName,
                        Description = rule.Description,
                        FilePath = filePath,
                        LineNumber = lineNumber,
                        ActualImport = actualImport,
                        ExpectedPattern = rule.ExpectedPattern,
                        AutoFixSuggestion = GenerateAutoFixSuggestion(rule, fileName, actualImport),
                        Severity = ViolationSeverity.Error
                    });
                }
            }
        }

        return violations;
    }

    public async Task<AutoFixResult> FixImportPath(ImportPathViolation violation)
    {
        try
        {
            var content = await File.ReadAllTextAsync(violation.FilePath);
            var rule = _importRules[violation.RuleName];
            
            // Generate the correct import path
            var correctImport = GenerateCorrectImportPath(rule, Path.GetFileName(violation.FilePath), violation.ActualImport);
            
            // Replace the incorrect import
            var pattern = Regex.Escape(violation.ActualImport);
            var fixedContent = Regex.Replace(content, pattern, correctImport);
            
            // Write the fixed content back
            await File.WriteAllTextAsync(violation.FilePath, fixedContent);
            
            return new AutoFixResult
            {
                Success = true,
                Message = $"Fixed import path: {violation.ActualImport} → {correctImport}",
                OriginalCode = violation.ActualImport,
                FixedCode = correctImport
            };
        }
        catch (Exception ex)
        {
            return new AutoFixResult
            {
                Success = false,
                Message = $"Failed to fix import path: {ex.Message}"
            };
        }
    }

    private bool IsValidImportPath(string actualImport, ImportPathRule rule, string fileName)
    {
        // For internal symphony imports, check if it's a relative path
        if (rule.FilePattern.Contains("index|hooks|handlers|registry|business-logic") &&
            actualImport.StartsWith("./"))
        {
            return true; // Internal imports are valid if they start with ./
        }

        // For external imports, resolve template placeholders and then compare
        var resolvedExpectedPattern = ResolveTemplatePattern(rule.ExpectedPattern, actualImport);
        return actualImport == resolvedExpectedPattern;
    }

    private string ResolveTemplatePattern(string templatePattern, string actualImport)
    {
        // Handle CSS generation imports: ../../../../../components/elements/ComponentName/ComponentName.utils.ts
        var cssComponentMatch = Regex.Match(actualImport, @"components/elements/([^/]+)/\1\.utils\.js$");
        if (cssComponentMatch.Success)
        {
            var componentName = cssComponentMatch.Groups[1].Value;
            return templatePattern.Replace("{component}", componentName);
        }

        // Handle event types imports: ../../../../event-types/core/componentname.event-types.ts
        var eventTypesMatch = Regex.Match(actualImport, @"event-types/core/([^/]+)\.event-types\.js$");
        if (eventTypesMatch.Success)
        {
            var componentName = eventTypesMatch.Groups[1].Value;
            return templatePattern.Replace("{component}", componentName);
        }

        // If we can't extract component name, return template as-is for comparison
        // This will likely fail validation, which is correct behavior
        return templatePattern;
    }

    private int GetExpectedDepth(string expectedPattern)
    {
        return expectedPattern.Count(c => c == '/') - expectedPattern.Split('/').Count(part => part == "..");
    }

    private int GetImportDepth(string importPath)
    {
        if (importPath.StartsWith("./"))
            return 0; // Same directory
            
        var parts = importPath.Split('/');
        var upLevels = parts.Count(part => part == "..");
        return upLevels;
    }

    private string GenerateAutoFixSuggestion(ImportPathRule rule, string fileName, string actualImport)
    {
        // Use the same template resolution logic as validation
        return ResolveTemplatePattern(rule.AutoFixPattern, actualImport);
    }

    private string GenerateCorrectImportPath(ImportPathRule rule, string fileName, string actualImport)
    {
        var template = rule.AutoFixPattern;
        
        // Replace placeholders
        if (template.Contains("{component}"))
        {
            var componentName = ExtractComponentName(fileName);
            template = template.Replace("{component}", componentName);
        }
        
        if (template.Contains("{filename}"))
        {
            var targetFileName = ExtractTargetFileName(actualImport);
            template = template.Replace("{filename}", targetFileName);
        }
        
        return template;
    }

    private string ExtractComponentName(string fileName)
    {
        // Extract component name from file context
        // This would be more sophisticated in a real implementation
        if (fileName.Contains("Canvas"))
            return "canvas";
        if (fileName.Contains("Button"))
            return "button";
        if (fileName.Contains("Container"))
            return "container";
            
        return "component"; // Default fallback
    }

    private string ExtractTargetFileName(string importPath)
    {
        var fileName = Path.GetFileNameWithoutExtension(importPath);
        return fileName;
    }

    private int GetLineNumber(string content, int characterIndex)
    {
        return content.Substring(0, characterIndex).Count(c => c == '\n') + 1;
    }

    public async Task<ImportPathValidationSummary> ValidateAllImportPaths(string symphonyPath)
    {
        var summary = new ImportPathValidationSummary
        {
            SymphonyPath = symphonyPath,
            ValidationTimestamp = DateTime.UtcNow
        };

        if (!Directory.Exists(symphonyPath))
        {
            summary.Errors.Add($"Symphony directory not found: {symphonyPath}");
            return summary;
        }

        var jsFiles = Directory.GetFiles(symphonyPath, "*.js");
        var tsFiles = Directory.GetFiles(symphonyPath, "*.ts");
        var allFiles = jsFiles.Concat(tsFiles);

        foreach (var filePath in allFiles)
        {
            var content = await File.ReadAllTextAsync(filePath);
            var violations = await ValidateImportPaths(filePath, content);

            summary.FileResults.Add(new ImportPathFileResult
            {
                FilePath = filePath,
                FileName = Path.GetFileName(filePath),
                Violations = violations,
                IsCompliant = !violations.Any()
            });

            summary.TotalViolations += violations.Count;
        }

        summary.FilesChecked = allFiles.Count();
        summary.CompliantFiles = summary.FileResults.Count(f => f.IsCompliant);
        summary.IsCompliant = summary.TotalViolations == 0;

        return summary;
    }
}

public class ImportPathValidationSummary
{
    public string SymphonyPath { get; set; } = string.Empty;
    public DateTime ValidationTimestamp { get; set; }
    public int FilesChecked { get; set; }
    public int CompliantFiles { get; set; }
    public int TotalViolations { get; set; }
    public bool IsCompliant { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<ImportPathFileResult> FileResults { get; set; } = new();
}

public class ImportPathFileResult
{
    public string FilePath { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public List<ImportPathViolation> Violations { get; set; } = new();
    public bool IsCompliant { get; set; }
}
