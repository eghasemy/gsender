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
import { RotationSettings } from './definitions';

const Rotation: React.FC = () => {
    const {
        isConnected,
        workflow,
        activeState,
    } = useTypedSelector((state) => ({
        isConnected: state.connection.isConnected,
        workflow: state.controller.workflow,
        activeState: state.controller.state.status?.activeState,
    }));

    const [settings, setSettings] = useState<RotationSettings>({
        angle: 0,
        compensateRotation: true,
        probePoints: 2,
    });

    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [measuredAngle, setMeasuredAngle] = useState<number | null>(null);
    const [probePoint1, setProbePoint1] = useState<{x: number, y: number} | null>(null);
    const [probePoint2, setProbePoint2] = useState<{x: number, y: number} | null>(null);

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
        const { probePoints } = settings;
        
        const code: string[] = [
            '; Rotation Detection',
            `; Probe points: ${probePoints}`,
            'G21 G90', // Set metric and absolute mode
        ];

        if (probePoints === 2) {
            // Two-point rotation detection
            code.push(
                '; Probe first point',
                'G38.2 X-50 F200', // Probe toward negative X
                'G0 X2',
                'G38.2 X-5 F50',
                'G4 P0.1',
                '%POINT1_X=posx',
                '%POINT1_Y=posy',
                'G0 X20', // Move away from edge
                
                '; Move to second probe position',
                'G0 Y50', // Move to different Y position
                
                '; Probe second point',
                'G38.2 X-50 F200',
                'G0 X2',
                'G38.2 X-5 F50',
                'G4 P0.1',
                '%POINT2_X=posx',
                '%POINT2_Y=posy',
                
                '; Calculate rotation angle',
                '%DELTA_X=POINT2_X - POINT1_X',
                '%DELTA_Y=POINT2_Y - POINT1_Y',
                '%ANGLE=atan(DELTA_X/DELTA_Y) * 180/3.14159', // Convert to degrees
            );
        } else {
            // Three-point rotation detection (more accurate)
            code.push(
                '; Probe first point',
                'G38.2 X-50 F200',
                'G0 X2',
                'G38.2 X-5 F50',
                'G4 P0.1',
                '%POINT1_X=posx',
                '%POINT1_Y=posy',
                'G0 X20',
                
                '; Move to second probe position',
                'G0 Y30',
                
                '; Probe second point',
                'G38.2 X-50 F200',
                'G0 X2',
                'G38.2 X-5 F50',
                'G4 P0.1',
                '%POINT2_X=posx',
                '%POINT2_Y=posy',
                'G0 X20',
                
                '; Move to third probe position',
                'G0 Y30',
                
                '; Probe third point',
                'G38.2 X-50 F200',
                'G0 X2',
                'G38.2 X-5 F50',
                'G4 P0.1',
                '%POINT3_X=posx',
                '%POINT3_Y=posy',
                
                '; Calculate rotation angle using least squares fit',
                '%DELTA_X1=POINT2_X - POINT1_X',
                '%DELTA_Y1=POINT2_Y - POINT1_Y',
                '%DELTA_X2=POINT3_X - POINT2_X',
                '%DELTA_Y2=POINT3_Y - POINT2_Y',
                '%ANGLE1=atan(DELTA_X1/DELTA_Y1) * 180/3.14159',
                '%ANGLE2=atan(DELTA_X2/DELTA_Y2) * 180/3.14159',
                '%ANGLE=(ANGLE1 + ANGLE2)/2', // Average the angles
            );
        }

        if (settings.compensateRotation) {
            code.push(
                '; Apply rotation compensation',
                'G68 X0 Y0 R[ANGLE]', // Set coordinate system rotation
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
        setMeasuredAngle(null);
        setProbePoint1(null);
        setProbePoint2(null);
        
        const code = generateProbeCode();
        controller.command('gcode:safe', code, 'G21');
    };

    const handleStop = () => {
        controller.command('gcode:stop');
        setIsRunning(false);
    };

    const handleClearRotation = () => {
        // Clear coordinate system rotation
        controller.command('gcode', 'G69'); // Cancel coordinate system rotation
        setMeasuredAngle(null);
    };

    const handleApplyManualRotation = () => {
        if (settings.angle !== 0) {
            controller.command('gcode', `G68 X0 Y0 R${settings.angle}`);
        }
    };

    const calculateAngle = () => {
        if (probePoint1 && probePoint2) {
            const deltaX = probePoint2.x - probePoint1.x;
            const deltaY = probePoint2.y - probePoint1.y;
            const angle = Math.atan2(deltaX, deltaY) * 180 / Math.PI;
            setMeasuredAngle(angle);
        }
    };

    return (
        <div className="max-w-md space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Rotation Detection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="probePoints">Probe points:</Label>
                        <div className="flex gap-2 mt-1">
                            <Button
                                variant={settings.probePoints === 2 ? 'default' : 'outline'}
                                onClick={() => setSettings({ ...settings, probePoints: 2 })}
                                className="flex-1"
                            >
                                2 Points
                            </Button>
                            <Button
                                variant={settings.probePoints === 3 ? 'default' : 'outline'}
                                onClick={() => setSettings({ ...settings, probePoints: 3 })}
                                className="flex-1"
                            >
                                3 Points
                            </Button>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="manualAngle">Manual angle (degrees):</Label>
                        <Input
                            id="manualAngle"
                            type="number"
                            step="0.1"
                            value={settings.angle}
                            onChange={(e) => setSettings({ 
                                ...settings, 
                                angle: parseFloat(e.target.value) || 0 
                            })}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="compensate"
                            checked={settings.compensateRotation}
                            onCheckedChange={(checked) => setSettings({ 
                                ...settings, 
                                compensateRotation: checked as boolean 
                            })}
                        />
                        <Label htmlFor="compensate">Apply rotation compensation</Label>
                    </div>
                </CardContent>
            </Card>

            {measuredAngle !== null && (
                <Card>
                    <CardHeader>
                        <CardTitle>Measurement Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div>Detected angle: {measuredAngle.toFixed(3)}°</div>
                            {settings.compensateRotation && (
                                <div className="text-green-600">Rotation compensation applied</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-2">
                <div className="flex gap-2">
                    <Button onClick={handleStart} disabled={!canStart() || isRunning} className="flex-1">
                        Detect Rotation
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
                        onClick={handleApplyManualRotation}
                        disabled={settings.angle === 0 || isRunning}
                        variant="outline"
                        className="flex-1"
                    >
                        Apply Manual Angle
                    </Button>
                    <Button 
                        onClick={handleClearRotation}
                        disabled={isRunning}
                        variant="outline"
                    >
                        Clear Rotation
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-gray-600 space-y-2">
                        <p>1. Position the probe above a straight edge of your workpiece</p>
                        <p>2. Select 2 or 3 probe points (3 points is more accurate)</p>
                        <p>3. Click "Detect Rotation" to measure the workpiece angle</p>
                        <p>4. The coordinate system will be rotated automatically if enabled</p>
                        <p>5. Alternatively, enter a manual angle and apply it directly</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Rotation;