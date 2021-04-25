const directions = {
    H: [1, 0],
    V: [0, 1]
}

function rotateVector(vec){
    return [-vec[1], vec[0]];
}

function getLabelPinPos(pos, direction, count){
    const rightPos = pos.offset(IMAGE_SIZE / 2, -IMAGE_SIZE / 2);
    const bottomPos = pos.offset(0, IMAGE_SIZE / 8);
    const points = getPinPositions(pos, direction, count);
    if (direction[0] === 0) {
        points.push(rightPos.offset(8, 5));
    }else if (direction[1] === 0) {
        points.push(bottomPos);
    }

    return points;
}

function getPinPositions(pos, direction, count){
    const centerPos = pos.offset(0, -IMAGE_SIZE / 2);
    const posTemplate = {
        1: [0, 0],
        2: [[0.5, 0], [-0.5, 0]],
        4: [[0.5, 0.25], [0.5, -0.25], [-0.5, 0.25], [-0.5, -0.25]]
    };
    return posTemplate[count].map(point => centerPos.offset.apply(centerPos, Complex.multiply(IMAGE_SIZE, Complex.multiply(point, direction))));
}

function getPinDirections(direction, count){
    const dirTemplate = {
        2: [[1, 0], [-1, 0]],
        4: [[1, 0], [1, 0], [-1, 0], [-1, 0]]
    };
    return dirTemplate[count].map(point => Complex.multiply(point, direction));
}

function getAngleFromDirection(direction){
    const angles = {
        "0,1": 90,
        "0,-1": -90,
        "1,0": 0,
        "-1,0": 180
    }
    return angles[direction.toString()];
}

function generateXML(tag, properties, value){
    let xml = `<${tag}`;
    for(const prop in properties){
        xml += ` ${prop}="${properties[prop]}"`;
    }
    if (value){
        xml += `>${value}</${tag}>`;
    } else {
        xml += "/>";
    }
    return xml;
}

function getElementId(id, type){
    const prefixes = {
        Line: "",
        Component: "img",
        Node: "pin-"
    };
    return (prefixes[type] + id);
}