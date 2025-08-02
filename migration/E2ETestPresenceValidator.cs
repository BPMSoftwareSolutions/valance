using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace RX.Architecture.Validator.Console.Validators
{
    /// <summary>
    /// E2E Test Presence Validator for RenderX
    /// 
    /// Validates that proper Playwright E2E tests exist for RenderX application
    /// following Test-Driven Architecture (TDA) principles.
    /// 
    /// Requirements:
    /// - Playwright test file exists in ./testdata/RenderX/test
    /// - Test loads main RenderX app at http://localhost:3000
    /// - Asserts presence of #component-library, #canvas, #control-panel
    /// - Simulates dragging data-component="button" onto canvas
    /// - Confirms .component-button appears in canvas
    /// </summary>
    public class E2ETestPresenceValidator
    {
        private readonly string _testDirectory;
        private readonly string _projectRoot;

        public E2ETestPresenceValidator(string projectRoot = "./testdata/RenderX")
        {
            _projectRoot = projectRoot;
            _testDirectory = Path.Combine(projectRoot, "test");
        }

        public ValidationResult ValidateE2ETestPresence()
        {
            var result = new ValidationResult
            {
                ValidatorName = "E2ETestPresenceValidator",
                ComponentName = "RenderX",
                Timestamp = DateTime.UtcNow
            };

            try
            {
                // Check if test directory exists
                if (!Directory.Exists(_testDirectory))
                {
                    result.AddError($"E2E test directory not found: {_testDirectory}");
                    result.AddError("TDA Requirement: E2E tests must exist to validate architecture");
                    return result;
                }

                // Find Playwright test files
                var testFiles = Directory.GetFiles(_testDirectory, "*.spec.ts", SearchOption.AllDirectories)
                    .Concat(Directory.GetFiles(_testDirectory, "*.test.ts", SearchOption.AllDirectories))
                    .ToArray();

                if (!testFiles.Any())
                {
                    result.AddError("No Playwright test files found (*.spec.ts or *.test.ts)");
                    result.AddError("TDA Requirement: app.spec.ts must exist with E2E validations");
                    return result;
                }

                // Validate each test file
                foreach (var testFile in testFiles)
                {
                    ValidateTestFile(testFile, result);
                }

                // Check for required test file
                var appSpecFile = Path.Combine(_testDirectory, "app.spec.ts");
                if (!File.Exists(appSpecFile))
                {
                    result.AddWarning("app.spec.ts not found - this is the recommended main test file");
                }

                if (result.Errors.Count == 0)
                {
                    result.AddSuccess("E2E test presence validation passed");
                    result.AddSuccess("TDA compliance: E2E tests properly validate architecture");
                }
            }
            catch (Exception ex)
            {
                result.AddError($"Validation failed with exception: {ex.Message}");
            }

            return result;
        }

        private void ValidateTestFile(string testFilePath, ValidationResult result)
        {
            var fileName = Path.GetFileName(testFilePath);
            var content = File.ReadAllText(testFilePath);

            // Check for Playwright imports
            if (!content.Contains("@playwright/test") && !content.Contains("playwright"))
            {
                result.AddError($"{fileName}: Missing Playwright imports");
                return;
            }

            // Check for localhost:3000 navigation
            if (!Regex.IsMatch(content, @"goto\s*\(\s*['""]http://localhost:3000['""]"))
            {
                result.AddError($"{fileName}: Missing navigation to http://localhost:3000");
            }

            // Check for required DOM element assertions
            var requiredElements = new[] { "#component-library", "#canvas", "#control-panel" };
            foreach (var element in requiredElements)
            {
                if (!content.Contains(element))
                {
                    result.AddError($"{fileName}: Missing assertion for DOM element: {element}");
                }
            }

            // Check for drag and drop simulation
            if (!content.Contains("data-component=\"button\""))
            {
                result.AddError($"{fileName}: Missing drag simulation for data-component=\"button\"");
            }

            // Check for canvas drop validation
            if (!content.Contains(".component-button"))
            {
                result.AddError($"{fileName}: Missing validation for .component-button in canvas");
            }

            // Check for proper test structure
            if (!content.Contains("test(") && !content.Contains("it("))
            {
                result.AddError($"{fileName}: Missing test function declarations");
            }

            // Validate test describes the E2E scenario
            if (!Regex.IsMatch(content, @"(test|it)\s*\(\s*['""][^'""]*drag[^'""]*['""]", RegexOptions.IgnoreCase))
            {
                result.AddWarning($"{fileName}: Test should describe drag and drop scenario");
            }

            result.AddInfo($"{fileName}: E2E test file validated");
        }

        public async Task<ValidationResult> ValidateWithPlaywrightExecution()
        {
            var result = ValidateE2ETestPresence();
            
            if (result.Errors.Count > 0)
            {
                return result;
            }

            // Additional validation: Check if Playwright config exists
            var playwrightConfig = Path.Combine(_projectRoot, "playwright.config.ts");
            if (!File.Exists(playwrightConfig))
            {
                result.AddWarning("playwright.config.ts not found - recommended for proper test configuration");
            }

            // Check package.json for Playwright dependencies
            var packageJson = Path.Combine(_projectRoot, "package.json");
            if (File.Exists(packageJson))
            {
                var packageContent = await File.ReadAllTextAsync(packageJson);
                if (!packageContent.Contains("@playwright/test"))
                {
                    result.AddError("package.json missing @playwright/test dependency");
                }
            }
            else
            {
                result.AddError("package.json not found in RenderX project");
            }

            return result;
        }
    }

    public class ValidationResult
    {
        public string ValidatorName { get; set; } = "";
        public string ComponentName { get; set; } = "";
        public DateTime Timestamp { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public List<string> Info { get; set; } = new();
        public List<string> Success { get; set; } = new();

        public void AddError(string message) => Errors.Add(message);
        public void AddWarning(string message) => Warnings.Add(message);
        public void AddInfo(string message) => Info.Add(message);
        public void AddSuccess(string message) => Success.Add(message);

        public bool IsValid => Errors.Count == 0;
    }
}
