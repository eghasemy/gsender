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
import { Textarea } from 'app/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from 'app/components/ui/card';
import controller from 'app/lib/controller';
import { GRBL_ACTIVE_STATE_IDLE, WORKFLOW_STATE_RUNNING } from 'app/constants';
import { useTypedSelector } from 'app/hooks/useTypedSelector';
import { EdgeFinderSettings, EDGE_FINDER_MODE, PROBE_EDGE_POSITION } from './definitions';

interface EdgeFinderProps {
    mode: EDGE_FINDER_MODE;
}

const EdgeFinder: React.FC<EdgeFinderProps> = ({ mode }) => {
    const {
        isConnected,
        workflow,
        activeState,
    } = useTypedSelector((state) => ({
        isConnected: state.connection.isConnected,
        workflow: state.controller.workflow,
        activeState: state.controller.state.status?.activeState,
    }));

    const [settings, setSettings] = useState<EdgeFinderSettings>({
        mode,
        probeEdge: 'A',
        workpieceHeight: 20,
        workpieceXYEdgeOffset: 0,
        probeZ: false,
        previewEnable: false,
    });

    const [previewCode, setPreviewCode] = useState<string>('');
    const [isRunning, setIsRunning] = useState<boolean>(false);

    const canStart = (): boolean => {
        if (!isConnected) {
            return false;
        }
        if (workflow.state === WORKFLOW_STATE_RUNNING) {
            return false;
        }
        return activeState === GRBL_ACTIVE_STATE_IDLE;
    };

    const generateProbeCode = (): string[] => {
        const { probeEdge, workpieceHeight, workpieceXYEdgeOffset, probeZ } = settings;
        
        // This is a simplified probe code generation - would need to implement full logic
        const code: string[] = [
            '; Edge Finder - ' + mode,
            `; Probe edge: ${probeEdge}`,
            'G21 G91', // Set metric and relative mode
        ];

        // Add edge-specific probing logic based on selected edge/corner
        switch (probeEdge) {
            case 'A': // Bottom-left corner
                code.push(
                    'G38.2 X-50 F200', // Probe X negative
                    'G0 X2',
                    'G38.2 X-5 F50',
                    'G10 L20 P0 X0',
                    'G0 X10 Y10',
                    'G38.2 Y-50 F200', // Probe Y negative  
                    'G0 Y2',
                    'G38.2 Y-5 F50',
                    'G10 L20 P0 Y0'
                );
                break;
            case 'B': // Bottom-right corner
                code.push(
                    'G38.2 X50 F200', // Probe X positive
                    'G0 X-2',
                    'G38.2 X5 F50',
                    'G10 L20 P0 X0',
                    'G0 X-10 Y10',
                    'G38.2 Y-50 F200', // Probe Y negative
                    'G0 Y2',
                    'G38.2 Y-5 F50',
                    'G10 L20 P0 Y0'
                );
                break;
            case 'C': // Top-right corner
                code.push(
                    'G38.2 X50 F200', // Probe X positive
                    'G0 X-2',
                    'G38.2 X5 F50',
                    'G10 L20 P0 X0',
                    'G0 X-10 Y-10',
                    'G38.2 Y50 F200', // Probe Y positive
                    'G0 Y-2',
                    'G38.2 Y5 F50',
                    'G10 L20 P0 Y0'
                );
                break;
            case 'D': // Top-left corner
                code.push(
                    'G38.2 X-50 F200', // Probe X negative
                    'G0 X2',
                    'G38.2 X-5 F50',
                    'G10 L20 P0 X0',
                    'G0 X10 Y-10',
                    'G38.2 Y50 F200', // Probe Y positive
                    'G0 Y-2',
                    'G38.2 Y5 F50',
                    'G10 L20 P0 Y0'
                );
                break;
            case 'AB': // Bottom edge
                code.push(
                    'G38.2 Y-50 F200',
                    'G0 Y2',
                    'G38.2 Y-5 F50',
                    'G10 L20 P0 Y0'
                );
                break;
            case 'BC': // Right edge
                code.push(
                    'G38.2 X50 F200',
                    'G0 X-2',
                    'G38.2 X5 F50',
                    'G10 L20 P0 X0'
                );
                break;
            case 'CD': // Top edge
                code.push(
                    'G38.2 Y50 F200',
                    'G0 Y-2',
                    'G38.2 Y5 F50',
                    'G10 L20 P0 Y0'
                );
                break;
            case 'AD': // Left edge
                code.push(
                    'G38.2 X-50 F200',
                    'G0 X2',
                    'G38.2 X-5 F50',
                    'G10 L20 P0 X0'
                );
                break;
            case 'Z': // Z only
                code.push(
                    'G38.2 Z-50 F200',
                    'G0 Z2',
                    'G38.2 Z-5 F50',
                    'G10 L20 P0 Z0'
                );
                break;
        }

        if (probeZ && probeEdge !== 'Z') {
            code.push(
                '; Z probe',
                'G38.2 Z-50 F200',
                'G0 Z2',
                'G38.2 Z-5 F50',
                'G10 L20 P0 Z0'
            );
        }

        code.push('G90 G0 X0 Y0'); // Return to origin
        return code;
    };

    const updatePreview = () => {
        if (settings.previewEnable) {
            const code = generateProbeCode();
            setPreviewCode(code.join('\n'));
        } else {
            setPreviewCode('');
        }
    };

    useEffect(() => {
        updatePreview();
    }, [settings]);

    const handleStart = () => {
        if (!canStart()) {
            return;
        }

        setIsRunning(true);
        const code = generateProbeCode();
        controller.command('gcode:safe', code, 'G21');
    };

    const handleStop = () => {
        controller.command('gcode:stop');
        setIsRunning(false);
    };

    const EdgeSelector = () => (
        <div className="grid grid-cols-3 gap-2 w-48 h-48">
            {[
                { pos: 'D', row: 0, col: 0 },
                { pos: 'CD', row: 0, col: 1 },
                { pos: 'C', row: 0, col: 2 },
                { pos: 'AD', row: 1, col: 0 },
                { pos: 'Z', row: 1, col: 1 },
                { pos: 'BC', row: 1, col: 2 },
                { pos: 'A', row: 2, col: 0 },
                { pos: 'AB', row: 2, col: 1 },
                { pos: 'B', row: 2, col: 2 },
            ].map(({ pos, row, col }) => (
                <Button
                    key={pos}
                    variant={settings.probeEdge === pos ? "default" : "outline"}
                    className="h-16 w-16"
                    onClick={() => setSettings({ ...settings, probeEdge: pos as PROBE_EDGE_POSITION })}
                >
                    {pos}
                </Button>
            ))}
        </div>
    );

    return (
        <div className="flex gap-4">
            <div className="flex-1 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Workpiece Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="workpieceHeight">Height:</Label>
                            <Input
                                id="workpieceHeight"
                                type="number"
                                value={settings.workpieceHeight}
                                onChange={(e) => setSettings({ 
                                    ...settings, 
                                    workpieceHeight: parseFloat(e.target.value) || 0 
                                })}
                                disabled={!settings.probeZ}
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="edgeOffset">Edge offset:</Label>
                            <Input
                                id="edgeOffset"
                                type="number"
                                value={settings.workpieceXYEdgeOffset}
                                onChange={(e) => setSettings({ 
                                    ...settings, 
                                    workpieceXYEdgeOffset: parseFloat(e.target.value) || 0 
                                })}
                                disabled={!settings.probeZ}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="probeZ"
                            checked={settings.probeZ}
                            onCheckedChange={(checked) => setSettings({ 
                                ...settings, 
                                probeZ: checked as boolean 
                            })}
                        />
                        <Label htmlFor="probeZ">Probe Z</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="preview"
                            checked={settings.previewEnable}
                            onCheckedChange={(checked) => setSettings({ 
                                ...settings, 
                                previewEnable: checked as boolean 
                            })}
                        />
                        <Label htmlFor="preview">Preview</Label>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Edge/Corner Selection</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EdgeSelector />
                    </CardContent>
                </Card>

                <div className="flex gap-2">
                    <Button onClick={handleStart} disabled={!canStart() || isRunning}>
                        Start
                    </Button>
                    <Button 
                        onClick={handleStop} 
                        disabled={!isRunning}
                        variant="destructive"
                    >
                        Stop
                    </Button>
                </div>
            </div>

            {settings.previewEnable && (
                <Card className="w-80">
                    <CardHeader>
                        <CardTitle>Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={previewCode}
                            readOnly
                            className="h-96 font-mono text-xs"
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default EdgeFinder;