using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using RX.Architecture.Validator.Console.Services;
using RX.Architecture.Validator.Console.Models;

namespace RX.Architecture.Validator.Console.Validators
{
    public class CrossComponentEventValidator
    {
        private readonly PathMappingsConfig _pathMappings;
        private readonly bool _verbose;

        public CrossComponentEventValidator(PathMappingsConfig pathMappings, bool verbose = false)
        {
            _pathMappings = pathMappings;
            _verbose = verbose;
        }

        public async Task<CrossComponentEventValidationResult> ValidateEventRegistration(
            string symphonyPath, string symphonyName, string componentName)
        {
            var result = new CrossComponentEventValidationResult
            {
                SymphonyName = symphonyName,
                ComponentName = componentName,
                SymphonyPath = symphonyPath
            };

            if (_verbose)
                System.Console.WriteLine($"🔍 Validating event registration for {symphonyName} symphony...");

            try
            {
                // Step 1: Extract events from symphony sequence.ts
                var symphonyEvents = await ExtractSymphonyEvents(symphonyPath);
                result.SymphonyEvents = symphonyEvents;

                if (_verbose)
                    System.Console.WriteLine($"📋 Found {symphonyEvents.Count} events in symphony");

                // Step 2: Get target component event types
                var componentEventTypes = await GetComponentEventTypes(componentName);
                result.ComponentEventTypes = componentEventTypes;

                if (_verbose)
                    System.Console.WriteLine($"📋 Found {componentEventTypes.Count} events in {componentName} event types");

                // Step 3: Filter to only cross-component events (exclude Canvas-internal events)
                var crossComponentEvents = FilterCrossComponentEvents(symphonyEvents, componentName);
                if (_verbose)
                    System.Console.WriteLine($"🔍 Filtered to {crossComponentEvents.Count} cross-component events (excluded Canvas-internal events)");

                // Step 4: Detect registration gaps (only for cross-component events)
                var missingEvents = crossComponentEvents.Except(componentEventTypes).ToList();
                result.MissingEventRegistrations = missingEvents;

                if (_verbose && missingEvents.Any())
                    System.Console.WriteLine($"❌ Found {missingEvents.Count} missing cross-component event registrations");

                // Step 5: Check cross-component requirements for canvas symphonies (only for cross-component events)
                if (componentName == "canvas")
                {
                    var crossComponentGaps = await ValidateCrossComponentRegistration(crossComponentEvents);
                    result.CrossComponentGaps = crossComponentGaps;

                    if (_verbose && crossComponentGaps.Any())
                        System.Console.WriteLine($"❌ Found cross-component gaps in {crossComponentGaps.Count} components");
                }

                // Step 5: Generate recommendations
                result.Recommendations = GenerateRecommendations(missingEvents, result.CrossComponentGaps);

                if (_verbose)
                    System.Console.WriteLine($"💡 Generated {result.Recommendations.Count} recommendations");
            }
            catch (Exception ex)
            {
                System.Console.WriteLine($"❌ Error validating event registration: {ex.Message}");
                if (_verbose)
                    System.Console.WriteLine($"Stack trace: {ex.StackTrace}");
            }

            return result;
        }

        private async Task<List<string>> ExtractSymphonyEvents(string symphonyPath)
        {
            var events = new List<string>();
            var sequenceFile = Path.Combine(symphonyPath, "sequence.ts");
            
            if (!File.Exists(sequenceFile))
            {
                if (_verbose)
                    System.Console.WriteLine($"⚠️ Sequence file not found: {sequenceFile}");
                return events;
            }

            var content = await File.ReadAllTextAsync(sequenceFile);
            
            // Extract event definitions from sequence.ts
            // Pattern: event: EVENT_TYPES.SOME_EVENT or event: 'some-event'
            var eventPattern = @"event:\s*(?:EVENT_TYPES\.([A-Z_]+)|['""]([^'""]+)['""])";
            var matches = Regex.Matches(content, eventPattern);

            foreach (Match match in matches)
            {
                var eventName = match.Groups[1].Success ? 
                    ConvertEventTypeToString(match.Groups[1].Value) : 
                    match.Groups[2].Value;
                
                if (!string.IsNullOrEmpty(eventName))
                {
                    events.Add(eventName);
                    if (_verbose)
                        System.Console.WriteLine($"📝 Found event: {eventName}");
                }
            }

            return events.Distinct().ToList();
        }

        private async Task<List<string>> GetComponentEventTypes(string componentName)
        {
            var eventTypes = new List<string>();
            
            if (!_pathMappings.Components.TryGetValue(componentName, out var componentConfig))
            {
                if (_verbose)
                    System.Console.WriteLine($"⚠️ Component '{componentName}' not found in path mappings");
                return eventTypes;
            }

            // Navigate up from validator console to project root, then to the event types file
            var projectRoot = Directory.GetCurrentDirectory();
            // Go up two levels from packages/RX.Architecture.Validator.Console to project root
            projectRoot = Directory.GetParent(Directory.GetParent(projectRoot).FullName).FullName;

            var eventTypesPath = Path.Combine(
                projectRoot,
                "packages/RX.Evolution/rx.evolution.client",
                componentConfig.EventTypesPath
            );

            if (!File.Exists(eventTypesPath))
            {
                if (_verbose)
                    System.Console.WriteLine($"⚠️ Event types file not found: {eventTypesPath}");
                return eventTypes;
            }

            var content = await File.ReadAllTextAsync(eventTypesPath);
            
            // Extract event type values
            var eventPattern = @"([A-Z_]+):\s*['""]([^'""]+)['""]";
            var matches = Regex.Matches(content, eventPattern);

            foreach (Match match in matches)
            {
                eventTypes.Add(match.Groups[2].Value);
                if (_verbose)
                    System.Console.WriteLine($"📝 Found component event: {match.Groups[2].Value}");
            }

            return eventTypes.Distinct().ToList();
        }

        private async Task<Dictionary<string, List<string>>> ValidateCrossComponentRegistration(
            List<string> symphonyEvents)
        {
            var gaps = new Dictionary<string, List<string>>();

            // RX.Evolution uses dynamic component loading from JSON definitions
            // Components don't have individual event type files - they're loaded dynamically
            // Only validate cross-component registration for components that actually have event type files
            var targetComponents = _pathMappings.Components.Keys
                .Where(c => c != "canvas") // Exclude the source component
                .ToArray();

            if (!targetComponents.Any())
            {
                if (_verbose)
                    System.Console.WriteLine($"ℹ️ No target components found for cross-component validation (dynamic component architecture)");
                return gaps;
            }

            // Only check canvas events that should be accessible to other components
            var canvasEvents = symphonyEvents.Where(e => e.StartsWith("canvas-")).ToList();

            if (!canvasEvents.Any())
                return gaps;

            foreach (var component in targetComponents)
            {
                var componentEvents = await GetComponentEventTypes(component);
                var missingInComponent = canvasEvents
                    .Where(e => !componentEvents.Contains(e))
                    .ToList();

                if (missingInComponent.Any())
                {
                    gaps[component] = missingInComponent;
                    if (_verbose)
                        System.Console.WriteLine($"❌ {component} missing {missingInComponent.Count} canvas events");
                }
            }

            return gaps;
        }

        private List<EventRegistrationRecommendation> GenerateRecommendations(
            List<string> missingEvents, Dictionary<string, List<string>> crossComponentGaps)
        {
            var recommendations = new List<EventRegistrationRecommendation>();

            // Generate recommendations for missing events
            foreach (var eventName in missingEvents)
            {
                recommendations.Add(new EventRegistrationRecommendation
                {
                    EventName = eventName,
                    RecommendationType = "ADD_TO_EVENT_TYPES",
                    Description = $"Add '{eventName}' to component event types file",
                    CodeSuggestion = $"{ConvertEventNameToConstant(eventName)}: '{eventName}'"
                });
            }

            // Generate cross-component recommendations
            foreach (var (component, events) in crossComponentGaps)
            {
                foreach (var eventName in events)
                {
                    recommendations.Add(new EventRegistrationRecommendation
                    {
                        EventName = eventName,
                        RecommendationType = "ADD_CROSS_COMPONENT_EVENT",
                        Description = $"Add canvas event '{eventName}' to {component}.event-types.ts",
                        CodeSuggestion = $"{ConvertEventNameToConstant(eventName)}: '{eventName}'"
                    });
                }
            }

            return recommendations;
        }

        private List<string> FilterCrossComponentEvents(List<string> symphonyEvents, string componentName)
        {
            // Define Canvas-internal events that should NOT be cross-component
            var canvasInternalEvents = new HashSet<string>
            {
                // CSS Synchronization Events (Canvas-internal only)
                "canvas-css-sync-detected",
                "canvas-css-synchronized",
                "canvas-css-sync-complete",

                // Canvas Rendering Events (Canvas-internal only)
                "canvas-render-start",
                "canvas-render-complete",
                "canvas-performance-warning",

                // Canvas Mode Events (Canvas-internal only)
                "canvas-mode-changed",
                "canvas-edit-mode-coordination",

                // Canvas Viewport Events (Canvas-internal only)
                "canvas-zoom-changed",
                "canvas-pan-changed",
                "canvas-bounds-changed",

                // Canvas Tool Events (Canvas-internal only)
                "canvas-tool-selected",
                "canvas-tool-deselected",

                // Canvas Grid/Snap Events (Canvas-internal only)
                "canvas-grid-toggled",
                "canvas-snap-toggled",

                // Canvas Initialization Events (Canvas-internal only)
                "canvas-initialized",
                "canvas-destroyed",
                "canvas-reset"
            };

            // Filter out Canvas-internal events for cross-component validation
            var crossComponentEvents = symphonyEvents
                .Where(eventName => !canvasInternalEvents.Contains(eventName))
                .ToList();

            if (_verbose)
            {
                var filteredOut = symphonyEvents.Except(crossComponentEvents).ToList();
                if (filteredOut.Any())
                {
                    System.Console.WriteLine($"🔍 Filtered out {filteredOut.Count} Canvas-internal events:");
                    foreach (var eventName in filteredOut)
                    {
                        System.Console.WriteLine($"   - {eventName} (Canvas-internal)");
                    }
                }
            }

            return crossComponentEvents;
        }

        private string ConvertEventTypeToString(string eventType)
        {
            // Convert CANVAS_ELEMENT_SELECTED to canvas-element-selected
            return eventType.ToLower().Replace('_', '-');
        }

        private string ConvertEventNameToConstant(string eventName)
        {
            // Convert canvas-element-selected to CANVAS_ELEMENT_SELECTED
            return eventName.ToUpper().Replace('-', '_');
        }
    }
}
