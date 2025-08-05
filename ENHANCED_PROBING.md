# gSender Enhanced Probing Features - IoSender Feature Parity

This implementation adds comprehensive probing functionality to gSender, achieving feature parity with IoSender's probing capabilities.

## 🎯 Features Implemented

### ✅ Edge Finder (External)
- **Purpose**: Probe workpiece edges and corners from the outside
- **UI**: Visual 3x3 grid selector for edges/corners (A, B, C, D, AB, BC, CD, AD, Z)
- **Features**: 
  - Workpiece height settings
  - Edge offset configuration
  - Optional Z probing
  - Live preview of G-code

### ✅ Edge Finder (Internal)  
- **Purpose**: Probe holes, pockets, and internal features
- **UI**: Same interface as external but with inverted probing logic
- **Features**: Probes outward from inside the feature

### ✅ Center Finder
- **Purpose**: Find center of circular or rectangular workpieces
- **Modes**: Inside (probe outward) and Outside (probe inward)
- **Features**:
  - Multiple passes for accuracy
  - Workpiece dimension inputs with lock option
  - Preview functionality

### ✅ Height Map
- **Purpose**: Create height maps for workpiece leveling
- **Features**:
  - Configurable probe area and grid size
  - Height map visualization placeholder
  - Save/load functionality hooks
  - Apply compensation to G-code
  - Set from program limits option

### ✅ Rotation Detection
- **Purpose**: Detect and compensate for workpiece rotation
- **Features**:
  - 2-point or 3-point detection modes
  - Manual angle input option
  - Automatic coordinate system rotation (G68)
  - Clear rotation function (G69)

### ✅ Tool Length Offset
- **Purpose**: Automated tool length measurement
- **Features**:
  - Reference height configuration
  - Tool number selection
  - Automatic offset calculation and application
  - Manual offset setting option

## 🏗️ Architecture

### Component Structure
```
src/app/src/features/Probe/
├── EnhancedProbe.tsx      # Main tabbed interface
├── EdgeFinder.tsx         # Edge finding (external/internal)
├── CenterFinder.tsx       # Center finding
├── HeightMap.tsx         # Height mapping
├── Rotation.tsx          # Rotation detection
├── ToolLengthOffset.tsx  # Tool length measurement
├── definitions.ts        # Extended type definitions
└── README.md            # Documentation
```

### Code Generation
Extended `Probing.ts` with new functions:
- `getEdgeFinderCode()` - Edge finder G-code generation
- `getCenterFinderCode()` - Center finder G-code generation  
- `getHeightMapCode()` - Height map G-code generation

### Integration
- **UI**: Uses gSender's existing shadcn component library
- **State**: Integrates with existing probe state management
- **Controller**: Uses existing controller interface for G-code execution
- **Safety**: Maintains existing probe connectivity validation

## 🎨 User Interface

### Tabbed Interface
The enhanced probe system uses a clean tabbed interface with:
- **Basic**: Original gSender probing functionality
- **Edge (Ext)**: External edge finding
- **Edge (Int)**: Internal edge finding  
- **Center**: Center finding
- **Height Map**: Height mapping
- **Rotation**: Rotation detection
- **Tool Length**: Tool length measurement

### Visual Elements
- **Edge Selector**: 3x3 grid for intuitive edge/corner selection
- **Mode Toggles**: Clear buttons for inside/outside, external/internal modes
- **Preview**: Real-time G-code preview for all probing operations
- **Progress**: Status indicators and progress feedback

### Safety Features
- **Warning Messages**: Prominent safety warnings
- **Connectivity**: Probe connectivity validation
- **State Checks**: Machine state validation before operations
- **Emergency Stop**: Integration with existing stop functionality

## 🔧 Technical Details

### Type Safety
- **TypeScript**: Full type definitions for all new interfaces
- **Enums**: Type-safe mode selections and probe positions
- **Validation**: Input validation and error handling

### G-code Generation
- **Modular**: Separate generation functions for each probe type
- **Configurable**: Adjustable feed rates, distances, and safety margins
- **Variable Support**: Uses G-code variables for calculations
- **Comment Rich**: Well-documented generated code

### Performance
- **Lazy Loading**: Components loaded only when needed
- **State Management**: Efficient local state for UI responsiveness
- **Memory**: Minimal memory footprint for probe data

## 🚀 Usage Examples

### Edge Finding
```typescript
// External edge finding
const code = getEdgeFinderCode('external', 'A', 20, true);
// Generates G-code to probe bottom-left corner with Z

// Internal edge finding  
const code = getEdgeFinderCode('internal', 'C', 15, false);
// Generates G-code to probe top-right corner without Z
```

### Center Finding
```typescript
const code = getCenterFinderCode('inside', 50, 50, 2);
// Generates G-code for inside center finding with 2 passes
```

### Height Mapping
```typescript
const code = getHeightMapCode(0, 0, 100, 100, 10, 10, true);
// Generates height map with pause for 100x100mm area
```

## 🧪 Testing

### Unit Tests
- **Function Tests**: G-code generation validation
- **Type Tests**: TypeScript interface validation
- **Integration Tests**: Component interaction testing

### Test Coverage
- ✅ Edge finder code generation
- ✅ Center finder code generation
- ✅ Height map code generation
- ✅ Type definition validation

## 📋 TODO / Future Enhancements

### Short Term
- [ ] Complete height map 3D visualization
- [ ] Add probe result validation
- [ ] Implement file save/load for height maps
- [ ] Add more edge finder patterns

### Long Term
- [ ] CAM workflow integration
- [ ] Probe wear compensation
- [ ] Advanced surface mapping algorithms
- [ ] Multi-tool automatic measurement

## 🎖️ Feature Parity Status

| IoSender Feature | gSender Status | Notes |
|------------------|----------------|-------|
| Edge Finder (External) | ✅ Complete | Full visual selector, preview |
| Edge Finder (Internal) | ✅ Complete | Same interface, inverted logic |
| Center Finder | ✅ Complete | Inside/outside modes, multi-pass |
| Height Map | ✅ Core Complete | Visualization placeholder, save/load hooks |
| Rotation | ✅ Complete | 2/3-point detection, auto compensation |
| Tool Length Offset | ✅ Complete | Auto measurement, manual override |

## 🔍 Code Quality

- **ESLint**: Passes all linting rules
- **TypeScript**: Full type safety
- **Comments**: Comprehensive documentation
- **Consistency**: Follows gSender patterns
- **Safety**: Maintains all safety checks

This implementation successfully brings IoSender's advanced probing capabilities to gSender while maintaining the familiar gSender user experience and safety standards.