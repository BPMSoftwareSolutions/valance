/**
 * Symphony Business Logic File - Tests CSS Generation import patterns
 * This file should trigger specific import path violations based on C# rules
 */

// VIOLATION: CSS generation import with wrong path depth
import { ButtonUtils } from '../../../components/elements/button/button.utils.js';

// VIOLATION: Another CSS generation import with wrong path depth
import { CanvasUtils } from '../../../../components/elements/canvas/canvas.utils.js';

// Valid internal imports (should pass)
import { BusinessHelpers } from './business-helpers.js';

export class SymphonyBusinessLogic {
  constructor() {
    console.log('Symphony business logic with import violations');
  }

  generateStyles() {
    // CSS generation imports should be from ../../../../../components/elements/{component}/{component}.utils.ts
    const buttonStyles = ButtonUtils.generateButtonStyles();
    const canvasStyles = CanvasUtils.generateCanvasStyles();
    
    return {
      button: buttonStyles,
      canvas: canvasStyles
    };
  }

  processBusinessRules() {
    console.log('Processing business rules');
  }
}

export default SymphonyBusinessLogic;
