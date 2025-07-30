using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using RX.Architecture.Validator.Console.Models;

namespace RX.Architecture.Validator.Console.Validators;

/// <summary>
/// Main DataContractValidator that orchestrates the complete data flow validation pipeline
/// Validates data contracts through RenderX musical sequencing architecture
/// </summary>
public class DataContractValidator
{
    private readonly SequenceStartDataExtractor _sequenceExtractor;
    private readonly ConductorTransformationAnalyzer _conductorAnalyzer;
    private readonly HandlerContractExtractor _handlerExtractor;
    private readonly DataFlowValidator _dataFlowValidator;
    private readonly bool _verbose;

    public DataContractValidator(bool verbose = false)
    {
        _verbose = verbose;
        _sequenceExtractor = new SequenceStartDataExtractor(verbose);
        _conductorAnalyzer = new ConductorTransformationAnalyzer(verbose);
        _handlerExtractor = new HandlerContractExtractor(verbose);
        _dataFlowValidator = new DataFlowValidator(verbose);
    }

    /// <summary>
    /// Validate data contracts for a complete symphony
    /// </summary>
    public async Task<DataFlowValidationResult> ValidateDataContracts(string symphonyPath, string symphonyName)
    {
        if (_verbose)
            System.Console.WriteLine($"🎼 Starting data contract validation for {symphonyName}");

        try
        {
            // Step 1: Extract convenience function contracts
            var convenienceContracts = await ExtractConvenienceFunctionContracts(symphonyPath);
            
            // Step 2: Extract conductor transformations
            var conductorTransformations = await ExtractConductorTransformations();
            
            // Step 3: Extract handler contracts
            var handlerContracts = await ExtractHandlerContracts(symphonyPath);
            
            // Step 4: Get sequence events
            var sequenceEvents = await ExtractSequenceEvents(symphonyPath);
            
            // Step 5: Validate complete data flow
            var result = await _dataFlowValidator.ValidateDataFlow(
                convenienceContracts, conductorTransformations, handlerContracts, sequenceEvents);

            if (_verbose)
            {
                System.Console.WriteLine($"✅ Data contract validation complete for {symphonyName}");
                System.Console.WriteLine($"   Violations: {result.Violations.Count}");
                System.Console.WriteLine($"   Confidence: {result.Confidence}");
            }

            return result;
        }
        catch (Exception ex)
        {
            if (_verbose)
                System.Console.WriteLine($"❌ Data contract validation failed for {symphonyName}: {ex.Message}");

            return new DataFlowValidationResult
            {
                HasDataFlowViolations = true,
                Violations = new List<DataFlowViolation>
                {
                    new DataFlowViolation
                    {
                        Type = ViolationType.MissingAfterTransformation,
                        Description = $"Validation failed: {ex.Message}",
                        Severity = ViolationSeverity.Critical
                    }
                },
                Confidence = ValidationConfidence.Unknown
            };
        }
    }

    /// <summary>
    /// Extract convenience function contracts from symphony sequence files
    /// </summary>
    private async Task<List<ConvenienceFunctionContract>> ExtractConvenienceFunctionContracts(string symphonyPath)
    {
        var contracts = new List<ConvenienceFunctionContract>();

        if (_verbose)
            System.Console.WriteLine("  📋 Extracting convenience function contracts...");

        // Look for sequence.ts files in the symphony directory
        var sequenceFiles = FindSequenceFiles(symphonyPath);

        foreach (var sequenceFile in sequenceFiles)
        {
            var fileContracts = await _sequenceExtractor.ExtractConvenienceContracts(sequenceFile);
            contracts.AddRange(fileContracts);
        }

        if (_verbose)
            System.Console.WriteLine($"     Found {contracts.Count} convenience function contracts");

        return contracts;
    }

    /// <summary>
    /// Extract conductor transformations from MusicalConductor.ts
    /// </summary>
    private async Task<List<ConductorTransformation>> ExtractConductorTransformations()
    {
        if (_verbose)
            System.Console.WriteLine("  📋 Extracting conductor transformations...");

        // Find MusicalConductor.ts file
        var conductorPath = FindMusicalConductorFile();
        
        if (string.IsNullOrEmpty(conductorPath))
        {
            if (_verbose)
                System.Console.WriteLine("     ⚠️ MusicalConductor.ts not found");
            return new List<ConductorTransformation>();
        }

        var transformations = await _conductorAnalyzer.ExtractTransformations(conductorPath);

        if (_verbose)
            System.Console.WriteLine($"     Found {transformations.Count} conductor transformations");

        return transformations;
    }

    /// <summary>
    /// Extract handler contracts from symphony handler files
    /// </summary>
    private async Task<List<HandlerContract>> ExtractHandlerContracts(string symphonyPath)
    {
        var contracts = new List<HandlerContract>();

        if (_verbose)
            System.Console.WriteLine("  📋 Extracting handler contracts...");

        // Look for handlers.ts files in the symphony directory
        var handlerFiles = FindHandlerFiles(symphonyPath);

        foreach (var handlerFile in handlerFiles)
        {
            var fileContracts = await _handlerExtractor.ExtractContracts(handlerFile);
            contracts.AddRange(fileContracts);
        }

        if (_verbose)
            System.Console.WriteLine($"     Found {contracts.Count} handler contracts");

        return contracts;
    }

    /// <summary>
    /// Extract sequence events from symphony definition files
    /// </summary>
    private async Task<List<string>> ExtractSequenceEvents(string symphonyPath)
    {
        var events = new List<string>();

        if (_verbose)
            System.Console.WriteLine("  📋 Extracting sequence events...");

        // Look for sequence definition files
        var sequenceFiles = FindSequenceFiles(symphonyPath);

        foreach (var sequenceFile in sequenceFiles)
        {
            var fileEvents = await ExtractEventsFromSequenceFile(sequenceFile);
            events.AddRange(fileEvents);
        }

        // Remove duplicates
        events = events.Distinct().ToList();

        if (_verbose)
            System.Console.WriteLine($"     Found {events.Count} sequence events");

        return events;
    }

    /// <summary>
    /// Find sequence.ts files in symphony directory
    /// </summary>
    private List<string> FindSequenceFiles(string symphonyPath)
    {
        var sequenceFiles = new List<string>();

        if (!Directory.Exists(symphonyPath))
            return sequenceFiles;

        // Look for sequence.ts files
        var files = Directory.GetFiles(symphonyPath, "sequence.ts", SearchOption.AllDirectories);
        sequenceFiles.AddRange(files);

        // Also look for index.ts files that might contain sequences
        var indexFiles = Directory.GetFiles(symphonyPath, "index.ts", SearchOption.AllDirectories);
        sequenceFiles.AddRange(indexFiles);

        return sequenceFiles;
    }

    /// <summary>
    /// Find handlers.ts files in symphony directory
    /// </summary>
    private List<string> FindHandlerFiles(string symphonyPath)
    {
        var handlerFiles = new List<string>();

        if (!Directory.Exists(symphonyPath))
            return handlerFiles;

        // Look for handlers.ts files
        var files = Directory.GetFiles(symphonyPath, "handlers.ts", SearchOption.AllDirectories);
        handlerFiles.AddRange(files);

        return handlerFiles;
    }

    /// <summary>
    /// Find MusicalConductor.ts file
    /// </summary>
    private string FindMusicalConductorFile()
    {
        // Standard path for MusicalConductor.ts
        var standardPath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "..", "RX.Evolution", "rx.evolution.client", "src", "communication", "sequences", "core", "MusicalConductor.ts");

        var fullPath = Path.GetFullPath(standardPath);
        
        if (File.Exists(fullPath))
            return fullPath;

        // Alternative search in current directory tree
        var currentDir = Directory.GetCurrentDirectory();
        var searchPaths = new[]
        {
            Path.Combine(currentDir, "packages", "RX.Evolution", "rx.evolution.client", "src", "communication", "sequences", "core", "MusicalConductor.ts"),
            Path.Combine(currentDir, "..", "..", "packages", "RX.Evolution", "rx.evolution.client", "src", "communication", "sequences", "core", "MusicalConductor.ts")
        };

        foreach (var searchPath in searchPaths)
        {
            var resolvedPath = Path.GetFullPath(searchPath);
            if (File.Exists(resolvedPath))
                return resolvedPath;
        }

        return string.Empty;
    }

    /// <summary>
    /// Extract events from a sequence file
    /// </summary>
    private async Task<List<string>> ExtractEventsFromSequenceFile(string sequenceFile)
    {
        var events = new List<string>();

        try
        {
            var content = await File.ReadAllTextAsync(sequenceFile);
            
            // Extract event types from sequence definitions
            var eventMatches = System.Text.RegularExpressions.Regex.Matches(content, 
                @"event:\s*EVENT_TYPES\.(\w+)");
            
            foreach (System.Text.RegularExpressions.Match match in eventMatches)
            {
                var eventType = match.Groups[1].Value;
                // Convert from CONSTANT_CASE to kebab-case
                var kebabCase = ConvertToKebabCase(eventType);
                events.Add(kebabCase);
            }

            // Also look for direct event strings
            var directEventMatches = System.Text.RegularExpressions.Regex.Matches(content,
                @"event:\s*['""]([^'""]+)['""]");
            
            foreach (System.Text.RegularExpressions.Match match in directEventMatches)
            {
                events.Add(match.Groups[1].Value);
            }
        }
        catch (Exception ex)
        {
            if (_verbose)
                System.Console.WriteLine($"     ⚠️ Error reading sequence file {sequenceFile}: {ex.Message}");
        }

        return events;
    }

    /// <summary>
    /// Convert CONSTANT_CASE to kebab-case
    /// </summary>
    private string ConvertToKebabCase(string constantCase)
    {
        return constantCase.ToLower().Replace('_', '-');
    }

    /// <summary>
    /// Validate data contracts for multiple symphonies
    /// </summary>
    public async Task<Dictionary<string, DataFlowValidationResult>> ValidateMultipleSymphonies(
        Dictionary<string, string> symphonyPaths)
    {
        var results = new Dictionary<string, DataFlowValidationResult>();

        foreach (var (symphonyName, symphonyPath) in symphonyPaths)
        {
            var result = await ValidateDataContracts(symphonyPath, symphonyName);
            results[symphonyName] = result;
        }

        return results;
    }

    /// <summary>
    /// Get validation summary across multiple symphonies
    /// </summary>
    public ValidationSummary GetValidationSummary(Dictionary<string, DataFlowValidationResult> results)
    {
        return new ValidationSummary
        {
            TotalSymphonies = results.Count,
            SymphoniesWithViolations = results.Count(r => r.Value.HasDataFlowViolations),
            TotalViolations = results.Sum(r => r.Value.Violations.Count),
            CriticalViolations = results.Sum(r => r.Value.CriticalViolations),
            ErrorViolations = results.Sum(r => r.Value.ErrorViolations),
            WarningViolations = results.Sum(r => r.Value.WarningViolations),
            AverageConfidence = results.Values.Any() ? 
                results.Values.Average(r => (int)r.Confidence) : 0
        };
    }
}

/// <summary>
/// Summary of validation results across multiple symphonies
/// </summary>
public class ValidationSummary
{
    public int TotalSymphonies { get; set; }
    public int SymphoniesWithViolations { get; set; }
    public int TotalViolations { get; set; }
    public int CriticalViolations { get; set; }
    public int ErrorViolations { get; set; }
    public int WarningViolations { get; set; }
    public double AverageConfidence { get; set; }
}
