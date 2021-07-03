export const DEFAULT_FREQUENCY = 60;

export const PIN_RANGE = 1;
export const COMPONENT_RANGE = 0.7;
export const LINE_RANGE = 10;

export const ELEMENT_TYPES = {
    LABEL: "Label",
    IMAGE: "Image",
    LINE: "Line",
    PIN: "Pin"
};

export const ELEMENT_PREFIXES = {
    Line: "lin",
    Image: "img",
    Pin: "pin-",
    Label: "txt"
};

export const EQUATION_TYPES = {
    LOOP: "loop",
    NODE: "node"
};

export const KEYS = {
    R: "r",
    DELETE: "Delete",
    ESCAPE: "Escape"
};


export const DIRECTIONS = {
    LEFT: "LEFT",
    RIGHT: "RIGHT",
    UP: "UP",
    DOWN: "DOWN"
}

export const DIRECTION_DELTAS = {
    LEFT: {dx: -1, dy: 0},
    RIGHT: {dx: 1, dy: 0},
    UP: {dx: 0, dy: -1},
    DOWN: {dx: 0, dy: 1}
}

export const DIRECTION_ANGLES = {
    DOWN: 90,
    UP: -90,
    RIGHT: 0,
    LEFT: 180
};

export const ALIGNMENT_DELTAS = {
    H: {dx: 1, dy: 0},
    V: {dx: 0, dy: 1}
};

export const ALIGNMENT_ANGLES = {
    H: 0,
    V: 90
};