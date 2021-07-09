import {COMPONENT_DEFINITIONS} from "./config/components.js";
import {DOT_SIZE, IMAGE_SIZE, LABEL_POSITIONS, getLabelPinPos} from "./config/layout.js";
import {planPolyLine} from "./rendering/polyline.js";
import Position from "./rendering/position.js";

export const COMPONENT_RANGE = 0.7;
export const LINE_RANGE = 10;
export const PIN_RANGE = 1;

function getLines(pointsStr) {
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


function isNearLine(linePoints, position, range) {
    const [point1, point2] = linePoints;
    const minX = Math.min(point1.x, point2.x) - range;
    const maxX = Math.max(point1.x, point2.x) + range;
    const minY = Math.min(point1.y, point2.y) - range;
    const maxY = Math.max(point1.y, point2.y) + range;
    return position.x >= minX && position.x <= maxX && position.y >= minY && position.y <= maxY;
}

function getAngleFromDirection(direction) {
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
export default class Schematic {
    constructor(doc, graphics) {
        this.doc = doc;
        this.graphics = graphics;
    }

    deleteLine(lineId) {
        this.graphics.removeLine(lineId);
    }

    deleteNode(pin) {
        pin.lines.forEach((lineId) => this.graphics.removeLine(lineId));
        this.graphics.removePin(pin.id);
    }

    deleteComponent(component, pins) {
        component.pins.forEach((pinId) => {
            pins[pinId].lines.forEach((lineId) => this.graphics.removeLine(lineId));
            this.graphics.removePin(pinId);
        });
        this.graphics.removeLabel(component.id);
        this.graphics.removeImage(component.id);
    }

    addComponent(pins, component) {
        const angle = getAngleFromDirection(component.direction);
        const info = COMPONENT_DEFINITIONS[component.type];
        this.graphics.addImage(component.id, component.pos, component.type, angle);

        const [dlx, dly] = component.direction.dx === 0 ? LABEL_POSITIONS.V : LABEL_POSITIONS.H;
        const labelPos = component.pos.offset(dlx, dly);
        const labelValue = component.value ? `${component.value} ${info.unit}` : "";
        this.graphics.addLabel(component.id, labelPos, labelValue);
        component.pins.forEach((pinId) => this.graphics.addPin(pinId, pins[pinId].pos));
    }

    addLine(id, pin1, pin2) {
        const lines = planPolyLine(pin1, pin2, IMAGE_SIZE / 2);
        this.graphics.addPolyline(id, lines);
    }

    addPin(pin) {
        this.graphics.addPin(pin.id, pin.pos);
    }

    splitLineWithNode(circuit, lineId, newPinId) {
        this.graphics.removeLine(lineId);
        this.addPin(circuit.pins[newPinId]);
        for (const newLineId of circuit.pins[newPinId].lines) {
            const [pinId1, pinId2] = circuit.lines[newLineId];
            this.addLine(newLineId, circuit.pins[pinId1], circuit.pins[pinId2]);
        }
    }

    updateComponent(comp) {
        const pplPos = getLabelPinPos(comp.pos, comp.direction, comp.pins.length);
        comp.pins.forEach((pinId, index) => {
            this.graphics.updatePin(pinId, pplPos[index]);
        });

        const [labelPos] = pplPos.slice(-1);
        const compInfo = COMPONENT_DEFINITIONS[comp.type];
        this.graphics.updateLabel(comp.id, labelPos, `${comp.value} ${compInfo.unit}`);

        const angle = getAngleFromDirection(comp.direction);
        this.graphics.updateImage(comp.id, comp.pos, angle);
    }

    updateComponentAndLines(circuit, componentId) {
        const comp = circuit.components[componentId];
        this.updateComponent(comp);
        comp.pins.forEach((pinId) => {
            circuit.pins[pinId].lines.forEach((lineId) => {
                this.updateLine(circuit.pins, circuit.lines, lineId);
            });
        });
    }

    updateNodeAndLines(circuit, pinId) {
        this.graphics.updatePin(pinId, circuit.pins[pinId].pos);
        circuit.pins[pinId].lines.forEach((lineId) => this.updateLine(circuit.pins, circuit.lines, lineId));
    }

    updateLine(pins, lines, lineId) {
        const [pinId1, pinId2] = lines[lineId];
        const newLines = planPolyLine(pins[pinId1], pins[pinId2], IMAGE_SIZE / 2);
        this.graphics.updatePolyline(lineId, newLines);
    }

    isNearPin(pinId, position, range) {
        const pinPosition = this.graphics.getPinPosition(pinId);
        const dx = Math.abs(position.x - pinPosition.x);
        const dy = Math.abs(position.y - pinPosition.y);
        return dx < range * DOT_SIZE && dy < range * DOT_SIZE;
    }

    isNearPolyLine(lineId, position, range) {
        const lines = getLines(this.graphics.getPolyStr(lineId));
        return lines.some((linePoints) => isNearLine(linePoints, position, range));
    }

    isNearImage(componentId, position, range) {
        const imagePosition = this.graphics.getImagePosition(componentId);
        const dx = Math.abs(position.x - imagePosition.x);
        const dy = Math.abs(position.y - imagePosition.y);
        return dx < range * IMAGE_SIZE && dy < range * IMAGE_SIZE;
    }

    isNearby(circuit, position) {
        const {pins, lines, components} = circuit;
        const isNearPins = Object.keys(pins).some((pinId) => this.isNearPin(pinId, position, PIN_RANGE));
        const isNearComponents = Object.keys(components).some((id) => this.isNearImage(id, position, COMPONENT_RANGE));
        const isNearLines = Object.keys(lines).some((id) => this.isNearPolyLine(id, position, LINE_RANGE));
        return [isNearLines, isNearComponents, isNearPins].some((near) => near);
    }
}
