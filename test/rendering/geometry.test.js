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
    })
})