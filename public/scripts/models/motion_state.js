import { ELEMENT_TYPES } from "../schematic/elements.js";

export default class MotionState {
    constructor () {
        this.stopMove();
    }

    startComponentMove(componentId) {
        this.type = ELEMENT_TYPES.IMAGE;
        this.id = componentId;
        this.moving = true;
    }

    startNodeMove(pinId) {
        this.type = ELEMENT_TYPES.PIN;
        this.id = pinId;
        this.moving = true;
    }

    stopMove() {
        this.moving = false;
        this.type = null;
        this.id = null;
    }
}