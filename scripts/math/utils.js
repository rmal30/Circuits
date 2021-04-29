"use strict";

function range(a, b) {
    return [...new Array(b - a).keys()].map((i) => i + a);
}

function roundNum(num, places) {
    return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
}

function modulo(x, k) {
    return ((x % k) + k) % k;
}