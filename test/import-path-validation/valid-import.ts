/**
 * Valid Import Test File
 * This file contains only valid imports that should pass validation
 */

// Valid external imports - not from forbidden paths
import { Component } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Utils } from '../../utils/helpers';

// Valid relative imports within same directory
import { LocalHelper } from './helpers';
import { Constants } from './constants';

// Valid public API imports
import { PublicService } from 'src/services/public';
import { SharedTypes } from 'src/types/shared';

// Valid third-party imports
import axios from 'axios';
import lodash from 'lodash';

export class ValidImportExample {
  constructor() {
    console.log('Valid import example - no violations expected');
  }

  public render() {
    return <Button>Valid Component</Button>;
  }
}

export default ValidImportExample;
