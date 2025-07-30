using RX.Architecture.Validator.Console.Models;
using RX.Architecture.Validator.Console.Services;


namespace RX.Architecture.Validator.Console.Validators;

public class SingleSymphonyValidator
{
    private readonly bool _verbose;
    private readonly FileSystemService _fileSystemService;
    private readonly ArchitectureViolationDetector _violationDetector;
    private readonly ImportPathValidator _importPathValidator;
    private readonly ExportCompletenessValidator _exportValidator;
    private readonly EventTypeValidator _eventTypeValidator;
    private readonly FunctionAvailabilityValidator _functionAvailabilityValidator;
    private readonly CrossComponentEventValidator _crossComponentEventValidator;
    private readonly DataContractValidator _dataContractValidator;
    private readonly RuntimeBindingValidator _runtimeBindingValidator;
    private readonly SequenceRegistrationValidator _sequenceRegistrationValidator;
    private readonly PathMappingsConfig _pathMappings;

    public SingleSymphonyValidator(bool verbose = false)
    {
        _verbose = verbose;
        _fileSystemService = new FileSystemService();
        _violationDetector = new ArchitectureViolationDetector();
        _importPathValidator = new ImportPathValidator();
        _exportValidator = new ExportCompletenessValidator();
        _eventTypeValidator = new EventTypeValidator();
        _functionAvailabilityValidator = new FunctionAvailabilityValidator();

        // Load path mappings for cross-component event validation
        var configService = new ConfigurationService();
        _pathMappings = configService.LoadPathMappingsConfig().Result;
        _crossComponentEventValidator = new CrossComponentEventValidator(_pathMappings, verbose);
        _dataContractValidator = new DataContractValidator(verbose);
        _runtimeBindingValidator = new RuntimeBindingValidator();
        _sequenceRegistrationValidator = new SequenceRegistrationValidator();
    }

    public async Task<SymphonyValidationResult> ValidateSymphony(string symphonyPath, string symphonyName,
        string componentName, ValidationOptions options)
    {
        var result = new SymphonyValidationResult
        {
            SymphonyName = symphonyName,
            ComponentName = componentName,
            SymphonyPath = symphonyPath
        };

        if (_verbose)
            System.Console.WriteLine($"🎼 Validating symphony: {symphonyName} at {symphonyPath}");

        // Always check file structure for counting, regardless of validation options
        var structureResult = await ValidateStructure(symphonyPath);
        result.FilesChecked = structureResult.RequiredFiles.Count;
        result.ValidFiles = structureResult.RequiredFiles.Count(f => f.Exists);

        // Structure validation
        if (options.CheckStructure)
        {
            result.StructureValidation = structureResult;
        }

        // Export validation
        if (options.CheckExports)
        {
            result.ExportValidation = await ValidateExports(symphonyPath);
            if (result.ExportValidation.HasViolations)
                result.CriticalErrors += result.ExportValidation.Violations.Count;
        }

        // Import path validation
        if (options.CheckImports)
        {
            result.ImportPathValidation = await ValidateImportPaths(symphonyPath);
            if (result.ImportPathValidation.HasViolations)
            {
                result.CriticalErrors += result.ImportPathValidation.Violations.Count(v => v.Severity == ViolationSeverity.Critical);
                result.Warnings += result.ImportPathValidation.Violations.Count(v => v.Severity == ViolationSeverity.Warning);
            }
        }

        // Event type validation - should be part of violations check, not imports
        if (options.CheckViolations)
        {
            result.EventTypeValidation = await ValidateEventTypes(symphonyPath);
            if (result.EventTypeValidation.HasViolations)
            {
                result.CriticalErrors += result.EventTypeValidation.Violations.Count(v => v.Severity == ViolationSeverity.Critical);
                result.Warnings += result.EventTypeValidation.Violations.Count(v => v.Severity == ViolationSeverity.Warning);
            }
        }

        // Function availability validation
        if (options.CheckViolations)
        {
            result.FunctionAvailabilityValidation = await ValidateFunctionAvailability(symphonyPath);
            if (result.FunctionAvailabilityValidation.HasViolations)
            {
                result.CriticalErrors += result.FunctionAvailabilityValidation.Violations.Count(v => v.Severity == ViolationSeverity.Critical);
                result.Warnings += result.FunctionAvailabilityValidation.Violations.Count(v => v.Severity == ViolationSeverity.Warning);
            }
        }

        // Runtime binding validation - catches "function is not defined" errors
        if (options.CheckRuntimeBindings)
        {
            result.RuntimeBindingValidation = await _runtimeBindingValidator.ValidateRuntimeBindings(symphonyPath);
            if (!result.RuntimeBindingValidation.IsCompliant)
            {
                result.CriticalErrors += result.RuntimeBindingValidation.TotalViolations;
            }
        }

        // Architecture violation validation
        if (options.CheckViolations)
        {
            result.ViolationValidation = await ValidateViolations(symphonyPath);
            if (result.ViolationValidation.HasViolations)
            {
                result.CriticalErrors += result.ViolationValidation.Violations.Count(v => v.Severity == ViolationSeverity.Critical);
                result.Warnings += result.ViolationValidation.Violations.Count(v => v.Severity == ViolationSeverity.Warning);
            }
        }

        // Consistency validation
        if (options.CheckConsistency)
        {
            result.ConsistencyValidation = await ValidateConsistency(symphonyPath);
            if (!result.ConsistencyValidation.IsConsistent)
                result.Warnings += result.ConsistencyValidation.Issues.Count;
        }

        // Completeness validation
        if (options.CheckCompleteness)
        {
            result.CompletenessValidation = await ValidateCompleteness(symphonyPath);
            if (!result.CompletenessValidation.IsComplete)
            {
                result.CriticalErrors += result.CompletenessValidation.MissingHandlers.Count;
                result.Warnings += result.CompletenessValidation.OrphanedHandlers.Count;
            }
        }

        // Cross-component event registration validation
        if (options.CheckEventRegistration)
        {
            result.CrossComponentEventValidation = await ValidateCrossComponentEvents(
                symphonyPath, symphonyName, componentName);

            if (result.CrossComponentEventValidation.HasRegistrationGaps)
            {
                result.CriticalErrors += result.CrossComponentEventValidation.TotalMissingEvents;
            }
        }

        // Data contract validation
        if (options.CheckDataContracts)
        {
            result.DataFlowValidation = await ValidateDataContracts(symphonyPath, symphonyName);

            if (result.DataFlowValidation.HasDataFlowViolations)
            {
                result.CriticalErrors += result.DataFlowValidation.CriticalViolations;
                result.Warnings += result.DataFlowValidation.Violations.Count(v => v.Severity == ViolationSeverity.Warning || v.Severity == ViolationSeverity.Error);
            }
        }

        // Integration flow validation - checks UI handler to symphony integration
        if (options.CheckIntegrationFlow)
        {
            result.IntegrationFlowValidation = await ValidateIntegrationFlow(symphonyPath, symphonyName, componentName);

            if (result.IntegrationFlowValidation != null && !result.IntegrationFlowValidation.IsCompliant)
            {
                result.CriticalErrors += result.IntegrationFlowValidation.Violations.Count(v => v.Severity == "Critical");
                result.Warnings += result.IntegrationFlowValidation.Violations.Count(v => v.Severity == "Warning");
            }
        }

        // Sequence registration validation - checks that sequences are registered before being called
        if (options.CheckSequenceRegistration)
        {
            result.SequenceRegistrationValidation = await ValidateSequenceRegistration(symphonyPath);

            if (result.SequenceRegistrationValidation != null && !result.SequenceRegistrationValidation.IsCompliant)
            {
                result.CriticalErrors += result.SequenceRegistrationValidation.Violations.Count(v => v.Severity == "Critical");
                result.Warnings += result.SequenceRegistrationValidation.Violations.Count(v => v.Severity == "Warning");
            }
        }

        // Generate suggestions
        GenerateSuggestions(result);

        return result;
    }

    private async Task<IntegrationFlowValidationResult> ValidateIntegrationFlow(string symphonyPath, string symphonyName, string componentName)
    {
        try
        {
            // Determine project root (go up from symphony path to find src folder)
            var projectRoot = FindProjectRoot(symphonyPath);
            if (string.IsNullOrEmpty(projectRoot))
            {
                return new IntegrationFlowValidationResult
                {
                    SymphonyName = symphonyName,
                    ComponentName = componentName,
                    IsCompliant = true,
                    ValidationErrors = { "Could not determine project root for integration flow validation" }
                };
            }

            var integrationValidator = new IntegrationFlowValidator(_verbose, _pathMappings);
            return await integrationValidator.ValidateIntegrationFlow(symphonyName, componentName, symphonyPath, projectRoot);
        }
        catch (Exception ex)
        {
            return new IntegrationFlowValidationResult
            {
                SymphonyName = symphonyName,
                ComponentName = componentName,
                IsCompliant = false,
                ValidationErrors = { $"Integration flow validation failed: {ex.Message}" }
            };
        }
    }

    private string FindProjectRoot(string symphonyPath)
    {
        var current = new DirectoryInfo(symphonyPath);

        if (_verbose)
            System.Console.WriteLine($"🔍 [DEBUG] Starting project root search from: {symphonyPath}");

        // Go up directories until we find src folder or reach root
        while (current != null && current.Parent != null)
        {
            if (_verbose)
                System.Console.WriteLine($"🔍 [DEBUG] Checking directory: {current.FullName}");

            if (current.Name == "src" || Directory.Exists(Path.Combine(current.FullName, "src")))
            {
                var projectRoot = current.Name == "src" ? current.FullName : Path.Combine(current.FullName, "src");
                if (_verbose)
                    System.Console.WriteLine($"🔍 [DEBUG] Found project root: {projectRoot}");
                return projectRoot;
            }
            current = current.Parent;
        }

        if (_verbose)
            System.Console.WriteLine($"🔍 [DEBUG] No project root found!");
        return string.Empty;
    }

    private async Task<StructureValidationResult> ValidateStructure(string symphonyPath)
    {
        var result = new StructureValidationResult();
        var config = await new ConfigurationService().LoadValidationConfig();
        var requiredFiles = config.FileStructure.RequiredFiles;

        foreach (var fileName in requiredFiles)
        {
            var filePath = Path.Combine(symphonyPath, fileName);
            var fileInfo = new FileInfo(filePath);

            result.RequiredFiles.Add(new RequiredFile
            {
                FileName = fileName,
                ExpectedPath = filePath,
                Exists = fileInfo.Exists,
                FileSize = fileInfo.Exists ? fileInfo.Length : null,
                LastModified = fileInfo.Exists ? fileInfo.LastWriteTime : null
            });
        }

        // Check for unexpected files (both .ts and .ts)
        if (Directory.Exists(symphonyPath))
        {
            var allJsFiles = Directory.GetFiles(symphonyPath, "*.js");
            var allTsFiles = Directory.GetFiles(symphonyPath, "*.ts");
            var allFiles = allJsFiles.Concat(allTsFiles);
            var unexpectedFiles = allFiles
                .Select(Path.GetFileName)
                .Where(name => !requiredFiles.Contains(name))
                .ToList();

            result.UnexpectedFiles.AddRange(unexpectedFiles);
        }

        return result;
    }

    private async Task<ExportValidationResult> ValidateExports(string symphonyPath)
    {
        var result = new ExportValidationResult();
        var summary = await _exportValidator.ValidateAllExports(symphonyPath);

        // Convert summary to result format
        foreach (var fileResult in summary.FileResults)
        {
            result.Violations.AddRange(fileResult.Violations);
        }

        return result;
    }

    private async Task<ImportPathValidationResult> ValidateImportPaths(string symphonyPath)
    {
        var result = new ImportPathValidationResult();
        var summary = await _importPathValidator.ValidateAllImportPaths(symphonyPath);

        // Convert summary to result format
        foreach (var fileResult in summary.FileResults)
        {
            result.Violations.AddRange(fileResult.Violations);
        }

        return result;
    }

    private async Task<EventTypeValidationResult> ValidateEventTypes(string symphonyPath)
    {
        var result = new EventTypeValidationResult();
        var violations = await _eventTypeValidator.ValidateEventTypes(symphonyPath);

        // Convert violations to result format
        foreach (var violation in violations)
        {
            result.Violations.Add(new ArchitectureViolation
            {
                Type = violation.RuleName,
                Description = violation.Description,
                FilePath = violation.FilePath,
                LineNumber = violation.LineNumber,
                Severity = violation.Severity,
                Suggestion = $"Available events: {string.Join(", ", violation.AvailableEventTypes.Take(5))}"
            });
        }

        return result;
    }

    private async Task<FunctionAvailabilityValidationResult> ValidateFunctionAvailability(string symphonyPath)
    {
        var result = new FunctionAvailabilityValidationResult();

        // Get all JavaScript files in the symphony directory
        var jsFiles = Directory.GetFiles(symphonyPath, "*.js", SearchOption.AllDirectories);

        foreach (var jsFile in jsFiles)
        {
            var violations = await _functionAvailabilityValidator.ValidateFunctionAvailability(jsFile);

            // Convert violations to result format
            foreach (var violation in violations)
            {
                result.Violations.Add(new ArchitectureViolation
                {
                    Type = violation.RuleName,
                    Description = violation.Description,
                    FilePath = violation.FilePath,
                    LineNumber = violation.LineNumber,
                    Severity = violation.Severity,
                    Suggestion = $"Available functions in {violation.Namespace}: {string.Join(", ", violation.AvailableFunctions.Take(5))}"
                });
            }
        }

        return result;
    }

    private async Task<ViolationValidationResult> ValidateViolations(string symphonyPath)
    {
        var result = new ViolationValidationResult();
        
        if (!Directory.Exists(symphonyPath))
            return result;

        var jsFiles = Directory.GetFiles(symphonyPath, "*.js");
        
        foreach (var filePath in jsFiles)
        {
            var content = await File.ReadAllTextAsync(filePath);
            var violations = await _violationDetector.DetectViolations(filePath, content);
            result.Violations.AddRange(violations);
        }

        return result;
    }

    private async Task<ConsistencyValidationResult> ValidateConsistency(string symphonyPath)
    {
        var result = new ConsistencyValidationResult();
        
        // Check cross-file consistency
        // This is a simplified implementation - in practice, this would be more comprehensive
        
        var sequencePath = Path.Combine(symphonyPath, "sequence.ts");
        var handlersPath = Path.Combine(symphonyPath, "handlers.ts");
        
        if (File.Exists(sequencePath) && File.Exists(handlersPath))
        {
            var sequenceContent = await File.ReadAllTextAsync(sequencePath);
            var handlersContent = await File.ReadAllTextAsync(handlersPath);
            
            // Basic consistency check - ensure handlers exist for sequence events
            // This would be more sophisticated in a real implementation
            if (sequenceContent.Contains("EVENT_TYPES") && !handlersContent.Contains("handle"))
            {
                result.Issues.Add("Sequence defines events but no handlers found");
            }
        }

        return result;
    }

    private async Task<CompletenessValidationResult> ValidateCompleteness(string symphonyPath)
    {
        var result = new CompletenessValidationResult();
        
        // Check handler/registry completeness
        var handlersPath = Path.Combine(symphonyPath, "handlers.ts");
        var registryPath = Path.Combine(symphonyPath, "registry.ts");
        
        if (File.Exists(handlersPath) && File.Exists(registryPath))
        {
            var handlersContent = await File.ReadAllTextAsync(handlersPath);
            var registryContent = await File.ReadAllTextAsync(registryPath);
            
            // Extract handler function names (simplified)
            var handlerMatches = System.Text.RegularExpressions.Regex.Matches(handlersContent, @"export\s+const\s+(\w+)\s*=");
            var handlerNames = handlerMatches.Cast<System.Text.RegularExpressions.Match>().Select(m => m.Groups[1].Value).ToList();
            
            // Check if all handlers are registered (simplified)
            foreach (var handlerName in handlerNames)
            {
                if (!registryContent.Contains(handlerName))
                {
                    result.OrphanedHandlers.Add($"Handler '{handlerName}' is not registered");
                }
            }
        }

        return result;
    }

    private void GenerateSuggestions(SymphonyValidationResult result)
    {
        if (result.StructureValidation != null && !result.StructureValidation.IsCompliant)
        {
            var missingFiles = result.StructureValidation.RequiredFiles.Where(f => !f.Exists).Select(f => f.FileName);
            result.Suggestions.Add($"Create missing files: {string.Join(", ", missingFiles)}");
        }

        if (result.ViolationValidation != null && result.ViolationValidation.HasViolations)
        {
            var criticalCount = result.ViolationValidation.Violations.Count(v => v.Severity == ViolationSeverity.Critical);
            if (criticalCount > 0)
            {
                result.Suggestions.Add($"Fix {criticalCount} critical architecture violations");
            }
        }

        if (result.ExportValidation != null && result.ExportValidation.HasViolations)
        {
            result.Suggestions.Add("Add missing exports to index.ts");
        }

        if (result.CompletenessValidation != null && !result.CompletenessValidation.IsComplete)
        {
            if (result.CompletenessValidation.MissingHandlers.Any())
            {
                result.Suggestions.Add("Implement missing event handlers");
            }
            if (result.CompletenessValidation.OrphanedHandlers.Any())
            {
                result.Suggestions.Add("Register orphaned handlers in registry.ts");
            }
        }

        if (result.CrossComponentEventValidation != null && result.CrossComponentEventValidation.HasRegistrationGaps)
        {
            result.Suggestions.Add($"Fix {result.CrossComponentEventValidation.TotalMissingEvents} event registration gaps");
        }

        if (result.DataFlowValidation != null && result.DataFlowValidation.HasDataFlowViolations)
        {
            result.Suggestions.Add($"Fix {result.DataFlowValidation.CriticalViolations} critical data flow violations");
            if (result.DataFlowValidation.ErrorViolations > 0)
            {
                result.Suggestions.Add($"Address {result.DataFlowValidation.ErrorViolations} data contract errors");
            }
        }

        if (result.SequenceRegistrationValidation != null && !result.SequenceRegistrationValidation.IsCompliant)
        {
            result.Suggestions.Add($"Fix {result.SequenceRegistrationValidation.Violations.Count} sequence registration issues");
        }
    }

    private async Task<CrossComponentEventValidationResult> ValidateCrossComponentEvents(
        string symphonyPath, string symphonyName, string componentName)
    {
        return await _crossComponentEventValidator.ValidateEventRegistration(
            symphonyPath, symphonyName, componentName);
    }

    private async Task<DataFlowValidationResult> ValidateDataContracts(string symphonyPath, string symphonyName)
    {
        if (_verbose)
            System.Console.WriteLine("  🔍 Validating data contracts through musical sequencing...");

        return await _dataContractValidator.ValidateDataContracts(symphonyPath, symphonyName);
    }

    private async Task<SequenceRegistrationValidationResult> ValidateSequenceRegistration(string symphonyPath)
    {
        if (_verbose)
            System.Console.WriteLine("  🔍 Validating sequence registrations...");

        // Find project root to scan for sequence calls and registrations
        var projectRoot = FindProjectRoot(symphonyPath);
        if (string.IsNullOrEmpty(projectRoot))
        {
            return new SequenceRegistrationValidationResult
            {
                IsCompliant = true,
                ValidationErrors = { "Could not determine project root for sequence registration validation" }
            };
        }

        return await _sequenceRegistrationValidator.ValidateSequenceRegistrations(projectRoot);
    }
}
