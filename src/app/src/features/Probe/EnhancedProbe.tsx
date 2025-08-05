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
import { Tabs } from 'app/components/Tabs';
import { Card, CardContent, CardHeader, CardTitle } from 'app/components/shadcn/Card';
import { Alert, AlertDescription } from 'app/components/shadcn/Alert';
import Probe from './Probe'; // Original probe component
import EdgeFinder from './EdgeFinder';
import CenterFinder from './CenterFinder';
import HeightMap from './HeightMap';
import ToolLengthOffset from './ToolLengthOffset';
import Rotation from './Rotation';
import { Actions, State } from './definitions';

interface EnhancedProbeProps {
    state: State;
    actions: Actions;
}

const EnhancedProbe: React.FC<EnhancedProbeProps> = ({ state, actions }) => {
    const [activeTab, setActiveTab] = useState<number>(0);

    const tabs = [
        {
            label: 'Basic',
            content: () => (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Probing</h3>
                    <p className="text-sm text-gray-600">
                        Standard touchplate probing for setting X, Y, and Z coordinates.
                    </p>
                    <Probe state={state} actions={actions} />
                </div>
            ),
        },
        {
            label: 'Edge (Ext)',
            content: () => (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Edge Finder (External)</h3>
                    <p className="text-sm text-gray-600">
                        Probe workpiece edges and corners from the outside. 
                        Move the probe to above the position indicated before start.
                    </p>
                    <EdgeFinder mode="external" />
                </div>
            ),
        },
        {
            label: 'Edge (Int)',
            content: () => (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Edge Finder (Internal)</h3>
                    <p className="text-sm text-gray-600">
                        Probe workpiece edges and corners from the inside (for holes/pockets).
                        Position the probe inside the feature before start.
                    </p>
                    <EdgeFinder mode="internal" />
                </div>
            ),
        },
        {
            label: 'Center',
            content: () => (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Center Finder</h3>
                    <p className="text-sm text-gray-600">
                        Find the center of circular or rectangular workpieces.
                        Place the probe above the approximate center before start.
                    </p>
                    <CenterFinder />
                </div>
            ),
        },
        {
            label: 'Height Map',
            content: () => (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Height Map</h3>
                    <p className="text-sm text-gray-600">
                        Create a height map for workpiece leveling compensation.
                        Ensure the initial Z-position is clear of any obstacles.
                    </p>
                    <HeightMap />
                </div>
            ),
        },
        {
            label: 'Rotation',
            content: () => (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Rotation Detection</h3>
                    <p className="text-sm text-gray-600">
                        Detect workpiece rotation and apply coordinate system compensation.
                        Position above a straight edge of your workpiece.
                    </p>
                    <Rotation />
                </div>
            ),
        },
        {
            label: 'Tool Length',
            content: () => (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tool Length Offset</h3>
                    <p className="text-sm text-gray-600">
                        Measure tool length automatically using a tool length sensor.
                        Move to above the tool length sensor before start.
                    </p>
                    <ToolLengthOffset />
                </div>
            ),
        },
    ];

    return (
        <div className="w-full h-full">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Probing</CardTitle>
                    <Alert>
                        <AlertDescription>
                            <span className="text-red-600 font-bold">
                                Warning! Use with care - incorrect parameters may damage your probe!
                            </span>
                        </AlertDescription>
                    </Alert>
                </CardHeader>
                <CardContent className="flex-1">
                    <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                </CardContent>
            </Card>
        </div>
    );
};

export default EnhancedProbe;