import Position from "../../public/scripts/rendering/position.js";
import {planPolyLine} from "../../public/scripts/rendering/polyline.js";

import assert from "assert";
import { ALL_DIRECTIONS } from "../../public/scripts/config/constants.js";
import { IMAGE_SIZE } from "../../public/scripts/config/layout.js";

describe("Polyline planning", () => {
    const ORIGIN = [0, 0];
    const anchor = (pos, dir) => {
        return {
            pos: new Position(...pos), 
            direction: dir
        }
    };

    describe("Single line", () => {
        /*
        ------
        */
        it("Right Line", () => {
            const DEST = [100, 0];
            const result1 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                anchor(DEST, ALL_DIRECTIONS.LEFT)
            );
            const result2 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                anchor(DEST, ALL_DIRECTIONS.UP)
            );
            const result3 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                anchor(DEST, ALL_DIRECTIONS.DOWN)
            );
            const expected = [ORIGIN, DEST];
            assert.deepStrictEqual(result1, expected);
            assert.deepStrictEqual(result2, expected);
            assert.deepStrictEqual(result3, expected);
        });

        it("Left line", () => {
            const DEST = [-100, 0];
            const result1 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                anchor(DEST, ALL_DIRECTIONS.RIGHT)
            );
            const result2 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                anchor(DEST, ALL_DIRECTIONS.UP)
            );
            const result3 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                anchor(DEST, ALL_DIRECTIONS.DOWN)
            );
            const expected = [ORIGIN, DEST];
            assert.deepStrictEqual(result1, expected);
            assert.deepStrictEqual(result2, expected);
            assert.deepStrictEqual(result3, expected);
        });

        it("Down line", () => {
            const DEST = [0, 100];
            const result1 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                anchor(DEST, ALL_DIRECTIONS.UP)
            );
            const result2 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                anchor(DEST, ALL_DIRECTIONS.LEFT)
            );
            const result3 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                anchor(DEST, ALL_DIRECTIONS.RIGHT)
            );
            const expected = [ORIGIN, DEST];
            assert.deepStrictEqual(result1, expected);
            assert.deepStrictEqual(result2, expected);
            assert.deepStrictEqual(result3, expected);
        });

        it("Up line", () => {
            const DEST = [0, -100];
            const result1 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                anchor(DEST, ALL_DIRECTIONS.DOWN)
            );
            const result2 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                anchor(DEST, ALL_DIRECTIONS.LEFT)
            );
            const result3 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                anchor(DEST, ALL_DIRECTIONS.RIGHT)
            );
            const expected = [ORIGIN, DEST];
            assert.deepStrictEqual(result1, expected);
            assert.deepStrictEqual(result2, expected);
            assert.deepStrictEqual(result3, expected);
        });
    });

    describe("Two lines", () => {
        /*
        ----
            |
            |
        */

        it("Up, right", () => {
            const DEST = [100, -100];
            const result1 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                anchor(DEST, ALL_DIRECTIONS.LEFT)
            );
            const result2 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                anchor(DEST, ALL_DIRECTIONS.UP)
            );
            const result3 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                anchor(DEST, ALL_DIRECTIONS.UP)
            );
            const result4 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                anchor(DEST, ALL_DIRECTIONS.DOWN)
            );
            const expected = [ORIGIN, [ORIGIN[0], DEST[1]], DEST];
            assert.deepStrictEqual(result1, expected);
            assert.deepStrictEqual(result2, expected);
            assert.deepStrictEqual(result3, expected);
            assert.deepStrictEqual(result4, expected);
        });

        it("Up, left", () => {
            const DEST = [-100, -100];
            const result1 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                anchor(DEST, ALL_DIRECTIONS.RIGHT)
            );
            const result2 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                anchor(DEST, ALL_DIRECTIONS.UP)
            );
            const result3 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                anchor(DEST, ALL_DIRECTIONS.DOWN)
            );
            const result4 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                anchor(DEST, ALL_DIRECTIONS.UP)
            );
            const expected = [ORIGIN, [ORIGIN[0], DEST[1]], DEST];
            assert.deepStrictEqual(result1, expected);
            assert.deepStrictEqual(result2, expected);
            assert.deepStrictEqual(result3, expected);
            assert.deepStrictEqual(result4, expected);
        });

        it("Down, right", () => {
            const DEST = [100, 100];
            const result1 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                anchor(DEST, ALL_DIRECTIONS.DOWN)
            );
            const result4 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                anchor(DEST, ALL_DIRECTIONS.UP)
            );
            const result2 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                anchor(DEST, ALL_DIRECTIONS.LEFT)
            );
            const result3 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                anchor(DEST, ALL_DIRECTIONS.DOWN)
            );

            const expected = [ORIGIN, [ORIGIN[0], DEST[1]], DEST];
            assert.deepStrictEqual(result1, expected);
            assert.deepStrictEqual(result2, expected);
            assert.deepStrictEqual(result3, expected);
            assert.deepStrictEqual(result4, expected);
        });

        it("Down, left", () => {
            const DEST = [-100, 100];
            const result1 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                anchor(DEST, ALL_DIRECTIONS.RIGHT)
            );
            const result2 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                anchor(DEST, ALL_DIRECTIONS.DOWN)
            );
            const result3 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                anchor(DEST, ALL_DIRECTIONS.DOWN)
            );
            const result4 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                anchor(DEST, ALL_DIRECTIONS.UP)
            );

            const expected = [ORIGIN, [ORIGIN[0], DEST[1]], DEST];
            assert.deepStrictEqual(result1, expected);
            assert.deepStrictEqual(result2, expected);
            assert.deepStrictEqual(result3, expected);
            assert.deepStrictEqual(result4, expected);
        });

        it("Left, up", () => {
            const DEST = [-100, -100];
            const result1 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                anchor(DEST, ALL_DIRECTIONS.RIGHT)
            );
            const result2 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                anchor(DEST, ALL_DIRECTIONS.LEFT)
            );
            const result3 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                anchor(DEST, ALL_DIRECTIONS.DOWN)
            );
            const result4 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                anchor(DEST, ALL_DIRECTIONS.LEFT)
            );
            
            const expected = [ORIGIN, [DEST[0], ORIGIN[1]], DEST];
            assert.deepStrictEqual(result1, expected);
            assert.deepStrictEqual(result2, expected);
            assert.deepStrictEqual(result3, expected);
            assert.deepStrictEqual(result4, expected);
        });

        it("Left, down", () => {
            const DEST = [-100, 100];
            const result1 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                anchor(DEST, ALL_DIRECTIONS.LEFT)
            );
            const result2 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                anchor(DEST, ALL_DIRECTIONS.UP)
            );
            const result3 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                anchor(DEST, ALL_DIRECTIONS.LEFT)
            );
            const result4 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                anchor(DEST, ALL_DIRECTIONS.RIGHT)
            );

            const expected = [ORIGIN, [DEST[0], ORIGIN[1]], DEST];
            assert.deepStrictEqual(result1, expected);
            assert.deepStrictEqual(result2, expected);
            assert.deepStrictEqual(result3, expected);
            assert.deepStrictEqual(result4, expected);
        });

        it("Right, up", () => {
            const DEST = [100, -100];
            const result1 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                anchor(DEST, ALL_DIRECTIONS.RIGHT)
            );
            const result2 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                anchor(DEST, ALL_DIRECTIONS.DOWN)
            );
            const result3 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                anchor(DEST, ALL_DIRECTIONS.LEFT)
            );
            const result4 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                anchor(DEST, ALL_DIRECTIONS.RIGHT)
            );
            const expected = [ORIGIN, [DEST[0], ORIGIN[1]], DEST];
            assert.deepStrictEqual(result1, expected);
            assert.deepStrictEqual(result2, expected);
            assert.deepStrictEqual(result3, expected);
            assert.deepStrictEqual(result4, expected);
        });

        it("Right, down", () => {
            const DEST = [100, 100];
            const result1 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                anchor(DEST, ALL_DIRECTIONS.RIGHT)
            );
            const result2 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                anchor(DEST, ALL_DIRECTIONS.LEFT)
            );
            const result3 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                anchor(DEST, ALL_DIRECTIONS.UP)
            );

            const result4 = planPolyLine(
                anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                anchor(DEST, ALL_DIRECTIONS.RIGHT)
            );
            const expected = [ORIGIN, [DEST[0], ORIGIN[1]], DEST];
            assert.deepStrictEqual(result1, expected);
            assert.deepStrictEqual(result2, expected);
            assert.deepStrictEqual(result3, expected);
            assert.deepStrictEqual(result4, expected);
        });
    });

    describe("Three lines", () => {

        describe("Anchors in same direction", () => {

            const offset = IMAGE_SIZE / 2;
            /*
            .----.
            |    |
                 |
            */
            it("Up, right, down", () => {
                const DEST1 = [100, 100];
                const DEST2 = [100, -100];
                const result1 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                    anchor(DEST1, ALL_DIRECTIONS.UP)
                );
                const result2 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                    anchor(DEST2, ALL_DIRECTIONS.UP)
                );
                const expected1 = [
                    ORIGIN, 
                    [ORIGIN[0], ORIGIN[1] - offset],
                    [DEST1[0], ORIGIN[1] - offset],
                    DEST1
                ];

                const expected2 = [
                    ORIGIN, 
                    [ORIGIN[0], DEST2[1] - offset],
                    [DEST2[0], DEST2[1] - offset],
                    DEST2
                ];
                assert.deepStrictEqual(result1, expected1);
                assert.deepStrictEqual(result2, expected2);
            });

            it("Up, left, down", () => {
                const DEST1 = [-100, 100];
                const DEST2 = [-100, -100];
                const result1 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                    anchor(DEST1, ALL_DIRECTIONS.UP)
                );
                const result2 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                    anchor(DEST2, ALL_DIRECTIONS.UP)
                );
                const expected1 = [
                    ORIGIN, 
                    [ORIGIN[0], ORIGIN[1] - offset],
                    [DEST1[0], ORIGIN[1] - offset],
                    DEST1
                ];

                const expected2 = [
                    ORIGIN, 
                    [ORIGIN[0], DEST2[1] - offset],
                    [DEST2[0], DEST2[1] - offset],
                    DEST2
                ];
                assert.deepStrictEqual(result1, expected1);
                assert.deepStrictEqual(result2, expected2);
            });

            it("Down, right, up", () => {
                const DEST1 = [100, 100];
                const DEST2 = [100, -100];
                const result1 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                    anchor(DEST1, ALL_DIRECTIONS.DOWN)
                );
                const result2 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                    anchor(DEST2, ALL_DIRECTIONS.DOWN)
                );
                const expected1 = [
                    ORIGIN, 
                    [ORIGIN[0], DEST1[1] + offset],
                    [DEST1[0], DEST1[1] + offset],
                    DEST1
                ];

                const expected2 = [
                    ORIGIN, 
                    [ORIGIN[0], ORIGIN[1] + offset],
                    [DEST2[0], ORIGIN[1] + offset],
                    DEST2
                ];
                assert.deepStrictEqual(result1, expected1);
                assert.deepStrictEqual(result2, expected2);
            });

            it("Down, left, up", () => {
                const DEST1 = [-100, 100];
                const DEST2 = [-100, -100];
                const result1 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                    anchor(DEST1, ALL_DIRECTIONS.DOWN)
                );
                const result2 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                    anchor(DEST2, ALL_DIRECTIONS.DOWN)
                );
                const expected1 = [
                    ORIGIN, 
                    [ORIGIN[0], DEST1[1] + offset],
                    [DEST1[0], DEST1[1] + offset],
                    DEST1
                ];

                const expected2 = [
                    ORIGIN, 
                    [ORIGIN[0], ORIGIN[1] + offset],
                    [DEST2[0], ORIGIN[1] + offset],
                    DEST2
                ];
                assert.deepStrictEqual(result1, expected1);
                assert.deepStrictEqual(result2, expected2);
            });

            it("Left, up, right", () => {
                const DEST1 = [-100, -100];
                const DEST2 = [100, -100];
                const result1 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                    anchor(DEST1, ALL_DIRECTIONS.LEFT)
                );
                const result2 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                    anchor(DEST2, ALL_DIRECTIONS.LEFT)
                );
                const expected1 = [
                    ORIGIN, 
                    [DEST1[0] - offset, ORIGIN[1]],
                    [DEST1[0] - offset, DEST1[1]],
                    DEST1
                ];

                const expected2 = [
                    ORIGIN, 
                    [ORIGIN[0] - offset, ORIGIN[1]],
                    [ORIGIN[0] - offset, DEST2[1]],
                    DEST2
                ];
                assert.deepStrictEqual(result1, expected1);
                assert.deepStrictEqual(result2, expected2);
            });

            it("Left, down, right", () => {
                const DEST1 = [-100, 100];
                const DEST2 = [100, 100];
                const result1 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                    anchor(DEST1, ALL_DIRECTIONS.LEFT)
                );
                const result2 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                    anchor(DEST2, ALL_DIRECTIONS.LEFT)
                );
                const expected1 = [
                    ORIGIN, 
                    [DEST1[0] - offset, ORIGIN[1]],
                    [DEST1[0] - offset, DEST1[1]],
                    DEST1
                ];

                const expected2 = [
                    ORIGIN, 
                    [ORIGIN[0] - offset, ORIGIN[1]],
                    [ORIGIN[0] - offset, DEST2[1]],
                    DEST2
                ];
                assert.deepStrictEqual(result1, expected1);
                assert.deepStrictEqual(result2, expected2);
            });
    
            it("Right, up, left", () => {
                const DEST1 = [-100, -100];
                const DEST2 = [100, -100];
                const result1 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                    anchor(DEST1, ALL_DIRECTIONS.RIGHT)
                );
                const result2 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                    anchor(DEST2, ALL_DIRECTIONS.RIGHT)
                );
                const expected1 = [
                    ORIGIN, 
                    [ORIGIN[0] + offset, ORIGIN[1]],
                    [ORIGIN[0] + offset, DEST1[1]],
                    DEST1
                ];

                const expected2 = [
                    ORIGIN, 
                    [DEST2[0] + offset, ORIGIN[1]],
                    [DEST2[0] + offset, DEST2[1]],
                    DEST2
                ];
                assert.deepStrictEqual(result1, expected1);
                assert.deepStrictEqual(result2, expected2);
            });

            it("Right, down, left", () => {
                const DEST1 = [-100, 100];
                const DEST2 = [100, 100];
                const result1 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                    anchor(DEST1, ALL_DIRECTIONS.RIGHT)
                );
                const result2 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                    anchor(DEST2, ALL_DIRECTIONS.RIGHT)
                );
                const expected1 = [
                    ORIGIN, 
                    [ORIGIN[0] + offset, ORIGIN[1]],
                    [ORIGIN[0] + offset, DEST1[1]],
                    DEST1
                ];

                const expected2 = [
                    ORIGIN, 
                    [DEST2[0] + offset, ORIGIN[1]],
                    [DEST2[0] + offset, DEST2[1]],
                    DEST2
                ];
                assert.deepStrictEqual(result1, expected1);
                assert.deepStrictEqual(result2, expected2);
            });
        });

       
        describe("Opposite direction", () => {
            /*
            ---.
               |
               '---
            */

            it("Up, right, up", () => {
                const DEST = [100, -100];
                const result1 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                    anchor(DEST, ALL_DIRECTIONS.DOWN)
                );
                
                const expected1 = [
                    ORIGIN, 
                    [ORIGIN[0], (ORIGIN[1] + DEST[1])/2],
                    [DEST[0], (ORIGIN[1] + DEST[1])/2],
                    DEST
                ];

                assert.deepStrictEqual(result1, expected1);
            });
    
            it("Up, left, up", () => {
                const DEST = [-100, -100];
                const result1 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                    anchor(DEST, ALL_DIRECTIONS.DOWN)
                );
                
                const expected1 = [
                    ORIGIN, 
                    [ORIGIN[0], (ORIGIN[1] + DEST[1])/2],
                    [DEST[0], (ORIGIN[1] + DEST[1])/2],
                    DEST
                ];

                assert.deepStrictEqual(result1, expected1);
            });
    
            it("Down, right, down", () => {
                const DEST = [100, 100];
                const result1 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                    anchor(DEST, ALL_DIRECTIONS.UP)
                );
                
                const expected1 = [
                    ORIGIN, 
                    [ORIGIN[0], (ORIGIN[1] + DEST[1])/2],
                    [DEST[0], (ORIGIN[1] + DEST[1])/2],
                    DEST
                ];

                assert.deepStrictEqual(result1, expected1);
            });
    
            it("Down, left, down", () => {
                const DEST = [-100, 100];
                const result1 = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.DOWN), 
                    anchor(DEST, ALL_DIRECTIONS.UP)
                );
                
                const expected1 = [
                    ORIGIN, 
                    [ORIGIN[0], (ORIGIN[1] + DEST[1])/2],
                    [DEST[0], (ORIGIN[1] + DEST[1])/2],
                    DEST
                ];

                assert.deepStrictEqual(result1, expected1);
            });
    
            it("Left, up, left", () => {
                const DEST = [-100, -100];
                const result = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                    anchor(DEST, ALL_DIRECTIONS.RIGHT)
                );
                
                const expected = [
                    ORIGIN, 
                    [(ORIGIN[0] + DEST[0])/2, ORIGIN[1]],
                    [(ORIGIN[0] + DEST[0])/2, DEST[1]],
                    DEST
                ];

                assert.deepStrictEqual(result, expected);
            });
    
            it("Left, down, left", () => {
                const DEST = [-100, 100];
                const result = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.LEFT), 
                    anchor(DEST, ALL_DIRECTIONS.RIGHT)
                );
                
                const expected = [
                    ORIGIN, 
                    [(ORIGIN[0] + DEST[0])/2, ORIGIN[1]],
                    [(ORIGIN[0] + DEST[0])/2, DEST[1]],
                    DEST
                ];

                assert.deepStrictEqual(result, expected);
            });
    
            it("Right, up, right", () => {
                const DEST = [100, -100];
                const result = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                    anchor(DEST, ALL_DIRECTIONS.LEFT)
                );
                
                const expected = [
                    ORIGIN, 
                    [(ORIGIN[0] + DEST[0])/2, ORIGIN[1]],
                    [(ORIGIN[0] + DEST[0])/2, DEST[1]],
                    DEST
                ];

                assert.deepStrictEqual(result, expected);
            });
    
            it("Right, down, right", () => {
                const DEST = [100, 100];
                const result = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                    anchor(DEST, ALL_DIRECTIONS.LEFT)
                );
                
                const expected = [
                    ORIGIN, 
                    [(ORIGIN[0] + DEST[0])/2, ORIGIN[1]],
                    [(ORIGIN[0] + DEST[0])/2, DEST[1]],
                    DEST
                ];

                assert.deepStrictEqual(result, expected);
            });
        })
    });

    describe("Five lines", () => {
        describe("Same direction", () => {
            const offset = IMAGE_SIZE/2;
            /*
            .---.
            |   |
            |
            |
            '---.
                |
            */
            it("Right, up, right, down, left", () => {
                const DEST = [100, 10];
                const result = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                    anchor(DEST, ALL_DIRECTIONS.RIGHT)
                );
                const expected = [
                    ORIGIN,
                    [ORIGIN[0] + offset, ORIGIN[1]],
                    [ORIGIN[0] + offset, DEST[1] - offset],
                    [DEST[0] + offset, DEST[1] - offset],
                    [DEST[0] + offset, DEST[1]],
                    DEST
                ];
                assert.deepStrictEqual(result, expected);
            });

            it("Right, down, right, up, left", () => {
                const DEST = [100, -10];
                const result = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                    anchor(DEST, ALL_DIRECTIONS.RIGHT)
                );
                const expected = [
                    ORIGIN,
                    [ORIGIN[0] + offset, ORIGIN[1]],
                    [ORIGIN[0] + offset, DEST[1] + offset],
                    [DEST[0] + offset, DEST[1] + offset],
                    [DEST[0] + offset, DEST[1]],
                    DEST
                ];
                assert.deepStrictEqual(result, expected);
            });

            it("Up, left, up, right, down", () => {
                const DEST = [10, -100];
                const result = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                    anchor(DEST, ALL_DIRECTIONS.UP)
                );
                const expected = [
                    ORIGIN,
                    [ORIGIN[0], ORIGIN[1] - offset],
                    [DEST[0] - offset, ORIGIN[1] - offset],
                    [DEST[0] - offset, DEST[1] - offset],
                    [DEST[0], DEST[1] - offset],
                    DEST
                ];
                assert.deepStrictEqual(result, expected);
            });

            it("Up, right, up, left, down", () => {
                const DEST = [-10, -100];
                const result = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                    anchor(DEST, ALL_DIRECTIONS.UP)
                );
                const expected = [
                    ORIGIN,
                    [ORIGIN[0], ORIGIN[1] - offset],
                    [DEST[0] + offset, ORIGIN[1] - offset],
                    [DEST[0] + offset, DEST[1] - offset],
                    [DEST[0], DEST[1] - offset],
                    DEST
                ];
                assert.deepStrictEqual(result, expected);
            });
            
        });

        describe("Opposite direction inwards", () => {
            const offset = IMAGE_SIZE/2;

            /*
            -----.
                 |
            .----'
            |
            '-----
            */
            it("Right, up, left, up, right", () => {
                const DEST = [0, -100];
                const result = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                    anchor(DEST, ALL_DIRECTIONS.LEFT)
                );
                const expected = [
                    ORIGIN,
                    [ORIGIN[0] + offset, ORIGIN[1]],
                    [ORIGIN[0] + offset, (ORIGIN[1] + DEST[1])/2],
                    [DEST[0] - offset, (ORIGIN[1] + DEST[1])/2],
                    [DEST[0] - offset, DEST[1]],
                    DEST
                ];
                assert.deepStrictEqual(result, expected);
            });

            it("Up, right, down, right, up", () => {
                const DEST = [100, 10];
                const result = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                    anchor(DEST, ALL_DIRECTIONS.DOWN)
                );
                const expected = [
                    ORIGIN,
                    [ORIGIN[0], ORIGIN[1] - offset],
                    [(ORIGIN[0] + DEST[0])/2, ORIGIN[1] - offset],
                    [(ORIGIN[0] + DEST[0])/2, DEST[1] + offset],
                    [DEST[0], DEST[1] + offset],
                    DEST
                ];
                assert.deepStrictEqual(result, expected);
            });

        });

        describe("Opposite direction outwards", () => {
            /*
            .-----.
            |     |
            |
            |
            |      |
            '------'
            */

            const offset = IMAGE_SIZE/2;

            it("Right, up, left, down, right", () => {
                const DEST = [-100, 10];
                const result = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.RIGHT), 
                    anchor(DEST, ALL_DIRECTIONS.LEFT)
                );
                const expected = [
                    ORIGIN,
                    [ORIGIN[0] + offset, ORIGIN[1]],
                    [ORIGIN[0] + offset, ORIGIN[1] - offset],
                    [DEST[0] - offset, ORIGIN[1] - offset],
                    [DEST[0] - offset, DEST[1]],
                    DEST
                ];
                assert.deepStrictEqual(result, expected);
            });

            it("Up, left, down, right, up", () => {
                const DEST = [10, 100];
                const result = planPolyLine(
                    anchor(ORIGIN, ALL_DIRECTIONS.UP), 
                    anchor(DEST, ALL_DIRECTIONS.DOWN)
                );
                const expected = [
                    ORIGIN,
                    [ORIGIN[0], ORIGIN[1] - offset],
                    [ORIGIN[0] - offset, ORIGIN[1] - offset],
                    [ORIGIN[0] - offset, DEST[1] + offset],
                    [DEST[0], DEST[1] + offset],
                    DEST
                ];
                assert.deepStrictEqual(result, expected);
            });
        });
    });
})