class Circuit {
    constructor(hertz, pins, lines, components) {
        this.hertz = hertz;
        this.pins = pins;
        this.lines = lines;
        this.components = components;
    }

    setFreq(freq) {
        this.hertz = freq;
    }

    deleteLine(lineIndex) {
        const linePins = this.lines[lineIndex].split("_");
        this.lines[lineIndex] = "";
        const pinLines = [this.pins[linePins[0]].lines, this.pins[linePins[1]].lines];
        pinLines[0].splice(pinLines[0].indexOf(lineIndex), 1);
        pinLines[1].splice(pinLines[1].indexOf(lineIndex), 1);
    }

    addComponent(id, type, value, pinCount, pos, directionStr) {
        const direction = directions[directionStr];
        const pinDir = getPinDirections(direction, COMPONENT_DEFINITIONS[type].pinCount);
        const pinPos = getPinPositions(pos, direction, COMPONENT_DEFINITIONS[type].pinCount);
        this.components.push({
            id: id,
            type: type,
            value: value,
            direction: pinDir[0],
            pins: range(pinCount, pinCount + COMPONENT_DEFINITIONS[type].pinCount),
            pos: pos.offset(0, -IMAGE_SIZE / 2)
        });
        for (let i = 0; i < COMPONENT_DEFINITIONS[type].pinCount; i++) {
            this.pins[pinCount + i] = {
                comp: id,
                direction: pinDir[i],
                lines: [],
                pos: pinPos[i]
            };
        }
    }

    addLine(lineID, prevPointID, id) {
        this.lines.push(lineID);
        this.pins[prevPointID].lines.push(this.lines.length - 1);
        this.pins[id].lines.push(this.lines.length - 1);
    }

    splitLine(lineID, pos, pinCount) {
        const [pin1, pin2] = lineID.split("_");
        const lineID1 = pin1 + "_" + pinCount;
        const lineID2 = pin2 + "_" + pinCount;
        const lineIndex1 = this.lines.indexOf(lineID);
        const lineIndex2 = this.lines.length;
        this.lines[lineIndex1] = lineID1;
        this.lines.push(lineID2);
        const lines2 = this.pins[pin2].lines;
        lines2[lines2.indexOf(lineIndex1)] = lineIndex2;
        this.pins[pinCount] = {pos: pos, comp: "", lines: [lineIndex1, lineIndex2], direction: ""};
    }

    rotateComponent(id) {
        const comp = this.components[id];
        const halfImgSize = IMAGE_SIZE / 2;
        comp.direction = rotateVector(comp.direction);
        const pplPos = getLabelPinPos(comp.pos.offset(0, halfImgSize), comp.direction, comp.pins.length);
        const directions = getPinDirections(comp.direction, comp.pins.length);

        for (const pinId in comp.pins) {
            this.pins[comp.pins[pinId]].direction = directions[pinId];
        }

        for (let i = 0; i < pplPos.length - 1; i++) {
            this.pins[comp.pins[i]].pos = pplPos[i];
        }
    }

    moveComponent(id, pos) {
        const comp = this.components[id];
        const halfImgSize = IMAGE_SIZE / 2;
        const pplPos = getLabelPinPos(pos, comp.direction, comp.pins.length);
        comp.pos = pos.offset(0, -halfImgSize);
        for (let i = 0; i < pplPos.length - 1; i++) {
            this.pins[comp.pins[i]].pos = pplPos[i];
        }
    }

    moveNode(id, pos) {
        this.pins[id].pos = pos;
    }

    setComponentValue(id, value) {
        this.components[id].value = value;
    }
}
