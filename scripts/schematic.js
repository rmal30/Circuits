class Schematic {
    constructor(doc) {
        this.doc = doc;
        this.svg = this.doc.getElementById("svg");
    }

    removeElement(id, type) {
        const elementId = getElementId(id, type);
        const element = this.doc.getElementById(elementId);
        this.svg.removeChild(element);
    }

    deleteLine(lineId) {
        this.removeElement(lineId, ELEMENT_TYPES.LINE);
    }

    deleteNode(pin) {
        pin.lines.forEach((lineId) => this.deleteLine(lineId));
        this.removeElement(pin.id, ELEMENT_TYPES.PIN);
    }

    deleteComponent(component, pins) {
        component.pins.forEach((pinId) => {
            pins[pinId].lines.forEach((lineId) => this.deleteLine(lineId));
            this.removeElement(pinId, ELEMENT_TYPES.PIN);
        });
        this.removeElement(component.id, ELEMENT_TYPES.LABEL);
        this.removeElement(component.id, ELEMENT_TYPES.IMAGE);
    }

    addComponent(pins, component) {
        const angle = getAngleFromDirection(component.direction);
        const info = COMPONENT_DEFINITIONS[component.type];
        this.svg.appendChild(CircuitXML.newImage(component.id, component.pos, component.type, angle));

        let dlx, dly;
        if (component.direction[0] === 0) {
            [dlx, dly] = LABEL_POSITIONS.V;
        } else {
            [dlx, dly] = LABEL_POSITIONS.H;
        }

        const labelPos = component.pos.offset(dlx, dly);
        const labelValue = component.value ? `${component.value} ${info.unit}` : "";
        this.svg.appendChild(CircuitXML.newLabel(component.id, labelPos, labelValue));
        component.pins.forEach((pinId) => this.svg.appendChild(CircuitXML.newPin(pinId, pins[pinId].pos)));
    }

    addLine(id, pin1, pin2) {
        const polyStr = findPolyStr(pin1, pin2);
        this.svg.appendChild(CircuitXML.newLine(id, polyStr));
    }

    splitLineWithNode(circuit, lineId, newPinId) {
        this.deleteLine(lineId);
        this.addPin(circuit.pins[newPinId]);
        for (const newLineId of circuit.pins[newPinId].lines) {
            const [pinId1, pinId2] = circuit.lines[newLineId];
            this.addLine(newLineId, circuit.pins[pinId1], circuit.pins[pinId2]);
        }
    }

    addPin(pin) {
        this.svg.appendChild(CircuitXML.newPin(pin.id, pin.pos));
    }

    updateComponent(comp) {
        const pplPos = getLabelPinPos(comp.pos, comp.direction, comp.pins.length);
        comp.pins.forEach((pinId, index) => {
            this.updatePin(pinId, pplPos[index]);
        });

        const labelElementId = getElementId(comp.id, ELEMENT_TYPES.LABEL);
        const label = this.doc.getElementById(labelElementId);
        const [labelPos] = pplPos.slice(-1);
        const compInfo = COMPONENT_DEFINITIONS[comp.type];
        CircuitXML.updateLabel(label, labelPos, `${comp.value} ${compInfo.unit}`);

        const imageElementId = getElementId(comp.id, ELEMENT_TYPES.IMAGE);
        const img = this.doc.getElementById(imageElementId);
        const angle = getAngleFromDirection(comp.direction);
        CircuitXML.updateImage(img, comp.pos, angle);
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
        this.updatePin(pinId, circuit.pins[pinId].pos);
        circuit.pins[pinId].lines.forEach((lineId) => this.updateLine(circuit.pins, circuit.lines, lineId));
    }

    updatePin(pinID, position) {
        const elementId = getElementId(pinID, ELEMENT_TYPES.PIN);
        const pinElement = this.doc.getElementById(elementId);
        CircuitXML.updatePin(pinElement, position);
    }

    updateLine(pins, lines, lineId) {
        const [pinId1, pinId2] = lines[lineId];
        const elementId = getElementId(lineId, ELEMENT_TYPES.LINE);
        const lineElement = this.doc.getElementById(elementId);
        const newPolyStr = findPolyStr(pins[pinId1], pins[pinId2]);
        CircuitXML.updateLine(lineElement, newPolyStr);
    }
}
