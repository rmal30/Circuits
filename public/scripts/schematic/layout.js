import ComplexOperations from "../math/complex.js";

export const IMAGE_SIZE = 48;
export const DOT_SIZE = 4;
export const GRID_SIZE = 6;

export const DIRECTION_DELTAS = {
    LEFT: {dx: -1, dy: 0},
    RIGHT: {dx: 1, dy: 0},
    UP: {dx: 0, dy: -1},
    DOWN: {dx: 0, dy: 1}
};

export const PIN_POSITION_TEMPLATE = {
    1: [0, 0],
    2: [[0.5, 0], [-0.5, 0]],
    4: [[0.5, 0.25], [0.5, -0.25], [-0.5, 0.25], [-0.5, -0.25]]
};

export const DIRECTION_TEMPLATE = {
    2: [DIRECTION_DELTAS.RIGHT, DIRECTION_DELTAS.LEFT],
    4: [DIRECTION_DELTAS.RIGHT, DIRECTION_DELTAS.RIGHT, DIRECTION_DELTAS.LEFT, DIRECTION_DELTAS.LEFT]
};

export const LABEL_POSITIONS = {
    V: [IMAGE_SIZE / 2 + 12, 5],
    H: [0, IMAGE_SIZE / 2 + 8]
};

export const ALIGNMENT_DELTAS = {
    H: {dx: 1, dy: 0},
    V: {dx: 0, dy: 1}
};

export function getPinDirections(alignmentDelta, count) {
    return DIRECTION_TEMPLATE[count].map((delta) => {
        const newDelta = ComplexOperations.multiply([delta.dx, delta.dy], [alignmentDelta.dx, alignmentDelta.dy])
        return {dx: newDelta[0], dy: newDelta[1]}
    });
}

export function getPinPositions(pos, alignmentDelta, count) {
    return PIN_POSITION_TEMPLATE[count].map((point) => {
        const {dx, dy} = alignmentDelta;
        const rotatedPoint = ComplexOperations.multiply(point, [dx, dy]);
        const delta = ComplexOperations.multiply(IMAGE_SIZE, rotatedPoint);
        return pos.offset(delta[0], delta[1]);
    });
}

function getLabelPosition(pos, alignmentDelta){
    const {dx, dy} = alignmentDelta;
    let dlx, dly;
    if (dx === 0) {
        [dlx, dly] = LABEL_POSITIONS.V;
    } else if (dy === 0) {
        [dlx, dly] = LABEL_POSITIONS.H;
    }
    return pos.offset(dlx, dly);
}

export function getLabelPinPos(pos, alignmentDelta, count) {
    return [
        ...getPinPositions(pos, alignmentDelta, count),
        getLabelPosition(pos, alignmentDelta)
    ];
}
