export function range(a, b) {
    return [...new Array(b - a).keys()].map((i) => i + a);
}

export function roundNum(num, places) {
    return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
}
