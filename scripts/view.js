class View {
    constructor(_doc, _window) {
        this.doc = _doc;
        this.window = _window;
        this.schematic = new Schematic(_doc);
        this.svg = this.doc.getElementById("svg");
        this.simulate = this.doc.getElementById("simulate");
        this.chooseMode = this.doc.getElementById("mode");
        this.freq = this.doc.getElementById("freq");
        this.freq2 = this.doc.getElementById("freq2");
        this.header = this.doc.getElementById("header");
        this.info = this.doc.getElementById("info");
        this.compList = this.doc.getElementById("newComp");
        this.newCompDirection = this.doc.getElementById("newCompDir");
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
            onChooseMode(this.chooseMode.value);
        });
    }

    bindCanvasMouseMove(onCanvasMouseMove) {
        const height = this.header.clientHeight;

        // Drag component or node
        this.svg.addEventListener("mousemove", (event) => {
            const pos = new Position(event.clientX, event.clientY).offset(0, -height);
            const alignedPos = pos.offset(-pos.x % GRID_SIZE, -pos.y % GRID_SIZE);
            onCanvasMouseMove(alignedPos);
        });
    }

    bindKeyPress(onKeyPress) {
        // Detect keys to rotate and delete components
        this.doc.addEventListener("keydown", (event) => {
            onKeyPress(event.key);
        });
    }

    bindCanvasMouseUp(onCanvasMouseUp) {
        this.svg.addEventListener("mouseup", () => {
            onCanvasMouseUp();
        });
    }

    bindCanvasClick(onCanvasClick) {
        const height = this.header.clientHeight;

        this.svg.addEventListener("click", (event) => {
            setTimeout(() => {
                const pos = new Position(event.clientX, event.clientY).offset(0, -height);
                const alignedPos = pos.offset(-pos.x % GRID_SIZE, -pos.y % GRID_SIZE);
                onCanvasClick(alignedPos);
            }, 10);
        });
    }

    bindLabelClick(id, onLabelClick) {
        this.doc.getElementById(getElementId(id, ELEMENT_TYPES.LABEL)).addEventListener("click", () => {
            onLabelClick(id);
        });
    }

    bindComponentClick(id, onComponentClick) {
        this.doc.getElementById(getElementId(id, ELEMENT_TYPES.IMAGE)).addEventListener("click", () => {
            onComponentClick(id);
        });
    }

    bindComponentMouseDown(id, onComponentMouseDown) {
        this.doc.getElementById(getElementId(id, ELEMENT_TYPES.IMAGE)).addEventListener("mousedown", (event) => {
            event.preventDefault();
            onComponentMouseDown(id);
        });
    }

    bindPinClick(id, onPinClick) {
        this.doc.getElementById(getElementId(id, ELEMENT_TYPES.PIN)).addEventListener("click", () => {
            onPinClick(id);
        });
    }

    bindNodeMouseDown(id, onNodeMouseDown) {
        this.doc.getElementById(getElementId(id, ELEMENT_TYPES.PIN)).addEventListener("mousedown", (event) => {
            event.preventDefault();
            onNodeMouseDown(id);
        });
    }

    bindLineClick(id, onLineClick) {
        const height = this.header.clientHeight;

        this.doc.getElementById(getElementId(id, ELEMENT_TYPES.LINE)).addEventListener("click", (event) => {
            const pos = new Position(event.clientX, event.clientY).offset(0, -height);
            const alignedPos = pos.offset(-pos.x % GRID_SIZE, -pos.y % GRID_SIZE);
            onLineClick(id, alignedPos);
        });
    }

    setFrequencyEnabled(enabled) {
        const disabledClass = "is-disabled";

        if (enabled) {
            this.freq2.classList.remove(disabledClass);
        } else {
            this.freq2.classList.add(disabledClass);
        }

        this.freq.disabled = !enabled;
    }

    setInformation(info) {
        this.info.textContent = info;
    }

    setComponentOptions(componentOptions) {
        this.compList.options.length = 2;
        for (const component of Object.keys(componentOptions)) {
            this.compList.options[this.compList.options.length] = new Option(componentOptions[component], component);
        }
    }

    showSolution(currentSets, voltageSets, impComponents, valid, validIndex) {
        let solutionOutput = null;
        if (valid) {
            solutionOutput = [
                [
                    "Nodal analysis:",
                    ...impComponents.
                        map((component, index) => {
                            const fullId = `${component.type}_${component.id}`;
                            return `${fullId}: ${Complex.print(voltageSets[validIndex][index][0])}V`;
                        })
                ],
                [
                    "Mesh analysis:",
                    ...impComponents.
                        map((component, index) => {
                            const fullId = `${component.type}_${component.id}`;
                            return `${fullId}: ${Complex.print(currentSets[validIndex][index][0])}A`;
                        })
                ],
                [
                    "Component list:",
                    ...impComponents.map((value) => {
                        return `${value.type}_${value.id}: ${JSON.stringify(value, (_, v) => {
                            return (v instanceof Array) ? JSON.stringify(v) : v;
                        }, 4)}`;
                    })
                ]
            ].map((section) => section.join("\r\n")).join("\r\n\r\n");

        } else {
            solutionOutput = "No solution found";
        }
        this.setInformation(solutionOutput);
    }

    isNearImage(componentId, position, range) {
        const elementId = getElementId(componentId, ELEMENT_TYPES.IMAGE);
        const image = this.doc.getElementById(elementId);
        const dx = Math.abs(position.x - image.x.baseVal.value - IMAGE_SIZE / 2);
        const dy = Math.abs(position.y - image.y.baseVal.value - IMAGE_SIZE / 2);
        return dx < range * IMAGE_SIZE && dy < range * IMAGE_SIZE;
    }

    isNearPin(pinId, position, range) {
        const elementId = getElementId(pinId, ELEMENT_TYPES.PIN);
        const pin = this.doc.getElementById(elementId);
        const dx = Math.abs(position.x - pin.cx.baseVal.value);
        const dy = Math.abs(position.y - pin.cy.baseVal.value);
        return dx < range * DOT_SIZE && dy < range * DOT_SIZE;
    }

    isNearPolyLine(lineId, position, range) {
        const elementId = getElementId(lineId, ELEMENT_TYPES.LINE);
        const line = this.doc.getElementById(elementId);
        return getLines(CircuitXML.getPolyStr(line)).some((linePoints) => isNearLine(linePoints, position, range));
    }

    isNearSchematic(circuit, position) {
        const {pins, lines, components} = circuit;
        const isNearPins = Object.keys(pins).some((pinId) => this.isNearPin(pinId, position, 1));
        const isNearComponents = Object.keys(components).some((id) => this.isNearImage(id, position, 0.7));
        const isNearLines = Object.keys(lines).some((id) => this.isNearPolyLine(id, position, 10));
        return [isNearLines, isNearComponents, isNearPins].some((near) => near);
    }

    setElementSelected(selected, id, type) {
        const elementId = getElementId(id, type);
        const element = this.doc.getElementById(elementId);

        if (element) {
            const style = selected ? styles.select[type] : styles.deselect[type];
            Object.assign(element.style, style);
        }
    }

    // Select or deselect component, node or line
    setSelectedItem(item) {
        if (item) {
            this.setElementSelected(true, item.id, item.type);
        }
    }

    clearSelectedItem(item) {
        if (item) {
            this.setElementSelected(false, item.id, item.type);
        }
    }

    // Prompt value from user
    promptComponentValue(info) {
        const promptStr = `Please enter a ${info.prop} for a ${info.name} in ${info.unit}`;
        let value = null;
        let invalid = true;
        do {
            value = this.window.prompt(promptStr);
            invalid = value === "";
            if (invalid) {
                this.window.alert("Please enter a valid value");
            }
        } while (invalid);
        return value;
    }

    getNewComponentDirection() {
        return this.newCompDirection.value;
    }

    getNewComponentType() {
        return this.compList.value;
    }
}
