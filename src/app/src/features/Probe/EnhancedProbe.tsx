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
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'app/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from 'app/components/ui/card';
import { Alert, AlertDescription } from 'app/components/ui/alert';
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
    const [activeTab, setActiveTab] = useState<string>('basic');

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
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="basic">Basic</TabsTrigger>
                            <TabsTrigger value="edge-external">Edge (Ext)</TabsTrigger>
                            <TabsTrigger value="edge-internal">Edge (Int)</TabsTrigger>
                            <TabsTrigger value="center">Center</TabsTrigger>
                            <TabsTrigger value="heightmap">Height Map</TabsTrigger>
                            <TabsTrigger value="rotation">Rotation</TabsTrigger>
                            <TabsTrigger value="tool-length">Tool Length</TabsTrigger>
                        </TabsList>

                        <div className="mt-4 h-full">
                            <TabsContent value="basic" className="h-full">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Basic Probing</h3>
                                    <p className="text-sm text-gray-600">
                                        Standard touchplate probing for setting X, Y, and Z coordinates.
                                    </p>
                                    <Probe state={state} actions={actions} />
                                </div>
                            </TabsContent>

                            <TabsContent value="edge-external" className="h-full">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Edge Finder (External)</h3>
                                    <p className="text-sm text-gray-600">
                                        Probe workpiece edges and corners from the outside. 
                                        Move the probe to above the position indicated before start.
                                    </p>
                                    <EdgeFinder mode="external" />
                                </div>
                            </TabsContent>

                            <TabsContent value="edge-internal" className="h-full">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Edge Finder (Internal)</h3>
                                    <p className="text-sm text-gray-600">
                                        Probe workpiece edges and corners from the inside (for holes/pockets).
                                        Position the probe inside the feature before start.
                                    </p>
                                    <EdgeFinder mode="internal" />
                                </div>
                            </TabsContent>

                            <TabsContent value="center" className="h-full">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Center Finder</h3>
                                    <p className="text-sm text-gray-600">
                                        Find the center of circular or rectangular workpieces.
                                        Place the probe above the approximate center before start.
                                    </p>
                                    <CenterFinder />
                                </div>
                            </TabsContent>

                            <TabsContent value="heightmap" className="h-full">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Height Map</h3>
                                    <p className="text-sm text-gray-600">
                                        Create a height map for workpiece leveling compensation.
                                        Ensure the initial Z-position is clear of any obstacles.
                                    </p>
                                    <HeightMap />
                                </div>
                            </TabsContent>

                            <TabsContent value="rotation" className="h-full">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Rotation Detection</h3>
                                    <p className="text-sm text-gray-600">
                                        Detect workpiece rotation and apply coordinate system compensation.
                                        Position above a straight edge of your workpiece.
                                    </p>
                                    <Rotation />
                                </div>
                            </TabsContent>

                            <TabsContent value="tool-length" className="h-full">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Tool Length Offset</h3>
                                    <p className="text-sm text-gray-600">
                                        Measure tool length automatically using a tool length sensor.
                                        Move to above the tool length sensor before start.
                                    </p>
                                    <ToolLengthOffset />
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default EnhancedProbe;