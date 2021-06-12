import Model from "./model.js";
import View from "./view/view.js";
import Controller from "./controller.js";
import {DEFAULT_FREQUENCY} from "./config/constants.js";

const model = new Model(DEFAULT_FREQUENCY, {}, {}, {});
const view = new View(document, window);
const controller = new Controller(model, view);
