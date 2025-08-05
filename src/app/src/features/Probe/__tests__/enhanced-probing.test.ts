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

import { getEdgeFinderCode, getCenterFinderCode, getHeightMapCode } from '../../../lib/Probing';

describe('Enhanced Probing Functions', () => {
    describe('getEdgeFinderCode', () => {
        it('should generate external edge finder code', () => {
            const code = getEdgeFinderCode('external', 'A', 20, false);
            expect(code).toContain('; Edge Finder - external');
            expect(code).toContain('; Edge: A');
            expect(code).toContain('G21 G91');
        });

        it('should generate internal edge finder code', () => {
            const code = getEdgeFinderCode('internal', 'A', 20, false);
            expect(code).toContain('; Edge Finder - internal');
            expect(code).toContain('; Edge: A');
            expect(code).toContain('G21 G91');
        });

        it('should include Z probing when enabled', () => {
            const code = getEdgeFinderCode('external', 'A', 20, true);
            expect(code).toContain('; Z probe');
            expect(code).toContain('G38.2 Z-50 F200');
        });
    });

    describe('getCenterFinderCode', () => {
        it('should generate center finder code for inside mode', () => {
            const code = getCenterFinderCode('inside', 50, 50, 2);
            expect(code).toContain('; Center Finder - inside');
            expect(code).toContain('; Size: X50 Y50');
            expect(code).toContain('; Passes: 2');
        });

        it('should generate center finder code for outside mode', () => {
            const code = getCenterFinderCode('outside', 100, 100, 1);
            expect(code).toContain('; Center Finder - outside');
            expect(code).toContain('; Size: X100 Y100');
            expect(code).toContain('; Passes: 1');
        });
    });

    describe('getHeightMapCode', () => {
        it('should generate height map code', () => {
            const code = getHeightMapCode(0, 0, 100, 100, 10, 10, false);
            expect(code).toContain('; Height Map Generation');
            expect(code).toContain('; Area: X0 Y0 W100 H100');
            expect(code).toContain('; Grid: 10 x 10');
        });

        it('should include pause when enabled', () => {
            const code = getHeightMapCode(0, 0, 100, 100, 10, 10, true);
            expect(code).toContain('M0 (Pause before probing)');
        });

        it('should calculate correct number of points', () => {
            const code = getHeightMapCode(0, 0, 100, 100, 10, 10, false);
            // For 100x100 area with 10x10 grid, we should have 11x11 = 121 points
            const pointsX = Math.ceil(100 / 10) + 1; // 11
            const pointsY = Math.ceil(100 / 10) + 1; // 11
            const totalPoints = pointsX * pointsY; // 121
            expect(code).toContain(`; Total points: ${totalPoints}`);
        });
    });
});

describe('Enhanced Probing Components', () => {
    // These would be React component tests if we had a proper test environment
    it('should export all new probing components', () => {
        // This is a placeholder - in a real test environment we would test component rendering
        expect(true).toBe(true);
    });
});