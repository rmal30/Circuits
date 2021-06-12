export default class MatrixUtils {

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
        return mats.reduce((currentMatrix, newMatrix) => MatrixUtils.concat(currentMatrix, newMatrix));
    }

    // Transpose a matrix
    static transpose(mat) {
        const resultMatrix = new Array(mat[0].length);
        for (let i = 0; i < mat[0].length; i++) {
            resultMatrix[i] = mat.map((row) => row[i]);
        }

        return resultMatrix;
    }

    static zipWith(mergeFunc, mat1, mat2) {
        const mat3 = new Array(mat1.length);
        for (let j = 0; j < mat1.length; j++) {
            mat3[j] = new Array(mat1[0].length);
            for (let k = 0; k < mat1[0].length; k++) {
                mat3[j][k] = mergeFunc(mat1[j][k], mat2[j][k]);
            }
        }

        return mat3;
    }

    static map(func, mat) {
        const nmat = new Array(mat.length);
        for (let j = 0; j < mat.length; j++) {
            nmat[j] = new Array(mat[0].length);
            for (let k = 0; k < mat[0].length; k++) {
                nmat[j][k] = func(mat[j][k]);
            }
        }

        return nmat;
    }

    // Add two matricies
    static add(mathOperations, mat1, mat2) {
        return MatrixUtils.zipWith(mat1, mat2, mathOperations.add);
    }

    // Multiply a matrix by a constant
    static scalarMultiply(mathOperations, mat, n) {
        return MatrixUtils.map((value) => mathOperations.multiply(value, n), mat);
    }

    // Divide a matrix by a constant
    static scalarDivide(mathOperations, mat, n) {
        return MatrixUtils.map((value) => mathOperations.divide(value, n), mat);
    }

    // Multiply two matricies
    static multiply(mathOperations, mat1, mat2) {
        const mat3 = new Array(mat1.length);
        for (let j = 0; j < mat1.length; j++) {
            mat3[j] = new Array(mat2[0].length);
            for (let k = 0; k < mat2[0].length; k++) {
                mat3[j][k] = 0;
                for (let l = 0; l < mat2.length; l++) {
                    const multiplied = mathOperations.multiply(mat1[j][l], mat2[l][k]);
                    mat3[j][k] = mathOperations.add(mat3[j][k], multiplied);
                }
            }
        }

        return mat3;
    }
}
