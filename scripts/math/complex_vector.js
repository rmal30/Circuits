
class ComplexVector {

    // Find the length of a vector
    static norm(vec) {
        let sqsum = 0;
        for (const v of vec) {
            sqsum += Complex.abs(v);
        }
        return Math.sqrt(sqsum);
    }

    static dotProduct(vec1, vec2) {
        let sum = 0;
        for (let i = 0; i < vec1.length; i++) {
            sum = Complex.add(sum, Complex.multiply(Complex.conjugate(vec1[i]), vec2[i]));
        }

        return sum;
    }

    static scalarMultiply(vec, n) {
        return vec.map((value) => Complex.multiply(value, n));
    }

    // Find the projection of vector 1 along vector 2
    static projection(vec1, vec2) {
        const dotProduct = ComplexVector.dotProduct(vec1, vec2);
        const vec1Norm = ComplexVector.norm(vec1);
        const ratio = Complex.divide(dotProduct, vec1Norm * vec1Norm);
        return ComplexVector.scalarMultiply(vec1, ratio);
    }
}
