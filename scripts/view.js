class View {
    constructor() {
        this.simulate = document.getElementById("simulate");
        this.chooseMode = document.getElementById("mode");
        this.svg = document.getElementById("svg");
        this.freq = document.getElementById("freq");
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
        // Drag component or node
        this.svg.addEventListener("mousemove", () => {
            const pos = new Position(window.event.clientX, window.event.clientY).offset(0, -32);
            onMouseMove(pos);
        });
    }

    bindKeyPress(onKeyPress) {
        // Detect keys to rotate and delete components
        document.addEventListener("keydown", (event) => {
            onKeyPress(event.key);
        });
    }

    bindCanvasClick(onCanvasClick) {
        this.svg.addEventListener("click", () => {
            const pos = new Position(window.event.clientX, window.event.clientY).offset(0, -32);
            onCanvasClick(pos);
        });
    }


    rotateComponent(circuit, id) {
        const comp = circuit.components[id];
        const halfImgSize = IMAGE_SIZE / 2;
        const pplPos = getLabelPinPos(comp.pos.offset(0, halfImgSize), comp.direction, comp.pins.length);
        Render.changeComponentPosition(comp, id, comp.pos.offset(0, halfImgSize), pplPos);
        const componentLines = comp.pins.map(pinId => circuit.pins[pinId].lines);
    
        for (const i in componentLines) {
            componentLines[i].forEach(line => Render.adjustLine(circuit.pins, circuit.lines[line]));
        }
    }

    moveComponent(circuit, id, pos) {
        const comp = circuit.components[id];
        const pplPos = getLabelPinPos(pos, comp.direction, comp.pins.length);
        Render.changeComponentPosition(comp, id, pos, pplPos);
        const componentLines = comp.pins.map(pinId => circuit.pins[pinId].lines);

        for (const componentLine of componentLines) {
            componentLine.forEach(line => Render.adjustLine(circuit.pins, circuit.lines[line]));
        }
    }

    moveNode(circuit, id, cPos) {
        Render.movePin(id, cPos);
        circuit.pins[id].lines.forEach(line => Render.adjustLine(circuit.pins, circuit.lines[line]));
    }

    splitLine(pins, lineID, pos, pinCount) {
        const [pin1, pin2] = lineID.split("_");
        const lineID1 = pin1 + "_" + pinCount;
        const lineID2 = pin2 + "_" + pinCount;
        Render.changeLine(lineID, lineID1, findPolyStr(pins, pin1, pinCount));
        Render.drawPolyLine(lineID2, findPolyStr(pins, pin2, pinCount));
        Render.drawNode(pinCount, pos);
    }

    getNewComponentDirection(){
        return document.getElementById("newCompDir").value;
    }

    getNewComponentType(){
        return document.getElementById("newComp").value;
    }

    showSolution(currentSets, voltageSets, impComponents, valid, validIndex){
        const solutionOutput = getSolutionOutput(currentSets, voltageSets, impComponents, valid, validIndex);
        Render.setInformation(solutionOutput);
    }
}

