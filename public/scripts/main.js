import Circuit from "./models/circuit.js";
import MotionState from "./models/motion_state.js";
import SelectionState from "./models/selection_state.js";

import PromptView from "./views/prompt_view.js";
import HeaderView from "./views/header_view.js";
import StatusView from "./views/status_view.js";
import SVGGraphicsView from "./views/svg_graphics_view.js";
import SchematicView from "./views/schematic_view.js";
import StorageView from "./views/storage_view.js";

import Analyser from "./analysis/analyser.js";

import { PIN_DIRECTION_TEMPLATE, GRID_SIZE, IMAGE_SIZE, PIN_POSITION_TEMPLATE } from "./schematic/layout.js";
import SchematicController from "./controllers/schematic_controller.js";
import HeaderController from "./controllers/header_controller.js";
import DialogController from "./controllers/dialog_controller.js";


const DEFAULT_FREQUENCY = 60;

const circuit = new Circuit(
    {
        hertz: DEFAULT_FREQUENCY, 
        pins: {}, 
        lines: {}, 
        components: {}
    }, 
    PIN_POSITION_TEMPLATE, 
    PIN_DIRECTION_TEMPLATE, 
    IMAGE_SIZE, 
    Analyser
);

const motion = new MotionState();
const selection = new SelectionState();

const graphicsElement = document.getElementById("svg");
const graphicsView = new SVGGraphicsView(document, graphicsElement);
const schematicView = new SchematicView(document, graphicsView, GRID_SIZE);
const headerView = new HeaderView(document);
const statusView = new StatusView(document);
const storageView = new StorageView(document, window);
const promptView = new PromptView(window);

const schematicController = new SchematicController(circuit, motion, selection, schematicView, headerView, promptView);
const dialogController = new DialogController(schematicController, storageView);
const headerController = new HeaderController(schematicController, circuit, headerView, statusView, promptView, storageView);
headerController.setMode("dc");