/**
 * Control Panel Component
 * Properties panel for selected elements
 */

import React from 'react';

const ControlPanel: React.FC = () => (
  <div className="control-panel">
    <div className="control-panel-header">
      <h3>Properties</h3>
    </div>
    <div className="control-panel-content">
      <div className="property-section">
        <h4>Position</h4>
        <div className="property-group">
          <label>
            X: <input type="number" placeholder="0" disabled />
          </label>
          <label>
            Y: <input type="number" placeholder="0" disabled />
          </label>
        </div>
      </div>
      <div className="property-section">
        <h4>Size</h4>
        <div className="property-group">
          <label>
            Width: <input type="number" placeholder="100" disabled />
          </label>
          <label>
            Height: <input type="number" placeholder="50" disabled />
          </label>
        </div>
      </div>
      <div className="property-section">
        <h4>Style</h4>
        <div className="property-group">
          <label>
            Background: <input type="color" disabled />
          </label>
          <label>
            Border: <input type="text" placeholder="1px solid #ccc" disabled />
          </label>
        </div>
      </div>
    </div>
  </div>
);

export default ControlPanel;
