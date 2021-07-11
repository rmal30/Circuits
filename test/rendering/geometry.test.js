import assert from 'assert';
import {GeometryUtils, DIRECTION_DELTAS} from '../../public/scripts/rendering/geometry.js';
import Position from '../../public/scripts/rendering/position.js';

describe("Geometry utility function tests", () => {

    const testClass = GeometryUtils;

    describe("Rotate vector clockwise by 90 degrees", () => {

        function checkVectorsEqual(result, expected) {
            assert(result.dx === expected.dx);
            assert(result.dy === expected.dy);
        }
        const testFunction = testClass.rotateVector;

        it("Left rotates to up", () => {
            const result = testFunction(DIRECTION_DELTAS.LEFT);
            const expected = DIRECTION_DELTAS.UP;
            checkVectorsEqual(result, expected);
        });

        it("Right rotates to down", () => {
            const result = testFunction(DIRECTION_DELTAS.RIGHT);
            const expected = DIRECTION_DELTAS.DOWN;
            checkVectorsEqual(result, expected);
        });

        it("Up rotates to right", () => {
            const result = testFunction(DIRECTION_DELTAS.UP);
            const expected = DIRECTION_DELTAS.RIGHT;
            checkVectorsEqual(result, expected);
        });

        it("Down rotates to left", () => {
            const result = testFunction(DIRECTION_DELTAS.DOWN);
            const expected = DIRECTION_DELTAS.LEFT;
            checkVectorsEqual(result, expected);
        });

    });

    describe("Get clockwise angle starting from the right from a right angled vector", () => {
        const testFunction = testClass.getAngleFromDirection;
        it("Right is 0 degrees", () => {
            assert.strictEqual(testFunction(DIRECTION_DELTAS.RIGHT), 0);
        });

        it("Left is 180 degrees", () => {
            assert.strictEqual(testFunction(DIRECTION_DELTAS.LEFT), 180);
        });

        it("Up is -90 degrees", () => {
            assert.strictEqual(testFunction(DIRECTION_DELTAS.UP), -90);
        });

        it("Down is 90 degrees", () => {
            assert.strictEqual(testFunction(DIRECTION_DELTAS.DOWN), 90);
        });
    });

    describe("Test if point is near a right angled line according to a certain tolerance", () => {
        const testFunc = testClass.isNearLine;
        
        describe("Horizontal line", () => {
            it("Near line", () => {
                const linePoints = [new Position(0, 0), new Position(100, 0)];
                const position = new Position(50, 5);
                assert.strictEqual(testFunc(linePoints, position, 10), true)
            });
    
            it("Outside tolerance but near middle of line", () => {
                const linePoints = [new Position(0, 0), new Position(100, 0)];
                const position = new Position(50, 5);
                assert.strictEqual(testFunc(linePoints, position, 4), false)
            });

            it("Outside perpendicular range of two points but close enough", () => {
                const linePoints = [new Position(0, 0), new Position(100, 0)];
                const position = new Position(105, 5);
                assert.strictEqual(testFunc(linePoints, position, 10), true);
            });
    
            it("Close perpendicular distance to infinite extended line but far away from points", () => {
                const linePoints = [new Position(0, 0), new Position(100, 0)];
                const position = new Position(200, 5);
                assert.strictEqual(testFunc(linePoints, position, 10), false)
            });
        });
        

        describe("Vertical line", () => {
            it("Near line", () => {
                const linePoints = [new Position(0, 0), new Position(0, 100)];
                const position = new Position(5, 50);
                assert.strictEqual(testFunc(linePoints, position, 10), true)
            });
    
            it("Outside tolerance but near middle of line", () => {
                const linePoints = [new Position(0, 0), new Position(0, 100)];
                const position = new Position(5, 50);
                assert.strictEqual(testFunc(linePoints, position, 4), false)
            });

            it("Outside perpendicular range of two points but close enough", () => {
                const linePoints = [new Position(0, 0), new Position(0, 100)];
                const position = new Position(5, 105);
                assert.strictEqual(testFunc(linePoints, position, 10), true);
            });
    
            it("Close perpendicular distance to infinite extended line but far away from points", () => {
                const linePoints = [new Position(0, 0), new Position(0, 100)];
                const position = new Position(5, 200);
                assert.strictEqual(testFunc(linePoints, position, 10), false)
            });
        });
    });

    describe("Test if the maximum axis distance of two points is less than a certain tolerance", () => {
        const testFunc = testClass.isNearPoint;
        describe("Nearby", () => {
            it("dx = 0", () => {
                assert.strictEqual(testFunc(new Position(0, 0), new Position(0, 10), 11), true);
            });
    
            it("dy = 0", () => {
                assert.strictEqual(testFunc(new Position(0, 0), new Position(10, 0), 11), true);
            });
    
            it("dx and dy /= 0", () => {
                assert.strictEqual(testFunc(new Position(0, 0), new Position(10, 10), 11), true);
            });
        });
        
        describe("Not nearby", () => {
            it("dx = 0", () => {
                assert.strictEqual(testFunc(new Position(0, 0), new Position(0, 10), 8), false);
            });
    
            it("dy = 0", () => {
                assert.strictEqual(testFunc(new Position(0, 0), new Position(10, 0), 8), false);
            });
    
            it("dx and dy /= 0", () => {
                assert.strictEqual(testFunc(new Position(0, 0), new Position(10, 10), 8), false);
            });
        });
    });

    describe("Get pin positions from template", () => {
        const template = [[0.5, 0.25], [0.5, -0.25], [-0.5, 0.25], [-0.5, -0.25]];
        const testFunc = testClass.getPositionsFromTemplate;
        const position = new Position(80, 90);
        it("Normal", () => {
            assert.deepStrictEqual(testFunc(position, {dx: 1, dy: 0}, template, 100), [
                new Position(80 + 50, 90 + 25),
                new Position(80 + 50, 90 - 25),
                new Position(80 - 50, 90 + 25),
                new Position(80 - 50, 90 - 25)
            ]);
        });

        it("Rotated clockwise 90", () => {
            assert.deepStrictEqual(testFunc(position, {dx: 0, dy: 1}, template, 100), [
                new Position(80 - 25, 90 + 50),
                new Position(80 + 25, 90 + 50),
                new Position(80 - 25, 90 - 50),
                new Position(80 + 25, 90 - 50)
            ]);
        });

        it("Rotated clockwise 180", () => {
            assert.deepStrictEqual(testFunc(position, {dx: -1, dy: 0}, template, 100), [
                new Position(80 - 50, 90 - 25),
                new Position(80 - 50, 90 + 25),
                new Position(80 + 50, 90 - 25),
                new Position(80 + 50, 90 + 25)
            ]);
        });

        it("Rotated clockwise 270", () => {
            assert.deepStrictEqual(testFunc(position, {dx: 0, dy: -1}, template, 100), [
                new Position(80 + 25, 90 - 50),
                new Position(80 - 25, 90 - 50),
                new Position(80 + 25, 90 + 50),
                new Position(80 - 25, 90 + 50)
            ]);
        });
        
    });

    describe("Get pin directions from template", () => {
        const template = [DIRECTION_DELTAS.RIGHT, DIRECTION_DELTAS.RIGHT, DIRECTION_DELTAS.LEFT, DIRECTION_DELTAS.LEFT];
        const testFunc = testClass.getDirectionsFromTemplate;
        
        function checkVectorsEqual(result, expected) {
            assert(result.dx === expected.dx);
            assert(result.dy === expected.dy);
        }

        function checkArraysEqual(resultArr, expectedArr, assertFunc) {
            for (let i = 0; i < resultArr.length; i++) {
                assertFunc(resultArr[i], expectedArr[i]);
            }
        }

        it("Normal", () => {
            assert.deepStrictEqual(testFunc({dx: 1, dy: 0}, template), template);
        });

        it("Rotated clockwise 90", () => {
            const actual = testFunc({dx: 0, dy: 1}, template);
            const expected = [
                DIRECTION_DELTAS.DOWN,
                DIRECTION_DELTAS.DOWN,
                DIRECTION_DELTAS.UP,
                DIRECTION_DELTAS.UP
            ];
            checkArraysEqual(actual, expected, checkVectorsEqual);
        });

        it("Rotated clockwise 180", () => {
            const actual = testFunc({dx: -1, dy: 0}, template);
            const expected = [
                DIRECTION_DELTAS.LEFT,
                DIRECTION_DELTAS.LEFT,
                DIRECTION_DELTAS.RIGHT,
                DIRECTION_DELTAS.RIGHT
            ];
            checkArraysEqual(actual, expected, checkVectorsEqual);
        });

        it("Rotated clockwise 270", () => {
            const actual = testFunc({dx: 0, dy: -1}, template);
            const expected = [
                DIRECTION_DELTAS.UP,
                DIRECTION_DELTAS.UP,
                DIRECTION_DELTAS.DOWN,
                DIRECTION_DELTAS.DOWN
            ];
            checkArraysEqual(actual, expected, checkVectorsEqual);
        });
    });
})