import MatrixUtils from "../../public/scripts/math/matrix.js";
import assert from "assert";

describe("Matrix operations", () => {
    const operations = {
        add: (a, b) => a + b,
        subtract: (a, b) => a - b,
        multiply: (a, b) => a * b,
        divide: (a, b) => a/b
    };

    describe("Transpose", () => {
        const testFunc = MatrixUtils.transpose;

        it("Normal", () => {
            const input = [
                [1, 2, 3],
                [4, 5, 6]
            ];
            const expected = [
                [1, 4],
                [2, 5],
                [3, 6]
            ];
            return assert.deepStrictEqual(testFunc(input), expected);
        });

        it("Empty 0x0", () => {
            const input = [];
            const expected = [];
            return assert.deepStrictEqual(testFunc(input), expected);
        });

        it("1x0 -> 0x1", () => {
            const input = [[]];
            const expected = [];
            return assert.deepStrictEqual(testFunc(input), expected);
        });
    });

    describe("Add", () => {
        it("Normal", () => {
            const mat1 = [
                [1, 2, 3],
                [4, 5, 6]
            ];
            const mat2 = [
                [10, 20, 30],
                [40, 50, 60]
            ];
            const expected = [
                [11, 22, 33],
                [44, 55, 66]
            ];
            assert.deepStrictEqual(MatrixUtils.add(operations, mat1, mat2), expected);
        });
        it("Empty", () => {
            const mat1 = [];
            const mat2 = [];
            const expected = [];
            assert.deepStrictEqual(MatrixUtils.add(operations, mat1, mat2), expected);
        });
        it("Throw error if wrong shape", () => {
            const mat1 = [
                [1, 2, 3],
                [4, 5, 6]
            ];
            const mat2 = [
                [10, 20],
                [40, 50]
            ];
            assert.throws(() => MatrixUtils.add(operations, mat1, mat2));
        });
    });

    describe("Scalar multiply", () => {
        it("Normal", () => {
            const mat = [
                [1, 2, 3],
                [4, 5, 6]
            ];
            const expected = [
                [2, 4, 6],
                [8, 10, 12]
            ];
            assert.deepStrictEqual(MatrixUtils.scalarMultiply(operations, mat, 2), expected);
        });
    });

    describe("Scalar divide", () => {
        it("Normal", () => {
            const mat = [
                [0.1, 0.2, 0.3],
                [0.4, 0.5, 0.6]
            ];
            const expected = [
                [0.02, 0.04, 0.06],
                [0.08, 0.1, 0.12]
            ];
            assert.deepStrictEqual(MatrixUtils.scalarDivide(operations, mat, 5), expected);
        });
    });

    describe("Multiply", () => {
        const testFunc = MatrixUtils.multiply;

        it("Empty (0 rows) x Empty (0 rows)", () => {
            const mat1 = [];
            const mat2 = [];
            assert.deepStrictEqual(testFunc(operations, mat1, mat2), []);
        });

        it("Empty (0 rows) x (2 x 0 matrix)", () => {
            const mat1 = [];
            const mat2 = [
                [],
                []
            ];
            assert.deepStrictEqual(testFunc(operations, mat1, mat2), []);
        });

        it("Empty (0 rows) x (2 x 3 matrix)", () => {
            const mat1 = [];
            const mat2 = [
                [1, 2, 3],
                [4, 5, 6]
            ];
            assert.deepStrictEqual(testFunc(operations, mat1, mat2), []);
        });

        it("(2 x 0 matrix) x Empty (0 rows)", () => {
            const mat1 = [
                [],
                []
            ];
            const mat2 = [];
            assert.throws(() => testFunc(operations, mat1, mat2));
        });

        it("(2 x 0 matrix) x (3 x 0 matrix)", () => {
            const mat1 = [
                [],
                []
            ];
            const mat2 = [
                [],
                [],
                []
            ];
            assert.throws(() => testFunc(operations, mat1, mat2));
        });
        
        it("(2 x 0 matrix) x (1 x 2 matrix)", () => {
            const mat1 = [
                [],
                []
            ];
            const mat2 = [
                [1, 2]
            ];
            assert.throws(() => testFunc(operations, mat1, mat2));
        });

        it("(1 x 2 matrix) x Empty (0 rows)", () => {
            const mat1 = [
                [1, 2]
            ];
            const mat2 = [];
            assert.throws(() => testFunc(operations, mat1, mat2));
        });

        it("(1 x 2 matrix) x (3 x 0 matrix)", () => {
            const mat1 = [
                [1, 2]
            ];
            const mat2 = [
                [],
                [],
                []
            ];
            assert.throws(() => testFunc(operations, mat1, mat2));
        });

        it("(1 x 2 matrix) x (2 x 0 matrix)", () => {
            const mat1 = [
                [1, 2]
            ];
            const mat2 = [
                [],
                [],
            ];
            assert.deepStrictEqual(testFunc(operations, mat1, mat2), [[]]);
        });

        it("Single x single", () => {
            const mat1 = [[3]];
            const mat2 = [[5]];
            const expected = [[15]];
            const result = testFunc(operations, mat1, mat2);
            assert.deepStrictEqual(result, expected);
        });

        it("Col x single", () => {
            const mat1 = [[1], [2], [3]];
            const mat2 = [[5]];
            const expected = [[5], [10], [15]];
            const result = testFunc(operations, mat1, mat2);
            assert.deepStrictEqual(result, expected);
        });

        it("Single x row", () => {
            const mat1 = [[2]];
            const mat2 = [[1, 2, 3]];
            const expected = [[2, 4, 6]];
            const result = testFunc(operations, mat1, mat2);
            assert.deepStrictEqual(result, expected);
        });

        it("Row x col", () => {
            const mat1 = [
                [1, 2, 3]
            ];
            const mat2 = [
                [4],
                [5],
                [6]
            ];
            const expected = [
                [32]
            ];
            const result = testFunc(operations, mat1, mat2);
            assert.deepStrictEqual(result, expected);
        });

        it("Col x row", () => {
            const mat1 = [
                [4],
                [5],
                [6]
            ];
            const mat2 = [
                [1, 2, 3]
            ];
            const expected = [
                [4, 8, 12],
                [5, 10, 15],
                [6, 12, 18]
            ];
            const result = testFunc(operations, mat1, mat2);
            assert.deepStrictEqual(result, expected);
        });

        it("Full version", () => {
            const mat1 = [
                [1, 2, 3],
                [4, 5, 6]
            ];
            const mat2 = [
                [7, 8, 1],
                [9, 10, 2],
                [11, 12, 3]
            ];
            const expected = [
                [58, 64, 14],
                [139, 154, 32]
            ];
            const result = testFunc(operations, mat1, mat2);
            assert.deepStrictEqual(result, expected);
        });

        it("Throw error if size mismatch", () => {
            const mat1 = [
                [1, 2, 3],
                [4, 5, 6]
            ];
            const mat2 = [
                [7, 8],
                [9, 10]
            ];
            assert.throws(() => testFunc(operations, mat1, mat2));
        });
    });

    describe("Concatenate two matricies horizontally", () => {
        it("Normal", () => {
            const mat1 = [
                [1, 2, 3],
                [4, 5, 6]
            ];
            const mat2 = [
                [7, 8],
                [9, 10]
            ];
            const expected = [
                [1, 2, 3, 7, 8],
                [4, 5, 6, 9, 10]
            ];
            const result = MatrixUtils.concat(mat1, mat2);
            assert.deepStrictEqual(result, expected);
        });

        it("Throw error if height mismatch", () => {
            const mat1 = [
                [1, 2, 3],
                [4, 5, 6]
            ];
            const mat2 = [
                [7, 8],
                [9, 10],
                [11, 12]
            ];
            assert.throws(() => MatrixUtils.concat(mat1, mat2));
        });
    });

    describe("Concatenate a number of matricies horizontally", () => {
        const testFunc = MatrixUtils.concatMultiple;

        it("Zero", () => {
            assert.deepStrictEqual(testFunc([]), []);
        });

        it("One", () => {
            const mat = [
                [1, 2, 3],
                [4, 5, 6]
            ];
            assert.deepStrictEqual(testFunc([mat]), mat);
        });

        it("Three", () => {
            const mats = [
                [
                    [1],
                    [2],
                    [3]
                ],
                [
                    [4, 5],
                    [6, 7],
                    [8, 9]
                ],
                [
                    [10],
                    [11],
                    [12]
                ]
            ];
            const expected = [
                [1, 4, 5, 10],
                [2, 6, 7, 11],
                [3, 8, 9, 12],
            ];
            assert.deepStrictEqual(testFunc(mats), expected);
        });

        it("Throw error if height mismatch", () => {
            const mat1 = [
                [1, 2, 3],
                [4, 5, 6]
            ];
            const mat2 = [
                [7, 8],
                [9, 10],
                [11, 12]
            ];
            assert.throws(() => testFunc([mat1, mat2]));
        });
    });
});
