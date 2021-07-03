import {DIRECTION_TEMPLATE, IMAGE_SIZE, LABEL_POSITIONS, PIN_POSITION_TEMPLATE} from "../config/layout.js";
import ComplexOperations from "../math/complex.js";
import Position from "./position.js";

export function rotateVector(vec) {
    return {dx: -vec.dy, dy: vec.dx};
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

export function getPinDirections(alignmentDelta, count) {
    return DIRECTION_TEMPLATE[count]
        .map((delta) => {
            const newDelta = ComplexOperations.multiply([delta.dx, delta.dy], [alignmentDelta.dx, alignmentDelta.dy])
            return {dx: newDelta[0], dy: newDelta[1]}
        });
}

export function getAngleFromDirection(direction) {
    if (direction.dx === 1 && direction.dy === 0) {
        return 0
    } else if (direction.dx === 0 && direction.dy === 1) {
        return 90;
    } else if(direction.dx === 0 && direction.dy === -1) {
        return -90;
    } else {
        return 180;
    }
}


export function getLines(pointsStr) {
    const points = pointsStr.split(" ").map((pointStr) => {
        const [x, y] = pointStr.split(",").map((v) => Number(v));
        return new Position(x, y)
    });
    const linePoints = [];
    for (let i = 0; i < points.length - 1; i++) {
        linePoints.push([points[i], points[i + 1]]);
    }
    return linePoints;
}

export function isNearLine(linePoints, position, range) {
    const [point1, point2] = linePoints;
    const minX = Math.min(point1.x, point2.x) - range;
    const maxX = Math.max(point1.x, point2.x) + range;
    const minY = Math.min(point1.y, point2.y) - range;
    const maxY = Math.max(point1.y, point2.y) + range;
    return position.x >= minX && position.x <= maxX && position.y >= minY && position.y <= maxY;
}