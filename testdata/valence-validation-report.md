# Valence Validation Report

**Profile:** renderx-sequence-profile.json

**Validation Time:** 2025-07-29T18:34:55Z

## Summary
- Files: 3
- Validators: 8
- Rules: 24
- Errors: 3
- Warnings: 3
- Passed: ✅

## Files
### `src/sequences/welcomeSequence.ts`
- **validateSequenceRequiredFields**: ✅ Passed
- **validateSequenceBeats**: ❌ Failed
  - 🔹 `beatOrderSequential` (error): Beat sequence order is broken at index 2 (expected 3).
  - 🔹 `missingEventTitle` (warning): Beat #5 is missing an event title.

### `src/sequences/marketingSequence.ts`
- **validateSequenceMusicalProperties**: ❌ Failed
  - 🔹 `invalidKey` (error): Invalid musical key 'L# minor'.
  - 🔹 `tempoOutOfRange` (error): Tempo 215 exceeds max of 200.

### `src/sequences/contactSequence.ts`
- **validateSequenceDocumentation**: ❌ Warning
  - 🔹 `missingDomainTerminology` (warning): Description lacks key domain terms like 'event bus' or 'conductor'.

