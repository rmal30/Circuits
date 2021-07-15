import {COMPONENT_DEFINITIONS} from "../components.js";

import {GeometryUtils} from "../rendering/geometry.js";
import {ELEMENT_TYPES, getElementId} from "./elements.js";
import Position from "../rendering/position.js";

const COMPONENT_RANGE = 0.7;
const LINE_RANGE = 10;
const PIN_RANGE = 1;

export default class Schematic {
    constructor(graphics, planPolyline, styles, dotSize, imageSize, labelPositions, posTemplates) {
        this.graphics = graphics;
        this.planPolyline = planPolyline;
        this.styles = styles;
        this.dotSize = dotSize;
        this.imageSize = imageSize;
        this.labelPositions = labelPositions;
        this.posTemplates = posTemplates;
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

    deleteComponent(component, pins) {
        component.pins.forEach((pinId) => {
            this.deleteNode({lines: pins[pinId].lines, id: pinId});
        });
        this.deleteLabel(component.id);
        this.deleteImage(component.id);
    }

    setSelection(item) {
        if (item.selected) {
            this.graphics.setElementStyle(getElementId(item.id, item.type), this.styles.select[item.type]);
        }
    }

    clearSelection(item) {
        if (item.selected) {
            this.graphics.setElementStyle(getElementId(item.id, item.type), this.styles.deselect[item.type]);
        }
    }

    addComponent(pins, component) {
        const position = Position.fromObject(component.pos);

        const angle = GeometryUtils.getAngleFromDirection(component.direction);
        const elementId = getElementId(component.id, ELEMENT_TYPES.IMAGE);
        this.graphics.addImage(elementId, `images/${component.type}.png`, this.imageSize, position, angle);

        const info = COMPONENT_DEFINITIONS[component.type];
        const [dlx, dly] = component.direction.dx === 0 ? this.labelPositions.V : this.labelPositions.H;
        const labelPos = position.offset(dlx, dly);
        const labelValue = component.value ? `${component.value} ${info.unit}` : "";
        this.graphics.addLabel(getElementId(component.id, ELEMENT_TYPES.LABEL), labelPos, labelValue);
        component.pins.forEach((pinId) => this.addPin({id: pinId, pos: pins[pinId].pos}));
    }

    addLine(id, pin1, pin2) {
        const lines = this.planPolyline(pin1, pin2, this.imageSize / 2);
        this.graphics.addPolyline(getElementId(id, ELEMENT_TYPES.LINE), lines, this.styles.initial.Line);
    }

    addPin(pin) {
        const pinPosition = Position.fromObject(pin.pos);
        this.graphics.addCircle(getElementId(pin.id, ELEMENT_TYPES.PIN), this.dotSize, pinPosition);
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
        const compPosition = Position.fromObject(comp.pos);
        const pinPositions = GeometryUtils.getPositionsFromTemplate(compPosition, comp.direction, this.posTemplates[comp.pins.length], this.imageSize);
        comp.pins.forEach((pinId, index) => {
            const elementId = getElementId(pinId, ELEMENT_TYPES.PIN);
            this.graphics.updateCircle(elementId, pinPositions[index]);
        });

        const alignment = comp.direction.dx === 0 ? "V" : "H";
        const [dlx, dly] = this.labelPositions[alignment];
        const labelPosition = compPosition.offset(dlx, dly);
        
        const compInfo = COMPONENT_DEFINITIONS[comp.type];
        const labelElementId = getElementId(comp.id, ELEMENT_TYPES.LABEL);
        this.graphics.updateLabel(labelElementId, labelPosition, `${comp.value} ${compInfo.unit}`);

        const angle = GeometryUtils.getAngleFromDirection(comp.direction);
        const imageElementId = getElementId(comp.id, ELEMENT_TYPES.IMAGE);
        this.graphics.updateImage(imageElementId, this.imageSize, compPosition, angle);
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
        const newLines = this.planPolyline(pins[pinId1], pins[pinId2], this.imageSize / 2);
        const elementId = getElementId(lineId, ELEMENT_TYPES.LINE);
        this.graphics.updatePolyline(elementId, newLines);
    }

    isNearPin(pinId, position, range) {
        const elementId = getElementId(pinId, ELEMENT_TYPES.PIN);
        const pinPosition = this.graphics.getCirclePosition(elementId);
        return GeometryUtils.isNearPoint(pinPosition, position, range * this.dotSize);
    }

    isNearPolyLine(lineId, position, range) {
        const elementId = getElementId(lineId, ELEMENT_TYPES.LINE);
        const lines = this.graphics.getPolylinePoints(elementId);
        return lines.some((linePoints) => GeometryUtils.isNearLine(linePoints, position, range));
    }

    isNearImage(componentId, position, range) {
        const elementId = getElementId(componentId, ELEMENT_TYPES.IMAGE);
        const imagePosition = this.graphics.getImagePosition(elementId, this.imageSize);
        return GeometryUtils.isNearPoint(imagePosition, position, range * this.imageSize);   
    }

    isNearby(circuit, position) {
        const {pins, lines, components} = circuit;
        const isNearPins = Object.keys(pins).some((pinId) => this.isNearPin(pinId, position, PIN_RANGE));
        const isNearComponents = Object.keys(components).some((id) => this.isNearImage(id, position, COMPONENT_RANGE));
        const isNearLines = Object.keys(lines).some((id) => this.isNearPolyLine(id, position, LINE_RANGE));
        return [isNearLines, isNearComponents, isNearPins].some((near) => near);
    }
}
