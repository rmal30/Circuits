import {COMPONENT_DEFINITIONS} from "../components.js";
import {ELEMENT_TYPES} from "../schematic/elements.js";

const KEYS = {
    R: "r",
    DELETE: "Delete",
    ESCAPE: "Escape"
};

export default class SchematicController {

    constructor(circuit, motion, selection, schematicView, headerView, windowView) {
        this.models = {circuit, motion, selection};
        this.views = {schematicView, headerView, windowView};

        this.views.schematicView.events.bindKeyPress(this.onKeyPress.bind(this));
        this.views.schematicView.events.bindContainerClick(this.onContainerClick.bind(this));
        this.views.schematicView.events.bindContainerMouseMove(this.onMouseMove.bind(this));
        this.views.schematicView.events.bindContainerMouseUp(this.models.motion.stopMove.bind(this.models.motion));
    }

    onMouseMove(pos) {
        if (this.models.motion.moving) {
            switch (this.models.motion.type) {
                case ELEMENT_TYPES.IMAGE:
                    if (this.models.motion.moving) {
                        this.models.circuit.moveComponent(this.models.motion.id, pos);
                        this.views.schematicView.schematic.updateComponentAndLines(this.models.circuit, this.models.motion.id);
                    }
                    break;

                case ELEMENT_TYPES.PIN:
                    if (this.models.motion.moving) {
                        this.models.circuit.moveNode(this.models.motion.id, pos);
                        this.views.schematicView.schematic.updateNodeAndLines(this.models.circuit, this.models.motion.id);
                    }
                    break;

                default:
                    break;
            }
        }
    }

    // Change component value
    changeComponentValue(id) {
        const component = this.models.circuit.components[id];
        const compInfo = COMPONENT_DEFINITIONS[component.type];
        const value = this.views.windowView.promptComponentValue(compInfo);

        if (value !== null) {
            this.models.circuit.setComponentValue(id, value);
            this.views.schematicView.schematic.updateComponent(component);
        }
    }

    // Delete component and all associated pins/lines
    deleteComponent(id) {
        const component = this.models.circuit.components[id];
        this.views.schematicView.schematic.deleteComponent(component, this.models.circuit.pins);
        this.models.circuit.deleteComponent(id);
        this.models.selection.clearSelection();
    }

    // Delete node and all associated lines
    deleteNode(id) {
        const pin = this.models.circuit.pins[id];
        if (!("comp" in pin)) {
            this.views.schematicView.schematic.deleteNode(pin);
            this.models.circuit.deleteNode(id);
            this.models.selection.clearSelection();
        }
    }

    deleteLine(lineId) {
        this.views.schematicView.schematic.deleteLine(lineId);
        this.models.circuit.deleteLine(lineId);
        this.models.selection.clearSelection();
    }

    clearSelection() {
        this.views.schematicView.schematic.clearSelection(this.models.selection);
        this.models.selection.clearSelection();
    }

    deleteSelection() {
        switch (this.models.selection.type) {
            case ELEMENT_TYPES.PIN:
                this.deleteNode(this.models.selection.id);
                break;

            case ELEMENT_TYPES.IMAGE:
                this.deleteComponent(this.models.selection.id);
                break;

            case ELEMENT_TYPES.LINE:
                this.deleteLine(this.models.selection.id);
                break;

            default:
                break;
        }
    }

    onKeyPress(key) {
        if (this.models.selection.selected) {
            switch (key) {
                case KEYS.DELETE:
                    this.deleteSelection();
                    break;

                case KEYS.ESCAPE:
                    this.clearSelection();
                    break;

                case KEYS.R:
                    if (this.models.selection.type === ELEMENT_TYPES.IMAGE) {
                        this.models.circuit.rotateComponent(this.models.selection.id);
                        this.views.schematicView.schematic.updateComponentAndLines(this.models.circuit, this.models.selection.id);
                    }
                    break;

                default:
                    break;
            }
        }
    }

    onContainerClick(position) {
        if (!this.views.schematicView.schematic.isNearby(this.models.circuit, position)) {
            const newCompType = this.views.headerView.getNewComponentType();
            if (this.models.selection.selected) {
                this.clearSelection();
            } else if (newCompType !== " ") {
                this.addNewComponent(newCompType, position);
            }
        }
    }

    onComponentClick(componentId) {
        this.clearSelection();
        this.models.selection.selectImage(componentId);
        this.views.schematicView.schematic.setSelection(this.models.selection);
    }

    onPinClick(pinId) {
        if (!this.models.selection.selected || this.models.selection.type !== ELEMENT_TYPES.PIN) {
            this.clearSelection();
            this.models.selection.selectPin(pinId);
            this.views.schematicView.schematic.setSelection(this.models.selection);
        } else if (pinId !== this.models.selection.id) {
            this.addLine(this.models.selection.id, pinId);
            this.clearSelection();
        }
    }

    onLineClick(lineId, position) {
        if (!this.models.selection.selected || this.models.selection.type !== ELEMENT_TYPES.PIN) {
            this.clearSelection();
            this.models.selection.selectLine(lineId);
            this.views.schematicView.schematic.setSelection(this.models.selection);
        } else {
            this.splitLine(this.models.selection.id, lineId, position);
            this.clearSelection();
        }
    }

    addLine(pinId1, pinId2) {
        const lineId = this.models.circuit.addLine(pinId1, pinId2);
        this.addInteractiveLineDrawing(lineId);
    }

    // Add component to diagram
    addNewComponent(type, position) {
        let value = null;
        const newCompInfo = COMPONENT_DEFINITIONS[type];
        if (newCompInfo.prop) {
            value = this.views.windowView.promptComponentValue(newCompInfo);
            if (value === null) {
                return;
            }
        }

        const directionStr = this.views.headerView.getNewComponentDirection();
        const id = this.models.circuit.addComponent(type, value, position, directionStr);
        this.addInteractiveComponentDrawing(id);
    }

    addInteractiveLineDrawing(lineId) {
        const {pins, lines} = this.models.circuit;
        const [pinId1, pinId2] = lines[lineId];
        this.views.schematicView.schematic.addLine(lineId, pins[pinId1], pins[pinId2]);
        this.views.schematicView.events.bindLineClick(lineId, this.onLineClick.bind(this));
    }

    addInteractiveNodeDrawing(pin) {
        this.views.schematicView.schematic.addPin(pin);
        this.views.schematicView.events.bindPinClick(pin.id, this.onPinClick.bind(this));
        this.views.schematicView.events.bindNodeMouseDown(pin.id, this.models.motion.startNodeMove.bind(this.models.motion));
    }

    addInteractiveComponentDrawing(id) {
        this.views.schematicView.schematic.addComponent(this.models.circuit.pins, this.models.circuit.components[id]);
        this.views.schematicView.events.bindLabelClick(id, this.changeComponentValue.bind(this));
        this.views.schematicView.events.bindComponentClick(id, this.onComponentClick.bind(this));
        this.views.schematicView.events.bindComponentMouseDown(id, this.models.motion.startComponentMove.bind(this.models.motion));
        this.models.circuit.components[id].pins.forEach((pinId) => {
            this.views.schematicView.events.bindPinClick(pinId, this.onPinClick.bind(this));
        });
    }

    // Split line with node at a given position, and connect new node to another pin
    splitLine(pinId, lineId, position) {
        const newPinId = this.models.circuit.splitLineWithNode(pinId, lineId, position);
        this.views.schematicView.schematic.splitLineWithNode(this.models.circuit, lineId, newPinId);
        this.views.schematicView.events.bindPinClick(newPinId, this.onPinClick.bind(this));
        this.views.schematicView.events.bindNodeMouseDown(newPinId, this.models.motion.startNodeMove.bind(this.models.motion));
        return newPinId;
    }

    clearCircuit() {
        for (const lineId of Object.keys(this.models.circuit.lines)) {
            this.deleteLine(lineId);
        }

        for (const compId of Object.keys(this.models.circuit.components)) {
            this.deleteComponent(compId);
        }

        for (const pinId of Object.keys(this.models.circuit.pins)) {
            this.deleteNode(pinId);
        }
    }

    drawCircuit(circuit) {
        Object.assign(this.models.circuit, circuit);
        for (const compId in circuit.components) {
            this.addInteractiveComponentDrawing(compId)
        }

        for (const pinId in circuit.pins) {
            const pin = circuit.pins[pinId];
            if (!("comp" in pin)) {
                this.addInteractiveNodeDrawing(pin);
            }
        }

        for (const lineId in circuit.lines) {
            this.addInteractiveLineDrawing(lineId);
        }
    }

    loadCircuit(circuitObject) {
        this.clearCircuit();
        this.drawCircuit(circuitObject);
    }
}
