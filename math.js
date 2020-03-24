
function absC2(z){
    if(z.constructor === Array){
        return z[0] * z[0] + z[1] * z[1];
    }else{
        return z * z;
    }
}

// Find the length of a vector
function norm(vec){
    var sqsum = 0;
    for(var i = 0; i < vec.length; i++){
        sqsum += absC2(vec[i]);
    }
    return Math.sqrt(sqsum);
}

function cdotP(vec1, vec2){
    var sum = [0, 0];
    for(var i = 0; i < vec1.length; i++){
        sum = addC(sum, multiplyC(conjC(vec1[i]), vec2[i]));
    }
    return sum;
}

// Find the projection of vector 1 along vector 2
function projection(vec1, vec2){
    return scalarMultiply([vec1], divideC(cdotP(vec1, vec2), norm(vec1) * norm(vec1)));
}

// Conjugate transpose
function conjTranspose(mat){
    var resultMatrix = new Array(mat[0].length);
    for(var i = 0; i < mat[0].length; i++){
        resultMatrix[i] = [];
        for(var j = 0; j < mat.length; j++){
            resultMatrix[i].push(conjC(mat[j][i]));
        }
    }
    return resultMatrix;
}

// Transpose a matrix
function transpose(mat){
    var resultMatrix = new Array(mat[0].length);
    for(var i = 0; i < mat[0].length; i++){
        resultMatrix[i] = [];
        for(var j = 0; j < mat.length; j++){
            resultMatrix[i].push(mat[j][i]);
        }
    }
    return resultMatrix;
}

// Add two matricies
function addM(mat1, mat2){
    var mat3 = new Array(mat1.length);
    for(var j = 0; j < mat1.length; j++){
        mat3[j] = new Array(mat1[0].length);
        for(var k = 0; k < mat1[0].length; k++){
            mat3[j][k] = addC(mat1[j][k], mat2[j][k]);
        }
    }
    return mat3;
}

// Multiply a matrix by a constant
function scalarMultiply(mat, n){
    var nmat = new Array(mat.length);
    for(var j = 0; j < mat.length; j++){
        nmat[j] = new Array(mat[0].length);
        for(var k = 0; k < mat[0].length; k++){
            nmat[j][k] = multiplyC(n, mat[j][k]);
        }
    }
    return nmat;
}

// Divide a matrix by a constant
function scalarDivide(mat, n){
    var nmat = new Array(mat.length);
    for(var j = 0; j < mat.length; j++){
        nmat[j] = new Array(mat[0].length);
        for(var k = 0; k < mat[0].length; k++){
            nmat[j][k] = divideC(mat[j][k], n);
        }
    }
    return nmat;
}

// Multiply two matricies
function multiplyM(mat1, mat2){
    var mat3 = new Array(mat1.length);
    for(var j = 0; j < mat1.length; j++){
        mat3[j] = new Array(mat2[0].length);
        for(var k = 0; k < mat2[0].length; k++){
            mat3[j][k] = [0, 0];
            for(var l = 0; l < mat2.length; l++){
                mat3[j][k] = addC(mat3[j][k], multiplyC(mat1[j][l], mat2[l][k]));
            }
        }
    }
    return mat3;
}

// Find the Q matrix in QR decomposition
function findQ(mat){
    var u = new Array(mat.length);
    var matT = transpose(mat);
    for(var i = 0; i < mat[0].length; i++){
        u[i] = matT[i];
        for(var j = i - 1; j >= 0; j--){
            u[i] = addM([u[i]], scalarMultiply(projection(u[j], u[i]), -1))[0];
        }
        u[i] = scalarDivide([u[i]], norm(u[i]))[0];
    }
    var Q = transpose(u);
    return scalarMultiply(Q, -1);
}

// Solve the matrix equation using QR decomposition
function QRSolve(matrix, vector){
    var q = findQ(matrix);
    var r = multiplyM(conjTranspose(q), matrix);
    return solveRUMatrix(r, transpose(multiplyM(conjTranspose(q), transpose([vector])))[0]);
}

// Part of QR decomposition
function solveRUMatrix(matrix, vector){
    var solutionSet = zeros(matrix.length);
    var l = solutionSet.length;
    var sol;
    for(var j = l - 1; j >= 0; j--){
        sol = vector[j];
        for(var i = j; i < l; i++){
            sol = subtractC(sol, multiplyC(matrix[j][i], solutionSet[i]));
        }
        solutionSet[j] = divideC(sol, matrix[j][j]);
    }
    console.log(matrix, vector, solutionSet);
    return solutionSet;
}

// Create an array with zeros
function zeros(num){
    var arr = [];
    for(var i = 0; i < num; i++){
        arr.push([0, 0]);
    }
    return arr;
}

function conjC(z){
    if(z.constructor === Array){
        return [z[0], -z[1]];
    }else{
        return z;
    }
}

function multiplyC(z1, z2){
    var isArray1 = z1.constructor === Array;
    var isArray2 = z2.constructor === Array;
    if(isArray1 && isArray2){
        return [z1[0] * z2[0] - z1[1] * z2[1], z1[0] * z2[1] + z1[1] * z2[0]];
    }else if(isArray1 && !isArray2){
        return [z1[0] * z2, z1[1] * z2];
    }else if(!isArray1 && isArray2){
        return [z2[0] * z1, z2[1] * z1];
    }else{
        return z1 * z2;
    }
}

function divideC(z1, z2){
    var isArray1 = z1.constructor === Array;
    var isArray2 = z2.constructor === Array;
    var denom = z2[0] * z2[0] + z2[1] * z2[1];
    if(isArray1 && isArray2){
        return [(z1[0] * z2[0] + z1[1] * z2[1]) / denom, (-z1[0] * z2[1] + z1[1] * z2[0]) / denom];
    }else if(isArray1 && !isArray2){
        return [z1[0] / z2, z1[1] / z2];
    }else if(!isArray1 && isArray2){
        return [z2[0] * z1 / denom, -z2[1] * z1 / denom];
    }else{
        return z1 / z2;
    }
}

function addC(z1, z2){
    var isArray1 = z1.constructor === Array;
    var isArray2 = z2.constructor === Array;
    if(isArray1 && isArray2){
        return [z1[0] + z2[0], z1[1] + z2[1]];
    }else if(isArray1 && !isArray2){
        return [z1[0] + z2, z1[1]];
    }else if(!isArray1 && isArray2){
        return [z2[0] + z1, z2[1]];
    }else{
        return z1 + z2;
    }
}

function subtractC(z1, z2){
    var isArray1 = z1.constructor === Array;
    var isArray2 = z2.constructor === Array;
    if(isArray1 && isArray2){
        return [z1[0] - z2[0], z1[1] - z2[1]];
    }else if(isArray1 && !isArray2){
        return [z1[0] - z2, z1[1]];
    }else if(!isArray1 && isArray2){
        return [-z2[0] + z1, -z2[1]];
    }else{
        return z1 - z2;
    }
}

function roundNum(num, places){
    return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
}
