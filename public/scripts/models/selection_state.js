import { ELEMENT_TYPES } from "../schematic/elements.js";

export default class SelectionState {
    constructor() {
        this.clearSelection();
    }

    selectPin(pinId) {
        this.type = ELEMENT_TYPES.PIN;
        this.id = pinId;
        this.selected = true;
    }

    selectImage(componentId) {
        this.type = ELEMENT_TYPES.IMAGE;
        this.id = componentId;
        this.selected = true;
    }

    selectLine(lineId) {
        this.type = ELEMENT_TYPES.LINE;
        this.id = lineId;
        this.selected = true;
    }

    clearSelection() {
        this.selected = false;
        this.type = null;
        this.id = null;
    }
}