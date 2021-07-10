import Utils from "./utils.js";

export default class ComplexOperations {

    static norm(z) {
        if (z.constructor === Array) {
            const [re, imag] = z;
            return re * re + imag * imag;
        } else {
            return z * z;
        }
    }

    static conjugate(z) {
        if (z.constructor === Array) {
            const [re, im] = z;
            return [re, -im];
        } else {
            return z;
        }
    }

    static print(z, numPlaces = 8) {
        if (z.constructor === Array) {
            const [realString, imaginaryString] = z.map((value) => Utils.roundNum(value, numPlaces));
            return `${realString} + ${imaginaryString}j`;
        } else {
            return Utils.roundNum(z, numPlaces).toString();
        }
    }

    static multiply(z1, z2) {
        const isArray1 = z1.constructor === Array;
        const isArray2 = z2.constructor === Array;
        if (isArray1 && isArray2) {
            const [re1, im1] = z1;
            const [re2, im2] = z2;
            const newRe = re1 * re2 - im1 * im2;
            const newImag = re1 * im2 + im1 * re2;
            return [newRe, newImag];
        } else if (isArray1 && !isArray2) {
            const [re1, im1] = z1;
            return [re1 * z2, im1 * z2];
        } else if (!isArray1 && isArray2) {
            const [re2, im2] = z2;
            return [re2 * z1, im2 * z1];
        } else {
            return z1 * z2;
        }
    }

    static divide(z1, z2) {
        const isArray1 = z1.constructor === Array;
        const isArray2 = z2.constructor === Array;
        const denom = z2[0] * z2[0] + z2[1] * z2[1];
        if (isArray1 && isArray2) {
            return [(z1[0] * z2[0] + z1[1] * z2[1]) / denom, (-z1[0] * z2[1] + z1[1] * z2[0]) / denom];
        } else if (isArray1 && !isArray2) {
            return [z1[0] / z2, z1[1] / z2];
        } else if (!isArray1 && isArray2) {
            return [z2[0] * z1 / denom, -z2[1] * z1 / denom];
        } else {
            return z1 / z2;
        }
    }

    static add(z1, z2) {
        const isArray1 = z1.constructor === Array;
        const isArray2 = z2.constructor === Array;
        if (isArray1 && isArray2) {
            return [z1[0] + z2[0], z1[1] + z2[1]];
        } else if (isArray1 && !isArray2) {
            return [z1[0] + z2, z1[1]];
        } else if (!isArray1 && isArray2) {
            return [z2[0] + z1, z2[1]];
        } else {
            return z1 + z2;
        }
    }

    static subtract(z1, z2) {
        const isArray1 = z1.constructor === Array;
        const isArray2 = z2.constructor === Array;
        if (isArray1 && isArray2) {
            return [z1[0] - z2[0], z1[1] - z2[1]];
        } else if (isArray1 && !isArray2) {
            return [z1[0] - z2, z1[1]];
        } else if (!isArray1 && isArray2) {
            return [-z2[0] + z1, -z2[1]];
        } else {
            return z1 - z2;
        }
    }
}
