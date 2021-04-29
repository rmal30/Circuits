class Controller {

    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.setMode("dc");
        this.view.bindKeyPress(this.onKeyPress.bind(this));

        this.view.bindCanvasClick(this.onCanvasClick.bind(this));
        this.view.bindCanvasMouseMove(this.onMouseMove.bind(this));
        this.view.bindCanvasMouseUp(this.model.stopMove.bind(this.model));

        this.view.bindFreqChange(this.changeFreq.bind(this));
        this.view.bindSimulate(this.onSimulate.bind(this));
        this.view.bindChooseMode(this.setMode.bind(this));
    }

    changeFreq(value) {
        this.model.circuit.setFreq(parseFloat(value));
    }

    onMouseMove(pos) {
        if (this.model.moving) {
            switch (this.model.moving.type) {
                case ELEMENT_TYPES.IMAGE:
                    if (this.model.moving) {
                        this.model.circuit.moveComponent(this.model.moving.id, pos);
                        this.view.schematic.updateComponentAndLines(this.model.circuit, this.model.moving.id);
                    }
                    break;

                case ELEMENT_TYPES.PIN:
                    if (this.model.moving) {
                        this.model.circuit.moveNode(this.model.moving.id, pos);
                        this.view.schematic.updateNodeAndLines(this.model.circuit, this.model.moving.id);
                    }
                    break;

                default:
                    break;
            }
        }
    }

    // Simulate circuit and show results
    onSimulate() {
        const simulationResults = this.model.circuit.simulate(this.model.circuit);
        const [currentSets, voltageSets, impComponents, valid, validIndex] = simulationResults;
        this.view.showSolution(currentSets, voltageSets, impComponents, valid, validIndex);
    }

    // Change component value
    changeComponentValue(id) {
        const component = this.model.circuit.components[id];
        const compInfo = COMPONENT_DEFINITIONS[component.type];
        const value = this.view.promptComponentValue(compInfo);

        if (value !== null) {
            this.model.circuit.setComponentValue(id, value);
            this.view.schematic.updateComponent(component);
        }
    }

    // Set AC/DC mode
    setMode(mode) {
        this.view.setFrequencyEnabled(mode === "ac");
        this.view.setComponentOptions(COMPONENTS_LIST[mode]);

        for (const possibleMode in COMPONENTS_LIST) {
            if (possibleMode !== mode) {
                for (const id of Object.keys(this.model.circuit.components)) {
                    if (this.model.circuit.components[id].type in COMPONENTS_LIST[possibleMode]) {
                        this.deleteComponent(id);
                    }
                }
            }
        }
    }

    // Delete component and all associated pins/lines
    deleteComponent(id) {
        const component = this.model.circuit.components[id];
        this.view.schematic.deleteComponent(component, this.model.circuit.pins);
        this.model.circuit.deleteComponent(id);
        this.model.clearSelection();
    }

    // Delete node and all associated lines
    deleteNode(id) {
        const pin = this.model.circuit.pins[id];
        if (!("comp" in pin)) {
            this.view.schematic.deleteNode(pin);
            this.model.circuit.deleteNode(id);
            this.model.clearSelection();
        }
    }

    deleteLine(lineId) {
        this.view.schematic.deleteLine(lineId);
        this.model.circuit.deleteLine(lineId);
        this.model.clearSelection();
    }

    clearSelection() {
        this.view.clearSelectedItem(this.model.selected);
        this.model.clearSelection();
    }

    onKeyPress(key) {
        if (this.model.selected) {
            switch (key) {
                case "Delete":
                    switch (this.model.selected.type) {
                        case ELEMENT_TYPES.PIN:
                            this.deleteNode(this.model.selected.id);
                            break;

                        case ELEMENT_TYPES.IMAGE:
                            this.deleteComponent(this.model.selected.id);
                            break;

                        case ELEMENT_TYPES.LINE:
                            this.deleteLine(this.model.selected.id);
                            break;

                        default:
                            break;
                    }
                    break;

                case "Escape":
                    this.clearSelection();
                    break;

                case "r":
                    if (this.model.selected.type === ELEMENT_TYPES.IMAGE) {
                        this.model.circuit.rotateComponent(this.model.selected.id);
                        this.view.schematic.updateComponentAndLines(this.model.circuit, this.model.selected.id);
                    }
                    break;

                default:
                    break;
            }
        }
    }

    onCanvasClick(position) {
        if (!this.view.isNearSchematic(this.model.circuit, position)) {
            const newCompType = this.view.getNewComponentType();
            if (this.model.selected) {
                this.clearSelection();
            } else if (newCompType !== " ") {
                this.addComponent(newCompType, position);
            }
        }
    }

    onComponentClick(componentId) {
        this.clearSelection();
        this.model.selectImage(componentId);
        this.view.setSelectedItem(this.model.selected);
    }

    onPinClick(pinId) {
        if (!this.model.selected || this.model.selected.type !== ELEMENT_TYPES.PIN) {
            this.clearSelection();
            this.model.selectPin(pinId);
            this.view.setSelectedItem(this.model.selected);
        } else if (pinId !== this.model.selected.id) {
            const lineId = this.model.circuit.addLine(this.model.selected.id, pinId);
            const {pins} = this.model.circuit;
            this.view.schematic.addLine(lineId, pins[this.model.selected.id], pins[pinId]);
            this.view.bindLineClick(lineId, this.onLineClick.bind(this));
            this.clearSelection();
        }
    }

    onLineClick(lineId, position) {
        if (!this.model.selected || this.model.selected.type !== ELEMENT_TYPES.PIN) {
            this.clearSelection();
            this.model.selectLine(lineId);
            this.view.setSelectedItem(this.model.selected);
        } else {
            this.splitLine(this.model.selected.id, lineId, position);
            this.clearSelection();
        }
    }

    // Add component to diagram
    addComponent(type, position) {
        let value = null;
        const newCompInfo = COMPONENT_DEFINITIONS[type];
        if (newCompInfo.prop) {
            value = this.view.promptComponentValue(newCompInfo);
            if (value === null) {
                return;
            }
        }

        const directionStr = this.view.getNewComponentDirection();
        const id = this.model.circuit.addComponent(type, value, position, directionStr);
        this.view.schematic.addComponent(this.model.circuit.pins, this.model.circuit.components[id]);
        this.view.bindLabelClick(id, this.changeComponentValue.bind(this));
        this.view.bindComponentClick(id, this.onComponentClick.bind(this));
        this.view.bindComponentMouseDown(id, this.model.startComponentMove.bind(this.model));
        this.model.circuit.components[id].pins.forEach((pinId) => {
            this.view.bindPinClick(pinId, this.onPinClick.bind(this));
        });
    }

    // Split line with node at a given position, and connect new node to another pin
    splitLine(pinId, lineId, position) {
        const newPinId = this.model.circuit.splitLineWithNode(pinId, lineId, position);
        this.view.schematic.splitLineWithNode(this.model.circuit, lineId, newPinId);
        this.view.bindPinClick(newPinId, this.onPinClick.bind(this));
        this.view.bindNodeMouseDown(newPinId, this.model.startNodeMove.bind(this.model));
        return newPinId;
    }
}
