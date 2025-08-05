# Enhanced Probing Features

This document describes the expanded probing functionality added to gSender to achieve feature parity with IoSender.

## Overview

The enhanced probing system adds several new probing modes beyond the basic touchplate functionality:

1. **Edge Finder (External)** - Probe workpiece edges and corners from the outside
2. **Edge Finder (Internal)** - Probe workpiece edges and corners from the inside (for holes/pockets)
3. **Center Finder** - Find the center of circular or rectangular workpieces
4. **Height Map** - Create height maps for workpiece leveling compensation
5. **Rotation Detection** - Detect workpiece rotation and apply coordinate system compensation
6. **Tool Length Offset** - Measure tool length automatically using a tool length sensor

## Features

### Edge Finder (External)

Probe workpiece edges and corners from the outside. This is useful for setting work coordinates when you can approach the workpiece from the outside.

**Features:**
- Probe any edge (A, B, C, D) or corner (AB, BC, CD, AD)
- Z-axis probing option
- Visual edge/corner selector
- Preview functionality
- Workpiece height and edge offset settings

**Usage:**
1. Position the probe above the workpiece edge/corner you want to probe
2. Select the appropriate edge/corner from the visual selector
3. Configure workpiece settings if needed
4. Enable Z probing if required
5. Click Start to begin probing

### Edge Finder (Internal)

Probe workpiece edges and corners from the inside. This is useful for probing holes, pockets, or internal features.

**Features:**
- Same interface as external edge finder
- Probes outward from inside the feature
- Suitable for holes, pockets, and internal features

**Usage:**
1. Position the probe inside the feature you want to probe
2. Select the appropriate edge/corner
3. Configure settings and start probing

### Center Finder

Find the center of circular or rectangular workpieces with high precision.

**Features:**
- Inside and outside probing modes
- Multiple passes for increased accuracy
- Workpiece dimension inputs with lock option
- Preview functionality

**Usage:**
1. Position the probe above the approximate center
2. Set workpiece dimensions
3. Choose inside or outside mode
4. Set number of passes for accuracy
5. Start probing to find the exact center

### Height Map

Create height maps for workpiece leveling compensation.

**Features:**
- Configurable probe area and grid size
- Grid visualization
- Height map save/load functionality
- Apply compensation to G-code
- Pause option before probing

**Usage:**
1. Define the area to probe
2. Set grid size for resolution
3. Optionally set from program limits
4. Start probing to create height map
5. Save and apply to compensate for workpiece irregularities

### Rotation Detection

Detect workpiece rotation and apply coordinate system compensation.

**Features:**
- 2-point or 3-point detection modes
- Manual angle input option
- Automatic rotation compensation
- Clear rotation function

**Usage:**
1. Position probe above a straight edge
2. Choose 2 or 3 point detection
3. Start detection to measure angle
4. Rotation compensation is applied automatically

### Tool Length Offset

Measure tool length automatically using a tool length sensor.

**Features:**
- Automatic tool length measurement
- Reference height setting
- Manual and automatic offset application
- Clear offset functionality

**Usage:**
1. Install the tool to measure
2. Move to above the tool length sensor
3. Set reference height
4. Start measurement
5. Tool length offset is applied automatically

## Technical Implementation

### Components

- `EdgeFinder.tsx` - External and internal edge finding
- `CenterFinder.tsx` - Center finding for circular/rectangular features
- `HeightMap.tsx` - Height map generation and application
- `Rotation.tsx` - Rotation detection and compensation
- `ToolLengthOffset.tsx` - Tool length measurement
- `EnhancedProbe.tsx` - Main tabbed interface containing all probing modes

### Code Generation

Advanced probing G-code generation functions have been added to `Probing.ts`:

- `getEdgeFinderCode()` - Generate edge finder probe sequences
- `getCenterFinderCode()` - Generate center finder probe sequences  
- `getHeightMapCode()` - Generate height map probe sequences

### Integration

The enhanced probing is integrated into the existing probe system through:

- Extended type definitions in `definitions.ts`
- New probe mode interfaces and settings
- Integration with existing probe infrastructure
- Consistent UI patterns with gSender design

## Safety Considerations

**Warning: Use with care - incorrect parameters may damage your probe!**

- Always verify probe connectivity before starting
- Ensure adequate clearance for probe movements
- Start with conservative settings and adjust as needed
- Test with non-critical workpieces first
- Keep emergency stop within reach

## Future Enhancements

- 3D visualization for height maps
- Additional probe patterns
- Probe result validation
- Integration with CAM workflows
- Probe wear compensation