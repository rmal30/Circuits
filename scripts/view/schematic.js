class Schematic {
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

        let dlx, dly;
        if (component.direction[0] === 0) {
            [dlx, dly] = LABEL_POSITIONS.V;
        } else {
            [dlx, dly] = LABEL_POSITIONS.H;
        }

        const labelPos = component.pos.offset(dlx, dly);
        const labelValue = component.value ? `${component.value} ${info.unit}` : "";
        this.graphics.addLabel(component.id, labelPos, labelValue);
        component.pins.forEach((pinId) => this.graphics.addPin(pinId, pins[pinId].pos));
    }

    addLine(id, pin1, pin2) {
        const polyStr = findPolyStr(pin1, pin2);
        this.graphics.addLine(id, polyStr);
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
        const newPolyStr = findPolyStr(pins[pinId1], pins[pinId2]);
        this.graphics.updateLine(lineId, newPolyStr);
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
