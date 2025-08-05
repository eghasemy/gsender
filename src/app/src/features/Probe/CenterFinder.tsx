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
import { Button } from 'app/components/shadcn/Button';
import { Input } from 'app/components/shadcn/Input';
import { Label } from 'app/components/shadcn/Label';
import { Checkbox } from 'app/components/shadcn/Checkbox';
import { Textarea } from 'app/components/shadcn/TextArea';
import { Card, CardContent, CardHeader, CardTitle } from 'app/components/shadcn/Card';
import controller from 'app/lib/controller';
import { GRBL_ACTIVE_STATE_IDLE, WORKFLOW_STATE_RUNNING } from 'app/constants';
import { useTypedSelector } from 'app/hooks/useTypedSelector';
import { CenterFinderSettings, CENTER_FINDER_MODE } from './definitions';

const CenterFinder: React.FC = () => {
    const {
        isConnected,
        workflow,
        activeState,
    } = useTypedSelector((state) => ({
        isConnected: state.connection.isConnected,
        workflow: state.controller.workflow,
        activeState: state.controller.state.status?.activeState,
    }));

    const [settings, setSettings] = useState<CenterFinderSettings>({
        mode: 'inside',
        workpieceSizeX: 50,
        workpieceSizeY: 50,
        workpiecLockXY: true,
        passes: 2,
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
        const { mode, workpieceSizeX, workpieceSizeY, passes } = settings;
        
        const code: string[] = [
            '; Center Finder - ' + mode,
            `; Workpiece size: X${workpieceSizeX} Y${workpieceSizeY}`,
            `; Passes: ${passes}`,
            'G21 G91', // Set metric and relative mode
        ];

        const probeDistance = mode === 'inside' ? 
            Math.max(workpieceSizeX, workpieceSizeY) / 2 + 10 : 
            Math.max(workpieceSizeX, workpieceSizeY) + 20;

        for (let pass = 1; pass <= passes; pass++) {
            code.push(`; Pass ${pass} of ${passes}`);
            
            if (mode === 'inside') {
                // Inside probing - probe outward from center
                code.push(
                    // Probe X positive
                    `G38.2 X${probeDistance} F200`,
                    'G0 X-2',
                    'G38.2 X5 F50',
                    'G4 P0.1',
                    '%X_RIGHT=posx',
                    `G0 X-${probeDistance + 5}`,
                    
                    // Probe X negative  
                    `G38.2 X-${probeDistance} F200`,
                    'G0 X2',
                    'G38.2 X-5 F50',
                    'G4 P0.1',
                    '%X_LEFT=posx',
                    
                    // Calculate and move to X center
                    '%X_CENTER=(X_RIGHT + X_LEFT)/2',
                    'G90 G0 X[X_CENTER]',
                    'G91',
                    
                    // Probe Y positive
                    `G38.2 Y${probeDistance} F200`,
                    'G0 Y-2',
                    'G38.2 Y5 F50',
                    'G4 P0.1',
                    '%Y_TOP=posy',
                    `G0 Y-${probeDistance + 5}`,
                    
                    // Probe Y negative
                    `G38.2 Y-${probeDistance} F200`,
                    'G0 Y2',
                    'G38.2 Y-5 F50',
                    'G4 P0.1',
                    '%Y_BOTTOM=posy',
                    
                    // Calculate and move to Y center
                    '%Y_CENTER=(Y_TOP + Y_BOTTOM)/2',
                    'G90 G0 Y[Y_CENTER]',
                    'G91'
                );
            } else {
                // Outside probing - probe inward toward center
                code.push(
                    // Move to start position and probe inward
                    `G0 X${probeDistance}`,
                    `G38.2 X-${probeDistance} F200`,
                    'G0 X2',
                    'G38.2 X-5 F50',
                    'G4 P0.1',
                    '%X_RIGHT=posx',
                    `G0 X${probeDistance + 5}`,
                    `G0 X-${probeDistance * 2}`,
                    
                    `G38.2 X${probeDistance} F200`,
                    'G0 X-2',
                    'G38.2 X5 F50',
                    'G4 P0.1',
                    '%X_LEFT=posx',
                    
                    // Calculate and move to X center
                    '%X_CENTER=(X_RIGHT + X_LEFT)/2',
                    'G90 G0 X[X_CENTER]',
                    'G91',
                    
                    // Y probing
                    `G0 Y${probeDistance}`,
                    `G38.2 Y-${probeDistance} F200`,
                    'G0 Y2',
                    'G38.2 Y-5 F50',
                    'G4 P0.1',
                    '%Y_TOP=posy',
                    `G0 Y${probeDistance + 5}`,
                    `G0 Y-${probeDistance * 2}`,
                    
                    `G38.2 Y${probeDistance} F200`,
                    'G0 Y-2',
                    'G38.2 Y5 F50',
                    'G4 P0.1',
                    '%Y_BOTTOM=posy',
                    
                    // Calculate and move to Y center
                    '%Y_CENTER=(Y_TOP + Y_BOTTOM)/2',
                    'G90 G0 Y[Y_CENTER]',
                    'G91'
                );
            }
        }

        code.push(
            '; Set center as origin',
            'G10 L20 P0 X0 Y0',
            'G90 G0 X0 Y0'
        );

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

    const handleSizeChange = (axis: 'x' | 'y', value: number) => {
        if (settings.workpiecLockXY) {
            setSettings({
                ...settings,
                workpieceSizeX: value,
                workpieceSizeY: value,
            });
        } else {
            setSettings({
                ...settings,
                [axis === 'x' ? 'workpieceSizeX' : 'workpieceSizeY']: value,
            });
        }
    };

    return (
        <div className="flex gap-4">
            <div className="flex-1 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Workpiece Dimensions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="sizeX">X size:</Label>
                            <Input
                                id="sizeX"
                                type="number"
                                value={settings.workpieceSizeX}
                                onChange={(e) => handleSizeChange('x', parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        
                        <div>
                            <Label htmlFor="sizeY">Y size:</Label>
                            <Input
                                id="sizeY"
                                type="number"
                                value={settings.workpieceSizeY}
                                onChange={(e) => handleSizeChange('y', parseFloat(e.target.value) || 0)}
                                disabled={settings.workpiecLockXY}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="lock"
                                checked={settings.workpiecLockXY}
                                onCheckedChange={(checked) => setSettings({ 
                                    ...settings, 
                                    workpiecLockXY: checked as boolean 
                                })}
                            />
                            <Label htmlFor="lock">Lock</Label>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Probe Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="passes">Passes:</Label>
                            <Input
                                id="passes"
                                type="number"
                                min="1"
                                max="5"
                                value={settings.passes}
                                onChange={(e) => setSettings({ 
                                    ...settings, 
                                    passes: parseInt(e.target.value) || 1 
                                })}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant={settings.mode === 'inside' ? 'default' : 'outline'}
                                onClick={() => setSettings({ ...settings, mode: 'inside' })}
                            >
                                Inside
                            </Button>
                            <Button
                                variant={settings.mode === 'outside' ? 'default' : 'outline'}
                                onClick={() => setSettings({ ...settings, mode: 'outside' })}
                            >
                                Outside
                            </Button>
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

export default CenterFinder;