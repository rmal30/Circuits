function rotateVector(vec) {
    return [-vec[1], vec[0]];
}

function getLabelPinPos(pos, direction, count) {
    const points = getPinPositions(pos, direction, count);
    const [dx, dy] = direction;
    let dlx, dly;
    if (dx === 0) {
        [dlx, dly] = labelPositions.V;
    } else if (dy === 0) {
        [dlx, dly] = labelPositions.H;
    }
    points.push(pos.offset(dlx, dly));
    return points;
}

function getPinPositions(pos, direction, count) {
    return posTemplate[count].map(point => pos.offset.apply(pos, Complex.multiply(IMAGE_SIZE, Complex.multiply(point, direction))));
}

function getPinDirections(direction, count) {
    return dirTemplate[count].map(point => Complex.multiply(point, direction));
}

function getAngleFromDirection(direction) {
    const angles = {
        "0,1": 90,
        "0,-1": -90,
        "1,0": 0,
        "-1,0": 180
    }
    return angles[direction.toString()];
}

function generateXML(tag, properties, value) {
    let xml = `<${tag}`;
    for (const prop in properties) {
        xml += ` ${prop}="${properties[prop]}"`;
    }
    if (value) {
        xml += `>${value}</${tag}>`;
    } else {
        xml += "/>";
    }
    return xml;
}

function getElementId(id, type) {
    const prefixes = {
        Line: "",
        Component: "img",
        Node: "pin-"
    };
    return (prefixes[type] + id);
}
