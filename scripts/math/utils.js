"use strict";

function range(a, b) {
    return [...new Array(b - a).keys()].map((i) => i + a);
}

// Create an array with zeros
function zeros(num) {
    const arr = [];
    for (let i = 0; i < num; i++) {
        arr.push(0);
    }
    return arr;
}

function roundNum(num, places) {
    return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
}
