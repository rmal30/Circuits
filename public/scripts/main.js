import Circuit from "./models/circuit.js";
import MotionState from "./models/motion_state.js";
import SelectionState from "./models/selection_state.js";

import PromptView from "./views/prompt_view.js";
import HeaderView from "./views/header_view.js";
import StatusView from "./views/status_view.js";
import SVGGraphicsView from "./views/svg_graphics_view.js";
import SchematicView from "./views/schematic_view.js";

import Controller from "./controller.js";
import { GRID_SIZE } from "./schematic/layout.js";


export const DEFAULT_FREQUENCY = 60;
const circuit = new Circuit(DEFAULT_FREQUENCY, {}, {}, {});
const motion = new MotionState();
const selection = new SelectionState();

const graphicsElement = document.getElementById("svg");
const graphicsView = new SVGGraphicsView(document, graphicsElement);
const schematicView = new SchematicView(document, graphicsView, GRID_SIZE);
const headerView = new HeaderView(document);
const statusView = new StatusView(document);
const promptView = new PromptView(window);

const controller = new Controller(circuit, motion, selection, schematicView, headerView, statusView, promptView);
