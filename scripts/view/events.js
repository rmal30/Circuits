import {ELEMENT_TYPES} from "../config/constants.js";
import {GRID_SIZE} from "../config/layout.js";
import {getElementId} from "../rendering/utils.js";
import Position from "./../rendering/position.js";

export default class Events {

    constructor(doc) {
        this.doc = doc;
        this.svg = this.doc.getElementById("svg");
        this.simulate = this.doc.getElementById("simulate");
        this.chooseMode = this.doc.getElementById("mode");
        this.freq = this.doc.getElementById("freq");
        this.header = this.doc.getElementById("header");
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
        const headerHeight = this.header.clientHeight;

        // Drag component or node
        this.svg.addEventListener("mousemove", (event) => {
            const pos = new Position(event.clientX, event.clientY).offset(0, -headerHeight);
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
        const headerHeight = this.header.clientHeight;
        this.svg.addEventListener("click", (event) => {
            const pos = new Position(event.clientX, event.clientY).offset(0, -headerHeight);
            const alignedPos = pos.offset(-pos.x % GRID_SIZE, -pos.y % GRID_SIZE);
            onCanvasClick(alignedPos);
        });
    }

    bindLabelClick(id, onLabelClick) {
        const elementId = getElementId(id, ELEMENT_TYPES.LABEL);
        const label = this.doc.getElementById(elementId);
        label.addEventListener("click", () => {
            onLabelClick(id);
        });
    }

    bindComponentClick(id, onComponentClick) {
        const elementId = getElementId(id, ELEMENT_TYPES.IMAGE);
        const image = this.doc.getElementById(elementId);
        image.addEventListener("click", () => {
            onComponentClick(id);
        });
    }

    bindComponentMouseDown(id, onComponentMouseDown) {
        const elementId = getElementId(id, ELEMENT_TYPES.IMAGE);
        const image = this.doc.getElementById(elementId);
        image.addEventListener("mousedown", (event) => {
            event.preventDefault();
            onComponentMouseDown(id);
        });
    }

    bindPinClick(id, onPinClick) {
        const elementId = getElementId(id, ELEMENT_TYPES.PIN);
        const pin = this.doc.getElementById(elementId);
        pin.addEventListener("click", () => {
            onPinClick(id);
        });
    }

    bindNodeMouseDown(id, onNodeMouseDown) {
        const elementId = getElementId(id, ELEMENT_TYPES.PIN);
        const node = this.doc.getElementById(elementId);
        node.addEventListener("mousedown", (event) => {
            event.preventDefault();
            onNodeMouseDown(id);
        });
    }

    bindLineClick(id, onLineClick) {
        const headerHeight = this.header.clientHeight;
        const elementId = getElementId(id, ELEMENT_TYPES.LINE);
        const line = this.doc.getElementById(elementId);
        line.addEventListener("click", (event) => {
            const pos = new Position(event.clientX, event.clientY).offset(0, -headerHeight);
            const alignedPos = pos.offset(-pos.x % GRID_SIZE, -pos.y % GRID_SIZE);
            onLineClick(id, alignedPos);
        });
    }
}
