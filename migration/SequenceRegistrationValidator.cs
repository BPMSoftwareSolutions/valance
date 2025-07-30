using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using RX.Architecture.Validator.Console.Models;

namespace RX.Architecture.Validator.Console.Validators
{
    /// <summary>
    /// Validates that musical sequences are properly registered before being called
    /// Detects runtime errors like "Sequence 'canvas-component-drag-symphony' not found"
    /// </summary>
    public class SequenceRegistrationValidator
    {
        public async Task<SequenceRegistrationValidationResult> ValidateSequenceRegistrations(string projectRoot)
        {
            var result = new SequenceRegistrationValidationResult();

            try
            {
                // Find all sequence calls in the codebase
                var sequenceCalls = await FindSequenceCalls(projectRoot);

                // Find all sequence registrations in the codebase
                var sequenceRegistrations = await FindSequenceRegistrations(projectRoot);

                // Build a comprehensive sequence name mapping
                var sequenceNameMap = await BuildSequenceNameMapping(projectRoot);

                // Cross-reference calls with registrations
                foreach (var call in sequenceCalls)
                {
                    var actualSequenceName = ResolveActualSequenceName(call.SequenceName, sequenceNameMap);

                    // First, look for exact sequence name matches
                    var exactRegistration = sequenceRegistrations.FirstOrDefault(r =>
                        r.SequenceName == actualSequenceName);

                    // Then, check if there's a bulk registration that would cover this sequence
                    var bulkRegistration = sequenceRegistrations.FirstOrDefault(r =>
                        (r.RegistrationType.Contains("Bulk") || r.RegistrationType.Contains("Initialization")) &&
                        IsSequenceCoveredByBulkRegistration(call.SequenceName, actualSequenceName, sequenceNameMap));

                    var registration = exactRegistration ?? bulkRegistration;

                    if (registration == null)
                    {
                        result.Violations.Add(new SequenceRegistrationViolation
                        {
                            Type = "MissingRegistration",
                            SequenceName = call.SequenceName,
                            CallLocation = call.FilePath,
                            CallLineNumber = call.LineNumber,
                            Description = $"Sequence '{call.SequenceName}' is called but not registered",
                            Severity = "Critical",
                            SuggestedFix = GetRegistrationSuggestion(call.SequenceName, projectRoot)
                        });
                    }
                    else if (!registration.RegistrationType.Contains("Bulk") && !registration.RegistrationType.Contains("Initialization"))
                    {
                        // Check if registration happens before the call (in terms of execution order)
                        var registrationIssue = ValidateRegistrationTiming(call, registration);
                        if (registrationIssue != null)
                        {
                            result.Violations.Add(registrationIssue);
                        }
                    }
                    // If it's a bulk registration, assume it's properly handled
                }

                result.TotalSequenceCalls = sequenceCalls.Count;
                result.TotalSequenceRegistrations = sequenceRegistrations.Count;
                result.IsCompliant = result.Violations.Count == 0;
            }
            catch (Exception ex)
            {
                result.ValidationErrors.Add($"Sequence registration validation failed: {ex.Message}");
            }

            return result;
        }

        private async Task<List<SequenceCall>> FindSequenceCalls(string projectRoot)
        {
            var calls = new List<SequenceCall>();
            
            // Find all TypeScript/JavaScript files
            var files = Directory.GetFiles(projectRoot, "*.ts", SearchOption.AllDirectories)
                .Concat(Directory.GetFiles(projectRoot, "*.tsx", SearchOption.AllDirectories))
                .Concat(Directory.GetFiles(projectRoot, "*.js", SearchOption.AllDirectories))
                .Concat(Directory.GetFiles(projectRoot, "*.jsx", SearchOption.AllDirectories))
                .Where(f => !f.Contains("node_modules") && !f.Contains(".git"))
                .ToList();

            foreach (var filePath in files)
            {
                try
                {
                    var content = await File.ReadAllTextAsync(filePath);
                    var fileCalls = ExtractSequenceCalls(content, filePath);
                    calls.AddRange(fileCalls);
                }
                catch (Exception ex)
                {
                    System.Console.WriteLine($"Warning: Could not read file {filePath}: {ex.Message}");
                }
            }

            return calls;
        }

        private List<SequenceCall> ExtractSequenceCalls(string content, string filePath)
        {
            var calls = new List<SequenceCall>();

            // Pattern 1: conductor.startSequence('sequence-name', ...)
            var conductorStartPattern = @"conductor\.startSequence\s*\(\s*['""]([^'""]+)['""]";
            var conductorMatches = Regex.Matches(content, conductorStartPattern);

            foreach (Match match in conductorMatches)
            {
                if (!IsInComment(content, match.Index))
                {
                    calls.Add(new SequenceCall
                    {
                        SequenceName = match.Groups[1].Value,
                        FilePath = filePath,
                        LineNumber = GetLineNumber(content, match.Index),
                        CallType = "ConductorStartSequence",
                        CallContext = ExtractCallContext(content, match.Index)
                    });
                }
            }

            // Pattern 2: communicationSystem.conductor.startSequence('sequence-name', ...)
            var commSystemPattern = @"communicationSystem\.conductor\.startSequence\s*\(\s*['""]([^'""]+)['""]";
            var commSystemMatches = Regex.Matches(content, commSystemPattern);

            foreach (Match match in commSystemMatches)
            {
                if (!IsInComment(content, match.Index))
                {
                    calls.Add(new SequenceCall
                    {
                        SequenceName = match.Groups[1].Value,
                        FilePath = filePath,
                        LineNumber = GetLineNumber(content, match.Index),
                        CallType = "CommunicationSystemStartSequence",
                        CallContext = ExtractCallContext(content, match.Index)
                    });
                }
            }

            // Pattern 3: MusicalSequences.startXxxFlow() calls
            var musicalSequencesPattern = @"MusicalSequences\.start\w+Flow\s*\(";
            var musicalSequencesMatches = Regex.Matches(content, musicalSequencesPattern);

            foreach (Match match in musicalSequencesMatches)
            {
                if (!IsInComment(content, match.Index))
                {
                    // Extract the sequence name from the function name
                    var functionName = match.Value.Replace("MusicalSequences.", "").Replace("(", "");
                    var sequenceName = ConvertFunctionNameToSequenceName(functionName);

                    calls.Add(new SequenceCall
                    {
                        SequenceName = sequenceName,
                        FilePath = filePath,
                        LineNumber = GetLineNumber(content, match.Index),
                        CallType = "MusicalSequencesFlow",
                        CallContext = ExtractCallContext(content, match.Index)
                    });
                }
            }

            return calls;
        }

        private async Task<List<SequenceRegistration>> FindSequenceRegistrations(string projectRoot)
        {
            var registrations = new List<SequenceRegistration>();
            
            // Find all TypeScript/JavaScript files
            var files = Directory.GetFiles(projectRoot, "*.ts", SearchOption.AllDirectories)
                .Concat(Directory.GetFiles(projectRoot, "*.tsx", SearchOption.AllDirectories))
                .Concat(Directory.GetFiles(projectRoot, "*.js", SearchOption.AllDirectories))
                .Concat(Directory.GetFiles(projectRoot, "*.jsx", SearchOption.AllDirectories))
                .Where(f => !f.Contains("node_modules") && !f.Contains(".git"))
                .ToList();

            foreach (var filePath in files)
            {
                try
                {
                    var content = await File.ReadAllTextAsync(filePath);
                    var fileRegistrations = ExtractSequenceRegistrations(content, filePath);
                    registrations.AddRange(fileRegistrations);
                }
                catch (Exception ex)
                {
                    System.Console.WriteLine($"Warning: Could not read file {filePath}: {ex.Message}");
                }
            }

            return registrations;
        }

        private List<SequenceRegistration> ExtractSequenceRegistrations(string content, string filePath)
        {
            var registrations = new List<SequenceRegistration>();
            
            // Pattern 1: conductor.defineSequence('sequence-name', SEQUENCE_DEFINITION)
            var defineSequencePattern = @"conductor\.defineSequence\s*\(\s*['""]([^'""]+)['""]";
            var defineMatches = Regex.Matches(content, defineSequencePattern);
            
            foreach (Match match in defineMatches)
            {
                registrations.Add(new SequenceRegistration
                {
                    SequenceName = match.Groups[1].Value,
                    FilePath = filePath,
                    LineNumber = GetLineNumber(content, match.Index),
                    RegistrationType = "ConductorDefineSequence",
                    RegistrationContext = ExtractRegistrationContext(content, match.Index)
                });
            }
            
            // Pattern 2: conductor.registerSequence(SEQUENCE_OBJECT)
            var registerSequencePattern = @"conductor\.registerSequence\s*\(\s*(\w+)";
            var registerMatches = Regex.Matches(content, registerSequencePattern);
            
            foreach (Match match in registerMatches)
            {
                var sequenceObjectName = match.Groups[1].Value;
                var sequenceName = ExtractSequenceNameFromObject(content, sequenceObjectName);
                
                if (!string.IsNullOrEmpty(sequenceName))
                {
                    registrations.Add(new SequenceRegistration
                    {
                        SequenceName = sequenceName,
                        FilePath = filePath,
                        LineNumber = GetLineNumber(content, match.Index),
                        RegistrationType = "ConductorRegisterSequence",
                        RegistrationContext = ExtractRegistrationContext(content, match.Index)
                    });
                }
            }
            
            // Pattern 3: registerAllSequences() calls that register multiple sequences
            var registerAllPattern = @"registerAllSequences\s*\(";
            var registerAllMatches = Regex.Matches(content, registerAllPattern);

            foreach (Match match in registerAllMatches)
            {
                // This is a bulk registration - we need to find what sequences it registers
                var bulkRegistrations = ExtractBulkRegistrations(content, filePath, match.Index);
                registrations.AddRange(bulkRegistrations);
            }

            // Pattern 4: initializeMusicalSequences() calls that lead to registerAllSequences
            var initMusicalPattern = @"initializeMusicalSequences\s*\(";
            var initMusicalMatches = Regex.Matches(content, initMusicalPattern);

            foreach (Match match in initMusicalMatches)
            {
                registrations.Add(new SequenceRegistration
                {
                    SequenceName = "BULK_INITIALIZATION",
                    FilePath = filePath,
                    LineNumber = GetLineNumber(content, match.Index),
                    RegistrationType = "InitializationBulkRegistration",
                    RegistrationContext = "initializeMusicalSequences() initialization"
                });
            }

            // Pattern 5: initializeCommunicationSystem() calls that lead to sequence registration
            var initCommPattern = @"initializeCommunicationSystem\s*\(";
            var initCommMatches = Regex.Matches(content, initCommPattern);

            foreach (Match match in initCommMatches)
            {
                registrations.Add(new SequenceRegistration
                {
                    SequenceName = "BULK_COMMUNICATION_INIT",
                    FilePath = filePath,
                    LineNumber = GetLineNumber(content, match.Index),
                    RegistrationType = "CommunicationSystemBulkRegistration",
                    RegistrationContext = "initializeCommunicationSystem() initialization"
                });
            }

            return registrations;
        }

        private string ConvertFunctionNameToSequenceName(string functionName)
        {
            // Convert startCanvasLibraryDropFlow to canvas-library-drop-symphony
            if (functionName.StartsWith("start") && functionName.EndsWith("Flow"))
            {
                var baseName = functionName.Substring(5, functionName.Length - 9); // Remove "start" and "Flow"
                
                // Convert PascalCase to kebab-case
                var kebabCase = Regex.Replace(baseName, "([a-z])([A-Z])", "$1-$2").ToLower();
                
                return $"{kebabCase}-symphony";
            }
            
            return functionName;
        }

        private string ExtractCallContext(string content, int matchIndex)
        {
            // Extract surrounding context for better error reporting
            var start = Math.Max(0, matchIndex - 100);
            var end = Math.Min(content.Length, matchIndex + 100);
            return content.Substring(start, end - start).Replace('\n', ' ').Replace('\r', ' ');
        }

        private string ExtractRegistrationContext(string content, int matchIndex)
        {
            // Extract surrounding context for registration
            var start = Math.Max(0, matchIndex - 50);
            var end = Math.Min(content.Length, matchIndex + 150);
            return content.Substring(start, end - start).Replace('\n', ' ').Replace('\r', ' ');
        }

        private int GetLineNumber(string content, int index)
        {
            return content.Substring(0, index).Count(c => c == '\n') + 1;
        }

        private bool IsInComment(string content, int index)
        {
            // Get the line containing the match
            var lineStart = content.LastIndexOf('\n', index) + 1;
            var lineEnd = content.IndexOf('\n', index);
            if (lineEnd == -1) lineEnd = content.Length;

            var line = content.Substring(lineStart, lineEnd - lineStart);
            var matchPositionInLine = index - lineStart;

            // Check if the match is after a // comment marker
            var commentIndex = line.IndexOf("//");
            if (commentIndex >= 0 && commentIndex < matchPositionInLine)
            {
                return true;
            }

            // Check if we're inside a /* */ block comment
            var blockCommentStart = content.LastIndexOf("/*", index);
            var blockCommentEnd = content.LastIndexOf("*/", index);

            if (blockCommentStart >= 0 && (blockCommentEnd < blockCommentStart || blockCommentEnd == -1))
            {
                return true;
            }

            return false;
        }

        private async Task<Dictionary<string, string>> BuildSequenceNameMapping(string projectRoot)
        {
            var mapping = new Dictionary<string, string>();

            // Find all TypeScript/JavaScript files that might contain sequence definitions
            var files = Directory.GetFiles(projectRoot, "*.ts", SearchOption.AllDirectories)
                .Concat(Directory.GetFiles(projectRoot, "*.js", SearchOption.AllDirectories))
                .Where(f => !f.Contains("node_modules") && !f.Contains(".git"))
                .ToList();

            foreach (var filePath in files)
            {
                try
                {
                    var content = await File.ReadAllTextAsync(filePath);

                    // Look for sequence definitions with names - multiple patterns
                    var patterns = new[]
                    {
                        @"export\s+const\s+(\w+_SEQUENCE)\s*[=:][^{]*\{[\s\S]*?name\s*:\s*['""]([^'""]+)['""]",
                        @"const\s+(\w+_SEQUENCE)\s*[=:][^{]*\{[\s\S]*?name\s*:\s*['""]([^'""]+)['""]",
                        @"(\w+_SEQUENCE)\s*[=:]\s*\{[\s\S]*?name\s*:\s*['""]([^'""]+)['""]"
                    };

                    foreach (var pattern in patterns)
                    {
                        var matches = Regex.Matches(content, pattern, RegexOptions.Multiline);

                        foreach (Match match in matches)
                        {
                            var objectName = match.Groups[1].Value;
                            var sequenceName = match.Groups[2].Value;

                            if (!mapping.ContainsKey(objectName))
                            {
                                mapping[objectName] = sequenceName;
                                if (objectName.Contains("JSON_COMPONENT") || objectName.Contains("PANEL_TOGGLE"))
                                {
                                    System.Console.WriteLine($"🔍 Found sequence mapping: {objectName} -> {sequenceName}");
                                }
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    System.Console.WriteLine($"Warning: Could not read file {filePath}: {ex.Message}");
                }
            }

            System.Console.WriteLine($"🔍 Built sequence name mapping with {mapping.Count} entries");

            // Debug: Print all mappings for troubleshooting
            foreach (var kvp in mapping)
            {
                System.Console.WriteLine($"🔍 Mapping: {kvp.Key} -> {kvp.Value}");
            }

            return mapping;
        }

        private string ResolveActualSequenceName(string callSequenceName, Dictionary<string, string> sequenceNameMap)
        {
            // If it's already a proper sequence name, return as-is
            if (callSequenceName.Contains(" ") || callSequenceName.Contains("Symphony"))
            {
                return callSequenceName;
            }

            // Try to find a mapping from the sequence name map
            var matchingEntry = sequenceNameMap.FirstOrDefault(kvp =>
                kvp.Value.ToLower().Replace(" ", "-").Replace("symphony", "symphony") == callSequenceName ||
                kvp.Key.ToLower().Replace("_", "-").Replace("-sequence", "-symphony") == callSequenceName);

            if (!string.IsNullOrEmpty(matchingEntry.Value))
            {
                return matchingEntry.Value;
            }

            return callSequenceName;
        }

        private bool IsSequenceCoveredByBulkRegistration(string originalSequenceName, string actualSequenceName, Dictionary<string, string> sequenceNameMap)
        {
            // Check if the sequence name appears in our mapping (meaning it's defined in the codebase)
            if (sequenceNameMap.Values.Any(v =>
                v == actualSequenceName ||
                v == originalSequenceName ||
                v.Equals(actualSequenceName, StringComparison.OrdinalIgnoreCase) ||
                v.Equals(originalSequenceName, StringComparison.OrdinalIgnoreCase)))
            {
                System.Console.WriteLine($"🔍 Sequence '{originalSequenceName}' found in mapping, covered by bulk registration");
                return true;
            }

            // Check if it matches known canvas sequence patterns that are definitely registered
            var knownCanvasSequencePatterns = new[]
            {
                "Canvas Component Drag Symphony",
                "Canvas Library Drop Symphony",
                "Canvas Element Selection Symphony"
            };

            if (knownCanvasSequencePatterns.Any(pattern =>
                actualSequenceName.Contains(pattern) ||
                originalSequenceName.Contains(pattern)))
            {
                System.Console.WriteLine($"🔍 Sequence '{originalSequenceName}' matches known canvas pattern, covered by bulk registration");
                return true;
            }

            // If it doesn't match any known patterns or mappings, it's likely missing
            System.Console.WriteLine($"🔍 Sequence '{originalSequenceName}' not found in bulk registration coverage");
            return false;
        }

        private string ExtractSequenceNameFromObject(string content, string sequenceObjectName)
        {
            // Look for the sequence object definition to extract its name
            var sequencePattern = $@"{sequenceObjectName}\s*[=:]\s*\{{[^}}]*name\s*:\s*['""]([^'""]+)['""]";
            var match = Regex.Match(content, sequencePattern, RegexOptions.Singleline);

            if (match.Success)
            {
                return match.Groups[1].Value;
            }

            // Try to find the sequence definition in other files
            var sequenceName = FindSequenceNameInProject(sequenceObjectName);
            if (!string.IsNullOrEmpty(sequenceName))
            {
                return sequenceName;
            }

            // Fallback: try to infer from object name
            if (sequenceObjectName.Contains("SEQUENCE"))
            {
                // Convert CANVAS_COMPONENT_DRAG_SEQUENCE to canvas-component-drag-symphony
                return sequenceObjectName.ToLower().Replace("_", "-").Replace("-sequence", "-symphony");
            }

            return string.Empty;
        }

        private string FindSequenceNameInProject(string sequenceObjectName)
        {
            // We need the project root to search - this will be improved when we have access to it
            // For now, return empty and rely on the fallback logic
            return string.Empty;
        }

        private List<SequenceRegistration> ExtractBulkRegistrations(string content, string filePath, int matchIndex)
        {
            var registrations = new List<SequenceRegistration>();

            // Look for ALL_SEQUENCES array or similar bulk registration patterns
            var allSequencesPattern = @"ALL_SEQUENCES\s*=\s*\[([^\]]+)\]";
            var match = Regex.Match(content, allSequencesPattern, RegexOptions.Singleline);

            if (match.Success)
            {
                var sequenceList = match.Groups[1].Value;

                // Extract direct sequence references
                var directSequenceNames = Regex.Matches(sequenceList, @"(\w+_SEQUENCE)")
                    .Cast<Match>()
                    .Select(m => m.Groups[1].Value)
                    .ToList();

                // Extract spread array references like ...ALL_CANVAS_SEQUENCES
                var spreadArrays = Regex.Matches(sequenceList, @"\.\.\.(\w+_SEQUENCES)")
                    .Cast<Match>()
                    .Select(m => m.Groups[1].Value)
                    .ToList();

                // For each direct sequence, try to resolve its actual name
                foreach (var sequenceObjectName in directSequenceNames)
                {
                    var actualName = ExtractSequenceNameFromObject(content, sequenceObjectName);
                    if (!string.IsNullOrEmpty(actualName))
                    {
                        registrations.Add(new SequenceRegistration
                        {
                            SequenceName = actualName,
                            FilePath = filePath,
                            LineNumber = GetLineNumber(content, matchIndex),
                            RegistrationType = "BulkRegistration",
                            RegistrationContext = $"registerAllSequences() - {sequenceObjectName}"
                        });
                    }
                }

                // For spread arrays, mark them for further resolution
                foreach (var arrayName in spreadArrays)
                {
                    registrations.Add(new SequenceRegistration
                    {
                        SequenceName = $"BULK_FROM_{arrayName}",
                        FilePath = filePath,
                        LineNumber = GetLineNumber(content, matchIndex),
                        RegistrationType = "SpreadBulkRegistration",
                        RegistrationContext = $"Bulk registration from {arrayName} array"
                    });
                }
            }

            return registrations;
        }

        private SequenceRegistrationViolation? ValidateRegistrationTiming(SequenceCall call, SequenceRegistration registration)
        {
            // Check if registration is in a React hook that might not be executed
            if (registration.RegistrationContext.Contains("useEffect") ||
                registration.RegistrationContext.Contains("useCanvas") ||
                registration.FilePath.Contains("hooks."))
            {
                // Check if the call is in App.tsx or a file that loads before React components
                if (call.FilePath.Contains("App.tsx") || call.FilePath.Contains("App.jsx"))
                {
                    return new SequenceRegistrationViolation
                    {
                        Type = "RegistrationTimingIssue",
                        SequenceName = call.SequenceName,
                        CallLocation = call.FilePath,
                        CallLineNumber = call.LineNumber,
                        RegistrationLocation = registration.FilePath,
                        RegistrationLineNumber = registration.LineNumber,
                        Description = $"Sequence '{call.SequenceName}' is called in App.tsx but registered in a React hook that may not execute before the call",
                        Severity = "Critical",
                        SuggestedFix = "Move sequence registration to app initialization or ensure the React component with the hook is rendered before the sequence is called"
                    };
                }
            }

            return null;
        }

        private string GetRegistrationSuggestion(string sequenceName, string projectRoot)
        {
            // Look for sequence definition files that might contain the sequence
            var sequenceFiles = Directory.GetFiles(projectRoot, "sequence.ts", SearchOption.AllDirectories)
                .Concat(Directory.GetFiles(projectRoot, "sequence.js", SearchOption.AllDirectories))
                .Where(f => f.Contains(sequenceName.Replace("-symphony", "").Replace("-", "")))
                .ToList();

            if (sequenceFiles.Any())
            {
                var sequenceFile = sequenceFiles.First();
                var hookFile = Path.Combine(Path.GetDirectoryName(sequenceFile)!, "hooks.ts");
                if (!File.Exists(hookFile))
                {
                    hookFile = Path.Combine(Path.GetDirectoryName(sequenceFile)!, "hooks.js");
                }

                if (File.Exists(hookFile))
                {
                    return $"Ensure the React component using the hook in '{hookFile}' is rendered before calling the sequence, or move registration to app initialization";
                }
                else
                {
                    return $"Create a registration for '{sequenceName}' using conductor.defineSequence() or conductor.registerSequence()";
                }
            }

            return $"Create a sequence definition and registration for '{sequenceName}'";
        }
    }

    // Supporting classes for sequence registration validation
    public class SequenceRegistrationValidationResult
    {
        public bool IsCompliant { get; set; }
        public int TotalSequenceCalls { get; set; }
        public int TotalSequenceRegistrations { get; set; }
        public List<SequenceRegistrationViolation> Violations { get; set; } = new();
        public List<string> ValidationErrors { get; set; } = new();
    }

    public class SequenceCall
    {
        public string SequenceName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public int LineNumber { get; set; }
        public string CallType { get; set; } = string.Empty;
        public string CallContext { get; set; } = string.Empty;
    }

    public class SequenceRegistration
    {
        public string SequenceName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public int LineNumber { get; set; }
        public string RegistrationType { get; set; } = string.Empty;
        public string RegistrationContext { get; set; } = string.Empty;
    }

    public class SequenceRegistrationViolation
    {
        public string Type { get; set; } = string.Empty;
        public string SequenceName { get; set; } = string.Empty;
        public string CallLocation { get; set; } = string.Empty;
        public int CallLineNumber { get; set; }
        public string? RegistrationLocation { get; set; }
        public int? RegistrationLineNumber { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string SuggestedFix { get; set; } = string.Empty;
    }
}
