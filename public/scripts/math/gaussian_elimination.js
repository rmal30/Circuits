import Utils from "../utils.js";

export default class GaussianElimination {

    static partialPivot(aug, p) {
        let temp = null;
        const n = aug.length;
        if (aug[p][p] === 0) {
            for (let r = p + 1; r < n; r++) {
                if (aug[r][p] !== 0) {
                    temp = aug[p];
                    aug[p] = aug[r];
                    aug[r] = temp;
                    return aug;
                }
            }
        }
        return aug;
    }

    static forwardElimination(mathOperations, aug) {
        const n = aug.length;
        for (let p = 0; p < n - 1; p++) {
            aug = GaussianElimination.partialPivot(aug, p);
            for (let r = p + 1; r < n; r++) {
                const factor = mathOperations.divide(aug[r][p], aug[p][p]);
                for (let i = p; i <= n; i++) {
                    const scaled = mathOperations.multiply(factor, aug[p][i]);
                    aug[r][i] = mathOperations.subtract(aug[r][i], scaled);
                }
            }
        }
        return aug;
    }

    static backSubstitution(mathOperations, aug) {
        const n = aug.length;
        const x = new Array(n).fill(0);
        const diagonal = aug.map((_, index) => aug[index][index]);
        if (diagonal.some((value) => value === 0)) {
            let impossible = false;
            for (let i = 0; i < n; i++) {
                if (aug[i][i] === 0) {
                    impossible = impossible || aug[i][n] !== 0;
                }
            }

            throw new Error(impossible ? "No solution" : "Indeterminate");
        }

        x[n - 1] = mathOperations.divide(aug[n - 1][n], aug[n - 1][n - 1]);
        for (let p = n - 2; p >= 0; p--) {
            const rowSum = Utils.range(p + 1, n).
                map((i) => mathOperations.multiply(aug[p][i], x[i])).
                reduce((a, b) => mathOperations.add(a, b));

            x[p] = mathOperations.divide(mathOperations.subtract(aug[p][n], rowSum), aug[p][p]);
        }
        return x;
    }

    static solve(mathOperations, matrix, vector) {
        let aug = Utils.range(0, matrix.length).map((i) => matrix[i].concat([vector[i]]));
        aug = GaussianElimination.forwardElimination(mathOperations, aug);
        return GaussianElimination.backSubstitution(mathOperations, aug);
    }
}
