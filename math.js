
function absC2(z){
    if(z.constructor === Array){
        return z[0]*z[0] + z[1]*z[1];
    }else{
        return z*z;
    }
}

//Find the length of a vector
function norm(vec){
    var sqsum = 0;
    for(var i=0; i<vec.length; i++){
        sqsum+=absC2(vec[i]);
    }
    return Math.sqrt(sqsum);
}

function cdotP(vec1, vec2){
    var sum = [0, 0];
    for(var i=0; i<vec1.length; i++){
        sum = addC(sum, multiplyC(conjC(vec1[i]), vec2[i]));
    }
    return sum;
}

//Find the projection of vector 1 along vector 2
function projection(vec1, vec2){
    return s_mult([vec1], divideC(cdotP(vec1, vec2), norm(vec1)*norm(vec1)));
}


//Conjugate transpose
function conjTranspose(mat){
    var mat_t = new Array(mat[0].length);
    for(var i=0; i<mat[0].length; i++){
        mat_t[i]=[];
        for(var j=0; j<mat.length; j++){
            mat_t[i].push(conjC(mat[j][i]));
        }
    }
    return mat_t;
}

//Transpose a matrix
function transpose(mat){
    var mat_t = new Array(mat[0].length);
    for(var i=0; i<mat[0].length; i++){
        mat_t[i]=[];
        for(var j=0; j<mat.length; j++){
            mat_t[i].push(mat[j][i]);
        }
    }
    return mat_t;
}

//Add two matricies
function addM(mat1,mat2){
    mat3=new Array(mat1.length);
    for(var j=0; j<mat1.length; j++){
        mat3[j]=new Array(mat1[0].length);
        for(var k=0; k<mat1[0].length; k++){
            mat3[j][k] = addC(mat1[j][k], mat2[j][k]);
        }
    }
    return mat3;
}

//Multiply a matrix by a constant
function s_mult(mat,n){
    nmat=new Array(mat.length);
    for(var j=0; j<mat.length; j++){
        nmat[j]=new Array(mat[0].length);
        for(var k=0; k<mat[0].length; k++){
            nmat[j][k]= multiplyC(n, mat[j][k]);
        }
    }
    return nmat;
}

//Divide a matrix by a constant
function s_div(mat,n){
    nmat=new Array(mat.length);
    for(var j=0; j<mat.length; j++){
        nmat[j]=new Array(mat[0].length);
        for(var k=0; k<mat[0].length; k++){
            nmat[j][k] = divideC(mat[j][k], n);
        }
    }
    return nmat;
}

//Multiply two matricies
function multiplyM(mat1, mat2){
    mat3=new Array(mat1.length);
    for(var j=0; j<mat1.length; j++){
        mat3[j]=new Array(mat2[0].length);
        for(var k=0; k<mat2[0].length; k++){
            mat3[j][k]= [0, 0];
            for(var l=0; l<mat2.length; l++){
                mat3[j][k] = addC(mat3[j][k], multiplyC(mat1[j][l], mat2[l][k]));
            }
        }
    }
    return mat3;
}

//Find the Q matrix in QR decomposition
function find_q(mat){
    var q_mat = new Array(mat.length);
    var u = new Array(mat.length);
    var t_mat = transpose(mat);
    for(var i=0; i<mat[0].length; i++){
        u[i] = t_mat[i];
        for(var j=i-1; j>=0; j--){
            u[i] = addM([u[i]], s_mult(projection(u[j],u[i]),-1))[0];
        }
        u[i] = s_div([u[i]],norm(u[i]))[0];
    }
    q_mat = transpose(u);
    return s_mult(q_mat, -1);
}

//Solve the matrix equation using QR decomposition
function QRSolve(matrix,vector){
    var q = find_q(matrix);
    var r = multiplyM(conjTranspose(q),matrix);
    return solve_ru_matrix(r,transpose(multiplyM(conjTranspose(q),transpose([vector])))[0]);
}

//Part of QR decomposition
function solve_ru_matrix(matrix,vector){
    var solution_set = zeros(matrix.length);
    var l = solution_set.length; var sol;
    for(var j=l-1; j>=0; j--){
        sol=vector[j];
        for(var i=j; i<l; i++){
            sol= subtractC(sol, multiplyC(matrix[j][i], solution_set[i]));
        }
        solution_set[j] = divideC(sol, matrix[j][j]);
    }
    console.log(matrix, vector, solution_set);
    return solution_set;
}


//Create an array with zeros
function zeros(num){
    var arr = [];
    for(var i=0; i<num; i++){
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
        return [z1[0]*z2[0] - z1[1]*z2[1], z1[0]*z2[1] + z1[1]*z2[0]];
    }else if(isArray1 && !isArray2){
        return [z1[0]*z2 , z1[1]*z2];
    }else if(!isArray1 && isArray2){
        return [z2[0]*z1, z2[1]*z1];
    }else{
        return z1*z2;
    }
}

function divideC(z1, z2){
    var isArray1 = z1.constructor === Array;
    var isArray2 = z2.constructor === Array;
    var denom = z2[0]*z2[0] + z2[1]*z2[1];
    if(isArray1 && isArray2){
        return [(z1[0]*z2[0] + z1[1]*z2[1])/denom, (-z1[0]*z2[1] + z1[1]*z2[0])/denom];
    }else if(isArray1 && !isArray2){
        return [z1[0]/z2 , z1[1]/z2];
    }else if(!isArray1 && isArray2){
        return [z2[0]*z1/denom, -z2[1]*z1/denom];
    }else{
        return z1/z2;
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
        return [z1[0] - z2 , z1[1]];
    }else if(!isArray1 && isArray2){
        return [-z2[0] + z1, -z2[1]];
    }else{
        return z1 - z2;
    }
}

function roundNum(num, places){
    return Math.round(num*Math.pow(10, places))/Math.pow(10, places);
}
