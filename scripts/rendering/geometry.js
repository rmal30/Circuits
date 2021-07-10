
export default class GeometryUtils {

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
        if (direction.dx === 1 && direction.dy === 0) {
            return 0
        } else if (direction.dx === 0 && direction.dy === 1) {
            return 90;
        } else if(direction.dx === 0 && direction.dy === -1) {
            return -90;
        } else if(direction.dx === -1 && direction.dy === 0) {
            return 180;
        } else {
            throw new Error("Unexpected direction");
        }
    }
}