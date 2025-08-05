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

import React, { useState } from 'react';
import { Button } from 'app/components/ui/button';
import { Input } from 'app/components/ui/input';
import { Label } from 'app/components/ui/label';
import { Checkbox } from 'app/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from 'app/components/ui/card';
import controller from 'app/lib/controller';
import { GRBL_ACTIVE_STATE_IDLE, WORKFLOW_STATE_RUNNING } from 'app/constants';
import { useTypedSelector } from 'app/hooks/useTypedSelector';
import { ToolLengthSettings } from './definitions';

const ToolLengthOffset: React.FC = () => {
    const {
        isConnected,
        workflow,
        activeState,
    } = useTypedSelector((state) => ({
        isConnected: state.connection.isConnected,
        workflow: state.controller.workflow,
        activeState: state.controller.state.status?.activeState,
    }));

    const [settings, setSettings] = useState<ToolLengthSettings>({
        referenceHeight: 20,
        toolNumber: 1,
        setOffset: true,
    });

    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [measuredLength, setMeasuredLength] = useState<number | null>(null);

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
        const { referenceHeight, toolNumber, setOffset } = settings;
        
        const code: string[] = [
            '; Tool Length Offset Measurement',
            `; Tool number: ${toolNumber}`,
            `; Reference height: ${referenceHeight}`,
            'G21 G90', // Set metric and absolute mode
            'G0 Z5', // Move to safe height
        ];

        // Move to tool length sensor position (assuming it's at machine coordinates)
        code.push(
            'G53 G0 X0 Y0', // Move to machine origin (adjust as needed)
            'G0 Z2', // Position above sensor
        );

        // Probe down to find tool length
        code.push(
            'G38.2 Z-100 F200', // Fast probe down
            'G0 Z2', // Retract slightly
            'G38.2 Z-5 F50', // Slow probe for accuracy
            'G4 P0.1', // Dwell
            '%TOOL_LENGTH=posz', // Store the measured position
        );

        if (setOffset) {
            code.push(
                `; Set tool length offset for tool ${toolNumber}`,
                `G43.1 Z[${referenceHeight} - TOOL_LENGTH]`, // Set tool length offset
                'G0 Z5' // Move to safe height
            );
        } else {
            code.push('G0 Z5'); // Just move to safe height
        }

        return code;
    };

    const handleStart = () => {
        if (!canStart()) {
            return;
        }

        setIsRunning(true);
        setMeasuredLength(null);
        
        const code = generateProbeCode();
        controller.command('gcode:safe', code, 'G21');
    };

    const handleStop = () => {
        controller.command('gcode:stop');
        setIsRunning(false);
    };

    const handleClearOffset = () => {
        // Clear tool length offset
        controller.command('gcode', 'G49'); // Cancel tool length offset
    };

    const handleSetManualOffset = () => {
        if (measuredLength !== null) {
            const offset = settings.referenceHeight - measuredLength;
            controller.command('gcode', `G43.1 Z${offset}`);
        }
    };

    return (
        <div className="max-w-md space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Tool Length Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="toolNumber">Tool number:</Label>
                        <Input
                            id="toolNumber"
                            type="number"
                            min="1"
                            max="99"
                            value={settings.toolNumber}
                            onChange={(e) => setSettings({ 
                                ...settings, 
                                toolNumber: parseInt(e.target.value) || 1 
                            })}
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="referenceHeight">Reference height:</Label>
                        <Input
                            id="referenceHeight"
                            type="number"
                            step="0.1"
                            value={settings.referenceHeight}
                            onChange={(e) => setSettings({ 
                                ...settings, 
                                referenceHeight: parseFloat(e.target.value) || 0 
                            })}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="setOffset"
                            checked={settings.setOffset}
                            onCheckedChange={(checked) => setSettings({ 
                                ...settings, 
                                setOffset: checked as boolean 
                            })}
                        />
                        <Label htmlFor="setOffset">Set offset automatically</Label>
                    </div>
                </CardContent>
            </Card>

            {measuredLength !== null && (
                <Card>
                    <CardHeader>
                        <CardTitle>Measurement Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div>Measured length: {measuredLength.toFixed(3)} mm</div>
                            <div>Calculated offset: {(settings.referenceHeight - measuredLength).toFixed(3)} mm</div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-2">
                <div className="flex gap-2">
                    <Button onClick={handleStart} disabled={!canStart() || isRunning} className="flex-1">
                        Measure Tool Length
                    </Button>
                    <Button 
                        onClick={handleStop} 
                        disabled={!isRunning}
                        variant="destructive"
                    >
                        Stop
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button 
                        onClick={handleSetManualOffset}
                        disabled={measuredLength === null || isRunning}
                        variant="outline"
                        className="flex-1"
                    >
                        Set Offset Manually
                    </Button>
                    <Button 
                        onClick={handleClearOffset}
                        disabled={isRunning}
                        variant="outline"
                    >
                        Clear Offset
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-gray-600 space-y-2">
                        <p>1. Install the tool you want to measure</p>
                        <p>2. Move to above the tool length sensor</p>
                        <p>3. Set the reference height (typically the height of your reference tool)</p>
                        <p>4. Click "Measure Tool Length" to start probing</p>
                        <p>5. The tool length offset will be automatically set if enabled</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ToolLengthOffset;