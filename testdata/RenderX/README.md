# 🎨 RenderX Evolution - Visual Shell

**Lightweight Visual Shell with CIA/SPA Architecture and TDA Enforcement**

RenderX Evolution is a modern visual component editor built with React, TypeScript, and Vite, following **Conductor Integration Architecture (CIA)** and **Symphonic Plugin Architecture (SPA)** patterns with **Test-Driven Architecture (TDA)** enforcement.

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Playwright (for E2E testing)

### **Installation**
```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run test:install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

---

## 🧪 **Testing**

### **E2E Tests with Playwright**
```bash
# Run all E2E tests
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Debug tests
npm run test:debug

# View test report
npm run test:report
```

### **TDA Validation**
```bash
# Run E2E validator (from project root)
node ../../scripts/test-e2e-validator.cjs

# Run comprehensive TDA validation
node ../../scripts/validate-tda-implementation.cjs
```

---

## 🏗️ **Architecture**

### **CIA (Conductor Integration Architecture)**
- **Musical Conductor**: Orchestrates component loading and interaction
- **Sequence Execution**: Components load via musical sequences
- **Runtime Safety**: Graceful error handling and plugin validation
- **Event-Driven**: EventBus coordinates component communication

### **SPA (Symphonic Plugin Architecture)**
- **Plugin System**: Components are dynamically loaded plugins
- **Musical Metaphors**: Sequences, movements, beats, and tempo
- **Modular Design**: Clean separation of concerns
- **Lifecycle Management**: Proper mount/unmount handling

### **TDA (Test-Driven Architecture)**
- **Validation-First**: E2E tests drive architectural decisions
- **Continuous Validation**: Automated architectural compliance checking
- **Quality Gates**: Tests must pass before deployment
- **Refactor Loop**: Iterative improvement based on validation feedback

---

## 🎯 **Core Features**

### **Visual Component Editor**
- **Component Library**: Drag-and-drop component palette
- **Canvas Workspace**: Visual design surface
- **Control Panel**: Component properties and settings
- **Real-time Preview**: Live component rendering

### **Component System**
- **JSON-Driven**: Components defined in JSON format
- **Dynamic Loading**: Components loaded at runtime
- **Type Safety**: Full TypeScript support
- **Extensible**: Easy to add new component types

### **Drag and Drop**
- **Intuitive Interface**: Drag components from library to canvas
- **Visual Feedback**: Drag states and drop zones
- **Component Positioning**: Precise placement control
- **Multi-Component**: Support for multiple component instances

---

## 📁 **Project Structure**

```
src/
├── App.tsx                 # Main application component
├── main.tsx               # Application entry point
├── communication/         # CIA event system
│   ├── EventBus.ts       # Event coordination
│   ├── sequences/        # Musical sequences
│   └── index.ts          # Communication exports
├── services/             # Core services
│   └── JsonComponentLoader.ts
├── types/                # TypeScript definitions
├── utils/                # Utility functions
└── styles/               # CSS and styling

test/                     # E2E tests
├── app.spec.ts          # Main test suite
├── global-setup.ts      # Test setup
├── global-teardown.ts   # Test cleanup
└── playwright.config.ts # Playwright configuration

public/
├── json-components/     # Component definitions
│   ├── button.json     # Button component
│   └── input.json      # Input component
└── plugins/            # SPA plugins
```

---

## 🎼 **Component Development**

### **Creating New Components**

1. **Define JSON Component**
```json
{
  "id": "my-component-001",
  "metadata": {
    "name": "My Component",
    "type": "MyComponent",
    "description": "Custom component description",
    "category": "custom"
  },
  "structure": {
    "type": "div",
    "props": { "className": "my-component" },
    "children": []
  },
  "spa": {
    "pluginType": "component",
    "sequence": {
      "id": "my-component-symphony",
      "movements": [
        { "name": "onMount", "beat": 1, "event": "COMPONENT_MOUNTED" }
      ]
    }
  }
}
```

2. **Add to Component Library**
Place the JSON file in `public/json-components/`

3. **Test Integration**
Components automatically appear in the library and are testable via E2E tests

---

## 🧪 **E2E Test Coverage**

### **Core Functionality**
- ✅ Application loading and initialization
- ✅ DOM element presence validation
- ✅ Component library interactions
- ✅ Drag and drop operations
- ✅ Canvas component rendering
- ✅ Control panel functionality

### **Architecture Validation**
- ✅ CIA conductor integration
- ✅ SPA plugin mounting
- ✅ Musical sequence execution
- ✅ Event system coordination
- ✅ Component lifecycle management

### **Error Scenarios**
- ✅ Invalid drag targets
- ✅ Component loading failures
- ✅ Network interruptions
- ✅ Malformed component data

---

## 🔧 **Configuration**

### **Vite Configuration**
- **Port**: 3000 (required for E2E tests)
- **Hot Reload**: Enabled for development
- **TypeScript**: Full support with type checking
- **React**: Fast refresh enabled

### **Playwright Configuration**
- **Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS and Android viewports
- **Parallel**: Tests run in parallel
- **Retries**: Automatic retry on CI failures

---

## 📊 **Validation Status**

### **TDA Compliance: ✅ PASS**
- E2E validator enforcement active
- All architectural constraints satisfied
- Continuous validation pipeline operational

### **Test Results: ✅ PASS**
- All Playwright tests passing
- DOM structure validated
- Drag and drop functionality confirmed
- Component rendering verified

---

## 🚀 **Development Workflow**

### **1. Start Development**
```bash
npm run dev
```

### **2. Run Tests During Development**
```bash
npm run test:headed
```

### **3. Validate Architecture**
```bash
node ../../scripts/validate-tda-implementation.cjs
```

### **4. Build for Production**
```bash
npm run build
```

---

## 🎯 **Next Steps**

### **Planned Features**
- [ ] Component property editor
- [ ] Layout templates
- [ ] Export functionality
- [ ] Component marketplace
- [ ] Advanced animations

### **Architecture Improvements**
- [ ] Additional SPA validators
- [ ] Enhanced CIA error handling
- [ ] Performance optimizations
- [ ] Mobile responsiveness

---

## 📚 **Documentation**

- **CIA Architecture**: `../../docs/wiki/Architectures/CIA-Conductor-Integration-Architecture.md`
- **SPA Architecture**: `../../docs/wiki/Architectures/SPA-Symphonic-Plugin-Architecture.md`
- **TDA Methodology**: `../../docs/wiki/Methodologies/Test-Driven-Architecture.md`
- **Implementation Summary**: `../../TDA-E2E-Implementation-Summary.md`

---

## 🤝 **Contributing**

1. Follow TDA principles - tests drive architecture
2. Ensure E2E validator passes
3. Maintain CIA/SPA compliance
4. Add comprehensive test coverage
5. Update documentation

---

## 📄 **License**

MIT License - see LICENSE file for details

---

**Built with ❤️ using Test-Driven Architecture (TDA) principles**
