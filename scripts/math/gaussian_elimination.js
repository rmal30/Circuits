"use strict";

class GaussianElimination {

    static partialPivot(aug, p) {
        let temp;
        const n = aug.length;
        if (aug[p][p] === 0) {
            for (let r = p + 1; r < n; r++) {
                if (aug[r][p] !== 0) {
                    temp = aug[p];
                    aug[p] = aug[r];
                    aug[r] = temp;
                }
            }
        }
        return aug;
    }

    static forwardElimination(aug) {
        const n = aug.length;
        for (let p = 0; p < n - 1; p++) {
            aug = GaussianElimination.partialPivot(aug, p);
            for (let r = p + 1; r < n; r++) {
                const factor = Complex.divide(aug[r][p], aug[p][p]);
                for (let i = p; i <= n; i++) {
                    aug[r][i] = Complex.subtract(aug[r][i], Complex.multiply(factor, aug[p][i]));
                }
            }
        }
        return aug;
    }

    static backSubstitution(aug) {
        const n = aug.length;
        const x = zeros(n);
        x[n - 1] = Complex.divide(aug[n - 1][n], aug[n - 1][n - 1]);
        for (let p = n - 2; p >= 0; p--) {
            const rowSum = range(p + 1, n).map(i => Complex.multiply(aug[p][i], x[i])).reduce((a, b) => Complex.add(a, b));
            x[p] = Complex.divide(Complex.subtract(aug[p][n], rowSum), aug[p][p]);
        }
        return x;
    }

    static solve(matrix, vector) {
        let aug = range(0, matrix.length).map((i) => matrix[i].concat([vector[i]]));
        aug = GaussianElimination.forwardElimination(aug);
        return GaussianElimination.backSubstitution(aug);
    }
}
