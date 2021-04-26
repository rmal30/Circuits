class View {
    constructor() {
        this.simulate = document.getElementById("simulate");
        this.chooseMode = document.getElementById("mode");
        this.svg = document.getElementById("svg");
        this.freq = document.getElementById("freq");
        this.header = document.getElementById("header");
        this.doc = document;
    }

    bindFreqChange(onFreqChange) {
        this.freq.addEventListener("click", () => {
            onFreqChange(this.freq.value);
        });
    }

    bindSimulate(onSimulate) {
        this.simulate.addEventListener("click", () => {
            onSimulate();
        });
    }

    bindChooseMode(onChooseMode) {
        this.chooseMode.addEventListener("click", () => {
            const mode = document.getElementById("mode");
            onChooseMode(mode.value);
        });
    }

    bindMouseMove(onMouseMove) {
        const height = this.header.clientHeight;

        // Drag component or node
        this.svg.addEventListener("mousemove", (event) => {
            const pos = new Position(event.clientX, event.clientY).offset(0, -height);
            onMouseMove(pos);
        });
    }

    bindKeyPress(onKeyPress) {
        // Detect keys to rotate and delete components
        this.doc.addEventListener("keydown", (event) => {
            onKeyPress(event.key);
        });
    }

    bindCanvasClick(onCanvasClick) {
        const height = this.header.clientHeight;

        this.svg.addEventListener("click", () => {
            const pos = new Position(window.event.clientX, window.event.clientY).offset(0, -height);
            onCanvasClick(pos);
        });
    }


    rotateComponent(circuit, id) {
        const comp = circuit.components[id];
        const pplPos = getLabelPinPos(comp.pos, comp.direction, comp.pins.length);
        Render.changeComponentPosition(comp, id, comp.pos, pplPos);
        const componentLines = comp.pins.map((pinId) => circuit.pins[pinId].lines);

        for (const i in componentLines) {
            componentLines[i].forEach((line) => Render.adjustLine(circuit.pins, circuit.lines[line]));
        }
    }

    moveComponent(circuit, id, pos) {
        const comp = circuit.components[id];
        const pplPos = getLabelPinPos(pos, comp.direction, comp.pins.length);
        Render.changeComponentPosition(comp, id, pos, pplPos);
        const componentLines = comp.pins.map((pinId) => circuit.pins[pinId].lines);

        for (const componentLine of componentLines) {
            componentLine.forEach((line) => Render.adjustLine(circuit.pins, circuit.lines[line]));
        }
    }

    moveNode(circuit, id, cPos) {
        Render.movePin(id, cPos);
        circuit.pins[id].lines.forEach((line) => Render.adjustLine(circuit.pins, circuit.lines[line]));
    }

    splitLine(pins, lineID, pos, pinCount) {
        const [pin1, pin2] = lineID.split("_");
        const lineID1 = pin1 + "_" + pinCount;
        const lineID2 = pin2 + "_" + pinCount;
        Render.changeLine(lineID, lineID1, findPolyStr(pins, pin1, pinCount));
        Render.drawPolyLine(lineID2, findPolyStr(pins, pin2, pinCount));
        Render.drawNode(pinCount, pos);
    }

    getNewComponentDirection() {
        return document.getElementById("newCompDir").value;
    }

    getNewComponentType() {
        return document.getElementById("newComp").value;
    }

    showSolution(currentSets, voltageSets, impComponents, valid, validIndex) {
        const solutionOutput = getSolutionOutput(currentSets, voltageSets, impComponents, valid, validIndex);
        Render.setInformation(solutionOutput);
    }

    inImageBounds(componentId, pos) {
        const image = document.getElementById(getElementId(componentId, "Component"));
        const dx = Math.abs(pos.x - image.x.baseVal.value - (IMAGE_SIZE / 2));
        const dy = Math.abs(pos.y - image.y.baseVal.value - (IMAGE_SIZE / 2));
        return dx < IMAGE_SIZE * 0.4 && dy < IMAGE_SIZE * 0.4;
    }

    nearPin(pinId, pos) {
        const pin = document.getElementById(getElementId(pinId, "Node"));
        const nearPinX = Math.abs(pos.x - pin.cx.baseVal.value) < IMAGE_SIZE;
        const nearPinY = Math.abs(pos.y - pin.cy.baseVal.value) < IMAGE_SIZE;
        return nearPinX && nearPinY;
    }
}

