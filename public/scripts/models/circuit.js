
import {COMPONENT_DEFINITIONS} from "../components.js";
import Utils from "../math/utils.js";
import {GeometryUtils, ALIGNMENT_DELTAS} from "../rendering/geometry.js";
import Position from "../rendering/position.js";

export default class Circuit {

    constructor(circuit, posTemplates, dirTemplates, imageSize, analyser) {
        this.hertz = circuit.hertz;
        this.pins = circuit.pins;
        this.lines = circuit.lines;
        this.components = circuit.components;
        this.newPinId = Circuit.getNewID(this.pins);
        this.newLineId = Circuit.getNewID(this.lines);
        this.newComponentId = Circuit.getNewID(this.components);
        this.posTemplates = posTemplates;
        this.dirTemplates = dirTemplates;
        this.imageSize = imageSize;
        this.analyser = analyser;
    }

    static getNewID(obj) {
        const objKeys = Object.keys(obj);
        const ids = objKeys.map((key) => Number(key));
        return objKeys.length === 0 ? 0 : ids.reduce((max, value) => Math.max(max, value)) + 1;
    }

    setFreq(freq) {
        this.hertz = freq;
    }

    removeLineFromPin(lineId, pinId) {
        const pinLineSet = new Set(this.pins[pinId].lines);
        pinLineSet.delete(lineId);
        this.pins[pinId].lines = [...pinLineSet];
    }

    deleteLine(lineId) {
        const [pin1, pin2] = this.lines[lineId];
        this.removeLineFromPin(lineId, pin1);
        this.removeLineFromPin(lineId, pin2);
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
        const pinDir = GeometryUtils.getDirectionsFromTemplate(ALIGNMENT_DELTAS[alignment], this.dirTemplates[pinCount]);
        const pinPos = GeometryUtils.getPositionsFromTemplate(pos, ALIGNMENT_DELTAS[alignment], this.posTemplates[pinCount], this.imageSize);
        const id = this.newComponentId;
        const pinIds = Utils.range(this.newPinId, this.newPinId + pinCount);

        this.components[id] = {id, type, value: parseFloat(value), direction: pinDir[0], pins: pinIds, pos: pos.toObject()};

        this.newComponentId++;

        for (let index = 0; index < pinCount; index++) {
            this.addComponentPin(id, pinPos[index].toObject(), pinDir[index]);
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
        [pin1, pin2, pin3].forEach((pin) => {
            this.addLine(pinId, pin);
        });
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
        comp.direction = GeometryUtils.rotateVector(comp.direction);
        const componentPosition = Position.fromObject(comp.pos);
        const pinPositions = GeometryUtils.getPositionsFromTemplate(componentPosition, comp.direction, this.posTemplates[comp.pins.length], this.imageSize);
        const directions = GeometryUtils.getDirectionsFromTemplate(comp.direction, this.dirTemplates[comp.pins.length]);

        comp.pins.forEach((pinId, index) => {
            this.pins[pinId].direction = directions[index];
            this.moveNode(pinId, pinPositions[index]);
        });
    }

    moveComponent(id, pos) {
        const comp = this.components[id];
        const pinPositions = GeometryUtils.getPositionsFromTemplate(pos, comp.direction, this.posTemplates[comp.pins.length], this.imageSize);
        comp.pos = pos.toObject();
        comp.pins.forEach((pinId, index) => {
            this.moveNode(pinId, pinPositions[index]);
        });
    }

    moveNode(pinId, pos) {
        this.pins[pinId].pos = pos.toObject();
    }

    setComponentValue(id, value) {
        this.components[id].value = parseFloat(value);
    }

    simulate() {
        return this.analyser.getCurrentsAndVoltages(this);
    }
}
