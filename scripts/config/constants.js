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

export const DIRECTIONS = {
    H: [1, 0],
    V: [0, 1]
};

export const ALL_DIRECTIONS = {
    LEFT: [-1, 0],
    RIGHT: [1, 0],
    UP: [0, -1],
    DOWN: [0, 1]
}

export const DIRECTION_ANGLES = {
    H: 0,
    V: 90
};

export const ANGLES = {
    "0,1": 90,
    "0,-1": -90,
    "1,0": 0,
    "-1,0": 180
};

export const KEYS = {
    R: "r",
    DELETE: "Delete",
    ESCAPE: "Escape"
};
