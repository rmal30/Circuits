const DEFAULT_FREQUENCY = 60;

const PIN_RANGE = 1;
const COMPONENT_RANGE = 0.7;
const LINE_RANGE = 10;

const ELEMENT_TYPES = {
    LABEL: "Label",
    IMAGE: "Image",
    LINE: "Line",
    PIN: "Pin"
};

const ELEMENT_PREFIXES = {
    Line: "lin",
    Image: "img",
    Pin: "pin-",
    Label: "txt"
};

const EQUATION_TYPES = {
    LOOP: "loop",
    NODE: "node"
};

const DIRECTIONS = {
    H: [1, 0],
    V: [0, 1]
};

const DIRECTION_ANGLES = {
    H: 0,
    V: 90
};

const ANGLES = {
    "0,1": 90,
    "0,-1": -90,
    "1,0": 0,
    "-1,0": 180
};

const KEYS = {
    R: "r",
    DELETE: "Delete",
    ESCAPE: "Escape"
};
