import fs from 'fs/promises';
import path from 'path';

export async function loadProfile(profileName) {
  const profilePath = path.join('profiles', `${profileName}.json`);
  try {
    const content = await fs.readFile(profilePath, 'utf-8');
    const profile = JSON.parse(content);
    
    // Load all validators referenced in the profile
    const validators = [];
    for (const validatorName of profile.validators) {
      const validator = await loadValidator(validatorName);
      validators.push(validator);
    }
    
    return {
      ...profile,
      validators
    };
  } catch (error) {
    throw new Error(`Failed to load profile ${profileName}: ${error.message}`);
  }
}

export async function loadValidator(validatorName) {
  const validatorPath = path.join('validators', `${validatorName}.json`);
  try {
    const content = await fs.readFile(validatorPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load validator ${validatorName}: ${error.message}`);
  }
}

export async function loadValidators(validatorNames) {
  const validators = [];
  for (const name of validatorNames) {
    const validator = await loadValidator(name);
    validators.push(validator);
  }
  return validators;
}