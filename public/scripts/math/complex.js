import Utils from "../utils.js";

export default class ComplexOperations {

    static abs(z) {
        if (z.constructor === Array) {
            const [re, imag] = z;
            return re * re + imag * imag;
        } else {
            return z * z;
        }
    }

    static print(z, numPlaces = 8) {
        if (z.constructor === Array) {
            const [realString, imaginaryString] = z.map((value) => Utils.roundNum(value, numPlaces));
            return `${realString} + ${imaginaryString}j`;
        } else {
            return Utils.roundNum(z, numPlaces);
        }
    }

    static conjugate(z) {
        if (z.constructor === Array) {
            return [z[0], -z[1]];
        } else {
            return z;
        }
    }

    static multiply(z1, z2) {
        const isArray1 = z1.constructor === Array;
        const isArray2 = z2.constructor === Array;
        if (isArray1 && isArray2) {
            return [z1[0] * z2[0] - z1[1] * z2[1], z1[0] * z2[1] + z1[1] * z2[0]];
        } else if (isArray1 && !isArray2) {
            return [z1[0] * z2, z1[1] * z2];
        } else if (!isArray1 && isArray2) {
            return [z2[0] * z1, z2[1] * z1];
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
