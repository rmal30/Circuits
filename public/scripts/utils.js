import {ELEMENT_PREFIXES} from "./config/constants.js";

export default class Utils {

    /**
     * Return range of numbers from a to b
     * @param {number} start - Start number inclusive
     * @param {number} end - End number exclusive
     * @returns {number[]} - Range of numbers
     */
     static range(start, end) {
        return [...new Array(end - start).keys()].map((value) => value + start);
    }

    /**
     * Round number to a specified number of places
     * @param {number} num - Number to round
     * @param {number} places - Number of places
     * @returns {number} - Rounded number
     */
    static roundNum(num, places) {
        const factor = 10 ** places;
        return Math.round(num * factor) / factor;
    }

    static getElementId(id, type) {
        if (type in ELEMENT_PREFIXES) {
            return ELEMENT_PREFIXES[type] + id;
        } else {
            throw new Error("Invalid type");
        }
    }
}
