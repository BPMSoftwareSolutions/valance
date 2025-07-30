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
    /// Validates integration flow between UI event handlers and musical sequences
    /// Detects when symphonies are structurally sound but disconnected from UI layer
    /// </summary>
    public class IntegrationFlowValidator
    {
        private readonly bool _verbose;
        private readonly PathMappingsConfig _pathMappings;

        public IntegrationFlowValidator(bool verbose, PathMappingsConfig pathMappings)
        {
            _verbose = verbose;
            _pathMappings = pathMappings;
        }

        /// <summary>
        /// Validates integration flow for a specific symphony
        /// </summary>
        public async Task<IntegrationFlowValidationResult> ValidateIntegrationFlow(
            string symphonyName, 
            string componentName, 
            string symphonyPath,
            string projectRoot)
        {
            var result = new IntegrationFlowValidationResult
            {
                SymphonyName = symphonyName,
                ComponentName = componentName,
                IsCompliant = true,
                Violations = new List<IntegrationFlowViolation>()
            };

            if (_verbose)
                System.Console.WriteLine($"🔗 Validating integration flow for {symphonyName} symphony...");

            try
            {
                // Step 1: Extract expected event handlers from symphony
                var expectedHandlers = await ExtractExpectedEventHandlers(symphonyPath, symphonyName);
                
                // Step 2: Scan UI files for actual event handler implementations
                var actualHandlers = await ScanUIEventHandlers(projectRoot, symphonyName);
                
                // Step 3: Check for missing symphony calls in event handlers
                var missingIntegrations = await ValidateHandlerSymphonyIntegration(
                    expectedHandlers, actualHandlers, symphonyName, projectRoot, symphonyPath);
                
                result.Violations.AddRange(missingIntegrations);
                result.IsCompliant = result.Violations.Count == 0;

                if (_verbose)
                {
                    System.Console.WriteLine($"🔍 Found {expectedHandlers.Count} expected handlers");
                    System.Console.WriteLine($"🔍 Found {actualHandlers.Count} actual UI handlers");
                    System.Console.WriteLine($"🔍 Detected {result.Violations.Count} integration violations");
                }
            }
            catch (Exception ex)
            {
                result.ValidationErrors.Add($"Error validating integration flow: {ex.Message}");
                result.IsCompliant = false;
            }

            return result;
        }

        /// <summary>
        /// Extract expected event handlers from symphony definition
        /// </summary>
        private async Task<List<ExpectedEventHandler>> ExtractExpectedEventHandlers(
            string symphonyPath, string symphonyName)
        {
            var handlers = new List<ExpectedEventHandler>();
            
            // Look for sequence.ts file to understand the symphony flow
            var sequenceFile = Path.Combine(symphonyPath, "sequence.ts");
            if (!File.Exists(sequenceFile))
                return handlers;

            var content = await File.ReadAllTextAsync(sequenceFile);
            
            // Extract symphony events that should have UI triggers
            var eventPattern = @"event:\s*['""]([^'""]+)['""]";
            var eventMatches = Regex.Matches(content, eventPattern);
            
            foreach (Match match in eventMatches)
            {
                var eventName = match.Groups[1].Value;
                
                // Map event names to expected UI handler patterns
                var expectedHandler = MapEventToExpectedHandler(eventName, symphonyName);
                if (expectedHandler != null)
                {
                    handlers.Add(expectedHandler);
                }
            }

            return handlers;
        }

        /// <summary>
        /// Map symphony events to expected UI handler patterns
        /// </summary>
        private ExpectedEventHandler? MapEventToExpectedHandler(string eventName, string symphonyName)
        {
            return symphonyName switch
            {
                "component-drag" when eventName.Contains("drag") => new ExpectedEventHandler
                {
                    EventName = eventName,
                    ExpectedHandlerName = "handleCanvasElementDragStart",
                    ExpectedSymphonyCall = $"conductor.startSequence('canvas-component-drag-symphony'",
                    UITriggerType = "onDragStart"
                },
                "library-drop" when eventName.Contains("drop") => new ExpectedEventHandler
                {
                    EventName = eventName,
                    ExpectedHandlerName = "handleCanvasLibraryDrop",
                    ExpectedSymphonyCall = $"conductor.startSequence('canvas-library-drop-symphony'",
                    UITriggerType = "onDrop"
                },
                "element-selection" when eventName.Contains("selection") => new ExpectedEventHandler
                {
                    EventName = eventName,
                    ExpectedHandlerName = "handleCanvasElementSelection",
                    ExpectedSymphonyCall = $"conductor.startSequence('canvas-element-selection-symphony'",
                    UITriggerType = "onClick"
                },
                _ => null
            };
        }

        /// <summary>
        /// Scan UI files for actual event handler implementations
        /// </summary>
        private async Task<List<ActualEventHandler>> ScanUIEventHandlers(string projectRoot, string symphonyName)
        {
            var handlers = new List<ActualEventHandler>();

            if (_verbose)
                System.Console.WriteLine($"🔍 [DEBUG] Scanning UI files from project root: {projectRoot}");

            // Look for App.tsx and other UI files
            var uiFiles = new[]
            {
                Path.Combine(projectRoot, "App.tsx"),
                Path.Combine(projectRoot, "src", "App.tsx"),
                Path.Combine(projectRoot, "components", "Canvas.tsx"),
                Path.Combine(projectRoot, "src", "components", "Canvas.tsx"),
                Path.Combine(projectRoot, "src", "components", "Canvas", "Canvas.tsx")
            };

            if (_verbose)
            {
                System.Console.WriteLine($"🔍 [DEBUG] Looking for UI files:");
                foreach (var file in uiFiles)
                {
                    var exists = File.Exists(file);
                    System.Console.WriteLine($"🔍 [DEBUG]   {file} - {(exists ? "EXISTS" : "NOT FOUND")}");
                }
            }

            foreach (var uiFile in uiFiles.Where(File.Exists))
            {
                if (_verbose)
                    System.Console.WriteLine($"🔍 [DEBUG] Analyzing UI file: {uiFile}");

                var content = await File.ReadAllTextAsync(uiFile);
                var fileHandlers = ExtractEventHandlersFromFile(content, uiFile, symphonyName);

                if (_verbose)
                    System.Console.WriteLine($"🔍 [DEBUG] Found {fileHandlers.Count} handlers in {Path.GetFileName(uiFile)}");

                handlers.AddRange(fileHandlers);
            }

            return handlers;
        }

        /// <summary>
        /// Extract event handlers from a specific UI file
        /// </summary>
        private List<ActualEventHandler> ExtractEventHandlersFromFile(string content, string filePath, string symphonyName)
        {
            var handlers = new List<ActualEventHandler>();

            if (_verbose)
                System.Console.WriteLine($"🔍 [DEBUG] Extracting handlers from {Path.GetFileName(filePath)} for {symphonyName} symphony");

            // Pattern for React event handlers:
            // Format 1: onDragStart={(e) => handleSomething(e)}
            // Format 2: onDragStart={handleSomething}
            var handlerPattern1 = @"(on\w+)\s*=\s*\{\s*\([^)]*\)\s*=>\s*(\w+)\s*\([^)]*\)\s*\}";
            var handlerPattern2 = @"(on\w+)\s*=\s*\{\s*(\w+)\s*\}";

            var matches1 = Regex.Matches(content, handlerPattern1);
            var matches2 = Regex.Matches(content, handlerPattern2);

            var allMatches = new List<Match>();
            allMatches.AddRange(matches1.Cast<Match>());
            allMatches.AddRange(matches2.Cast<Match>());

            if (_verbose)
                System.Console.WriteLine($"🔍 [DEBUG] Found {allMatches.Count} potential event handler patterns");

            foreach (Match match in allMatches)
            {
                var eventType = match.Groups[1].Value;
                var handlerName = match.Groups[2].Value;

                if (_verbose)
                    System.Console.WriteLine($"🔍 [DEBUG] Found handler: {handlerName} for {eventType}");

                // Check if this handler is relevant to the symphony
                if (IsHandlerRelevantToSymphony(handlerName, eventType, symphonyName))
                {
                    if (_verbose)
                        System.Console.WriteLine($"🔍 [DEBUG] Handler {handlerName} is relevant to {symphonyName}");

                    // Check if the handler calls a musical sequence
                    var callsSymphony = CheckIfHandlerCallsSymphony(content, handlerName, symphonyName);

                    if (_verbose)
                        System.Console.WriteLine($"🔍 [DEBUG] Handler {handlerName} calls symphony: {callsSymphony.calls} - {callsSymphony.details}");

                    handlers.Add(new ActualEventHandler
                    {
                        HandlerName = handlerName,
                        EventType = eventType,
                        FilePath = filePath,
                        LineNumber = GetLineNumber(content, match.Index),
                        CallsSymphony = callsSymphony.calls,
                        SymphonyCallDetails = callsSymphony.details
                    });
                }
            }

            if (_verbose)
                System.Console.WriteLine($"🔍 [DEBUG] Extracted {handlers.Count} relevant handlers");

            return handlers;
        }

        /// <summary>
        /// Check if a handler is relevant to the symphony being validated
        /// </summary>
        private bool IsHandlerRelevantToSymphony(string handlerName, string eventType, string symphonyName)
        {
            return symphonyName switch
            {
                "component-drag" => handlerName.Contains("Drag") || eventType == "onDragStart",
                "library-drop" => handlerName.Contains("Drop") || eventType == "onDrop",
                "element-selection" => handlerName.Contains("Selection") || handlerName.Contains("Click") || eventType == "onClick",
                _ => false
            };
        }

        /// <summary>
        /// Check if a handler function calls its corresponding musical sequence
        /// </summary>
        private (bool calls, string details) CheckIfHandlerCallsSymphony(string content, string handlerName, string symphonyName)
        {
            if (_verbose)
                System.Console.WriteLine($"🔍 [DEBUG] Looking for handler function: {handlerName}");

            // Try to find the handler function definition with proper brace matching
            var handlerBody = ExtractFunctionBodyWithBraceMatching(content, handlerName);

            if (handlerBody == null)
            {
                if (_verbose)
                    System.Console.WriteLine($"🔍 [DEBUG] Handler function {handlerName} not found");
                return (false, "Handler function not found");
            }

            if (_verbose)
                System.Console.WriteLine($"🔍 [DEBUG] Handler body (first 100 chars): {handlerBody.Substring(0, Math.Min(100, handlerBody.Length))}...");

            // Check for symphony calls
            var symphonyCallPatterns = new[]
            {
                @"conductor\.startSequence\s*\(\s*['""].*?symphony['""]",
                @"communicationSystem\.conductor\.startSequence\s*\(\s*['""].*?symphony['""]",
                @"startSequence\s*\(\s*['""].*?symphony['""]",
                @"startCanvasLibraryDropFlow\s*\(",
                @"musical.*?sequence",
                @"symphony.*?start"
            };

            foreach (var pattern in symphonyCallPatterns)
            {
                var match = Regex.Match(handlerBody, pattern, RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    // Extract the actual symphony name being called
                    var symphonyCallMatch = Regex.Match(handlerBody, @"(?:communicationSystem\.)?conductor\.startSequence\s*\(\s*['""]([^'""]+)['""]", RegexOptions.IgnoreCase);
                    if (symphonyCallMatch.Success)
                    {
                        var calledSymphonyName = symphonyCallMatch.Groups[1].Value;
                        if (_verbose)
                            System.Console.WriteLine($"🔍 [DEBUG] Found symphony call: {calledSymphonyName}");

                        // Check if the called symphony name matches the expected pattern
                        var expectedSymphonyName = $"canvas-{symphonyName}-symphony";
                        if (calledSymphonyName != expectedSymphonyName)
                        {
                            if (_verbose)
                                System.Console.WriteLine($"🔍 [DEBUG] Symphony name mismatch! Called: {calledSymphonyName}, Expected: {expectedSymphonyName}");
                            return (false, $"Symphony name mismatch: calls '{calledSymphonyName}' but expected '{expectedSymphonyName}'");
                        }
                    }

                    if (_verbose)
                        System.Console.WriteLine($"🔍 [DEBUG] Found valid symphony call with pattern: {pattern}");
                    return (true, $"Found symphony call matching pattern: {pattern}");
                }
            }

            if (_verbose)
                System.Console.WriteLine($"🔍 [DEBUG] No symphony call found in handler body");
            return (false, "No symphony call found in handler body");
        }

        /// <summary>
        /// Validate integration between handlers and symphonies
        /// </summary>
        private async Task<List<IntegrationFlowViolation>> ValidateHandlerSymphonyIntegration(
            List<ExpectedEventHandler> expectedHandlers,
            List<ActualEventHandler> actualHandlers,
            string symphonyName,
            string projectRoot,
            string symphonyPath)
        {
            var violations = new List<IntegrationFlowViolation>();

            // Check for missing symphony calls in actual handlers
            foreach (var actualHandler in actualHandlers)
            {
                if (!actualHandler.CallsSymphony)
                {
                    violations.Add(new IntegrationFlowViolation
                    {
                        Type = "MissingSymphonyCall",
                        HandlerName = actualHandler.HandlerName,
                        EventType = actualHandler.EventType,
                        FilePath = actualHandler.FilePath,
                        LineNumber = actualHandler.LineNumber,
                        Description = $"Event handler '{actualHandler.HandlerName}' does not call corresponding musical sequence for {symphonyName} symphony",
                        ExpectedCall = $"conductor.startSequence('canvas-{symphonyName}-symphony', ...)",
                        ActualBehavior = actualHandler.SymphonyCallDetails,
                        Severity = "Critical",
                        Impact = "Symphony beats will never execute, breaking the musical architecture"
                    });
                }
                else if (actualHandler.SymphonyCallDetails.Contains("mismatch"))
                {
                    violations.Add(new IntegrationFlowViolation
                    {
                        Type = "SymphonyNameMismatch",
                        HandlerName = actualHandler.HandlerName,
                        EventType = actualHandler.EventType,
                        FilePath = actualHandler.FilePath,
                        LineNumber = actualHandler.LineNumber,
                        Description = $"Event handler '{actualHandler.HandlerName}' calls wrong symphony name",
                        ExpectedCall = $"conductor.startSequence('canvas-{symphonyName}-symphony', ...)",
                        ActualBehavior = actualHandler.SymphonyCallDetails,
                        Severity = "Critical",
                        Impact = "Runtime error: Sequence not found - symphony will fail to execute"
                    });
                }
            }

            // Check if the symphony is properly registered in the conductor
            var symphonyRegistrationViolation = await ValidateSymphonyRegistration(symphonyName, projectRoot, symphonyPath);
            if (symphonyRegistrationViolation != null)
            {
                violations.Add(symphonyRegistrationViolation);
            }

            return violations;
        }

        /// <summary>
        /// Validate that the symphony is properly registered in the MusicalConductor
        /// </summary>
        private async Task<IntegrationFlowViolation?> ValidateSymphonyRegistration(string symphonyName, string projectRoot, string symphonyPath)
        {
            try
            {
                // Look for MusicalConductor.ts file
                var conductorFiles = new[]
                {
                    Path.Combine(projectRoot, "communication", "sequences", "MusicalConductor.ts"),
                    Path.Combine(projectRoot, "communication", "MusicalConductor.ts"),
                    Path.Combine(projectRoot, "core", "MusicalConductor.ts"),
                    Path.Combine(projectRoot, "MusicalConductor.ts")
                };

                var expectedSymphonyName = $"canvas-{symphonyName}-symphony";
                bool isRegistered = false;
                string registrationLocation = "";

                // First check the MusicalConductor.ts file
                foreach (var conductorFile in conductorFiles.Where(File.Exists))
                {
                    var content = await File.ReadAllTextAsync(conductorFile);

                    var registrationPatterns = new[]
                    {
                        $@"['""]?{expectedSymphonyName}['""]?\s*:",
                        $@"registerSequence\s*\(\s*['""]?{expectedSymphonyName}['""]?\s*,",
                        $@"defineSequence\s*\(\s*['""]?{expectedSymphonyName}['""]?\s*,",
                        $@"sequences\s*\[\s*['""]?{expectedSymphonyName}['""]?\s*\]",
                        $@"['""]?{expectedSymphonyName}['""]?\s*=>"
                    };

                    if (registrationPatterns.Any(pattern => Regex.IsMatch(content, pattern, RegexOptions.IgnoreCase)))
                    {
                        isRegistered = true;
                        registrationLocation = conductorFile;
                        if (_verbose)
                            System.Console.WriteLine($"🔍 [DEBUG] Symphony {expectedSymphonyName} found in conductor: {conductorFile}");
                        break;
                    }
                }

                // If not found in conductor, check the symphony's own files (hooks.ts, index.ts)
                if (!isRegistered)
                {
                    var symphonyFiles = new[]
                    {
                        Path.Combine(symphonyPath, "hooks.ts"),
                        Path.Combine(symphonyPath, "index.ts"),
                        Path.Combine(symphonyPath, "registry.ts")
                    };

                    foreach (var symphonyFile in symphonyFiles.Where(File.Exists))
                    {
                        var content = await File.ReadAllTextAsync(symphonyFile);

                        var registrationPatterns = new[]
                        {
                            $@"defineSequence\s*\(\s*['""]?{expectedSymphonyName}['""]?\s*,",
                            $@"registerSequence\s*\(\s*['""]?{expectedSymphonyName}['""]?\s*,",
                            $@"conductor\.defineSequence\s*\(\s*['""]?{expectedSymphonyName}['""]?\s*,",
                            $@"conductor\.registerSequence\s*\(\s*['""]?{expectedSymphonyName}['""]?\s*,"
                        };

                        if (registrationPatterns.Any(pattern => Regex.IsMatch(content, pattern, RegexOptions.IgnoreCase)))
                        {
                            isRegistered = true;
                            registrationLocation = symphonyFile;
                            if (_verbose)
                                System.Console.WriteLine($"🔍 [DEBUG] Symphony {expectedSymphonyName} found in symphony file: {symphonyFile}");
                            break;
                        }
                    }
                }

                if (!isRegistered)
                {
                    if (_verbose)
                        System.Console.WriteLine($"🔍 [DEBUG] Symphony {expectedSymphonyName} not found in any registration location");

                    return new IntegrationFlowViolation
                    {
                        Type = "SymphonyNotRegistered",
                        HandlerName = "MusicalConductor",
                        EventType = "Registration",
                        FilePath = symphonyPath,
                        LineNumber = 1,
                        Description = $"Symphony '{expectedSymphonyName}' is not registered anywhere",
                        ExpectedCall = $"conductor.defineSequence('{expectedSymphonyName}', SEQUENCE) in hooks.ts",
                        ActualBehavior = "Symphony not found in conductor or symphony files",
                        Severity = "Critical",
                        Impact = "Runtime error: Sequence not found when handlers try to start symphony"
                    };
                }
                else
                {
                    if (_verbose)
                        System.Console.WriteLine($"🔍 [DEBUG] Symphony {expectedSymphonyName} properly registered in: {registrationLocation}");
                }

                return null; // No violation found
            }
            catch (Exception ex)
            {
                if (_verbose)
                    System.Console.WriteLine($"🔍 [DEBUG] Error validating symphony registration: {ex.Message}");
                return null;
            }
        }

        /// <summary>
        /// Extract function body with proper brace matching to handle nested braces
        /// </summary>
        private string? ExtractFunctionBodyWithBraceMatching(string content, string handlerName)
        {
            // Find the function declaration
            var functionPatterns = new[]
            {
                $@"const\s+{handlerName}\s*=.*?\{{", // const handlerName = () => {
                $@"function\s+{handlerName}\s*\([^)]*\)\s*\{{", // function handlerName() {
                $@"{handlerName}\s*:\s*\([^)]*\)\s*=>\s*\{{", // handlerName: () => {
                $@"{handlerName}\s*=\s*\([^)]*\)\s*=>\s*\{{" // handlerName = () => {
            };

            foreach (var pattern in functionPatterns)
            {
                var match = Regex.Match(content, pattern, RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    if (_verbose)
                        System.Console.WriteLine($"🔍 [DEBUG] Found handler declaration: {handlerName}");

                    // Find the opening brace position
                    var startPos = match.Index + match.Length - 1; // Position of opening brace

                    // Use brace matching to find the complete function body
                    var functionBody = ExtractBalancedBraces(content, startPos);
                    if (functionBody != null)
                    {
                        if (_verbose)
                            System.Console.WriteLine($"🔍 [DEBUG] Extracted function body ({functionBody.Length} chars)");
                        return functionBody;
                    }
                }
            }

            if (_verbose)
                System.Console.WriteLine($"🔍 [DEBUG] Handler function {handlerName} not found");
            return null;
        }

        /// <summary>
        /// Extract content between balanced braces starting from the given position
        /// </summary>
        private string? ExtractBalancedBraces(string content, int startPos)
        {
            if (startPos >= content.Length || content[startPos] != '{')
                return null;

            var braceCount = 0;
            var start = startPos + 1; // Skip opening brace
            var current = startPos;

            while (current < content.Length)
            {
                var ch = content[current];
                if (ch == '{')
                    braceCount++;
                else if (ch == '}')
                {
                    braceCount--;
                    if (braceCount == 0)
                    {
                        // Found matching closing brace
                        return content.Substring(start, current - start);
                    }
                }
                current++;
            }

            return null; // Unmatched braces
        }

        /// <summary>
        /// Get line number for a character position in content
        /// </summary>
        private int GetLineNumber(string content, int position)
        {
            return content.Take(position).Count(c => c == '\n') + 1;
        }
    }
}
