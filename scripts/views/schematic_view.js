import SchematicEvents from "../events/schematic_events.js";
import Schematic from "../schematic/schematic.js";
import {STYLES} from "../schematic/style.js";
import {planPolyLine} from "../rendering/polyline.js";
import {DOT_SIZE, IMAGE_SIZE, LABEL_POSITIONS, PIN_POSITION_TEMPLATE} from "../schematic/layout.js";

export default class SchematicView {
    constructor(_doc, graphicsView, gridSize) {
        this.doc = _doc;
        this.schematic = new Schematic(graphicsView, planPolyLine, STYLES, DOT_SIZE, IMAGE_SIZE, LABEL_POSITIONS, PIN_POSITION_TEMPLATE);
        this.events = new SchematicEvents(document, gridSize);
    }
}