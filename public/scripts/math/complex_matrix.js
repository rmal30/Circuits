import Complex from "./complex.js";
export default class ComplexMatrix {

    static concat(mat1, mat2) {
        const mat3 = [];
        for (let j = 0; j < mat1.length; j++) {
            mat3.push([...mat1[j], ...mat2[j]]);
        }
        return mat3;
    }

    /**
     * Concatenate matricies horizontally
     * @param {Array<Array<any>>[]} mats - Matricies to concatenate
     * @returns {Array<Array<any>>} - Concatenated matrix
     */
    static concatMultiple(mats) {
        return mats.reduce((currentMatrix, newMatrix) => ComplexMatrix.concat(currentMatrix, newMatrix));
    }

    // Conjugate transpose
    static conjTranspose(mat) {
        const resultMatrix = new Array(mat[0].length);
        for (let i = 0; i < mat[0].length; i++) {
            resultMatrix[i] = [];
            for (let j = 0; j < mat.length; j++) {
                resultMatrix[i].push(Complex.conjugate(mat[j][i]));
            }
        }

        return resultMatrix;
    }

    // Transpose a matrix
    static transpose(mat) {
        const resultMatrix = new Array(mat[0].length);
        for (let i = 0; i < mat[0].length; i++) {
            resultMatrix[i] = [];
            for (let j = 0; j < mat.length; j++) {
                resultMatrix[i].push(mat[j][i]);
            }
        }

        return resultMatrix;
    }

    // Add two matricies
    static add(mat1, mat2) {
        const mat3 = new Array(mat1.length);
        for (let j = 0; j < mat1.length; j++) {
            mat3[j] = new Array(mat1[0].length);
            for (let k = 0; k < mat1[0].length; k++) {
                mat3[j][k] = Complex.add(mat1[j][k], mat2[j][k]);
            }
        }

        return mat3;
    }

    // Multiply a matrix by a constant
    static scalarMultiply(mat, n) {
        const nmat = new Array(mat.length);
        for (let j = 0; j < mat.length; j++) {
            nmat[j] = new Array(mat[0].length);
            for (let k = 0; k < mat[0].length; k++) {
                nmat[j][k] = Complex.multiply(n, mat[j][k]);
            }
        }

        return nmat;
    }

    // Divide a matrix by a constant
    static scalarDivide(mat, n) {
        const nmat = new Array(mat.length);
        for (let j = 0; j < mat.length; j++) {
            nmat[j] = new Array(mat[0].length);
            for (let k = 0; k < mat[0].length; k++) {
                nmat[j][k] = Complex.divide(mat[j][k], n);
            }
        }

        return nmat;
    }

    // Multiply two matricies
    static multiply(mat1, mat2) {
        const mat3 = new Array(mat1.length);
        for (let j = 0; j < mat1.length; j++) {
            mat3[j] = new Array(mat2[0].length);
            for (let k = 0; k < mat2[0].length; k++) {
                mat3[j][k] = 0;
                for (let l = 0; l < mat2.length; l++) {
                    mat3[j][k] = Complex.add(mat3[j][k], Complex.multiply(mat1[j][l], mat2[l][k]));
                }
            }
        }

        return mat3;
    }
}
