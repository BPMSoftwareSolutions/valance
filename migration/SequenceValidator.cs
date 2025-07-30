using RX.Architecture.Validator.Console.Models;
using RX.Architecture.Validator.Console.Services;
using System.Text.RegularExpressions;

namespace RX.Architecture.Validator.Console.Validators;

public class SequenceValidator
{
    private readonly bool _strictMode;
    private readonly ValidationConfig _config;

    public SequenceValidator(bool strictMode = false)
    {
        _strictMode = strictMode;
        _config = LoadValidationConfig();
    }

    public ValidationResult ValidateSequence(SequenceDefinition sequence)
    {
        var result = new ValidationResult
        {
            SequenceName = sequence.Name,
            ComponentName = ExtractComponentName(sequence.Name)
        };

        // Core validations
        ValidateRequiredFields(sequence, result);
        ValidateMusicalProperties(sequence, result);
        ValidateMovements(sequence, result);
        ValidateEventTypes(sequence, result);

        // Strict mode validations
        if (_strictMode)
        {
            ValidateNamingConventions(sequence, result);
            ValidateDocumentation(sequence, result);
            ValidateComplexity(sequence, result);
        }

        return result;
    }

    private void ValidateRequiredFields(SequenceDefinition sequence, ValidationResult result)
    {
        if (string.IsNullOrWhiteSpace(sequence.Name))
            result.AddError("Sequence name is required");

        if (string.IsNullOrWhiteSpace(sequence.Description))
            result.AddError("Sequence description is required");

        if (string.IsNullOrWhiteSpace(sequence.Key))
            result.AddError("Musical key is required");

        if (sequence.Tempo <= 0)
            result.AddError("Tempo must be greater than 0");

        if (sequence.Movements == null || !sequence.Movements.Any())
            result.AddError("Sequence must have at least one movement");
    }

    private void ValidateMusicalProperties(SequenceDefinition sequence, ValidationResult result)
    {
        // Validate key signature
        var validKeys = new[] { "C Major", "D Major", "E Major", "F Major", "G Major", "A Major", "B Major",
                               "C Minor", "D Minor", "E Minor", "F Minor", "G Minor", "A Minor", "B Minor" };
        
        if (!validKeys.Contains(sequence.Key))
            result.AddWarning($"Unusual key signature: {sequence.Key}");

        // Validate tempo range
        if (sequence.Tempo < _config.Validation.MinTempo || sequence.Tempo > _config.Validation.MaxTempo)
            result.AddWarning($"Tempo {sequence.Tempo} BPM is outside recommended range ({_config.Validation.MinTempo}-{_config.Validation.MaxTempo})");

        // Validate time signature
        if (sequence.TimeSignature != _config.Validation.RequiredTimeSignature)
            result.AddWarning($"Non-standard time signature: {sequence.TimeSignature}");
    }

    private void ValidateMovements(SequenceDefinition sequence, ValidationResult result)
    {
        foreach (var movement in sequence.Movements)
        {
            if (string.IsNullOrWhiteSpace(movement.Name))
                result.AddError("Movement name is required");

            if (movement.Measures == null || !movement.Measures.Any())
                result.AddError($"Movement '{movement.Name}' must have at least one measure");

            ValidateBeats(movement.Measures, result);
        }
    }

    private void ValidateBeats(List<BeatDefinition> beats, ValidationResult result)
    {
        // Check sequential beat numbering
        var expectedBeat = 1;
        foreach (var beat in beats.OrderBy(b => b.Beat))
        {
            if (beat.Beat != expectedBeat)
            {
                result.AddError($"Beat numbering gap: expected beat {expectedBeat}, found beat {beat.Beat}");
            }
            expectedBeat++;
        }

        // Validate beat properties
        foreach (var beat in beats)
        {
            if (string.IsNullOrWhiteSpace(beat.Event))
                result.AddError($"Beat {beat.Beat} is missing event type");

            if (string.IsNullOrWhiteSpace(beat.Title))
                result.AddError($"Beat {beat.Beat} is missing title");

            if (string.IsNullOrWhiteSpace(beat.Description))
                result.AddWarning($"Beat {beat.Beat} is missing description");

            // Validate dependencies
            if (beat.Dependencies?.Any() == true)
            {
                foreach (var dependency in beat.Dependencies)
                {
                    if (!beats.Any(b => b.Beat == dependency))
                        result.AddError($"Beat {beat.Beat} has invalid dependency: beat {dependency} does not exist");
                }
            }
        }

        // Check for too many beats
        if (beats.Count > _config.Validation.MaxBeatsPerSequence)
            result.AddWarning($"Sequence has {beats.Count} beats, consider breaking into multiple sequences (max recommended: {_config.Validation.MaxBeatsPerSequence})");
    }

    private void ValidateEventTypes(SequenceDefinition sequence, ValidationResult result)
    {
        // This would validate against actual EVENT_TYPES definitions
        // For now, we'll do basic validation
        
        var eventTypes = sequence.Movements
            .SelectMany(m => m.Measures)
            .Select(b => b.Event)
            .Distinct()
            .ToList();

        foreach (var eventType in eventTypes)
        {
            if (!IsValidEventType(eventType))
                result.AddError($"Unknown event type: {eventType}");
        }
    }

    private void ValidateNamingConventions(SequenceDefinition sequence, ValidationResult result)
    {
        // Validate sequence name pattern
        var sequencePattern = new Regex(_config.NamingConventions.SequencePattern);
        if (!sequencePattern.IsMatch(sequence.Name))
            result.AddError($"Sequence name '{sequence.Name}' does not match required pattern");

        // Validate symphony numbering
        if (!sequence.Name.Contains("Symphony No."))
            result.AddWarning("Sequence name should include symphony number (e.g., 'Symphony No. 1')");
    }

    private void ValidateDocumentation(SequenceDefinition sequence, ValidationResult result)
    {
        if (sequence.Description.Length < 20)
            result.AddWarning("Sequence description should be more detailed (minimum 20 characters)");

        // Check for musical terminology
        var musicalTerms = new[] { "tempo", "key", "movement", "beat", "measure" };
        if (!musicalTerms.Any(term => sequence.Description.ToLower().Contains(term)))
            result.AddWarning("Sequence description should include musical terminology");
    }

    private void ValidateComplexity(SequenceDefinition sequence, ValidationResult result)
    {
        var totalBeats = sequence.Movements.Sum(m => m.Measures.Count);
        
        if (totalBeats > 12)
            result.AddWarning($"Complex sequence with {totalBeats} beats - consider breaking into multiple sequences");

        if (sequence.Movements.Count > 3)
            result.AddWarning($"Sequence has {sequence.Movements.Count} movements - consider simplifying");
    }

    private bool IsValidEventType(string eventType)
    {
        // This would check against actual EVENT_TYPES
        // For now, basic validation
        return !string.IsNullOrWhiteSpace(eventType) && 
               eventType.All(c => char.IsUpper(c) || c == '_') &&
               eventType.Length > 3;
    }

    private string ExtractComponentName(string sequenceName)
    {
        // Extract component name from sequence name
        // e.g., "Canvas Component Symphony No. 1" -> "Canvas"
        var parts = sequenceName.Split(' ');
        return parts.Length > 0 ? parts[0].ToLower() : "unknown";
    }

    private ValidationConfig LoadValidationConfig()
    {
        var configService = new ConfigurationService();
        return configService.LoadValidationConfig().Result;
    }
}
