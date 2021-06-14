export default class MatrixUtils {

    static concat(mat1, mat2) {
        if (mat1.length !== mat2.length) {
            throw new Error("Cannot concatenate: Matricies do not have the same height");
        }
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
        if (mats.length === 0) {
            return [];
        }
        return mats.reduce((currentMatrix, newMatrix) => MatrixUtils.concat(currentMatrix, newMatrix));
    }

    // Transpose a matrix
    static transpose(mat) {
        const numCols = mat.length > 0 ? mat[0].length : 0;
        const resultMatrix = new Array(numCols);
        for (let i = 0; i < numCols; i++) {
            resultMatrix[i] = mat.map((row) => row[i]);
        }
        return resultMatrix;
    }

    static zipWith(mergeFunc, mat1, mat2) {
        const rowSizeMatches = mat1.length === mat2.length;
        const bothNotEmpty = mat1.length > 0 && mat2.length > 0;
        const bothEmpty = mat1.length === 0 && rowSizeMatches;
        const colSizeMatches = bothNotEmpty ? mat1[0].length === mat2[0].length : bothEmpty;
        if (!rowSizeMatches || !colSizeMatches) {
            throw new Error("Cannot merge: Matricies do not have the same size");
        }
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
        return MatrixUtils.zipWith(mathOperations.add, mat1, mat2);
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
        if (mat1.length > 0 && mat1[0].length !== mat2.length) {
            throw new Error("Matrix size mismatch");
        } else if (mat1.length > 0 && mat2.length === 0) {
            throw new Error("Cannot multiply as number of columns in second matrix is unknown")
        }

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
