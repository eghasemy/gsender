/*
 * Copyright (C) 2021 Sienci Labs Inc.
 *
 * This file is part of gSender.
 *
 * gSender is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, under version 3 of the License.
 *
 * gSender is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with gSender.  If not, see <https://www.gnu.org/licenses/>.
 *
 * Contact for information regarding this program and its license
 * can be sent through gSender@sienci.com or mailed to the main office
 * of Sienci Labs Inc. in Waterloo, Ontario, Canada.
 *
 */

import React, { useState, useEffect } from 'react';
import { Button } from 'app/components/ui/button';
import { Input } from 'app/components/ui/input';
import { Label } from 'app/components/ui/label';
import { Checkbox } from 'app/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from 'app/components/ui/card';
import controller from 'app/lib/controller';
import { GRBL_ACTIVE_STATE_IDLE, WORKFLOW_STATE_RUNNING } from 'app/constants';
import { useTypedSelector } from 'app/hooks/useTypedSelector';
import { HeightMapSettings } from './definitions';

interface HeightMapPoint {
    x: number;
    y: number;
    z: number;
}

const HeightMap: React.FC = () => {
    const {
        isConnected,
        workflow,
        activeState,
    } = useTypedSelector((state) => ({
        isConnected: state.connection.isConnected,
        workflow: state.controller.workflow,
        activeState: state.controller.state.status?.activeState,
    }));

    const [settings, setSettings] = useState<HeightMapSettings>({
        minX: 0,
        minY: 0,
        width: 100,
        height: 100,
        gridSizeX: 10,
        gridSizeY: 10,
        gridSizeLockXY: true,
        addPause: false,
        setToolOffset: false,
    });

    const [heightMapData, setHeightMapData] = useState<HeightMapPoint[]>([]);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [currentPoint, setCurrentPoint] = useState<number>(0);

    const canStart = (): boolean => {
        if (!isConnected) {
            return false;
        }
        if (workflow.state === WORKFLOW_STATE_RUNNING) {
            return false;
        }
        return activeState === GRBL_ACTIVE_STATE_IDLE;
    };

    const getTotalPoints = (): number => {
        const pointsX = Math.ceil(settings.width / settings.gridSizeX) + 1;
        const pointsY = Math.ceil(settings.height / settings.gridSizeY) + 1;
        return pointsX * pointsY;
    };

    const generateProbePoints = (): HeightMapPoint[] => {
        const points: HeightMapPoint[] = [];
        const pointsX = Math.ceil(settings.width / settings.gridSizeX) + 1;
        const pointsY = Math.ceil(settings.height / settings.gridSizeY) + 1;

        for (let y = 0; y < pointsY; y++) {
            for (let x = 0; x < pointsX; x++) {
                const pointX = settings.minX + (x * settings.gridSizeX);
                const pointY = settings.minY + (y * settings.gridSizeY);
                points.push({
                    x: pointX,
                    y: pointY,
                    z: 0, // Will be filled during probing
                });
            }
        }

        return points;
    };

    const generateProbeCode = (): string[] => {
        const points = generateProbePoints();
        const code: string[] = [
            '; Height Map Generation',
            `; Area: X${settings.minX} Y${settings.minY} W${settings.width} H${settings.height}`,
            `; Grid: ${settings.gridSizeX} x ${settings.gridSizeY}`,
            `; Total points: ${points.length}`,
            'G21 G90', // Set metric and absolute mode
        ];

        if (settings.addPause) {
            code.push('M0 (Pause before probing - press continue when ready)');
        }

        // Move to start position
        code.push(`G0 X${settings.minX} Y${settings.minY}`);

        // Probe each point
        points.forEach((point, index) => {
            code.push(
                `; Point ${index + 1} of ${points.length}: X${point.x} Y${point.y}`,
                `G0 X${point.x} Y${point.y}`,
                'G38.2 Z-50 F200', // Fast probe down
                'G0 Z2', // Retract slightly
                'G38.2 Z-5 F50', // Slow probe for accuracy
                '%PROBE_Z=posz', // Store probe result
                'G0 Z5' // Retract to safe height
            );
        });

        if (settings.setToolOffset) {
            code.push(
                '; Set tool offset at origin',
                'G0 X0 Y0',
                'G38.2 Z-50 F200',
                'G0 Z2',
                'G38.2 Z-5 F50',
                'G10 L20 P0 Z0',
                'G0 Z5'
            );
        }

        code.push('G0 X0 Y0'); // Return to origin
        return code;
    };

    const handleStart = () => {
        if (!canStart()) {
            return;
        }

        setIsRunning(true);
        setCurrentPoint(0);
        setHeightMapData([]);
        
        const code = generateProbeCode();
        controller.command('gcode:safe', code, 'G21');
    };

    const handleStop = () => {
        controller.command('gcode:stop');
        setIsRunning(false);
        setIsPaused(false);
    };

    const handleProbe = () => {
        // Continue probing next point
        controller.command('gcode:run');
        setIsPaused(false);
    };

    const handleGridSizeChange = (axis: 'x' | 'y', value: number) => {
        if (settings.gridSizeLockXY) {
            setSettings({
                ...settings,
                gridSizeX: value,
                gridSizeY: value,
            });
        } else {
            setSettings({
                ...settings,
                [axis === 'x' ? 'gridSizeX' : 'gridSizeY']: value,
            });
        }
    };

    const loadHeightMap = () => {
        // TODO: Implement file loading
        console.log('Load height map from file');
    };

    const saveHeightMap = () => {
        // TODO: Implement file saving
        console.log('Save height map to file');
    };

    const applyHeightMap = () => {
        // TODO: Implement height map application to loaded G-code
        console.log('Apply height map to G-code');
    };

    const setFromProgramLimits = () => {
        // TODO: Get program limits from loaded file
        console.log('Set area from program limits');
    };

    const HeightMapVisualization = () => (
        <div className="border border-gray-300 bg-gray-50 p-4 h-80 flex items-center justify-center">
            <div className="text-gray-500">
                Height map visualization would go here
                <br />
                Points: {getTotalPoints()}
                <br />
                Current: {currentPoint}
            </div>
        </div>
    );

    return (
        <div className="flex gap-4">
            <div className="w-80 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Area to probe</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="minX">X:</Label>
                                <Input
                                    id="minX"
                                    type="number"
                                    value={settings.minX}
                                    onChange={(e) => setSettings({ 
                                        ...settings, 
                                        minX: parseFloat(e.target.value) || 0 
                                    })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="width">W:</Label>
                                <Input
                                    id="width"
                                    type="number"
                                    value={settings.width}
                                    onChange={(e) => setSettings({ 
                                        ...settings, 
                                        width: parseFloat(e.target.value) || 0 
                                    })}
                                />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="minY">Y:</Label>
                                <Input
                                    id="minY"
                                    type="number"
                                    value={settings.minY}
                                    onChange={(e) => setSettings({ 
                                        ...settings, 
                                        minY: parseFloat(e.target.value) || 0 
                                    })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="height">H:</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={settings.height}
                                    onChange={(e) => setSettings({ 
                                        ...settings, 
                                        height: parseFloat(e.target.value) || 0 
                                    })}
                                />
                            </div>
                        </div>

                        <Button onClick={setFromProgramLimits} className="w-full">
                            Set from program limits
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Grid size</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="gridX">X:</Label>
                            <Input
                                id="gridX"
                                type="number"
                                value={settings.gridSizeX}
                                onChange={(e) => handleGridSizeChange('x', parseFloat(e.target.value) || 1)}
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="gridY">Y:</Label>
                            <Input
                                id="gridY"
                                type="number"
                                value={settings.gridSizeY}
                                onChange={(e) => handleGridSizeChange('y', parseFloat(e.target.value) || 1)}
                                disabled={settings.gridSizeLockXY}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="lockGrid"
                                checked={settings.gridSizeLockXY}
                                onCheckedChange={(checked) => setSettings({ 
                                    ...settings, 
                                    gridSizeLockXY: checked as boolean 
                                })}
                            />
                            <Label htmlFor="lockGrid">Lock</Label>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="pause"
                            checked={settings.addPause}
                            onCheckedChange={(checked) => setSettings({ 
                                ...settings, 
                                addPause: checked as boolean 
                            })}
                        />
                        <Label htmlFor="pause">Pause before probing</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="setZ0"
                            checked={settings.setToolOffset}
                            onCheckedChange={(checked) => setSettings({ 
                                ...settings, 
                                setToolOffset: checked as boolean 
                            })}
                        />
                        <Label htmlFor="setZ0">Set Z = 0 at X0Y0</Label>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-4">
                <HeightMapVisualization />
                
                <div className="flex gap-2">
                    <Button onClick={handleStart} disabled={!canStart() || isRunning}>
                        Start
                    </Button>
                    <Button 
                        onClick={handleProbe} 
                        disabled={!isPaused}
                    >
                        Probe
                    </Button>
                    <Button 
                        onClick={handleStop} 
                        disabled={!isRunning}
                        variant="destructive"
                    >
                        Stop
                    </Button>
                    <Button onClick={loadHeightMap} disabled={isRunning}>
                        Load
                    </Button>
                    <Button onClick={saveHeightMap} disabled={isRunning}>
                        Save
                    </Button>
                    <Button 
                        onClick={applyHeightMap} 
                        disabled={heightMapData.length === 0}
                    >
                        Apply
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HeightMap;