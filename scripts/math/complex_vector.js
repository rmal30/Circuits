import Complex from "./complex.js";

export default class ComplexVector {

    // Find the length of a vector
    static norm(vector) {
        let sqsum = 0;
        for (const value of vector) {
            sqsum += Complex.abs(value);
        }
        return Math.sqrt(sqsum);
    }

    static dotProduct(vector1, vector2) {
        let sum = 0;
        vector1.forEach((value, index) => {
            sum = Complex.add(sum, Complex.multiply(Complex.conjugate(value), vector2[index]));
        });

        return sum;
    }

    static scalarMultiply(vector, scalar) {
        return vector.map((value) => Complex.multiply(value, scalar));
    }

    // Find the projection of vector 1 along vector 2
    static projection(vector1, vector2) {
        const dotProduct = ComplexVector.dotProduct(vector1, vector2);
        const vec1Norm = ComplexVector.norm(vector1);
        const ratio = Complex.divide(dotProduct, vec1Norm * vec1Norm);
        return ComplexVector.scalarMultiply(vector1, ratio);
    }
}
