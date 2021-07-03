import Position from "./position.js";

function findMidPointsWithSameDirection(originPosition, destPosition, direction, padding) {
    const dy = destPosition.y - originPosition.y;
    const dx = destPosition.x - originPosition.x;
    const minX = Math.min(originPosition.x, destPosition.x);
    const minY = Math.min(originPosition.y, destPosition.y);
    const maxX = Math.max(originPosition.x, destPosition.x);
    const maxY = Math.max(originPosition.y, destPosition.y);

    if (direction.dx === 0) {
        if(Math.abs(dx) > padding) {
            const yPos = direction.dy < 0 ? (minY - padding) : (maxY + padding);
            return [ 
                new Position(originPosition.x, yPos),
                new Position(destPosition.x, yPos)
            ];
        } else {
            const xPos = dy * dx * direction.dy >= 0 ? (maxX - padding) : (minX + padding);
            const initialY = originPosition.y + direction.dy * padding;
            const finalY = destPosition.y + direction.dy * padding;
            return [ 
                originPosition.offset(0, direction.dy * padding),
                new Position(xPos, initialY),
                new Position(xPos, finalY),
                destPosition.offset(0, direction.dy * padding)
            ];
        }
    } else {
        if(Math.abs(dy) > padding) {
            const xPos = direction.dx < 0 ? (minX - padding) : (maxX + padding);
            return [ 
                new Position(xPos, originPosition.y),
                new Position(xPos, destPosition.y)
            ];
        } else {
            const yPos = dy * dx * direction.dx >= 0 ? (maxY - padding) : (minY + padding);
            const initialX = originPosition.x + direction.dx * padding;
            const finalX = destPosition.x + direction.dx * padding;
            return [ 
                originPosition.offset(direction.dx * padding, 0),
                new Position(initialX, yPos),
                new Position(finalX, yPos),
                destPosition.offset(direction.dx * padding, 0)
            ];
        }
    }
}

function findMidPointsWithOppositeDirection(originPosition, destPosition, originDirection, padding) {
    const dy = destPosition.y - originPosition.y;
    const dx = destPosition.x - originPosition.x;
    const minX = Math.min(originPosition.x, destPosition.x);
    const minY = Math.min(originPosition.y, destPosition.y);

    if (originDirection.dx === 0) {
        if (dx === 0 && originDirection.dy * dy >= 0) {
            return [];
        } else if (originDirection.dy * dy >= 0 && (Math.abs(dy) > 2 * padding || Math.abs(dx) <= 2 * padding)) {
            return [
                originPosition.offset(0, dy/2),
                destPosition.offset(0, -dy/2)
            ];
        } else {
            const xPos = Math.abs(dx) > 2 * padding ? (originPosition.x + destPosition.x) / 2 : minX - padding;
            const initialY = originPosition.y + padding * originDirection.dy;
            const finalY = destPosition.y - padding * originDirection.dy;
            return [
                originPosition.offset(0, padding * originDirection.dy),
                new Position(xPos, initialY),
                new Position(xPos, finalY),
                destPosition.offset(0, -padding * originDirection.dy)
            ];
        }
    } else {
        if (dy === 0 && originDirection.dx * dx >= 0) {
            return [];
        } else if (originDirection.dx * dx >= 0 && (Math.abs(dx) > 2 * padding || Math.abs(dy) <= 2 * padding)) {
            return [
                originPosition.offset(dx/2, 0),
                destPosition.offset(-dx/2, 0)
            ];
        } else {
            const yPos = Math.abs(dy) > 2 * padding ? (originPosition.y + destPosition.y) / 2 : minY - padding;
            const initialX = originPosition.x + padding * originDirection.dx;
            const finalX = destPosition.x - padding * originDirection.dx;
            
            return [
                originPosition.offset(padding * originDirection.dx, 0),
                new Position(initialX, yPos),
                new Position(finalX, yPos),
                destPosition.offset(-padding * originDirection.dx, 0)
            ];
        }
    }
}

function findMidPointsWithOrthogonalDirection(origin, dest, dir0, dir1, padding) {
    const dx = dest.x - origin.x;
    const dy = dest.y - origin.y;

    if((dir0.dx * dx > padding || dir0.dy * dy > padding) && (dir1.dx * dx < -padding || dir1.dy * dy < -padding)) {
        return [
            origin.offset(Math.abs(dx) * dir0.dx, Math.abs(dy) * dir0.dy)
        ];
    } else if((dir0.dx * dx > 0 || dir0.dy * dy > 0) && (dir1.dx * dx < -2 * padding || dir1.dy * dy < -2 * padding)) {
        const firstMidPoint = origin.offset(padding * dir0.dx, padding * dir0.dy);
        const secondMidPoint = firstMidPoint.offset(-Math.abs(dx/2) * dir1.dx, -Math.abs(dy/2) * dir1.dy)
        return [
            firstMidPoint,
            secondMidPoint,
            dest.offset(Math.abs(dx/2) * dir1.dx, Math.abs(dy/2) * dir1.dy)
        ];
    } else if((dir0.dx * dx > 2 * padding || dir0.dy * dy > 2 * padding) && (dir1.dx * dx < 0 || dir1.dy * dy < 0)) {
        const firstMidPoint = origin.offset(Math.abs(dx/2) * dir0.dx, Math.abs(dy/2) * dir0.dy);
        const lastMidPoint = dest.offset(padding * dir1.dx, padding * dir1.dy);
        return [
            firstMidPoint,
            lastMidPoint.offset(-Math.abs(dx/2) * dir0.dx, -Math.abs(dy/2) * dir0.dy),
            lastMidPoint
        ];
    } else if ((dir0.dx * dx > 0 || dir0.dy * dy > 0) && (dir1.dx * dx < 0 || dir1.dy * dy < 0)) {
        return [
            origin.offset(Math.abs(dx) * dir0.dx, Math.abs(dy) * dir0.dy)
        ];
    } else if ((dir0.dx * dx < 0 || dir0.dy * dy < 0) && (dir1.dx * dx > 0 || dir1.dy * dy > 0)) {
        const firstMidPoint = origin.offset(padding * dir0.dx, padding * dir0.dy);
        const secondMidPoint = firstMidPoint.offset(
            (Math.abs(dx) + padding) * dir1.dx, 
            (Math.abs(dy) + padding) * dir1.dy
        );
        return [
            firstMidPoint,
            secondMidPoint,
            dest.offset(padding * dir1.dx, padding * dir1.dy)
        ];
    } else if((dir0.dx * dx > 0 || dir0.dy * dy > 0) && (dir1.dx * dx > 0 || dir1.dy * dy > 0)) {
        const initialdx = Math.abs(dx) > 2 * padding ? Math.abs(dx/2) : (Math.abs(dx) + padding);
        const initialdy = Math.abs(dy) > 2 * padding ? Math.abs(dy/2) : (Math.abs(dy) + padding);
        const firstMidPoint = origin.offset(initialdx * dir0.dx, initialdy * dir0.dy);
        return [
            firstMidPoint,
            firstMidPoint.offset(
                (Math.abs(dx) + padding) * dir1.dx,
                (Math.abs(dy) + padding) * dir1.dy
            ),
            dest.offset(padding * dir1.dx, padding * dir1.dy)
        ];
    } else if ((dir0.dx * dx < 0 || dir0.dy * dy < 0) && (dir1.dx * dx < 0 || dir1.dy * dy < 0)) {
        const initialdx = Math.abs(dx) > 2 * padding ? Math.abs(dx/2) : (Math.abs(dx) + padding);
        const initialdy = Math.abs(dy) > 2 * padding ? Math.abs(dy/2) : (Math.abs(dy) + padding);
        const lastMidPoint = dest.offset(initialdx * dir1.dx, initialdy * dir1.dy);
        const secondLastMidPoint = lastMidPoint.offset(
            (Math.abs(dx) + padding) * dir0.dx,
            (Math.abs(dy) + padding) * dir0.dy
        )
        return [
            origin.offset(padding * dir0.dx, padding * dir0.dy),
            secondLastMidPoint,
            lastMidPoint
        ];
    } else if (dir0.dx * dx === 0 && dir0.dy * dy === 0) {
        if(Math.abs(dx) + Math.abs(dy) < 2 * padding && dir1.dx * dx <= 0 && dir1.dy * dy <= 0) {
            return [];
        } else {
            const secondX = dir1.dx * dx < 0 ? -Math.abs(dx/2) : (Math.abs(dx) + padding);
            const secondY = dir1.dy * dy < 0 ? -Math.abs(dy/2) : (Math.abs(dy) + padding);
            const finalOffsetX = Math.max(-dir1.dx * dx / 2, padding);
            const finalOffsetY = Math.max(-dir1.dy * dy / 2, padding);
            const firstMidPoint = origin.offset(padding * dir0.dx, padding * dir0.dy);
            return [
                firstMidPoint,
                firstMidPoint.offset(secondX * dir1.dx, secondY * dir1.dy),
                dest.offset(finalOffsetX * dir1.dx, finalOffsetY * dir1.dy)
            ];
        }
    } else {
        if(Math.abs(dx) + Math.abs(dy) < 2 * padding && dir0.dx * dx >= 0 && dir0.dy * dy >= 0) {
            return [];
        } else {
            const secondX = dir0.dx * dx > 0 ? -Math.abs(dx/2) : (Math.abs(dx) + padding);
            const secondY = dir0.dy * dy > 0 ? -Math.abs(dy/2) : (Math.abs(dy) + padding);
            const initialOffsetX = Math.max(dir0.dx * dx / 2, padding);
            const initialOffsetY = Math.max(dir0.dy * dy / 2, padding);
            const lastMidPoint = dest.offset(padding * dir1.dx, padding * dir1.dy);
            return [
                origin.offset(initialOffsetX * dir0.dx, initialOffsetY * dir0.dy),
                lastMidPoint.offset(secondX * dir0.dx, secondY * dir0.dy),
                lastMidPoint
            ];
        }
    }
}

function findMidPointsWithNoDirection(startPosition, endPosition, startDirection, padding) {
    const dy = endPosition.y - startPosition.y;
    const dx = endPosition.x - startPosition.x;

    if(dy * startDirection.dx - dx * startDirection.dy === 0 && dx * startDirection.dx + dy * startDirection.dy >= 0) {
        return [];
    } else {
        if (startDirection.dx === 0) {
            if(startDirection.dy * dy >= 0 && (Math.abs(dy) > padding || Math.abs(dx) <= padding)) {
                return [
                    new Position(startPosition.x, endPosition.y)
                ];
            } else if (Math.abs(dx) > padding) {
                return [
                    startPosition.offset(0, padding * startDirection.dy),
                    startPosition.offset(dx, padding * startDirection.dy)
                ]
            } else {
                return [
                    startPosition.offset(0, padding * startDirection.dy),
                    startPosition.offset(-padding, padding * startDirection.dy),
                    startPosition.offset(-padding, dy)
                ]
            }
        } else {
            if(startDirection.dx * dx >= 0 && (Math.abs(dx) > padding || Math.abs(dy) <= padding)) {
                return [
                    new Position(endPosition.x, startPosition.y)
                ];
            } else if (Math.abs(dy) > padding) {
                const firstMidPoint = startPosition.offset(padding * startDirection.dx, 0);
                return [
                    firstMidPoint,
                    firstMidPoint.offset(0, dy)
                ]
            } else {
                return [
                    startPosition.offset(padding * startDirection.dx, 0),
                    startPosition.offset(padding * startDirection.dx, -padding),
                    startPosition.offset(dx, -padding)
                ]
            }
        }
    }
}

/**
 * Plan a line which can connect two components
 * @param {{pos, direction}} originPin - Origin pin
 * @param {{pos, direction}} destPin - Destination pin
 * @param {number} padding - The number of pixels to add to a pin before turning
 * @returns {number[][]} - SVG polyline string
 */
export function planPolyLine(originPin, destPin, padding) {
    const origin = originPin.pos;
    const dest = destPin.pos;
    const dir0 = originPin.direction;
    const dir1 = destPin.direction;

    let midPoints = [];
    if (!dir0 && !dir1) {
        midPoints = [
            new Position(origin.x, dest.y)
        ];
    } else if(!dir1) {
        midPoints = findMidPointsWithNoDirection(origin, dest, dir0, padding);
    } else if(!dir0) {
        midPoints = findMidPointsWithNoDirection(dest, origin, dir1, padding).reverse();
    } else if(dir0.dx === dir1.dx && dir0.dy === dir1.dy) {
        midPoints = findMidPointsWithSameDirection(origin, dest, dir0, padding);
    } else if (dir0.dx === -dir1.dx && dir0.dy === -dir1.dy) {
        midPoints = findMidPointsWithOppositeDirection(origin, dest, dir0, padding);
    } else {
        midPoints = findMidPointsWithOrthogonalDirection(origin, dest, dir0, dir1, padding);
    }

    return [origin, ...midPoints, dest];
}
