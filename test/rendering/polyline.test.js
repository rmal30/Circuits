import Position from "../../public/scripts/rendering/position.js";
import {planPolyLine} from "../../public/scripts/rendering/polyline.js";

import assert from "assert";
import { DIRECTION_DELTAS } from "../../public/scripts/rendering/geometry.js";

const padding = 20;

describe("Polyline planning", () => {
    const ORIGIN = new Position(0, 0);
    const anchor = (pos, dir) => {
        return {
            pos: pos, 
            direction: dir
        }
    };

    describe("No direction for both points", () => {
        it("Both no direction", () => {
            const DEST = new Position(100, 200);
            const result = planPolyLine(anchor(ORIGIN, null), anchor(DEST, null), 20);
            assert.deepStrictEqual(result, [
                ORIGIN,
                new Position(ORIGIN.x, DEST.y),
                DEST
            ]);
        });
    });

    describe("Origin point has no direction", () => {
        describe("Straight line", () => {
            it("East", () => {
                const DEST = new Position(100, 0);
                const result = planPolyLine(
                    anchor(ORIGIN, null), 
                    anchor(DEST, DIRECTION_DELTAS.LEFT),
                    padding
                );
                assert.deepStrictEqual(result, [ORIGIN, DEST]);
            });

            it("West", () => {
                const DEST = new Position(-100, 0);
                const result = planPolyLine(
                    anchor(ORIGIN, null), 
                    anchor(DEST, DIRECTION_DELTAS.RIGHT),
                    padding
                );
                assert.deepStrictEqual(result, [ORIGIN, DEST]);
            });

            it("North", () => {
                const DEST = new Position(0, -100);
                const result = planPolyLine(
                    anchor(ORIGIN, null), 
                    anchor(DEST, DIRECTION_DELTAS.DOWN),
                    padding
                );
                assert.deepStrictEqual(result, [ORIGIN, DEST]);
            });

            it("South", () => {
                const DEST = new Position(0, 100);
                const result = planPolyLine(
                    anchor(ORIGIN, null), 
                    anchor(DEST, DIRECTION_DELTAS.UP),
                    padding
                );
                assert.deepStrictEqual(result, [ORIGIN, DEST]);
            });
        });

        describe("Two lines", () => {
            it("North east", () => {
                const DEST = new Position(100, -100);
                const result1 = planPolyLine(
                    anchor(ORIGIN, null), 
                    anchor(DEST, DIRECTION_DELTAS.DOWN),
                    padding
                );
                assert.deepStrictEqual(result1, [
                    ORIGIN, 
                    new Position(DEST.x, ORIGIN.y),
                    DEST
                ]);

                const result2 = planPolyLine(
                    anchor(ORIGIN, null), 
                    anchor(DEST, DIRECTION_DELTAS.LEFT),
                    padding
                );
                assert.deepStrictEqual(result2, [
                    ORIGIN, 
                    new Position(ORIGIN.x, DEST.y),
                    DEST
                ]);
            });

        });
        
        describe("Three lines", () => {
            it("North east", () => {
                const DEST = new Position(100, -100);
                const result1 = planPolyLine(
                    anchor(ORIGIN, null), 
                    anchor(DEST, DIRECTION_DELTAS.UP),
                    padding
                );
                assert.deepStrictEqual(result1, [
                    ORIGIN, 
                    new Position(ORIGIN.x, DEST.y - padding),
                    DEST.offset(0, -padding),
                    DEST
                ]);

                const result2 = planPolyLine(
                    anchor(ORIGIN, null), 
                    anchor(DEST, DIRECTION_DELTAS.RIGHT),
                    padding
                );
                assert.deepStrictEqual(result2, [
                    ORIGIN, 
                    new Position(DEST.x + padding, ORIGIN.y),
                    DEST.offset(padding, 0),
                    DEST
                ]);
            });
        });

        describe("Four lines", () => {
            it("ENE", () => {
                const DEST = new Position(100, -10);
                const result = planPolyLine(
                    anchor(ORIGIN, null), 
                    anchor(DEST, DIRECTION_DELTAS.RIGHT),
                    padding
                );
                assert.deepStrictEqual(result, [
                    ORIGIN,
                    new Position(ORIGIN.x, DEST.y - padding),
                    DEST.offset(padding, -padding),
                    DEST.offset(padding, 0),
                    DEST
                ]);
            });

            it("NNE", () => {
                const DEST = new Position(10, -100);
                const result = planPolyLine(
                    anchor(ORIGIN, null), 
                    anchor(DEST, DIRECTION_DELTAS.UP),
                    padding
                );
                assert.deepStrictEqual(result, [
                    ORIGIN,
                    new Position(DEST.x - padding, ORIGIN.y),
                    DEST.offset(-padding, -padding),
                    DEST.offset(0, -padding),
                    DEST
                ]);
            });
        });
    });

    describe("Destination point has no direction", () => {
        describe("Straight line", () => {
            it("East", () => {
                const DEST = new Position(100, 0);
                const result = planPolyLine(
                    anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                    anchor(DEST, null),
                    padding
                );
                assert.deepStrictEqual(result, [ORIGIN, DEST]);
            });

            it("West", () => {
                const DEST = new Position(-100, 0);
                const result = planPolyLine(
                    anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                    anchor(DEST, null),
                    padding
                );
                assert.deepStrictEqual(result, [ORIGIN, DEST]);
            });

            it("North", () => {
                const DEST = new Position(0, -100);
                const result = planPolyLine(
                    anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                    anchor(DEST, null),
                    padding
                );
                assert.deepStrictEqual(result, [ORIGIN, DEST]);
            });

            it("South", () => {
                const DEST = new Position(0, 100);
                const result = planPolyLine(
                    anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                    anchor(DEST, null),
                    padding
                );
                assert.deepStrictEqual(result, [ORIGIN, DEST]);
            });
        });

        describe("Two lines", () => {
            it("North east", () => {
                const DEST = new Position(100, -100);
                const result1 = planPolyLine(
                    anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                    anchor(DEST, null),
                    padding
                );
                assert.deepStrictEqual(result1, [
                    ORIGIN, 
                    new Position(DEST.x, ORIGIN.y),
                    DEST
                ]);

                const result2 = planPolyLine(
                    anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                    anchor(DEST, null),
                    padding
                );
                assert.deepStrictEqual(result2, [
                    ORIGIN, 
                    new Position(ORIGIN.x, DEST.y),
                    DEST
                ]);
            });

            it("North east", () => {
                const DEST = new Position(10, -10);
                const result1 = planPolyLine(
                    anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                    anchor(DEST, null),
                    padding
                );
                assert.deepStrictEqual(result1, [
                    ORIGIN, 
                    new Position(DEST.x, ORIGIN.y),
                    DEST
                ]);

                const result2 = planPolyLine(
                    anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                    anchor(DEST, null),
                    padding
                );
                assert.deepStrictEqual(result2, [
                    ORIGIN, 
                    new Position(ORIGIN.x, DEST.y),
                    DEST
                ]);
            });

        });
        
        describe("Three lines", () => {
            it("North east", () => {
                const DEST = new Position(100, -100);
                const result1 = planPolyLine(
                    anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                    anchor(DEST, null),
                    padding
                );
                assert.deepStrictEqual(result1, [
                    ORIGIN, 
                    ORIGIN.offset(0, padding),
                    new Position(DEST.x, ORIGIN.y + padding),
                    DEST
                ]);

                const result2 = planPolyLine(
                    anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                    anchor(DEST, null),
                    padding
                );
                assert.deepStrictEqual(result2, [
                    ORIGIN, 
                    ORIGIN.offset(-padding, 0),
                    new Position(ORIGIN.x - padding, DEST.y),
                    DEST
                ]);
            });
        });

        describe("Four lines", () => {
            it("ENE", () => {
                const DEST = new Position(100, -10);
                const result = planPolyLine(
                    anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                    anchor(DEST, null),
                    padding
                );
                assert.deepStrictEqual(result, [
                    ORIGIN,
                    ORIGIN.offset(-padding, 0),
                    ORIGIN.offset(-padding, -padding),
                    new Position(DEST.x, ORIGIN.y - padding),
                    DEST
                ]);
            });

            it("NNE", () => {
                const DEST = new Position(10, -100);
                const result = planPolyLine(
                    anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                    anchor(DEST, null),
                    padding
                );
                assert.deepStrictEqual(result, [
                    ORIGIN,
                    ORIGIN.offset(0, padding),
                    ORIGIN.offset(-padding, padding),
                    new Position(ORIGIN.x - padding, DEST.y),
                    DEST
                ]);
            });
        });
    });


    describe("Both have directions", () => {
        describe("Opposite directions", () => {
            describe("Long straight lines", () => {
                const expected = (dest) => [ORIGIN, dest];

                it("East", () => {
                    const DEST1 = new Position(100, 0);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST1, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    assert.deepStrictEqual(result1, expected(DEST1));
                });
                
    
                it("West", () => {
                    const DEST2 = new Position(-100, 0);
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST2, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    assert.deepStrictEqual(result2, expected(DEST2));
                });
                
                it("South", () => {
                    const DEST3 = new Position(0, 100);
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST3, DIRECTION_DELTAS.UP),
                        padding
                    );
                    assert.deepStrictEqual(result3, expected(DEST3));
                });
    
                
                it("North", () => {
                    const DEST4 = new Position(0, -100);
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST4, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    assert.deepStrictEqual(result4, expected(DEST4));
                });
            });

            describe("Short straight lines", () => {
                it("East", () => {
                    const DEST = new Position(10, 0);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );

                    const expected = [ORIGIN, DEST];
                    assert.deepStrictEqual(result1, expected);
                });
        
                it("West", () => {
                    const DEST = new Position(-10, 0);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    
                    const expected = [ORIGIN, DEST];
                    assert.deepStrictEqual(result1, expected);
                });
        
                it("South", () => {
                    const DEST = new Position(0, 10);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
        
                    const expected = [ORIGIN, DEST];
                    assert.deepStrictEqual(result1, expected);
                });
        
                it("North", () => {
                    const DEST = new Position(0, -10);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const expected = [ORIGIN, DEST];
                    assert.deepStrictEqual(result1, expected);
                });
            });
            
            describe("S shape", () => {
                const offset = padding;
    
                /*
                -----.
                    |
                .----'
                |
                '-----
                */
                it("Right, up, left, up, right", () => {
                    const DEST = new Position(0, -100);
                    const result = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const expected = [
                        ORIGIN,
                        new Position(ORIGIN.x + offset, ORIGIN.y),
                        new Position(ORIGIN.x + offset, (ORIGIN.y + DEST.y)/2),
                        new Position(DEST.x - offset, (ORIGIN.y + DEST.y)/2),
                        new Position(DEST.x - offset, DEST.y),
                        DEST
                    ];
                    assert.deepStrictEqual(result, expected);
                });
    
                it("Up, right, down, right, up", () => {
                    const DEST = new Position(100, 10);
                    const result = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const expected = [
                        ORIGIN,
                        new Position(ORIGIN.x, ORIGIN.y - offset),
                        new Position((ORIGIN.x + DEST.x)/2, ORIGIN.y - offset),
                        new Position((ORIGIN.x + DEST.x)/2, DEST.y + offset),
                        new Position(DEST.x, DEST.y + offset),
                        DEST
                    ];
                    assert.deepStrictEqual(result, expected);
                });
    
            });

            describe("Opposite direction", () => {
                /*
                ---.
                    |
                    '---
                */
    
                it("Up, right, up", () => {
                    const DEST = new Position(100, -100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    
                    const expected1 = [
                        ORIGIN, 
                        new Position(ORIGIN.x, (ORIGIN.y + DEST.y)/2),
                        new Position(DEST.x, (ORIGIN.y + DEST.y)/2),
                        DEST
                    ];
    
                    assert.deepStrictEqual(result1, expected1);
                });
    
                it("Vertical close by", () => {
                    const DEST = new Position(10, -10);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    
                    const expected1 = [
                        ORIGIN, 
                        new Position(ORIGIN.x, (ORIGIN.y + DEST.y)/2),
                        new Position(DEST.x, (ORIGIN.y + DEST.y)/2),
                        DEST
                    ];
    
                    assert.deepStrictEqual(result1, expected1);
                });
        
                it("Up, left, up", () => {
                    const DEST = new Position(-100, -100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    
                    const expected1 = [
                        ORIGIN, 
                        new Position(ORIGIN.x, (ORIGIN.y + DEST.y)/2),
                        new Position(DEST.x, (ORIGIN.y + DEST.y)/2),
                        DEST
                    ];
    
                    assert.deepStrictEqual(result1, expected1);
                });
        
                it("Down, right, down", () => {
                    const DEST = new Position(100, 100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    
                    const expected1 = [
                        ORIGIN, 
                        new Position(ORIGIN.x, (ORIGIN.y + DEST.y)/2),
                        new Position(DEST.x, (ORIGIN.y + DEST.y)/2),
                        DEST
                    ];
    
                    assert.deepStrictEqual(result1, expected1);
                });
        
                it("Down, left, down", () => {
                    const DEST = new Position(-100, 100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    
                    const expected1 = [
                        ORIGIN, 
                        new Position(ORIGIN.x, (ORIGIN.y + DEST.y)/2),
                        new Position(DEST.x, (ORIGIN.y + DEST.y)/2),
                        DEST
                    ];
    
                    assert.deepStrictEqual(result1, expected1);
                });
        
                it("Left, up, left", () => {
                    const DEST = new Position(-100, -100);
                    const result = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    
                    const expected = [
                        ORIGIN, 
                        new Position((ORIGIN.x + DEST.x)/2, ORIGIN.y),
                        new Position((ORIGIN.x + DEST.x)/2, DEST.y),
                        DEST
                    ];
    
                    assert.deepStrictEqual(result, expected);
                });
        
                it("Left, down, left", () => {
                    const DEST = new Position(-100, 100);
                    const result = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    
                    const expected = [
                        ORIGIN, 
                        new Position((ORIGIN.x + DEST.x)/2, ORIGIN.y),
                        new Position((ORIGIN.x + DEST.x)/2, DEST.y),
                        DEST
                    ];
    
                    assert.deepStrictEqual(result, expected);
                });
        
                it("Right, up, right", () => {
                    const DEST = new Position(100, -100);
                    const result = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    
                    const expected = [
                        ORIGIN, 
                        new Position((ORIGIN.x + DEST.x)/2, ORIGIN.y),
                        new Position((ORIGIN.x + DEST.x)/2, DEST.y),
                        DEST
                    ];
    
                    assert.deepStrictEqual(result, expected);
                });
        
                it("Right, down, right", () => {
                    const DEST = new Position(100, 100);
                    const result = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    
                    const expected = [
                        ORIGIN, 
                        new Position((ORIGIN.x + DEST.x)/2, ORIGIN.y),
                        new Position((ORIGIN.x + DEST.x)/2, DEST.y),
                        DEST
                    ];
    
                    assert.deepStrictEqual(result, expected);
                });
    
                it("Horizontal close by", () => {
                    const DEST = new Position(10, 10);
                    const result = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    
                    const expected = [
                        ORIGIN, 
                        new Position((ORIGIN.x + DEST.x)/2, ORIGIN.y),
                        new Position((ORIGIN.x + DEST.x)/2, DEST.y),
                        DEST
                    ];
    
                    assert.deepStrictEqual(result, expected);
                });
            });
            
            describe("C shape", () => {
                /*
                .-----.
                |     |
                |
                |
                |      |
                '------'
                */

                it("Right, up, left, down, right", () => {
                    const DEST = new Position(-100, 10);
                    const result = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const expected = [
                        ORIGIN,
                        new Position(ORIGIN.x + padding, ORIGIN.y),
                        new Position(ORIGIN.x + padding, ORIGIN.y - padding),
                        new Position(DEST.x - padding, ORIGIN.y - padding),
                        new Position(DEST.x - padding, DEST.y),
                        DEST
                    ];
                    assert.deepStrictEqual(result, expected);
                });

                it("Up, left, down, right, up", () => {
                    const DEST = new Position(10, 100);
                    const result = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const expected = [
                        ORIGIN,
                        new Position(ORIGIN.x, ORIGIN.y - padding),
                        new Position(ORIGIN.x - padding, ORIGIN.y - padding),
                        new Position(ORIGIN.x - padding, DEST.y + padding),
                        new Position(DEST.x, DEST.y + padding),
                        DEST
                    ];
                    assert.deepStrictEqual(result, expected);
                });
            });
        });

        describe("Same directions", () => {
            /*
            
                 |
            |    |
            '----'
            */
            describe("U shape", () => {
                it("Up, right, down", () => {
                    const DEST1 = new Position(100, 100);
                    const DEST2 = new Position(100, -100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST1, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST2, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const expected1 = [
                        ORIGIN, 
                        new Position(ORIGIN.x, ORIGIN.y - padding),
                        new Position(DEST1.x, ORIGIN.y - padding),
                        DEST1
                    ];

                    const expected2 = [
                        ORIGIN, 
                        new Position(ORIGIN.x, DEST2.y - padding),
                        new Position(DEST2.x, DEST2.y - padding),
                        DEST2
                    ];
                    assert.deepStrictEqual(result1, expected1);
                    assert.deepStrictEqual(result2, expected2);
                });

                it("Up, left, down", () => {
                    const DEST1 = new Position(-100, 100);
                    const DEST2 = new Position(-100, -100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST1, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST2, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const expected1 = [
                        ORIGIN, 
                        new Position(ORIGIN.x, ORIGIN.y - padding),
                        new Position(DEST1.x, ORIGIN.y - padding),
                        DEST1
                    ];

                    const expected2 = [
                        ORIGIN, 
                        new Position(ORIGIN.x, DEST2.y - padding),
                        new Position(DEST2.x, DEST2.y - padding),
                        DEST2
                    ];
                    assert.deepStrictEqual(result1, expected1);
                    assert.deepStrictEqual(result2, expected2);
                });

                it("Down, right, up", () => {
                    const DEST1 = new Position(100, 100);
                    const DEST2 = new Position(100, -100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST1, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST2, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const expected1 = [
                        ORIGIN, 
                        new Position(ORIGIN.x, DEST1.y + padding),
                        new Position(DEST1.x, DEST1.y + padding),
                        DEST1
                    ];

                    const expected2 = [
                        ORIGIN, 
                        new Position(ORIGIN.x, ORIGIN.y + padding),
                        new Position(DEST2.x, ORIGIN.y + padding),
                        DEST2
                    ];
                    assert.deepStrictEqual(result1, expected1);
                    assert.deepStrictEqual(result2, expected2);
                });

                it("Down, left, up", () => {
                    const DEST1 = new Position(-100, 100);
                    const DEST2 = new Position(-100, -100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST1, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST2, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const expected1 = [
                        ORIGIN, 
                        new Position(ORIGIN.x, DEST1.y + padding),
                        new Position(DEST1.x, DEST1.y + padding),
                        DEST1
                    ];

                    const expected2 = [
                        ORIGIN, 
                        new Position(ORIGIN.x, ORIGIN.y + padding),
                        new Position(DEST2.x, ORIGIN.y + padding),
                        DEST2
                    ];
                    assert.deepStrictEqual(result1, expected1);
                    assert.deepStrictEqual(result2, expected2);
                });

                it("Left, up, right", () => {
                    const DEST1 = new Position(-100, -100);
                    const DEST2 = new Position(100, -100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST1, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST2, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const expected1 = [
                        ORIGIN, 
                        new Position(DEST1.x - padding, ORIGIN.y),
                        new Position(DEST1.x - padding, DEST1.y),
                        DEST1
                    ];

                    const expected2 = [
                        ORIGIN, 
                        new Position(ORIGIN.x - padding, ORIGIN.y),
                        new Position(ORIGIN.x - padding, DEST2.y),
                        DEST2
                    ];
                    assert.deepStrictEqual(result1, expected1);
                    assert.deepStrictEqual(result2, expected2);
                });

                it("Left, down, right", () => {
                    const DEST1 = new Position(-100, 100);
                    const DEST2 = new Position(100, 100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST1, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST2, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const expected1 = [
                        ORIGIN, 
                        new Position(DEST1.x - padding, ORIGIN.y),
                        new Position(DEST1.x - padding, DEST1.y),
                        DEST1
                    ];

                    const expected2 = [
                        ORIGIN, 
                        new Position(ORIGIN.x - padding, ORIGIN.y),
                        new Position(ORIGIN.x - padding, DEST2.y),
                        DEST2
                    ];
                    assert.deepStrictEqual(result1, expected1);
                    assert.deepStrictEqual(result2, expected2);
                });
        
                it("Right, up, left", () => {
                    const DEST1 = new Position(-100, -100);
                    const DEST2 = new Position(100, -100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST1, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST2, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const expected1 = [
                        ORIGIN, 
                        new Position(ORIGIN.x + padding, ORIGIN.y),
                        new Position(ORIGIN.x + padding, DEST1.y),
                        DEST1
                    ];

                    const expected2 = [
                        ORIGIN, 
                        new Position(DEST2.x + padding, ORIGIN.y),
                        new Position(DEST2.x + padding, DEST2.y),
                        DEST2
                    ];
                    assert.deepStrictEqual(result1, expected1);
                    assert.deepStrictEqual(result2, expected2);
                });

                it("Right, down, left", () => {
                    const DEST1 = new Position(-100, 100);
                    const DEST2 = new Position(100, 100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST1, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST2, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const expected1 = [
                        ORIGIN, 
                        new Position(ORIGIN.x + padding, ORIGIN.y),
                        new Position(ORIGIN.x + padding, DEST1.y),
                        DEST1
                    ];

                    const expected2 = [
                        ORIGIN, 
                        new Position(DEST2.x + padding, ORIGIN.y),
                        new Position(DEST2.x + padding, DEST2.y),
                        DEST2
                    ];
                    assert.deepStrictEqual(result1, expected1);
                    assert.deepStrictEqual(result2, expected2);
                });
            });

            /*
            .---.
            |   |
            |
            |
            '---.
                |
            */
            describe("G shape", () => {

                it("Right, up, right, down, left", () => {
                    const DEST = new Position(100, 10);
                    const result = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const expected = [
                        ORIGIN,
                        new Position(ORIGIN.x + padding, ORIGIN.y),
                        new Position(ORIGIN.x + padding, DEST.y - padding),
                        new Position(DEST.x + padding, DEST.y - padding),
                        new Position(DEST.x + padding, DEST.y),
                        DEST
                    ];
                    assert.deepStrictEqual(result, expected);
                });
    
                it("Right, down, right, up, left", () => {
                    const DEST = new Position(100, -10);
                    const result = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const expected = [
                        ORIGIN,
                        new Position(ORIGIN.x + padding, ORIGIN.y),
                        new Position(ORIGIN.x + padding, DEST.y + padding),
                        new Position(DEST.x + padding, DEST.y + padding),
                        new Position(DEST.x + padding, DEST.y),
                        DEST
                    ];
                    assert.deepStrictEqual(result, expected);
                });
    
                it("Up, left, up, right, down", () => {
                    const DEST = new Position(10, -100);
                    const result = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const expected = [
                        ORIGIN,
                        new Position(ORIGIN.x, ORIGIN.y - padding),
                        new Position(DEST.x - padding, ORIGIN.y - padding),
                        new Position(DEST.x - padding, DEST.y - padding),
                        DEST.offset(0, -padding),
                        DEST
                    ];
                    assert.deepStrictEqual(result, expected);
                });
    
                it("Up, right, up, left, down", () => {
                    const DEST = new Position(-10, -100);
                    const result = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const expected = [
                        ORIGIN,
                        new Position(ORIGIN.x, ORIGIN.y - padding),
                        new Position(DEST.x + padding, ORIGIN.y - padding),
                        new Position(DEST.x + padding, DEST.y - padding),
                        new Position(DEST.x, DEST.y - padding),
                        DEST
                    ];
                    assert.deepStrictEqual(result, expected);
                });
                
            })
        });

        describe("Orthogonal directions", () => {
            describe("Short straight lines", () => {
                it("Right Line", () => {
                    const DEST = new Position(10, 0);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result5 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const expected = [ORIGIN, DEST];
                    assert.deepStrictEqual(result1, expected);
                    assert.deepStrictEqual(result2, expected);
                    assert.deepStrictEqual(result3, expected);
                    assert.deepStrictEqual(result4, expected);
                    assert.deepStrictEqual(result5, expected);
                });
        
                it("Left line", () => {
                    const DEST = new Position(-10, 0);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result5 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const expected = [ORIGIN, DEST];
                    assert.deepStrictEqual(result1, expected);
                    assert.deepStrictEqual(result2, expected);
                    assert.deepStrictEqual(result3, expected);
                    assert.deepStrictEqual(result4, expected);
                    assert.deepStrictEqual(result5, expected);
                });
        
                it("Down line", () => {
                    const DEST = new Position(0, 10);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result5 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
        
                    const expected = [ORIGIN, DEST];
                    assert.deepStrictEqual(result1, expected);
                    assert.deepStrictEqual(result2, expected);
                    assert.deepStrictEqual(result3, expected);
                    assert.deepStrictEqual(result4, expected);
                    assert.deepStrictEqual(result5, expected);
                });
        
                it("Up line", () => {
                    const DEST = new Position(0, -10);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const result5 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const expected = [ORIGIN, DEST];
                    assert.deepStrictEqual(result1, expected);
                    assert.deepStrictEqual(result2, expected);
                    assert.deepStrictEqual(result3, expected);
                    assert.deepStrictEqual(result4, expected);
                    assert.deepStrictEqual(result5, expected);
                });
            });

            describe("No reversals", () => {
                it("North east", () => {
                    const DESTS = [
                        new Position(10, -10),
                        new Position(100, -100)
                    ];
                    
                    for(const dest of DESTS) {
                        const result1 = planPolyLine(
                            anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                            anchor(dest, DIRECTION_DELTAS.LEFT),
                            padding
                        );
                        
                        const expected1 = [ORIGIN, new Position(ORIGIN.x, dest.y), dest];
                        assert.deepStrictEqual(result1, expected1);
        
                        const result2 = planPolyLine(
                            anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                            anchor(dest, DIRECTION_DELTAS.DOWN),
                            padding
                        );
                        const expected2 = [ORIGIN, new Position(dest.x, ORIGIN.y), dest];
                        assert.deepStrictEqual(result2, expected2);
                    }
                    
                });
        
                it("North west", () => {
                    const DESTS = [
                        new Position(-10, -10),
                        new Position(-100, -100)
                    ];
                    
                    for(const dest of DESTS) {
                        const result1 = planPolyLine(
                            anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                            anchor(dest, DIRECTION_DELTAS.RIGHT),
                            padding
                        );
                        const expected1 = [ORIGIN, new Position(ORIGIN.x, dest.y), dest];
                        assert.deepStrictEqual(result1, expected1);
        
                        const result2 = planPolyLine(
                            anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                            anchor(dest, DIRECTION_DELTAS.DOWN),
                            padding
                        );
                        const expected2 = [ORIGIN, new Position(dest.x, ORIGIN.y), dest];
                        assert.deepStrictEqual(result2, expected2);
                    }
                });
        
                it("South east", () => {
                    const DESTS = [
                        new Position(10, 10),
                        new Position(100, 100)
                    ];
                    
                    for(const dest of DESTS) {
                        const result1 = planPolyLine(
                            anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                            anchor(dest, DIRECTION_DELTAS.LEFT),
                            padding
                        );
                        const expected1 = [ORIGIN, new Position(ORIGIN.x, dest.y), dest];
                        assert.deepStrictEqual(result1, expected1);
        
                        const expected2 = [ORIGIN, new Position(dest.x, ORIGIN.y), dest];
                        const result2 = planPolyLine(
                            anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                            anchor(dest, DIRECTION_DELTAS.UP),
                            padding
                        );
                        assert.deepStrictEqual(result2, expected2);
                    }
        
                });
        
                it("South west", () => {
                    const DESTS = [
                        new Position(-10, 10),
                        new Position(-100, 100)
                    ];
        
                    for(const dest of DESTS) {
                        const result1 = planPolyLine(
                            anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                            anchor(dest, DIRECTION_DELTAS.RIGHT),
                            padding
                        );
                        const expected1 = [ORIGIN, new Position(ORIGIN.x, dest.y), dest];
                        assert.deepStrictEqual(result1, expected1);
        
                        const result2 = planPolyLine(
                            anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                            anchor(dest, DIRECTION_DELTAS.UP),
                            padding
                        );
                        const expected2 = [ORIGIN, new Position(dest.x, ORIGIN.y), dest];
                        assert.deepStrictEqual(result2, expected2);
                    }
                });
            });

            /*
            .------.
            |      |
            |
            '--
            */
            describe("Both reversed", () => {
            
                it("North east", () => {
                    const NORTH_EAST_DEST = new Position(100, -100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(NORTH_EAST_DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const expected1 = [
                        ORIGIN,
                        ORIGIN.offset(-padding, 0),
                        new Position(ORIGIN.x - padding, NORTH_EAST_DEST.y - padding),
                        NORTH_EAST_DEST.offset(0, -padding),
                        NORTH_EAST_DEST
                    ];
                    assert.deepStrictEqual(result1, expected1);
    
                    
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(NORTH_EAST_DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const expected2 = [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        new Position(NORTH_EAST_DEST.x + padding, ORIGIN.y + padding),
                        NORTH_EAST_DEST.offset(padding, 0),
                        NORTH_EAST_DEST
                    ];
                    assert.deepStrictEqual(result2, expected2);
                })
                
                it("South east", () => {
                    const SOUTH_EAST_DEST = new Position(100, 100);
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(SOUTH_EAST_DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const expected3 = [
                        ORIGIN,
                        ORIGIN.offset(-padding, 0),
                        new Position(ORIGIN.x - padding, SOUTH_EAST_DEST.y + padding),
                        SOUTH_EAST_DEST.offset(0, padding),
                        SOUTH_EAST_DEST
                    ];
                    assert.deepStrictEqual(result3, expected3);
        
        
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(SOUTH_EAST_DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const expected4 = [
                        ORIGIN,
                        ORIGIN.offset(0, -padding),
                        new Position(SOUTH_EAST_DEST.x + padding, ORIGIN.y - padding),
                        SOUTH_EAST_DEST.offset(padding, 0),
                        SOUTH_EAST_DEST
                    ];
                    assert.deepStrictEqual(result4, expected4);
                });
               
                it("North west", () => {
    
                    const NORTH_WEST_DEST = new Position(-100, -100);
                    const result5 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(NORTH_WEST_DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const expected5 = [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        new Position(ORIGIN.x + padding, NORTH_WEST_DEST.y - padding),
                        NORTH_WEST_DEST.offset(0, -padding),
                        NORTH_WEST_DEST
                    ];
                    assert.deepStrictEqual(result5, expected5);
    
    
                    const result6 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(NORTH_WEST_DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const expected6 = [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        new Position(NORTH_WEST_DEST.x - padding, ORIGIN.y + padding),
                        NORTH_WEST_DEST.offset(-padding, 0),
                        NORTH_WEST_DEST
                    ];
                    assert.deepStrictEqual(result6, expected6);
                });
                
                it("South west", () => {
                    const DEST4 = new Position(-100, 100);
                    const result7 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST4, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const expected7 = [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        new Position(ORIGIN.x + padding, DEST4.y + padding),
                        DEST4.offset(0, padding),
                        DEST4
                    ];
                    assert.deepStrictEqual(result7, expected7);
    
    
                    const result8 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST4, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const expected8 = [
                        ORIGIN,
                        ORIGIN.offset(0, -padding),
                        new Position(DEST4.x - padding, ORIGIN.y - padding),
                        DEST4.offset(-padding, 0),
                        DEST4
                    ];
                    assert.deepStrictEqual(result8, expected8);
                });
            });

            /*
                       |
                       |
                .------'
                |
                |
                '--
            */
            describe("One reversed, long", () => {
                
                it("North east", () => {
                    const DEST = new Position(100, -100);

                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );

                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );

                    const midX = (DEST.x + ORIGIN.x) / 2;
                    const midY = (DEST.y + ORIGIN.y) / 2;
                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(ORIGIN.x, midY),
                        new Position(padding + DEST.x, midY),
                        DEST.offset(padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        new Position(midX, ORIGIN.y + padding),
                        new Position(midX, DEST.y),
                        DEST
                    ]);
                    assert.deepStrictEqual(result3, [
                        ORIGIN,
                        new Position(midX, ORIGIN.y),
                        new Position(midX, DEST.y - padding),
                        DEST.offset(0, - padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result4, [
                        ORIGIN,
                        ORIGIN.offset(- padding, 0),
                        new Position(ORIGIN.x - padding, midY),
                        new Position(DEST.x, midY),
                        DEST
                    ]);
                });

                it("North west", () => {
                    const DEST = new Position(-100, -100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );

                    const midX = (DEST.x + ORIGIN.x) / 2;
                    const midY = (DEST.y + ORIGIN.y) / 2;

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(ORIGIN.x, midY),
                        new Position(-padding + DEST.x, midY),
                        DEST.offset(-padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        new Position(midX, ORIGIN.y + padding),
                        new Position(midX, DEST.y),
                        DEST
                    ]);
                    assert.deepStrictEqual(result3, [
                        ORIGIN,
                        new Position(midX, ORIGIN.y),
                        new Position(midX, DEST.y - padding),
                        DEST.offset(0, - padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result4, [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        new Position(ORIGIN.x + padding, midY),
                        new Position(DEST.x, midY),
                        DEST
                    ]);
                });

                it("South east", () => {
                    const DEST = new Position(100, 100);

                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );

                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );

                    const midX = (DEST.x + ORIGIN.x) / 2;
                    const midY = (DEST.y + ORIGIN.y) / 2;
                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(ORIGIN.x, midY),
                        new Position(padding + DEST.x, midY),
                        DEST.offset(padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(0, -padding),
                        new Position(midX, ORIGIN.y - padding),
                        new Position(midX, DEST.y),
                        DEST
                    ]);
                    assert.deepStrictEqual(result3, [
                        ORIGIN,
                        new Position(midX, ORIGIN.y),
                        new Position(midX, DEST.y + padding),
                        DEST.offset(0, padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result4, [
                        ORIGIN,
                        ORIGIN.offset(- padding, 0),
                        new Position(ORIGIN.x - padding, midY),
                        new Position(DEST.x, midY),
                        DEST
                    ]);
                });

                it("North west", () => {
                    const DEST = new Position(-100, 100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );

                    const midX = (DEST.x + ORIGIN.x) / 2;
                    const midY = (DEST.y + ORIGIN.y) / 2;

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(ORIGIN.x, midY),
                        new Position(-padding + DEST.x, midY),
                        DEST.offset(-padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(0, - padding),
                        new Position(midX, ORIGIN.y - padding),
                        new Position(midX, DEST.y),
                        DEST
                    ]);
                    assert.deepStrictEqual(result3, [
                        ORIGIN,
                        new Position(midX, ORIGIN.y),
                        new Position(midX, DEST.y + padding),
                        DEST.offset(0, padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result4, [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        new Position(ORIGIN.x + padding, midY),
                        new Position(DEST.x, midY),
                        DEST
                    ]);
                });
            });

            describe("One reversed, short", () => {
                it("NNE", () => {
                    const DEST = new Position(10, -100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(DEST.x + padding, ORIGIN.y),
                        DEST.offset(padding, - padding),
                        DEST.offset(0, - padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        ORIGIN.offset(-padding, padding),
                        new Position(ORIGIN.x - padding, DEST.y),
                        DEST
                    ]);
                });
                
                it("ENE", () => {
                    const DEST = new Position(100, -10);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(ORIGIN.x, DEST.y - padding),
                        DEST.offset(padding, -padding),
                        DEST.offset(padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(-padding, 0),
                        ORIGIN.offset(-padding, padding),
                        new Position(DEST.x, ORIGIN.y + padding),
                        DEST
                    ]);
                });
                
                it("NNW", () => {
                    const DEST = new Position(-10, -100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(DEST.x - padding, ORIGIN.y),
                        DEST.offset(-padding, - padding),
                        DEST.offset(0, - padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        ORIGIN.offset(padding, padding),
                        new Position(ORIGIN.x + padding, DEST.y),
                        DEST
                    ]);
                });
                
                it("WNW", () => {
                    const DEST = new Position(-100, -10);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(ORIGIN.x, DEST.y - padding),
                        DEST.offset(-padding, -padding),
                        DEST.offset(-padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        ORIGIN.offset(padding, padding),
                        new Position(DEST.x, ORIGIN.y + padding),
                        DEST
                    ]);
                });
                
                it("SSE", () => {
                    const DEST = new Position(10, 100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(DEST.x + padding, ORIGIN.y),
                        DEST.offset(padding, padding),
                        DEST.offset(0, padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(0, -padding),
                        ORIGIN.offset(-padding, -padding),
                        new Position(ORIGIN.x - padding, DEST.y),
                        DEST
                    ]);
                });
                
                it("ESE", () => {
                    const DEST = new Position(100, 10);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(ORIGIN.x, DEST.y + padding),
                        DEST.offset(padding, padding),
                        DEST.offset(padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(-padding, 0),
                        ORIGIN.offset(-padding, - padding),
                        new Position(DEST.x, ORIGIN.y - padding),
                        DEST
                    ]);
                });
                
                it("SSW", () => {
                    const DEST = new Position(-10, 100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(DEST.x - padding, ORIGIN.y),
                        DEST.offset(-padding, padding),
                        DEST.offset(0, padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(0, - padding),
                        ORIGIN.offset(padding, - padding),
                        new Position(ORIGIN.x + padding, DEST.y),
                        DEST
                    ]);
                });
                
                it("WSW", () => {
                    const DEST = new Position(-100, 10);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(ORIGIN.x, DEST.y + padding),
                        DEST.offset(-padding, padding),
                        DEST.offset(-padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        ORIGIN.offset(padding, - padding),
                        new Position(DEST.x, ORIGIN.y - padding),
                        DEST
                    ]);
                });
            });

            describe("None reversed, one side less than padding", () => {
                it("NNE", () => {
                    const DEST = new Position(10, -100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );

                    const midY = (DEST.y + ORIGIN.y) / 2;

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(ORIGIN.x, midY),
                        new Position(-padding + DEST.x, midY),
                        DEST.offset(-padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        new Position(ORIGIN.x + padding, midY),
                        new Position(DEST.x, midY),
                        DEST
                    ]);
                });

                it("ENE", () => {
                    const DEST = new Position(100, -10);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );

                    const midX = (DEST.x + ORIGIN.x) / 2;
                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        ORIGIN.offset(0, - padding),
                        new Position(midX, ORIGIN.y - padding),
                        new Position(midX, DEST.y),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        new Position(midX, ORIGIN.y),
                        new Position(midX, padding + DEST.y),
                        DEST.offset(0, padding),
                        DEST
                    ]);
                    
                });

                it("NNW", () => {
                    const DEST = new Position(-10, -100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );

                    const midY = (DEST.y + ORIGIN.y) / 2;

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(ORIGIN.x, midY),
                        new Position(padding + DEST.x, midY),
                        DEST.offset(padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(-padding, 0),
                        new Position(ORIGIN.x - padding, midY),
                        new Position(DEST.x, midY),
                        DEST
                    ]);
                });

                it("WNW", () => {
                    const DEST = new Position(-100, -10);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );

                    const midX = (DEST.x + ORIGIN.x) / 2;
                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        ORIGIN.offset(0, - padding),
                        new Position(midX, ORIGIN.y - padding),
                        new Position(midX, DEST.y),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        new Position(midX, ORIGIN.y),
                        new Position(midX, padding + DEST.y),
                        DEST.offset(0, padding),
                        DEST
                    ]);
                });

                it("SSE", () => {
                    const DEST = new Position(10, 100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );

                    const midY = (DEST.y + ORIGIN.y) / 2;

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(ORIGIN.x, midY),
                        new Position(-padding + DEST.x, midY),
                        DEST.offset(-padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        new Position(ORIGIN.x + padding, midY),
                        new Position(DEST.x, midY),
                        DEST
                    ]);
                });

                it("ESE", () => {
                    const DEST = new Position(100, 10);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );

                    const midX = (DEST.x + ORIGIN.x) / 2;
                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        new Position(midX, ORIGIN.y + padding),
                        new Position(midX, DEST.y),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        new Position(midX, ORIGIN.y),
                        new Position(midX, - padding + DEST.y),
                        DEST.offset(0, - padding),
                        DEST
                    ]);
                    
                });

                it("SSW", () => {
                    const DEST = new Position(-10, 100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );

                    const midY = (DEST.y + ORIGIN.y) / 2;

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(ORIGIN.x, midY),
                        new Position(padding + DEST.x, midY),
                        DEST.offset(padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(-padding, 0),
                        new Position(ORIGIN.x - padding, midY),
                        new Position(DEST.x, midY),
                        DEST
                    ]);
                });

                it("WSW", () => {
                    const DEST = new Position(-100, 10);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );

                    const midX = (DEST.x + ORIGIN.x) / 2;
                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        new Position(midX, ORIGIN.y + padding),
                        new Position(midX, DEST.y),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        new Position(midX, ORIGIN.y),
                        new Position(midX, - padding + DEST.y),
                        DEST.offset(0, - padding),
                        DEST
                    ]);
                });
            });

            describe("dx or dy = 0, towards", () => {
                it("North", () => {
                    const DEST = new Position(0, -100);
                    
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );

                    const midY = (DEST.y + ORIGIN.y) / 2;
                    

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(ORIGIN.x, midY),
                        new Position(-padding + DEST.x, midY),
                        DEST.offset(-padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        new Position(ORIGIN.x, midY),
                        new Position(padding + DEST.x, midY),
                        DEST.offset(padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result3, [
                        ORIGIN,
                        ORIGIN.offset( - padding, 0),
                        new Position(- padding + ORIGIN.x, midY),
                        new Position(DEST.x, midY),
                        DEST
                    ]);
                    assert.deepStrictEqual(result4, [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        new Position(ORIGIN.x + padding, midY),
                        new Position(DEST.x, midY),
                        DEST
                    ]);
                });

                it("South", () => {
                    const DEST = new Position(0, 100);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );

                    const midY = (DEST.y + ORIGIN.y) / 2;
                    
                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(ORIGIN.x, midY),
                        new Position(-padding + DEST.x, midY),
                        DEST.offset(-padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        new Position(ORIGIN.x, midY),
                        new Position(padding + DEST.x, midY),
                        DEST.offset(padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result3, [
                        ORIGIN,
                        ORIGIN.offset( - padding, 0),
                        new Position(- padding + ORIGIN.x, midY),
                        new Position(DEST.x, midY),
                        DEST
                    ]);
                    assert.deepStrictEqual(result4, [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        new Position(ORIGIN.x + padding, midY),
                        new Position(DEST.x, midY),
                        DEST
                    ]);
                });

                it("East", () => {
                    const DEST = new Position(100, 0);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );

                    const midX = (DEST.x + ORIGIN.x) / 2;
                    
                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(midX, ORIGIN.y),
                        new Position(midX, -padding + DEST.y),
                        DEST.offset(0, -padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        new Position(midX, ORIGIN.y),
                        new Position(midX, padding + DEST.y),
                        DEST.offset(0, padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result3, [
                        ORIGIN,
                        ORIGIN.offset(0, - padding),
                        new Position(midX, - padding + ORIGIN.y),
                        new Position(midX, DEST.y),
                        DEST
                    ]);
                    assert.deepStrictEqual(result4, [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        new Position(midX, ORIGIN.x + padding),
                        new Position(midX, DEST.y),
                        DEST
                    ]);
                });

                it("West", () => {
                    const DEST = new Position(-100, 0);
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );

                    const midX = (DEST.x + ORIGIN.x) / 2;
                    
                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        new Position(midX, ORIGIN.y),
                        new Position(midX, -padding + DEST.y),
                        DEST.offset(0, -padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        new Position(midX, ORIGIN.y),
                        new Position(midX, padding + DEST.y),
                        DEST.offset(0, padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result3, [
                        ORIGIN,
                        ORIGIN.offset(0, - padding),
                        new Position(midX, - padding + ORIGIN.y),
                        new Position(midX, DEST.y),
                        DEST
                    ]);
                    assert.deepStrictEqual(result4, [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        new Position(midX, ORIGIN.x + padding),
                        new Position(midX, DEST.y),
                        DEST
                    ]);
                });
            });

            describe("dx or dy == 0, away", () => {
                it("North", () => {
                    const DEST = new Position(0, -100);
                    
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        ORIGIN.offset(- padding, padding),
                        DEST.offset(-padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        ORIGIN.offset(padding, padding),
                        DEST.offset(padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result3, [
                        ORIGIN,
                        ORIGIN.offset( - padding, 0),
                        DEST.offset(- padding, - padding),
                        DEST.offset(0, -padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result4, [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        DEST.offset(padding, -padding),
                        DEST.offset(0, -padding),
                        DEST
                    ]);
                });

                it("South", () => {
                    const DEST = new Position(0, 100);
                    
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        ORIGIN.offset(0, -padding),
                        ORIGIN.offset(- padding, -padding),
                        DEST.offset(-padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(0, -padding),
                        ORIGIN.offset(padding, -padding),
                        DEST.offset(padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result3, [
                        ORIGIN,
                        ORIGIN.offset( - padding, 0),
                        DEST.offset(- padding, padding),
                        DEST.offset(0, padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result4, [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        DEST.offset(padding, padding),
                        DEST.offset(0, padding),
                        DEST
                    ]);
                });

                it("East", () => {
                    const DEST = new Position(100, 0);
                    
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        ORIGIN.offset(-padding, 0),
                        ORIGIN.offset(- padding, -padding),
                        DEST.offset(0, -padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(-padding, 0),
                        ORIGIN.offset(-padding, padding),
                        DEST.offset(0, padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result3, [
                        ORIGIN,
                        ORIGIN.offset(0, - padding),
                        DEST.offset(padding, - padding),
                        DEST.offset(padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result4, [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        DEST.offset(padding, padding),
                        DEST.offset(padding, 0),
                        DEST
                    ]);
                });

                it("West", () => {
                    const DEST = new Position(-100, 0);
                    
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        ORIGIN.offset(padding, -padding),
                        DEST.offset(0, -padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        ORIGIN.offset(padding, padding),
                        DEST.offset(0, padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result3, [
                        ORIGIN,
                        ORIGIN.offset(0, - padding),
                        DEST.offset(- padding, - padding),
                        DEST.offset(- padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result4, [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        DEST.offset(- padding, padding),
                        DEST.offset(- padding, 0),
                        DEST
                    ]);
                });
            });

            describe("dx or dy == 0, away, short", () => {
                it("North", () => {
                    const DEST = new Position(0, -10);
                    
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        ORIGIN.offset(- padding, padding),
                        DEST.offset(-padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        ORIGIN.offset(padding, padding),
                        DEST.offset(padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result3, [
                        ORIGIN,
                        ORIGIN.offset( - padding, 0),
                        DEST.offset(- padding, - padding),
                        DEST.offset(0, -padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result4, [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        DEST.offset(padding, -padding),
                        DEST.offset(0, -padding),
                        DEST
                    ]);
                });

                it("South", () => {
                    const DEST = new Position(0, 10);
                    
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        ORIGIN.offset(0, -padding),
                        ORIGIN.offset(- padding, -padding),
                        DEST.offset(-padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(0, -padding),
                        ORIGIN.offset(padding, -padding),
                        DEST.offset(padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result3, [
                        ORIGIN,
                        ORIGIN.offset( - padding, 0),
                        DEST.offset(- padding, padding),
                        DEST.offset(0, padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result4, [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        DEST.offset(padding, padding),
                        DEST.offset(0, padding),
                        DEST
                    ]);
                });

                it("East", () => {
                    const DEST = new Position(10, 0);
                    
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.LEFT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.RIGHT),
                        padding
                    );

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        ORIGIN.offset(-padding, 0),
                        ORIGIN.offset(- padding, -padding),
                        DEST.offset(0, -padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(-padding, 0),
                        ORIGIN.offset(-padding, padding),
                        DEST.offset(0, padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result3, [
                        ORIGIN,
                        ORIGIN.offset(0, - padding),
                        DEST.offset(padding, - padding),
                        DEST.offset(padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result4, [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        DEST.offset(padding, padding),
                        DEST.offset(padding, 0),
                        DEST
                    ]);
                });

                it("West", () => {
                    const DEST = new Position(-10, 0);
                    
                    const result1 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.UP),
                        padding
                    );
                    const result2 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.RIGHT), 
                        anchor(DEST, DIRECTION_DELTAS.DOWN),
                        padding
                    );
                
                    const result3 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.UP), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );
                    const result4 = planPolyLine(
                        anchor(ORIGIN, DIRECTION_DELTAS.DOWN), 
                        anchor(DEST, DIRECTION_DELTAS.LEFT),
                        padding
                    );

                    assert.deepStrictEqual(result1, [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        ORIGIN.offset(padding, -padding),
                        DEST.offset(0, -padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result2, [
                        ORIGIN,
                        ORIGIN.offset(padding, 0),
                        ORIGIN.offset(padding, padding),
                        DEST.offset(0, padding),
                        DEST
                    ]);
                    assert.deepStrictEqual(result3, [
                        ORIGIN,
                        ORIGIN.offset(0, - padding),
                        DEST.offset(- padding, - padding),
                        DEST.offset(- padding, 0),
                        DEST
                    ]);
                    assert.deepStrictEqual(result4, [
                        ORIGIN,
                        ORIGIN.offset(0, padding),
                        DEST.offset(- padding, padding),
                        DEST.offset(- padding, 0),
                        DEST
                    ]);
                });
            });
        });
    });
});