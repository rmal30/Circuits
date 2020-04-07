function range(a, b){
    var arr = [];
    for(var i = a; i < b; i++){
        arr.push(i);
    }
    return arr;
}

function partialPivot(aug, p){
    var temp;
    var n = aug.length;
    if(aug[p][p] === 0){
        for(var r = p + 1; r < n; r++){
            if(aug[r][p] !== 0){
                temp = aug[p];
                aug[p] = aug[r];
                aug[r] = temp;
            }
        }
    }
    return aug;
}

function forwardElimination(aug){
    var n = aug.length;
    for(var p = 0; p < n - 1; p++){
        aug = partialPivot(aug, p);
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
    aug = forwardElimination(aug);
    return backSubstitution(aug);
}
