import {ANGLES} from "../config/constants.js";
import {DIRECTION_TEMPLATE, IMAGE_SIZE, LABEL_POSITIONS, PIN_POSITION_TEMPLATE} from "../config/layout.js";
import ComplexOperations from "../math/complex.js";

export function rotateVector(vec) {
    return [-vec[1], vec[0]];
}

export function getPinPositions(pos, direction, count) {
    return PIN_POSITION_TEMPLATE[count].map((point) => {
        return pos.offset.apply(pos, ComplexOperations.multiply(IMAGE_SIZE, ComplexOperations.multiply(point, direction)));
    });
}

export function getLabelPosition(pos, direction){
    const [dx, dy] = direction;
    let dlx, dly;
    if (dx === 0) {
        [dlx, dly] = LABEL_POSITIONS.V;
    } else if (dy === 0) {
        [dlx, dly] = LABEL_POSITIONS.H;
    }
    return pos.offset(dlx, dly);
}

export function getLabelPinPos(pos, direction, count) {
    return [
        ...getPinPositions(pos, direction, count),
        getLabelPosition(pos, direction)
    ];
}

export function getPinDirections(direction, count) {
    return DIRECTION_TEMPLATE[count].map((point) => ComplexOperations.multiply(point, direction));
}

export function getAngleFromDirection(direction) {
    return ANGLES[direction.toString()];
}


export function getLines(pointsStr) {
    const points = pointsStr.split(" ").map((pointStr) => pointStr.split(",").map((v) => Number(v)));
    const linePoints = [];
    for (let i = 0; i < points.length - 1; i++) {
        linePoints.push([points[i], points[i + 1]]);
    }
    return linePoints;
}

export function isNearLine(linePoints, position, range) {
    const [point1, point2] = linePoints;
    const [x1, y1] = point1;
    const [x2, y2] = point2;
    const minX = Math.min(x1, x2) - range;
    const maxX = Math.max(x1, x2) + range;
    const minY = Math.min(y1, y2) - range;
    const maxY = Math.max(y1, y2) + range;
    return position.x >= minX && position.x <= maxX && position.y >= minY && position.y <= maxY;
}