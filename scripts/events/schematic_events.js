import {ELEMENT_TYPES, getElementId} from "../schematic/elements.js";
import Position from "../rendering/position.js";

export default class SchematicEvents {

    constructor(doc, gridSize) {
        this.doc = doc;
        this.svg = this.doc.getElementById("svg");
        this.header = this.doc.getElementById("header");
        this.gridSize = gridSize;
    }

    getAlignedPosition(eventPosition, headerHeight) {
        const pos = eventPosition.offset(0, -headerHeight);
        return pos.offset(-pos.x % this.gridSize, -pos.y % this.gridSize);
    }

    bindContainerMouseEvent(eventTag, onContainerMouseEvent) {
        const headerHeight = this.header.clientHeight;

        // Drag component or node
        this.svg.addEventListener(eventTag, (event) => {
            const eventPos = new Position(event.clientX, event.clientY);
            const alignedPos = this.getAlignedPosition(eventPos, headerHeight);
            onContainerMouseEvent(alignedPos);
        });
    }

    bindContainerMouseMove(onContainerMouseMove) {
        this.bindContainerMouseEvent("mousemove", onContainerMouseMove);
    }

    bindContainerClick(onContainerClick) {
        this.bindContainerMouseEvent("click", onContainerClick);
    }

    bindKeyPress(onKeyPress) {
        // Detect keys to rotate and delete components
        this.doc.addEventListener("keydown", (event) => {
            onKeyPress(event.key);
        });
    }

    bindContainerMouseUp(onContainerMouseUp) {
        this.svg.addEventListener("mouseup", () => {
            onContainerMouseUp();
        });
    }

    bindElementClick(id, onElementClick, elementType) {
        const elementId = getElementId(id, elementType);
        const element = this.doc.getElementById(elementId);
        element.addEventListener("click", () => {
            onElementClick(id);
        });
    }

    bindLabelClick(id, onLabelClick) {
        this.bindElementClick(id, onLabelClick, ELEMENT_TYPES.LABEL);
    }

    bindComponentClick(id, onComponentClick) {
        this.bindElementClick(id, onComponentClick, ELEMENT_TYPES.IMAGE);
    }

    bindPinClick(id, onPinClick) {
        this.bindElementClick(id, onPinClick, ELEMENT_TYPES.PIN);
    }

    bindElementMouseDown(id, onElementMouseDown, elementType){
        const elementId = getElementId(id, elementType);
        const image = this.doc.getElementById(elementId);
        image.addEventListener("mousedown", (event) => {
            event.preventDefault();
            onElementMouseDown(id);
        });
    }

    bindComponentMouseDown(id, onComponentMouseDown) {
        this.bindElementMouseDown(id, onComponentMouseDown, ELEMENT_TYPES.IMAGE);
    }
    
    bindNodeMouseDown(id, onNodeMouseDown) {
        this.bindElementMouseDown(id, onNodeMouseDown, ELEMENT_TYPES.PIN);
    }

    bindLineClick(id, onLineClick) {
        const headerHeight = this.header.clientHeight;
        const elementId = getElementId(id, ELEMENT_TYPES.LINE);
        const line = this.doc.getElementById(elementId);
        line.addEventListener("click", (event) => {
            const eventPos = new Position(event.clientX, event.clientY);
            const alignedPos = this.getAlignedPosition(eventPos, headerHeight);
            onLineClick(id, alignedPos);
        });
    }
}
