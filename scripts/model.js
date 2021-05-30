class Model {

    constructor(hertz, pins, lines, components) {
        this.circuit = new Circuit(hertz, pins, lines, components);
        this.moving = null;
        this.selected = null;
    }

    startComponentMove(componentId) {
        this.moving = {type: ELEMENT_TYPES.IMAGE, id: componentId};
    }

    startNodeMove(pinId) {
        this.moving = {type: ELEMENT_TYPES.PIN, id: pinId};
    }

    stopMove() {
        this.moving = null;
    }

    selectPin(pinId) {
        this.selected = {type: ELEMENT_TYPES.PIN, id: pinId};
    }

    selectImage(componentId) {
        this.selected = {type: ELEMENT_TYPES.IMAGE, id: componentId};
    }

    selectLine(lineId) {
        this.selected = {type: ELEMENT_TYPES.LINE, id: lineId};
    }

    clearSelection() {
        this.selected = null;
    }
}
