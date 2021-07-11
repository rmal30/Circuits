import SchematicEvents from "../events/schematic_events.js";
import Schematic from "../schematic/schematic.js";

export default class SchematicView {
    constructor(_doc, graphicsView, gridSize) {
        this.doc = _doc;
        this.schematic = new Schematic(graphicsView);
        this.events = new SchematicEvents(document, gridSize);
    }
}