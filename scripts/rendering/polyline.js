import {IMAGE_SIZE} from "../config/layout.js";
import Position from "./position.js";

/**
 * Plan a line which can connect two horizontal components
 */
export function findMidPointsWithBothHorizontal(dir0, dir1, min, max, origin, mid, dest, dx, dy) {
    const halfImgSize = IMAGE_SIZE / 2;
    const midPoints = [];
    if (dir1[0] * dir0[0] > 0) {
        if (Math.abs(dy) > halfImgSize) {
            if (dir1[0] < 0) {
                midPoints.push([min.x - halfImgSize, origin.y]);
                midPoints.push([min.x - halfImgSize, dest.y]);
            } else {
                midPoints.push([max.x + halfImgSize, origin.y]);
                midPoints.push([max.x + halfImgSize, dest.y]);
            }
        } else {
            midPoints.push([origin.x + dir0[0] * halfImgSize, origin.y]);
            if (dy * dx * dir1[0] >= 0) {
                midPoints.push([origin.x + dir0[0] * halfImgSize, max.y - halfImgSize]);
                midPoints.push([dest.x + dir1[0] * halfImgSize, max.y - halfImgSize]);
            } else {
                midPoints.push([origin.x + dir0[0] * halfImgSize, min.y + halfImgSize]);
                midPoints.push([dest.x + dir1[0] * halfImgSize, min.y + halfImgSize]);
            }
            midPoints.push([dest.x + dir1[0] * halfImgSize, dest.y]);
        }
    } else if (dx * dir0[0] >= 0 && (Math.abs(dx) > IMAGE_SIZE || Math.abs(dy) < IMAGE_SIZE)) {
            midPoints.push([mid.x, origin.y]);
            midPoints.push([mid.x, dest.y]);
    } else {
        midPoints.push([origin.x + dir0[0] * halfImgSize, origin.y]);
        if (Math.abs(dy) >= IMAGE_SIZE) {
            midPoints.push([origin.x + dir0[0] * halfImgSize, mid.y]);
            midPoints.push([dest.x + dir1[0] * halfImgSize, mid.y]);
        } else {
            midPoints.push([origin.x + dir0[0] * halfImgSize, min.y - halfImgSize]);
            midPoints.push([dest.x + dir1[0] * halfImgSize, min.y - halfImgSize]);
        }
        midPoints.push([dest.x + dir1[0] * halfImgSize, dest.y]);
    }
    return midPoints;
}

/**
 * Plan a line which can connect two vertical components
 */
export function findMidPointsWithBothVertical(dir0, dir1, min, max, origin, mid, dest, dx, dy) {
    const halfImgSize = IMAGE_SIZE / 2;
    const midPoints = [];
    if (dy * dir0[1] > 0 && dy * dir1[1] < 0 && Math.abs(dy) > IMAGE_SIZE) {
        midPoints.push([origin.x, mid.y]);
        midPoints.push([dest.x, mid.y]);
    } else if (dir1[1] * dir0[1] > 0 && Math.abs(dx) > halfImgSize) {
        if (dir1[1] < 0) {
            midPoints.push([origin.x, min.y - IMAGE_SIZE]);
            midPoints.push([dest.x, min.y - IMAGE_SIZE]);
        } else {
            midPoints.push([origin.x, max.y + IMAGE_SIZE]);
            midPoints.push([dest.x, max.y + IMAGE_SIZE]);
        }
    } else if (Math.abs(dx) > IMAGE_SIZE) {
        midPoints.push([origin.x, origin.y + dir0[1] * halfImgSize]);
        midPoints.push([mid.x, origin.y + dir0[1] * halfImgSize]);
        midPoints.push([mid.x, dest.y + dir1[1] * halfImgSize]);
        midPoints.push([dest.x, dest.y + dir1[1] * halfImgSize]);
    } else if (dy * dir0[1] < 0 || dy * dir1[1] > 0) {
        midPoints.push([origin.x, origin.y + dir0[1] * halfImgSize]);
        if (dir1[1] * dir0[1] > 0) {
            if (dx * dy * dir1[1] >= 0) {
                midPoints.push([max.x - halfImgSize, origin.y + dir0[1] * halfImgSize]);
                midPoints.push([max.x - halfImgSize, dest.y + dir1[1] * halfImgSize]);
            } else {
                midPoints.push([min.x + halfImgSize, origin.y + dir0[1] * halfImgSize]);
                midPoints.push([min.x + halfImgSize, dest.y + dir0[1] * halfImgSize]);
            }
        } else {
            midPoints.push([min.x - halfImgSize, origin.y + dir0[1] * halfImgSize]);
            midPoints.push([min.x - halfImgSize, dest.y + dir1[1] * halfImgSize]);
        }
        midPoints.push([dest.x, dest.y + dir1[1] * halfImgSize]);
    } else {
        midPoints.push([origin.x, mid.y]);
        midPoints.push([dest.x, mid.y]);
    }
    return midPoints;
}

/**
 * Plan a line which can connect two components
 */
export function findPolyStr(pin0, pin1) {
    const origin = pin0.pos;
    const dest = pin1.pos;
    let dir0 = pin0.direction;
    let dir1 = pin1.direction;
    const dx = dest.x - origin.x;
    const dy = dest.y - origin.y;
    const mid = origin.offset(dx * 0.5, dy * 0.5);
    const min = new Position(Math.min(origin.x, dest.x), Math.min(origin.y, dest.y));
    const max = new Position(Math.max(origin.x, dest.x), Math.max(origin.y, dest.y));
    let polyLinePoints = [];
    let midPoints = [];

    if (!dir0) {
        dir0 = [dx * Math.abs(dir1[1]), dy * Math.abs(dir1[0])];
    }

    if (!dir1) {
        dir1 = [-dx * Math.abs(dir0[1]), -dy * Math.abs(dir0[0])];
    }

    if (dir0 && dir1) {
        if (dir0[1] === 0 && dir1[1] === 0) {
            midPoints = findMidPointsWithBothHorizontal(dir0, dir1, min, max, origin, mid, dest, dx, dy);
        } else if (dir0[0] === 0 && dir1[0] === 0) {
            midPoints = findMidPointsWithBothVertical(dir0, dir1, min, max, origin, mid, dest, dx, dy);
        } else if (dir0[0] === 0 && dir1[1] === 0) {
            if (dy * dir0[1] > 0 && dx * dir1[0] < 0) {
                midPoints.push([origin.x, dest.y]);
            } else {
                midPoints.push([dest.x, origin.y]);
            }
        } else if (dx * dir0[0] > 0 && dy * dir1[1] < 0) {
            midPoints.push([dest.x, origin.y]);
        } else {
            midPoints.push([origin.x, dest.y]);
        }
    }

    polyLinePoints.push(origin.coords());
    polyLinePoints = polyLinePoints.concat(midPoints);
    polyLinePoints.push(dest.coords());
    return polyLinePoints.map((point) => point.join(",")).join(" ");
}
