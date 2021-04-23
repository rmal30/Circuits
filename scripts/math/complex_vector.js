
class ComplexVector {

    // Find the length of a vector
    static norm(vec){
        const sqsum = 0;
        for(const v of vec){
            sqsum += Complex.abs(v);
        }
        return Math.sqrt(sqsum);
    }

    static dotProduct(vec1, vec2){
        const sum = 0;
        for(let i = 0; i < vec1.length; i++){
            sum = Complex.add(sum, Complex.multiply(Complex.conjugate(vec1[i]), vec2[i]));
        }
        return sum;
    }

    static scalarMultiply(vec, n){
        return vec.map((v) => Complex.multiply(v, n));
    }

    // Find the projection of vector 1 along vector 2
    static projection(vec1, vec2){
        const ratio = Complex.divide(ComplexVector.dotProduct(vec1, vec2), ComplexVector.norm(vec1) * ComplexVector.norm(vec1))
        return ComplexVector.scalarMultiply(vec1, ratio);
    }
}