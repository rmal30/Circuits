function range(a, b){
    var arr = [];
    for(var i = a; i < b; i++){
        arr.push(i);
    }
    return arr;
}

// Create an array with zeros
function zeros(num){
    var arr = [];
    for(var i = 0; i < num; i++){
        arr.push(0);
    }
    return arr;
}

function swapRows(aug){
    var temp;
    var n = aug.length;
    for(var i = 0; i < n; i++){
        if(aug[i][i] === 0){
            for(var j = 0; j < n; j++){
                if(j !== i && aug[i][j] !== 0 && aug[j][i] !== 0){
                    temp = aug[i];
                    aug[i] = aug[j];
                    aug[j] = temp;
                }
            }
        }
    }
    return aug;
}

function forwardElimination(aug){
    var n = aug.length;
    for(var p = 0; p < n - 1; p++){
        for(var r = p + 1; r < n; r++){
            var factor = divideC(aug[r][p], aug[p][p]);
            for(var i = p; i <= n; i++){
                aug[r][i] = subtractC(aug[r][i], multiplyC(factor, aug[p][i]));
            }
        }
    }
    return aug;
}

function backSubstitution(aug){
    var n = aug.length;
    var x = zeros(n);
    x[n - 1] = divideC(aug[n - 1][n], aug[n - 1][n - 1]);
    for(var p = n - 2; p >= 0; p--){
        var rowSum = range(p + 1, n).map(i => multiplyC(aug[p][i], x[i])).reduce((a, b) => addC(a, b));
        x[p] = divideC(subtractC(aug[p][n], rowSum), aug[p][p]);
    }
    return x;
}

function gaussianElimination(matrix, vector){
    var aug = range(0, matrix.length).map((i) => matrix[i].concat([vector[i]]));
    aug = swapRows(aug);
    aug = forwardElimination(aug);
    return backSubstitution(aug);
}
