import ComplexOperations from "../../public/scripts/math/complex.js";
import assert from "assert";

describe("Complex operations", () => {
    const testClass = ComplexOperations;

    describe("Norm", () => {
        const testFunc = testClass.norm;
        it("Real", () => assert.strictEqual(testFunc(3), 9));
        it("Real part", () => assert.strictEqual(testFunc([4, 0]), 16));
        it("Imaginary part", () => assert.strictEqual(testFunc([0, 3]), 9));
        it("Complex", () => assert.strictEqual(testFunc([2, 3]), 13));
    });

    describe("Complex conjugate", () => {
        const testFunc = testClass.conjugate;
        it("Real", () => assert.strictEqual(testFunc(3), 3));
        it("Real part", () => assert.deepStrictEqual(testFunc([4, 0]), [4, -0]));
        it("Imaginary part", () => assert.deepStrictEqual(testFunc([0, 3]), [0, -3]));
        it("Complex", () => assert.deepStrictEqual(testFunc([2, 3]), [2, -3]));
    });

    describe("Print", () => {
        const testFunc = testClass.print;
        it("Real", () => assert.strictEqual(testFunc(3), "3"));
        it("Real part", () => assert.strictEqual(testFunc([6, 0]), "6 + 0j"));
        it("Imaginary part", () => assert.strictEqual(testFunc([0, 7]), "0 + 7j"));
        it("Complex", () => assert.strictEqual(testFunc([2, 3]), "2 + 3j"));
        it("Real decimal", () => assert.strictEqual(testFunc(Math.PI, 4), "3.1416"));
        it("Complex decimal", () => assert.strictEqual(testFunc([Math.PI, 2*Math.PI]), "3.14159265 + 6.28318531j"));
    })

    describe("Add", () => {
        const testFunc = ComplexOperations.add;
        it("Real and complex", () => assert.deepStrictEqual(testFunc(1, [2, 3]), [3, 3]));
        it("Complex and complex", () => assert.deepStrictEqual(testFunc([1, 2], [3, 4]), [4, 6]));
        it("Complex and real", () => assert.deepStrictEqual(testFunc([1, 2], 4), [5, 2]));
        it("Real and real", () => assert.strictEqual(testFunc(3, 6), 9));
    });

    describe("Subtract", () => {
        const testFunc = ComplexOperations.subtract;
        it("Real and complex", () => assert.deepStrictEqual(testFunc(1, [2, 3]), [-1, -3]));
        it("Complex and complex", () => assert.deepStrictEqual(testFunc([1, 2], [3, 7]), [-2, -5]));
        it("Complex and real", () => assert.deepStrictEqual(testFunc([1, 2], 4), [-3, 2]));
        it("Real and real", () => assert.strictEqual(testFunc(3, 6), -3));
    });

    describe("Multiply", () => {
        const testFunc = ComplexOperations.multiply;
        it("Real and complex", () => assert.deepStrictEqual(testFunc(2, [2, 3]), [4, 6]));
        it("Complex and complex", () => assert.deepStrictEqual(testFunc([1, 2], [3, 4]), [-5, 10]));
        it("Complex and real", () => assert.deepStrictEqual(testFunc([1, 2], 4), [4, 8]));
        it("Real and real", () => assert.strictEqual(testFunc(3, 6), 18));
    });

    describe("Divide", () => {
        const testFunc = ComplexOperations.divide;
        it("Real and complex", () => assert.deepStrictEqual(testFunc(10, [1, 3]), [1, -3]));
        it("Complex and complex", () => assert.deepStrictEqual(testFunc([-5, 10], [3, 4]), [1, 2]));
        it("Complex and real", () => assert.deepStrictEqual(testFunc([15, 5], 5), [3, 1]));
        it("Real and real", () => assert.strictEqual(testFunc(153, 17), 9));
    });

});