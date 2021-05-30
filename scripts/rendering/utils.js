

function rotateVector(vec) {
    return [-vec[1], vec[0]];
}

function getLabelPinPos(pos, direction, count) {
    const points = getPinPositions(pos, direction, count);
    const [dx, dy] = direction;
    let dlx, dly;
    if (dx === 0) {
        [dlx, dly] = LABEL_POSITIONS.V;
    } else if (dy === 0) {
        [dlx, dly] = LABEL_POSITIONS.H;
    }
    points.push(pos.offset(dlx, dly));
    return points;
}

function getPinPositions(pos, direction, count) {
    return PIN_POSITION_TEMPLATE[count].map((point) => pos.offset.apply(pos, Complex.multiply(IMAGE_SIZE, Complex.multiply(point, direction))));
}

function getPinDirections(direction, count) {
    return DIRECTION_TEMPLATE[count].map((point) => Complex.multiply(point, direction));
}

function getAngleFromDirection(direction) {
    return ANGLES[direction.toString()];
}

function getElementId(id, type) {
    if (type in ELEMENT_PREFIXES) {
        return (ELEMENT_PREFIXES[type] + id);
    } else {
        throw new Error("Invalid type");
    }
}

function getLines(pointsStr) {
    const points = pointsStr.split(" ").map((pointStr) => pointStr.split(",").map((v) => Number(v)));
    const linePoints = [];
    for (let i = 0; i < points.length - 1; i++) {
        linePoints.push([points[i], points[i + 1]]);
    }
    return linePoints;
}

function isNearLine(linePoints, position, range) {
    const [point1, point2] = linePoints;
    const [x1, y1] = point1;
    const [x2, y2] = point2;
    const minX = Math.min(x1, x2) - range;
    const maxX = Math.max(x1, x2) + range;
    const minY = Math.min(y1, y2) - range;
    const maxY = Math.max(y1, y2) + range;
    return position.x >= minX && position.x <= maxX && position.y >= minY && position.y <= maxY;
}
