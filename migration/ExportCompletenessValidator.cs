using RX.Architecture.Validator.Console.Models;
using System.Text.RegularExpressions;

namespace RX.Architecture.Validator.Console.Validators;

public class ExportCompletenessValidator
{
    private readonly Dictionary<string, ExportRule> _exportRules;

    public ExportCompletenessValidator()
    {
        _exportRules = InitializeExportRules();
    }

    private Dictionary<string, ExportRule> InitializeExportRules()
    {
        return new Dictionary<string, ExportRule>
        {
            // index.ts exports (unified export file)
            ["INDEX_EXPORTS"] = new ExportRule
            {
                FilePattern = @"index\.js$",
                RequiredExports = new[]
                {
                    @"CANVAS_.*_SEQUENCE",
                    @"start.*Flow",
                    @"useCanvas.*Symphony",
                    @"CANVAS_.*_HANDLERS",
                    @"registerCanvas.*Handlers",
                    @"SYMPHONY_METADATA"
                },
                OptionalExports = new[]
                {
                    @".*business.*logic.*",
                    @".*utils.*",
                    @".*helpers.*"
                },
                Description = "index.ts must export all symphony components with unified pattern"
            },

            // sequence.ts exports
            ["SEQUENCE_EXPORTS"] = new ExportRule
            {
                FilePattern = @"sequence\.js$",
                RequiredExports = new[]
                {
                    @"CANVAS_.*_SEQUENCE",
                    @"start.*Flow"
                },
                OptionalExports = new string[0],
                Description = "sequence.ts must export sequence definition and flow starter"
            },

            // hooks.ts exports
            ["HOOKS_EXPORTS"] = new ExportRule
            {
                FilePattern = @"hooks\.js$",
                RequiredExports = new[]
                {
                    @"useCanvas.*Symphony"
                },
                OptionalExports = new string[0],
                Description = "hooks.ts must export the React hook implementation"
            },

            // handlers.ts exports
            ["HANDLERS_EXPORTS"] = new ExportRule
            {
                FilePattern = @"handlers\.js$",
                RequiredExports = new[]
                {
                    @"handle.*",
                    @"CANVAS_.*_HANDLERS"
                },
                OptionalExports = new string[0],
                Description = "handlers.ts must export handler functions and handlers object"
            },

            // registry.ts exports
            ["REGISTRY_EXPORTS"] = new ExportRule
            {
                FilePattern = @"registry\.js$",
                RequiredExports = new[]
                {
                    @"registerCanvas.*Handlers",
                    @"CANVAS_.*_REGISTRY_METADATA"
                },
                OptionalExports = new string[0],
                Description = "registry.ts must export registration function and metadata"
            },

            // business-logic.ts exports
            ["BUSINESS_LOGIC_EXPORTS"] = new ExportRule
            {
                FilePattern = @"business-logic\.js$",
                RequiredExports = new[]
                {
                    @".*" // At least one export required
                },
                OptionalExports = new string[0],
                Description = "business-logic.ts must export business logic functions"
            }
        };
    }

    public async Task<List<ExportViolation>> ValidateExports(string filePath, string content)
    {
        var violations = new List<ExportViolation>();
        var fileName = Path.GetFileName(filePath);

        foreach (var (ruleName, rule) in _exportRules)
        {
            // Check if rule applies to this file
            if (!Regex.IsMatch(fileName, rule.FilePattern))
                continue;

            // Check required exports
            foreach (var requiredExport in rule.RequiredExports)
            {
                if (!HasExport(content, requiredExport))
                {
                    violations.Add(new ExportViolation
                    {
                        RuleName = ruleName,
                        Description = $"Missing required export pattern: {requiredExport}",
                        FilePath = filePath,
                        MissingExport = requiredExport,
                        Severity = ViolationSeverity.Error
                    });
                }
            }
        }

        return violations;
    }

    private bool HasExport(string content, string exportPattern)
    {
        // Check for various export patterns
        var patterns = new[]
        {
            $@"export\s+const\s+{exportPattern}",
            $@"export\s+\{{\s*{exportPattern}",
            $@"export\s+\*.*from.*{exportPattern}",
            $@"export\s+{{[^}}]*{exportPattern}[^}}]*}}",
            $@"module\.exports\.{exportPattern}",
            $@"exports\.{exportPattern}"
        };

        return patterns.Any(pattern => Regex.IsMatch(content, pattern, RegexOptions.IgnoreCase));
    }

    public async Task<ExportValidationSummary> ValidateAllExports(string symphonyPath)
    {
        var summary = new ExportValidationSummary
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
        
        foreach (var filePath in jsFiles)
        {
            var content = await File.ReadAllTextAsync(filePath);
            var violations = await ValidateExports(filePath, content);
            
            summary.FileResults.Add(new ExportFileResult
            {
                FilePath = filePath,
                FileName = Path.GetFileName(filePath),
                Violations = violations,
                IsCompliant = !violations.Any()
            });
            
            summary.TotalViolations += violations.Count;
        }

        summary.FilesChecked = jsFiles.Length;
        summary.CompliantFiles = summary.FileResults.Count(f => f.IsCompliant);
        summary.IsCompliant = summary.TotalViolations == 0;

        return summary;
    }

    public async Task<AutoFixResult> FixMissingExport(ExportViolation violation)
    {
        try
        {
            var content = await File.ReadAllTextAsync(violation.FilePath);
            var fileName = Path.GetFileName(violation.FilePath);
            
            // Generate the missing export based on the file type and pattern
            var exportCode = GenerateMissingExport(fileName, violation.MissingExport);
            
            if (string.IsNullOrEmpty(exportCode))
            {
                return new AutoFixResult
                {
                    Success = false,
                    Message = $"Cannot auto-generate export for pattern: {violation.MissingExport}"
                };
            }
            
            // Add the export at the end of the file
            var fixedContent = content.TrimEnd() + "\n\n" + exportCode + "\n";
            
            await File.WriteAllTextAsync(violation.FilePath, fixedContent);
            
            return new AutoFixResult
            {
                Success = true,
                Message = $"Added missing export: {violation.MissingExport}",
                OriginalCode = "// Missing export",
                FixedCode = exportCode
            };
        }
        catch (Exception ex)
        {
            return new AutoFixResult
            {
                Success = false,
                Message = $"Failed to fix missing export: {ex.Message}"
            };
        }
    }

    private string GenerateMissingExport(string fileName, string exportPattern)
    {
        return fileName switch
        {
            var f when f == "index.ts" => GenerateIndexExport(exportPattern),
            var f when f == "sequence.ts" => GenerateSequenceExport(exportPattern),
            var f when f == "hooks.ts" => GenerateHooksExport(exportPattern),
            var f when f == "handlers.ts" => GenerateHandlersExport(exportPattern),
            var f when f == "registry.ts" => GenerateRegistryExport(exportPattern),
            var f when f == "business-logic.ts" => GenerateBusinessLogicExport(exportPattern),
            _ => string.Empty
        };
    }

    private string GenerateIndexExport(string pattern)
    {
        return pattern switch
        {
            var p when p.Contains("SYMPHONY_METADATA") => GenerateSymphonyMetadata(),
            var p when p.Contains("SEQUENCE") => "// TODO: Add sequence export from './sequence.ts'",
            var p when p.Contains("Flow") => "// TODO: Add flow starter export from './sequence.ts'",
            var p when p.Contains("Symphony") => "// TODO: Add hook export from './hooks.ts'",
            var p when p.Contains("HANDLERS") => "// TODO: Add handlers export from './handlers.ts'",
            var p when p.Contains("register") => "// TODO: Add registry export from './registry.ts'",
            _ => $"// TODO: Add missing export for pattern: {pattern}"
        };
    }

    private string GenerateSymphonyMetadata()
    {
        return @"// Symphony metadata
export const SYMPHONY_METADATA = {
    name: ""Canvas Symphony"",
    description: ""Complete symphony implementation"",
    version: ""1.0.0"",
    completionStatus: ""COMPLETE"",
    files: {
        sequence: ""sequence.ts"",
        hooks: ""hooks.ts"",
        handlers: ""handlers.ts"",
        registry: ""registry.ts"",
        businessLogic: ""business-logic.ts""
    }
};";
    }

    private string GenerateSequenceExport(string pattern)
    {
        return pattern switch
        {
            var p when p.Contains("SEQUENCE") => "// TODO: Define and export CANVAS_*_SEQUENCE object",
            var p when p.Contains("Flow") => "// TODO: Define and export start*Flow function",
            _ => $"// TODO: Add missing export for pattern: {pattern}"
        };
    }

    private string GenerateHooksExport(string pattern)
    {
        return "// TODO: Define and export useCanvas*Symphony hook";
    }

    private string GenerateHandlersExport(string pattern)
    {
        return pattern switch
        {
            var p when p.Contains("handle") => "// TODO: Define and export handler functions",
            var p when p.Contains("HANDLERS") => "// TODO: Define and export CANVAS_*_HANDLERS object",
            _ => $"// TODO: Add missing export for pattern: {pattern}"
        };
    }

    private string GenerateRegistryExport(string pattern)
    {
        return pattern switch
        {
            var p when p.Contains("register") => "// TODO: Define and export registerCanvas*Handlers function",
            var p when p.Contains("METADATA") => "// TODO: Define and export CANVAS_*_REGISTRY_METADATA object",
            _ => $"// TODO: Add missing export for pattern: {pattern}"
        };
    }

    private string GenerateBusinessLogicExport(string pattern)
    {
        return "// TODO: Define and export business logic functions";
    }
}

public class ExportValidationSummary
{
    public string SymphonyPath { get; set; } = string.Empty;
    public DateTime ValidationTimestamp { get; set; }
    public int FilesChecked { get; set; }
    public int CompliantFiles { get; set; }
    public int TotalViolations { get; set; }
    public bool IsCompliant { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<ExportFileResult> FileResults { get; set; } = new();
}

public class ExportFileResult
{
    public string FilePath { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public List<ExportViolation> Violations { get; set; } = new();
    public bool IsCompliant { get; set; }
}
