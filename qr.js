
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
        u[i] = u[i].map(x => roundNum(x, 10));
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
