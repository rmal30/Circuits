import {DIRECTION_DELTAS} from "../rendering/geometry.js";

export const IMAGE_SIZE = 48;
export const DOT_SIZE = 4;
export const GRID_SIZE = 6;

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
    H: [0, IMAGE_SIZE / 2 + 12]
};