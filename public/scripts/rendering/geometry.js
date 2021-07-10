export const DIRECTION_DELTAS = {
    LEFT: {dx: -1, dy: 0},
    RIGHT: {dx: 1, dy: 0},
    UP: {dx: 0, dy: -1},
    DOWN: {dx: 0, dy: 1}
};

export const ALIGNMENT_DELTAS = {
    H: {dx: 1, dy: 0},
    V: {dx: 0, dy: 1}
};

export class GeometryUtils {

    static rotateVector(vec) {
        return {dx: -vec.dy, dy: vec.dx};
    }

    static isNearLine(linePoints, position, range) {
        const [point1, point2] = linePoints;
        const minX = Math.min(point1.x, point2.x) - range;
        const maxX = Math.max(point1.x, point2.x) + range;
        const minY = Math.min(point1.y, point2.y) - range;
        const maxY = Math.max(point1.y, point2.y) + range;
        return position.x >= minX && position.x <= maxX && position.y >= minY && position.y <= maxY;
    }

    static getAngleFromDirection(direction) {
        const radianAngle = Math.atan2(direction.dy, direction.dx);
        return radianAngle * 180 / Math.PI;
    }
}