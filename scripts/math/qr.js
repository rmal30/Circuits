"use strict";

class QRDecomposition {

    // Find the Q matrix in QR decomposition
    static findQ(mat) {
        const u = new Array(mat.length);
        const matT = ComplexMatrix.transpose(mat);
        for (let i = 0; i < mat[0].length; i++) {
            u[i] = matT[i];
            for (let j = i - 1; j >= 0; j--) {
                u[i] = ComplexMatrix.add([u[i]], ComplexMatrix.scalarMultiply([ComplexVector.projection(u[j], u[i])], -1))[0];
            }
            u[i] = ComplexMatrix.scalarDivide([u[i]], ComplexVector.norm(u[i]))[0];
            u[i] = u[i].map((x) => roundNum(x, 10));
        }
        const Q = ComplexMatrix.transpose(u);
        return ComplexMatrix.scalarMultiply(Q, -1);
    }

    // Solve the matrix equation using QR decomposition
    static solve(matrix, vector) {
        const q = QRDecomposition.findQ(matrix);
        const r = ComplexMatrix.multiply(ComplexMatrix.conjTranspose(q), matrix);
        const v = ComplexMatrix.transpose(ComplexMatrix.multiply(ComplexMatrix.conjTranspose(q), ComplexMatrix.transpose([vector])))[0];
        return QRDecomposition.solveRUMatrix(r, v);
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
