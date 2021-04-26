
function getDirection(pins, group, type) {
    switch (type) {
        case EQUATION_TYPES.LOOP:
            return getLoopDirection(pins, group);
        case EQUATION_TYPES.NODE:
            return getNodeDirection(pins, group);
        default:
            throw new Error("Invalid type");
    }
}

function getLoopDirection(pins, loop) {
    const pin1 = loop.indexOf(pins[0]);
    const pin2 = loop.indexOf(pins[1]);

    if (pin2 === -1 || pin1 === -1) {
        return 0;
    } else if (pin2 - pin1 === 1 || (pin1 === loop.length - 1 && pin2 === 0)) {
        return 1;
    } else if (pin1 - pin2 === 1 || (pin1 === 0 && pin2 === loop.length - 1)) {
        return -1;
    } else {
        return 0;
    }
}

function getNodeDirection(pins, node) {
    const pin1Exists = node.includes(pins[0]);
    const pin2Exists = node.includes(pins[1]);

    if (pin1Exists && !pin2Exists) {
        return -1;
    } else if (pin2Exists && !pin1Exists) {
        return 1;
    } else {
        return 0;
    }
}
