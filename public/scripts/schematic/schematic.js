import {COMPONENT_DEFINITIONS} from "../components.js";
import {DOT_SIZE, IMAGE_SIZE, LABEL_POSITIONS, getLabelPinPos} from "./layout.js";
import {GeometryUtils} from "../rendering/geometry.js";
import {planPolyLine} from "../rendering/polyline.js";
import { ELEMENT_TYPES, getElementId } from "./elements.js";
import { DEFAULT_LINE_STYLE, STYLES } from "./style.js";

export const COMPONENT_RANGE = 0.7;
export const LINE_RANGE = 10;
export const PIN_RANGE = 1;

export default class Schematic {
    constructor(graphics) {
        this.graphics = graphics;
    }

    deleteLine(lineId) {
        this.graphics.removeElement(getElementId(lineId, ELEMENT_TYPES.LINE));
    }

    deletePin(pinId) {
        this.graphics.removeElement(getElementId(pinId, ELEMENT_TYPES.PIN));
    }

    deleteImage(id) {
        this.graphics.removeElement(getElementId(id, ELEMENT_TYPES.IMAGE));
    }

    deleteLabel(id) {
        this.graphics.removeElement(getElementId(id, ELEMENT_TYPES.LABEL));
    }

    deleteNode(pin) {
        pin.lines.forEach((lineId) => this.deleteLine(lineId));
        this.deletePin(pin.id);
    }

    setSelection(item) {
        if (item.selected) {
            this.graphics.setElementStyle(getElementId(item.id, item.type), STYLES.select[item.type]);
        }
    }

    clearSelection(item) {
        if (item.selected) {
            this.graphics.setElementStyle(getElementId(item.id, item.type), STYLES.deselect[item.type]);
        }
    }

    deleteComponent(component, pins) {
        component.pins.forEach((pinId) => {
            this.deleteNode({lines: pins[pinId].lines, id: pinId});
        });
        this.deleteLabel(component.id);
        this.deleteImage(component.id);
    }

    addComponent(pins, component) {
        const angle = GeometryUtils.getAngleFromDirection(component.direction);
        const info = COMPONENT_DEFINITIONS[component.type];
        const elementId = getElementId(component.id, ELEMENT_TYPES.IMAGE);
        this.graphics.addImage(elementId, `images/${component.type}.png`, IMAGE_SIZE, component.pos, angle);

        const [dlx, dly] = component.direction.dx === 0 ? LABEL_POSITIONS.V : LABEL_POSITIONS.H;
        const labelPos = component.pos.offset(dlx, dly);
        const labelValue = component.value ? `${component.value} ${info.unit}` : "";
        this.graphics.addLabel(getElementId(component.id, ELEMENT_TYPES.LABEL), labelPos, labelValue);
        component.pins.forEach((pinId) => this.addPin({id: pinId, pos: pins[pinId].pos}));
    }

    addLine(id, pin1, pin2) {
        const lines = planPolyLine(pin1, pin2, IMAGE_SIZE / 2);
        this.graphics.addPolyline(getElementId(id, ELEMENT_TYPES.LINE), lines, DEFAULT_LINE_STYLE);
    }

    addPin(pin) {
        this.graphics.addCircle(getElementId(pin.id, ELEMENT_TYPES.PIN), DOT_SIZE, pin.pos);
    }

    splitLineWithNode(circuit, lineId, newPinId) {
        this.deleteLine(lineId);
        this.addPin(circuit.pins[newPinId]);
        for (const newLineId of circuit.pins[newPinId].lines) {
            const [pinId1, pinId2] = circuit.lines[newLineId];
            this.addLine(newLineId, circuit.pins[pinId1], circuit.pins[pinId2]);
        }
    }

    updateComponent(comp) {
        const pplPos = getLabelPinPos(comp.pos, comp.direction, comp.pins.length);
        comp.pins.forEach((pinId, index) => {
            const elementId = getElementId(pinId, ELEMENT_TYPES.PIN);
            this.graphics.updateCircle(elementId, pplPos[index]);
        });

        const [labelPos] = pplPos.slice(-1);
        const compInfo = COMPONENT_DEFINITIONS[comp.type];
        const labelElementId = getElementId(comp.id, ELEMENT_TYPES.LABEL);
        this.graphics.updateLabel(labelElementId, labelPos, `${comp.value} ${compInfo.unit}`);

        const angle = GeometryUtils.getAngleFromDirection(comp.direction);
        const imageElementId = getElementId(comp.id, ELEMENT_TYPES.IMAGE);
        this.graphics.updateImage(imageElementId, IMAGE_SIZE, comp.pos, angle);
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
        const elementId = getElementId(pinId, ELEMENT_TYPES.PIN);
        this.graphics.updateCircle(elementId, circuit.pins[pinId].pos);
        circuit.pins[pinId].lines.forEach((lineId) => this.updateLine(circuit.pins, circuit.lines, lineId));
    }

    updateLine(pins, lines, lineId) {
        const [pinId1, pinId2] = lines[lineId];
        const newLines = planPolyLine(pins[pinId1], pins[pinId2], IMAGE_SIZE / 2);
        const elementId = getElementId(lineId, ELEMENT_TYPES.LINE);
        this.graphics.updatePolyline(elementId, newLines);
    }

    isNearPin(pinId, position, range) {
        const elementId = getElementId(pinId, ELEMENT_TYPES.PIN);
        const pinPosition = this.graphics.getCirclePosition(elementId);
        const dx = Math.abs(position.x - pinPosition.x);
        const dy = Math.abs(position.y - pinPosition.y);
        return dx < range * DOT_SIZE && dy < range * DOT_SIZE;
    }

    isNearPolyLine(lineId, position, range) {
        const elementId = getElementId(lineId, ELEMENT_TYPES.LINE);
        const lines = this.graphics.getPolylinePoints(elementId);
        return lines.some((linePoints) => GeometryUtils.isNearLine(linePoints, position, range));
    }

    isNearImage(componentId, position, range) {
        const elementId = getElementId(componentId, ELEMENT_TYPES.IMAGE);
        const imagePosition = this.graphics.getImagePosition(elementId, IMAGE_SIZE);
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
