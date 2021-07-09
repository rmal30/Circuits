import Analyser from "./analysis/analyser.js";
import {COMPONENT_DEFINITIONS} from "./config/components.js";
import Utils from "./utils.js";
import { DIRECTION_TEMPLATE, getPinPositions } from "./config/layout.js";
import ComplexOperations from "./math/complex.js";

export const ALIGNMENT_DELTAS = {
    H: {dx: 1, dy: 0},
    V: {dx: 0, dy: 1}
};


function rotateVector(vec) {
    return {dx: -vec.dy, dy: vec.dx};
}

export function getPinDirections(alignmentDelta, count) {
    return DIRECTION_TEMPLATE[count].map((delta) => {
        const newDelta = ComplexOperations.multiply([delta.dx, delta.dy], [alignmentDelta.dx, alignmentDelta.dy])
        return {dx: newDelta[0], dy: newDelta[1]}
    });
}


export default class Circuit {

    constructor(hertz, pins, lines, components) {
        this.hertz = hertz;
        this.pins = pins;
        this.lines = lines;
        this.components = components;
        this.newPinId = Circuit.getNewID(pins);
        this.newLineId = Circuit.getNewID(lines);
        this.newComponentId = Circuit.getNewID(components);
    }

    static getNewID(obj) {
        const objKeys = Object.keys(obj);
        const ids = objKeys.map((key) => Number(key));
        return objKeys.length === 0 ? 0 : ids.reduce((max, value) => Math.max(max, value)) + 1;
    }

    setFreq(freq) {
        this.hertz = freq;
    }

    deleteLine(lineId) {
        const [pin1, pin2] = this.lines[lineId];

        const pin1LineSet = new Set(this.pins[pin1].lines);
        pin1LineSet.delete(lineId);
        this.pins[pin1].lines = [...pin1LineSet];

        const pin2LineSet = new Set(this.pins[pin2].lines);
        pin2LineSet.delete(lineId);
        this.pins[pin2].lines = [...pin2LineSet];

        delete this.lines[lineId];
    }

    deleteNode(pinID) {
        this.pins[pinID].lines.forEach((lineID) => this.deleteLine(lineID));
        delete this.pins[pinID];
    }

    deleteComponent(componentID) {
        this.components[componentID].pins.forEach((pinID) => this.deleteNode(pinID));
        delete this.components[componentID];
    }

    addComponent(type, value, pos, alignment) {
        const {pinCount} = COMPONENT_DEFINITIONS[type];
        const pinDir = getPinDirections(ALIGNMENT_DELTAS[alignment], pinCount);
        const pinPos = getPinPositions(pos, ALIGNMENT_DELTAS[alignment], pinCount);
        const id = this.newComponentId;
        const pinIds = Utils.range(this.newPinId, this.newPinId + pinCount);

        this.components[id] = {
            id: id,
            type: type,
            value: parseFloat(value),
            direction: pinDir[0],
            pins: pinIds,
            pos: pos
        };

        this.newComponentId++;

        for (let index = 0; index < pinCount; index++) {
            this.addComponentPin(id, pinPos[index], pinDir[index]);
        }

        return id;
    }

    addLine(pinId1, pinId2) {
        const lineId = this.newLineId;
        this.lines[lineId] = [pinId1, pinId2];
        this.pins[pinId1].lines.push(lineId);
        this.pins[pinId2].lines.push(lineId);
        this.newLineId++;
        return lineId;
    }

    splitLineWithNode(pin3, lineId, pos) {
        const [pin1, pin2] = this.lines[lineId];
        this.deleteLine(lineId);
        const pinId = this.addNode(pos);
        this.addLine(pinId, pin1);
        this.addLine(pinId, pin2);
        this.addLine(pinId, pin3);
        return pinId;
    }

    addComponentPin(componentId, pos, direction) {
        const pinId = this.newPinId;
        this.pins[pinId] = {id: pinId, comp: componentId, direction: direction, lines: [], pos: pos};
        this.newPinId++;
        return pinId;
    }

    addNode(pos) {
        const pinId = this.newPinId;
        this.pins[pinId] = {id: pinId, pos: pos, lines: []};
        this.newPinId++;
        return pinId;
    }

    rotateComponent(id) {
        const comp = this.components[id];
        comp.direction = rotateVector(comp.direction);
        const pinPositions = getPinPositions(comp.pos, comp.direction, comp.pins.length);
        const directions = getPinDirections(comp.direction, comp.pins.length);

        comp.pins.forEach((pinId, index) => {
            this.pins[pinId].direction = directions[index];
            this.moveNode(pinId, pinPositions[index]);
        });
    }

    moveComponent(id, pos) {
        const comp = this.components[id];
        const pinPositions = getPinPositions(pos, comp.direction, comp.pins.length);
        comp.pos = pos;
        comp.pins.forEach((pinId, index) => {
            this.moveNode(pinId, pinPositions[index]);
        });
    }

    moveNode(pinId, pos) {
        this.pins[pinId].pos = pos;
    }

    setComponentValue(id, value) {
        this.components[id].value = parseFloat(value);
    }

    simulate() {
        return Analyser.getCurrentsAndVoltages(this);
    }
}
