import Complex from "./complex.js";
import ComplexMatrix from "./complex_matrix.js";
import ComplexVector from "./complex_vector.js";
import {roundNum} from "./utils.js";

export default class QRDecomposition {

    // Find the Q matrix in QR decomposition
    static findQ(mat) {
        const u = new Array(mat.length);
        const matT = ComplexMatrix.transpose(mat);
        for (let i = 0; i < mat[0].length; i++) {
            u[i] = matT[i];
            for (let j = i - 1; j >= 0; j--) {
                const vectorProj = ComplexVector.projection(u[j], u[i]);
                u[i] = ComplexMatrix.add([u[i]], ComplexMatrix.scalarMultiply([vectorProj], -1))[0];
            }
            u[i] = ComplexMatrix.scalarDivide([u[i]], ComplexVector.norm(u[i]))[0];
            u[i] = u[i].map((value) => roundNum(value, 10));
        }
        const qMatrix = ComplexMatrix.transpose(u);
        return ComplexMatrix.scalarMultiply(qMatrix, -1);
    }

    // Solve the matrix equation using QR decomposition
    static solve(matrix, vector) {
        const qMatrix = QRDecomposition.findQ(matrix);
        const rMatrix = ComplexMatrix.multiply(ComplexMatrix.conjTranspose(qMatrix), matrix);
        const columnVector = ComplexMatrix.transpose([vector]);
        const columnVector2 = ComplexMatrix.multiply(ComplexMatrix.conjTranspose(qMatrix), columnVector);
        const [vector2] = ComplexMatrix.transpose(columnVector2);
        return QRDecomposition.solveRUMatrix(rMatrix, vector2);
    }

    // Solve RU matrix
    static solveRUMatrix(matrix, vector) {
        const solutionSet = new Array(matrix.length).fill(0);
        const l = solutionSet.length;
        for (let j = l - 1; j >= 0; j--) {
            let sol = vector[j];
            for (let i = j; i < l; i++) {
                sol = Complex.subtract(sol, Complex.multiply(matrix[j][i], solutionSet[i]));
            }
            solutionSet[j] = Complex.divide(sol, matrix[j][j]);
        }
        return solutionSet;
    }
}
