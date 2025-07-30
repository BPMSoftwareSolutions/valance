/**
 * Invalid Import Test File
 * This file contains forbidden imports that should trigger violations
 */

// VIOLATION: Forbidden import from internal directory
import { InternalService } from 'src/internal/services/InternalService';

// VIOLATION: Forbidden import from infra directory
import { DatabaseConnection } from 'src/infra/database/connection';

// VIOLATION: Forbidden import from private utils
import { PrivateHelper } from 'src/utils/private/helpers';

// VIOLATION: Direct internal path import
import { SecretConfig } from 'internal/config/secrets';

// VIOLATION: Private module import
import { PrivateAPI } from 'private/api/endpoints';

// Valid imports (should not trigger violations)
import { Component } from 'react';
import { PublicService } from 'src/services/public';
import { SharedUtils } from '../shared/utils';

export class InvalidImportExample {
  private internalService: any;
  private dbConnection: any;
  private privateHelper: any;

  constructor() {
    // These imports above should trigger validation violations
    this.internalService = new InternalService();
    this.dbConnection = new DatabaseConnection();
    this.privateHelper = new PrivateHelper();
    
    console.log('Invalid import example - should have violations');
  }

  public render() {
    return <div>Component with forbidden imports</div>;
  }
}

export default InvalidImportExample;
