import GaussianElimination from "../../public/scripts/math/gaussian_elimination.js";
import assert, { AssertionError, fail } from "assert";

describe("Gaussian elimination", () => {
    const operations = {
        add: (a, b) => a + b,
        subtract: (a, b) => a - b,
        multiply: (a, b) => a * b,
        divide: (a, b) => a/b
    };

    describe("Partial pivot", () => {
        it("No pivot needed", () => {
            const input = [
                [1, 0, 0, 2],
                [0, 1, 0, 3],
                [0, 0, 1, 4]
            ];
            assert.deepStrictEqual(GaussianElimination.partialPivot(input, 0), input);
            assert.deepStrictEqual(GaussianElimination.partialPivot(input, 1), input);
            assert.deepStrictEqual(GaussianElimination.partialPivot(input, 2), input);
        });
        it("Cannot pivot", () => {
            const input = [
                [0, 1, 1, 2],
                [0, 1, 1, 3],
                [0, 1, 1, 4]
            ];
            assert.deepStrictEqual(GaussianElimination.partialPivot(input, 0), input);
        });

        it("Pivot", () => {
            const input = [
                [0, 0, 1, 2],
                [0, 1, 0, 3],
                [1, 0, 0, 4]
            ];
            assert.deepStrictEqual(GaussianElimination.partialPivot(input, 0), [
                [1, 0, 0, 4],
                [0, 1, 0, 3],
                [0, 0, 1, 2]
            ]);
        });

        it("Do not pivot twice", () => {
            const input = [
                [0, 0, 1, 2],
                [1, 1, 0, 3],
                [1, 0, 0, 4]
            ];
            assert.deepStrictEqual(GaussianElimination.partialPivot(input, 0), [
                [1, 1, 0, 3],
                [0, 0, 1, 2],
                [1, 0, 0, 4]
            ]);
        });
    });

    describe("Forward elimination", () => {
        it("Normal case (no pivoting)", () => {
            const input = [
                [6, -2, 2, 4, 16],
                [12, -8, 6, 10, 26],
                [3, -13, 9, 3, -19],
                [-6, 4, 1, -18, -34]
            ];
            assert.deepStrictEqual(GaussianElimination.forwardElimination(operations, input), [
                [6, -2, 2, 4, 16],
                [0, -4, 2, 2, -6],
                [0, 0, 2, -5, -9],
                [0, 0, 0, -3, -3]
            ]);
        });

        it("Unstable", () => {
            const input = [
                [1, 1/2, 1/3, 10],
                [1/2, 1/3, 1/4, 20],
                [1/3, 1/4, 1/5, 30]
            ];
            const result = GaussianElimination.forwardElimination(operations, input);
            const expected = [
                [1, 1/2, 1/3, 10],
                [0, 1/12, 1/12, 15],
                [0, 0, 1/180, 35/3]
            ];

            let delta = 0;
            for (let i=0; i<result.length; i++) {
                for(let j=0; j<result[0].length; j++) {
                    delta += Math.abs(result[i][j] - expected[i][j]);
                }
            }
            assert(delta < 1e14);
        });

        it("Requires pivoting", () => {
            const input = [
                [0, 1, 0, 1],
                [0, 0, 1, 2],
                [1, 0, 0, 3],
            ];
            const result = GaussianElimination.forwardElimination(operations, input);
            const expected = [
                [1, 0, 0, 3],
                [0, 1, 0, 1],
                [0, 0, 1, 2],
            ]
            assert.deepStrictEqual(result, expected); 
        });

    });

    describe("Back substitution", () => {
        it("Normal", () => {
            const input = [
                [6, -2, 2, 4, 16],
                [0, -4, 2, 2, -6],
                [0, 0, 2, -5, -9],
                [0, 0, 0, -3, -3]
            ];
            assert.deepStrictEqual(GaussianElimination.backSubstitution(operations, input), [3, 1, -2, 1])
        })
    });

    describe("Solving", () => {
        it("Solve basic", () => {
            const matrix = [
                [1, -2, 1],
                [2, 1, -3],
                [4, -7, 1]
            ];
            const vector = [0, 5, -1];
            const result = GaussianElimination.solve(operations, matrix, vector);
            assert.deepStrictEqual(result, [3, 2, 1])
        });

        it("Indeterminate", () => {
            const matrix = [
                [1, 2, 3],
                [4, 5, 7],
                [5, 7, 10]
            ];
            const vector = [1, 2, 3];
            try {
                GaussianElimination.solve(operations, matrix, vector);
                fail("Missing expected exception.");
            } catch(err) {
                if (err instanceof AssertionError) {
                    throw err;
                }
                assert.match(err.message, /Indeterminate/g);
            }
        });

        it("No solution", () => {
            const matrix = [
                [1, 2, 3],
                [1, 2, 3],
                [5, 7, 10]
            ];
            const vector = [1, 2, 0];
            try {
                GaussianElimination.solve(operations, matrix, vector);
                fail("Missing expected exception.");
            } catch(err) {
                if (err instanceof AssertionError) {
                    throw err;
                }
                assert.match(err.message, /No solution/g);
            }
        });

    });
})
