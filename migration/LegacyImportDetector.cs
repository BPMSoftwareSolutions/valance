using RX.Architecture.Validator.Console.Models;
using System.Text.RegularExpressions;

namespace RX.Architecture.Validator.Console.Validators;

public class LegacyImportDetector
{
    private readonly Dictionary<string, LegacyImportRule> _legacyImportRules;

    public LegacyImportDetector()
    {
        _legacyImportRules = InitializeLegacyImportRules();
    }

    private Dictionary<string, LegacyImportRule> InitializeLegacyImportRules()
    {
        return new Dictionary<string, LegacyImportRule>
        {
            // Single file symphony imports that should be directory imports
            ["SINGLE_FILE_SYMPHONY_IMPORT"] = new LegacyImportRule
            {
                Pattern = @"from\s+['""]([^'""]*CanvasSequences\.[^'""]*-symphony)\.js['""]",
                Description = "Single file symphony import detected - should import from directory/index.ts",
                Severity = ViolationSeverity.Critical,
                AutoFixPattern = "{importPath}/index.ts",
                ExampleFix = "./CanvasSequences.element-selection-symphony.ts → ./CanvasSequences.element-selection-symphony/index.ts"
            },

            // Component sequence single file imports
            ["COMPONENT_SEQUENCE_SINGLE_FILE"] = new LegacyImportRule
            {
                Pattern = @"from\s+['""]([^'""]*Sequences\.[^'""]*-sequence)\.js['""]",
                Description = "Component sequence single file import - should use unified directory structure",
                Severity = ViolationSeverity.Error,
                AutoFixPattern = "{importPath}/index.ts",
                ExampleFix = "./ButtonSequences.resize-sequence.ts → ./ButtonSequences.resize-sequence/index.ts"
            },

            // Direct sequence file imports (bypassing index.ts)
            ["DIRECT_SEQUENCE_FILE_IMPORT"] = new LegacyImportRule
            {
                Pattern = @"from\s+['""]([^'""]*-symphony)/(?!index\.js)([^'""]+\.js)['""]",
                Description = "Direct sequence file import bypassing index.ts - should import from index.ts",
                Severity = ViolationSeverity.Warning,
                AutoFixPattern = "{directoryPath}/index.ts",
                ExampleFix = "./symphony/sequence.ts → ./symphony/index.ts"
            },

            // Old naming convention imports
            ["OLD_NAMING_CONVENTION"] = new LegacyImportRule
            {
                Pattern = @"from\s+['""]([^'""]*(?:Canvas|Button|Container)(?:Sequence|Symphony)[^'""]*)['""]",
                Description = "Old naming convention detected - verify compliance with unified architecture",
                Severity = ViolationSeverity.Warning,
                AutoFixPattern = "Review naming convention compliance",
                ExampleFix = "Verify follows [Component]Sequences.[name]-symphony pattern"
            }
        };
    }

    public async Task<List<LegacyImportViolation>> DetectLegacyImports(string filePath, string content)
    {
        var violations = new List<LegacyImportViolation>();
        var fileName = Path.GetFileName(filePath);
        var lines = content.Split('\n');

        foreach (var (ruleName, rule) in _legacyImportRules)
        {
            var matches = Regex.Matches(content, rule.Pattern, RegexOptions.Multiline | RegexOptions.IgnoreCase);
            
            foreach (Match match in matches)
            {
                var importPath = match.Groups[1].Value;
                var lineNumber = GetLineNumber(content, match.Index);
                var fullMatch = match.Value;
                
                violations.Add(new LegacyImportViolation
                {
                    RuleName = ruleName,
                    Description = rule.Description,
                    FilePath = filePath,
                    LineNumber = lineNumber,
                    LegacyImport = importPath,
                    FullImportStatement = fullMatch,
                    Severity = rule.Severity,
                    AutoFixSuggestion = GenerateAutoFixSuggestion(rule, importPath),
                    ExampleFix = rule.ExampleFix
                });
            }
        }

        return violations;
    }

    public async Task<LegacyImportValidationSummary> ValidateDirectory(string directoryPath)
    {
        var summary = new LegacyImportValidationSummary
        {
            DirectoryPath = directoryPath,
            ValidationTimestamp = DateTime.UtcNow
        };

        if (!Directory.Exists(directoryPath))
        {
            summary.ValidationErrors.Add($"Directory not found: {directoryPath}");
            return summary;
        }

        // Check all JavaScript files in the directory and subdirectories
        var jsFiles = Directory.GetFiles(directoryPath, "*.js", SearchOption.AllDirectories);
        
        foreach (var filePath in jsFiles)
        {
            var content = await File.ReadAllTextAsync(filePath);
            var violations = await DetectLegacyImports(filePath, content);
            
            if (violations.Any())
            {
                summary.FileResults.Add(new LegacyImportFileResult
                {
                    FilePath = filePath,
                    FileName = Path.GetFileName(filePath),
                    Violations = violations,
                    HasLegacyImports = true
                });
                
                summary.TotalViolations += violations.Count;
                summary.CriticalIssues += violations.Count(v => v.Severity == ViolationSeverity.Critical);
                summary.Errors += violations.Count(v => v.Severity == ViolationSeverity.Error);
                summary.Warnings += violations.Count(v => v.Severity == ViolationSeverity.Warning);
            }
        }

        summary.FilesChecked = jsFiles.Length;
        summary.FilesWithLegacyImports = summary.FileResults.Count;
        summary.IsCompliant = summary.TotalViolations == 0;

        return summary;
    }

    public async Task<AutoFixResult> FixLegacyImport(LegacyImportViolation violation)
    {
        try
        {
            var content = await File.ReadAllTextAsync(violation.FilePath);
            var rule = _legacyImportRules[violation.RuleName];
            
            // Generate the correct import path
            var correctImport = GenerateCorrectImportPath(rule, violation.LegacyImport);
            
            if (string.IsNullOrEmpty(correctImport))
            {
                return new AutoFixResult
                {
                    Success = false,
                    Message = $"Cannot auto-generate fix for: {violation.LegacyImport}"
                };
            }
            
            // Replace the legacy import with the correct one
            var oldImportPattern = Regex.Escape(violation.FullImportStatement);
            var newImportStatement = violation.FullImportStatement.Replace(violation.LegacyImport, correctImport);
            
            var fixedContent = Regex.Replace(content, oldImportPattern, newImportStatement);
            
            await File.WriteAllTextAsync(violation.FilePath, fixedContent);
            
            return new AutoFixResult
            {
                Success = true,
                Message = $"Fixed legacy import: {violation.LegacyImport} → {correctImport}",
                OriginalCode = violation.FullImportStatement,
                FixedCode = newImportStatement
            };
        }
        catch (Exception ex)
        {
            return new AutoFixResult
            {
                Success = false,
                Message = $"Failed to fix legacy import: {ex.Message}"
            };
        }
    }

    private string GenerateAutoFixSuggestion(LegacyImportRule rule, string importPath)
    {
        return GenerateCorrectImportPath(rule, importPath);
    }

    private string GenerateCorrectImportPath(LegacyImportRule rule, string importPath)
    {
        var template = rule.AutoFixPattern;
        
        if (template.Contains("{importPath}"))
        {
            return template.Replace("{importPath}", importPath);
        }
        
        if (template.Contains("{directoryPath}"))
        {
            var directoryPath = Path.GetDirectoryName(importPath) ?? importPath;
            return template.Replace("{directoryPath}", directoryPath);
        }
        
        return template;
    }

    private int GetLineNumber(string content, int characterIndex)
    {
        return content.Substring(0, characterIndex).Count(c => c == '\n') + 1;
    }
}

public class LegacyImportRule
{
    public string Pattern { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ViolationSeverity Severity { get; set; }
    public string AutoFixPattern { get; set; } = string.Empty;
    public string ExampleFix { get; set; } = string.Empty;
}

public class LegacyImportViolation
{
    public string RuleName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public int LineNumber { get; set; }
    public string LegacyImport { get; set; } = string.Empty;
    public string FullImportStatement { get; set; } = string.Empty;
    public ViolationSeverity Severity { get; set; }
    public string AutoFixSuggestion { get; set; } = string.Empty;
    public string ExampleFix { get; set; } = string.Empty;
}

public class LegacyImportValidationSummary
{
    public string DirectoryPath { get; set; } = string.Empty;
    public DateTime ValidationTimestamp { get; set; }
    public int FilesChecked { get; set; }
    public int FilesWithLegacyImports { get; set; }
    public int TotalViolations { get; set; }
    public int CriticalIssues { get; set; }
    public int Errors { get; set; }
    public int Warnings { get; set; }
    public bool IsCompliant { get; set; }
    public List<string> ValidationErrors { get; set; } = new();
    public List<LegacyImportFileResult> FileResults { get; set; } = new();
}

public class LegacyImportFileResult
{
    public string FilePath { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public List<LegacyImportViolation> Violations { get; set; } = new();
    public bool HasLegacyImports { get; set; }
}
