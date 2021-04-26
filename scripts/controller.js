class Controller {

    constructor(model, view) {
        this.view = view;
        this.model = model;
        this.setMode("dc");
        this.view.bindFreqChange(this.changeFreq.bind(this));
        this.view.bindSimulate(this.onSimulate.bind(this));
        this.view.bindChooseMode(this.setMode.bind(this));
        this.view.bindMouseMove(this.onMouseMove.bind(this));
        this.view.bindKeyPress(this.onKeyPress.bind(this));
        this.view.bindCanvasClick(this.onCanvasClick.bind(this));
    }

    changeFreq(value) {
        this.model.circuit.setFreq(parseFloat(value));
    }

    // Start move
    startComponentMove(id) {
        this.model.moving.comp = true;
        this.model.moveID = id;
    }

    // Stop move
    stopMove() {
        this.model.moving.comp = false;
        if (this.model.moving.dot) {
            this.drawLine(this.model.moveID, false);
        }
        this.model.moving.dot = false;
    }

    // Simulate circuit and show results
    onSimulate() {
        const [currentSets, voltageSets, impComponents, valid, validIndex] = simulate(this.model.circuit);
        this.view.showSolution(currentSets, voltageSets, impComponents, valid, validIndex);
    }

    // Update component value
    updateValue(id) {
        const compInfo = COMPONENT_DEFINITIONS[this.model.circuit.components[id].type];
        const value = promptComponentValue(compInfo);
        if (value !== null) {
            this.model.circuit.setComponentValue(id, value);
            Render.setLabel(id, value, compInfo.unit);
        }
    }

    setMode(mode) {
        switch (mode) {
            case "ac":
                Render.setFrequencyEnabled(true);
                Render.setComponentOptions(COMPONENTS_LIST.AC);
                this.removeComponentsWithType(COMPONENTS_LIST.DC);
                break;
            case "dc":
                Render.setFrequencyEnabled(false);
                Render.setComponentOptions(COMPONENTS_LIST.DC);
                this.removeComponentsWithType(COMPONENTS_LIST.AC);
                break;
            default:
                throw new Error("Unknown mode");
        }
    }

    removeComponentsWithType(componentOptions) {
        for (const id in this.model.circuit.components) {
            if (this.model.circuit.components[id].type in componentOptions) {
                this.deleteComponent(id);
            }
        }
    }

    onMouseMove(pos) {
        if (this.model.moving.comp) {
            this.moveComponent(pos);
        } else if (this.model.moving.dot) {
            this.moveNode(pos);
        }
    }

    deleteComponent(id) {
        const comp = this.model.circuit.components[id];
        const invalidElements = comp.pins.map((pinId) => getElementId(pinId, "Node")).concat([`img${id}`, `txt${id}`]);
        this.model.pointExists = this.model.pointExists && (!comp.pins.includes(this.model.prevPointID));
        invalidElements.forEach((element) => Render.removeElement(element));
        comp.pins.forEach((pin) => this.deleteLines(this.model.circuit.pins[pin]));
        this.model.circuit.components[id] = {};
        this.model.selected.comp = false;
    }

    onKeyPress(key) {
        if (this.model.selected.node) {
            if (key === "Delete") {
                Render.removeElement(getElementId(this.model.selectID, "Node"));
                this.deleteLines(this.model.circuit.pins[this.model.selectID]);
                this.model.selected.node = false;
                this.model.pointExists = false;
            }
        }
        if (this.model.selected.comp) {
            switch (key) {
                case "r":
                    this.model.circuit.rotateComponent(this.model.selectID);
                    this.view.rotateComponent(this.model.circuit, this.model.selectID);
                    break;
                case "Delete":
                    this.deleteComponent(this.model.selectID);
                    break;
                default:
                    break;
            }
        }

        if (this.model.selected.line) {
            switch (key) {
                case "Delete":
                    if (this.model.circuit.lines.includes(this.model.selectID)) {
                        this.deleteLine(this.model.circuit.lines.indexOf(this.model.selectID));
                    }
                    this.model.selected.line = false;
                    break;
                case "Escape":
                    Render.setSelected(false, this.model.selectID, "Line");
                    this.model.selected.line = false;
                    break;
                default:
                    break;
            }
        }
    }

    onCanvasClick(pos) {
        let listen = true;
        this.model.moving.comp = false;
        this.model.moving.dot = false;
        for (const id in this.model.circuit.components) {
            if (Object.keys(this.model.circuit.components[id]).length > 0) {
                if (this.view.inImageBounds(id, pos)) {
                    listen = false;
                    if (this.model.selected.comp && this.model.selectID !== id) {
                        Render.setSelected(false, this.model.selectID, "Component");
                        this.model.selected.comp = false;
                    }

                    if (!this.model.selected.comp) {
                        Render.setSelected(true, id, "Component");
                        this.model.selected.comp = true;
                        this.model.selectID = id;
                    }
                }
            }
        }

        for (const pinIndex in this.model.circuit.pins) {
            if (Object.keys(this.model.circuit.pins[pinIndex]).length > 0) {
                if (this.view.nearPin(pinIndex, pos)) {
                    listen = false;
                }
            }
        }

        if (listen) {
            const newCompType = this.view.getNewComponentType();
            if (this.model.pointExists) {
                Render.setSelected(false, this.model.prevPointID, "Node");
                this.model.pointExists = false;
            } else if (this.model.selected.comp) {
                Render.setSelected(false, this.model.selectID, "Component");
                this.model.selected.comp = false;
            } else if (newCompType !== " ") {
                this.addComponent(newCompType, pos);
            }
        }
    }

    deleteLines(pin) {
        while (pin.lines.length > 0) {
            this.deleteLine(pin.lines[0]);
        }
        for (const key in pin) {
            delete pin[key];
        }
    }

    deleteLine(lineIndex) {
        Render.removeElement(this.model.circuit.lines[lineIndex]);
        this.model.circuit.deleteLine(lineIndex);
    }

    // Add component to diagram
    addComponent(type, pos) {
        let value;
        const newCompInfo = COMPONENT_DEFINITIONS[type];
        if (newCompInfo.prop) {
            value = promptComponentValue(newCompInfo);
            if (value === null) {
                return;
            }
        }
        pos = pos.offset(-pos.x % GRID_SIZE, -pos.y % GRID_SIZE);
        const directionStr = this.view.getNewComponentDirection();
        const id = this.model.circuit.components.length;
        Render.drawComponent(id, newCompInfo, directionStr, value, pos, this.model.pinCount);
        this.model.circuit.addComponent(id, type, value, this.model.pinCount, pos, directionStr);
        this.model.pinCount += COMPONENT_DEFINITIONS[type].pinCount;
    }

    // Handle node selection
    handleNode(id) {
        this.model.moving.dot = true;
        this.model.selected.node = true;
        this.model.selected.comp = false;
        this.model.moveID = id;
        this.model.selectID = id;
    }

    addLine(id, createNewNode) {
        if (createNewNode) {
            if (id.split("_").includes(this.model.prevPointID)) {
                return;
            }
            let pos = new Position(window.event.clientX, window.event.clientY);
            pos = pos.offset(-pos.x % GRID_SIZE, -pos.y % GRID_SIZE);
            id = this.createNode(id, pos);
        }
        const lineID = `${this.model.prevPointID}_${id}`;
        if (!this.model.circuit.lines.includes(lineID)) {
            this.model.circuit.addLine(lineID, this.model.prevPointID, id);
            Render.drawPolyLine(lineID, findPolyStr(this.model.circuit.pins, this.model.prevPointID, id));
        }
    }

    clearSelection() {
        if (this.model.selected.comp) {
            this.model.selected.comp = false;
            Render.setSelected(false, this.model.selectID, "Component");
        }

        if (this.model.selected.node) {
            this.model.selected.node = false;
            Render.setSelected(false, this.model.selectID, "Node");
        }

        if (this.model.selected.line) {
            this.model.selected.node = false;
            Render.setSelected(false, this.model.selectID, "Line");
        }
    }

    // Draw line between two components
    drawLine(id, createNewNode) {
        if (this.model.pointExists) {
            Render.setSelected(false, this.model.prevPointID, "Node");
            this.model.pointExists = false;
            if (id !== this.model.prevPointID) {
                this.addLine(id, createNewNode);
            }
        } else if (createNewNode) {
            this.clearSelection();
            this.model.selected.line = true;
            Render.setSelected(true, id, "Line");
            this.model.selectID = id;
        } else {
            Render.setSelected(true, id, "Node");
            this.model.prevPointID = id;
            this.model.pointExists = true;
        }
    }

    // Create a node that connects 3 or more components
    createNode(lineID, pos) {
        this.model.circuit.splitLine(lineID, pos, this.model.pinCount);
        this.view.splitLine(this.model.circuit.pins, lineID, pos, this.model.pinCount);
        this.model.pinCount++;

        return this.model.pinCount - 1;
    }

    // Move node
    moveNode(pos) {
        const cPos = pos.offset(-pos.x % GRID_SIZE, -pos.y % GRID_SIZE);
        this.model.circuit.moveNode(this.model.moveID, cPos);
        this.view.moveNode(this.model.circuit, this.model.moveID, cPos);
    }

    // Move component
    moveComponent(pos) {
        const pos2 = pos.offset(-pos.x % GRID_SIZE, -pos.y % GRID_SIZE);
        this.model.circuit.moveComponent(this.model.moveID, pos2);
        this.view.moveComponent(this.model.circuit, this.model.moveID, pos2);
    }
}
