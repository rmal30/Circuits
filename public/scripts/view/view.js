import {COMPONENTS_LIST} from "../config/components.js";
import {STYLES} from "../config/style.js";
import Complex from "../math/complex.js";
import Utils from "../utils.js";
import Events from "./events.js";
import Graphics from "./graphics.js";
import Schematic from "../schematic.js";

export default class View {
    constructor(_doc, _window) {
        this.doc = _doc;
        this.window = _window;
        this.svg = this.doc.getElementById("svg");
        this.schematic = new Schematic(_doc, new Graphics(_doc, this.svg));
        this.events = new Events(_doc);
        this.freq = this.doc.getElementById("freq");
        this.freq2 = this.doc.getElementById("freq2");
        this.info = this.doc.getElementById("info");
        this.compList = this.doc.getElementById("newComp");
        this.newCompDirection = this.doc.getElementById("newCompDir");
    }

    setFrequencyEnabled(enabled) {
        const disabledClassName = "is-disabled";

        if (enabled) {
            this.freq2.classList.remove(disabledClassName);
        } else {
            this.freq2.classList.add(disabledClassName);
        }

        this.freq.disabled = !enabled;
    }

    setInformation(info) {
        this.info.textContent = info;
    }

    setComponentOptions(componentOptions) {
        this.compList.options.length = 1;
        for (const component of Object.keys(COMPONENTS_LIST.both)) {
            this.compList.options[this.compList.options.length] = new Option(
                COMPONENTS_LIST.both[component],
                component
            );
        }
        for (const component of Object.keys(componentOptions)) {
            this.compList.options[this.compList.options.length] = new Option(componentOptions[component], component);
        }
    }

    showSolution(currentSets, voltageSets, components) {
        let solutionOutput = "No solution known";
        if (currentSets && voltageSets) {
            solutionOutput = [
                [
                    "Nodal analysis:",
                    ...Object.entries(voltageSets.voltages).map((entry) => {
                        const [id, voltage] = entry;
                        return `${id}: ${Complex.print(voltage)}V`;
                    })
                ],
                [
                    "Mesh analysis:",
                    ...Object.entries(currentSets.currents).map((entry) => {
                        const [id, current] = entry;
                        return `${id}: ${Complex.print(current)}A`;
                    })
                ],
                [
                    "Meter measurements",
                    ...Object.entries(currentSets.meterVoltages).map((entry) => {
                        const [id, voltage] = entry;
                        return `${id}: ${Complex.print(voltage)}V`;
                    }),
                    ...Object.entries(currentSets.meterCurrents).map((entry) => {
                        const [id, current] = entry;
                        return `${id}: ${Complex.print(current)}A`;
                    })
                ],
                [
                    "Component list:",
                    ...Object.entries(components).map((entry) => {
                        const [id, component] = entry;
                        return `${id}: ${JSON.stringify(component, (_, value) => {
                            return value instanceof Array ? JSON.stringify(value) : value;
                        }, 4)}`;
                    })
                ]
            ].map((section) => section.join("\r\n")).join("\r\n\r\n");
        }
        this.setInformation(solutionOutput);
    }

    setElementSelected(selected, id, type) {
        const elementId = Utils.getElementId(id, type);
        const element = this.doc.getElementById(elementId);

        if (element) {
            const style = selected ? STYLES.select[type] : STYLES.deselect[type];
            Object.assign(element.style, style);
        }
    }

    setSelectedItem(item) {
        if (item) {
            this.setElementSelected(true, item.id, item.type);
        }
    }

    clearSelectedItem(item) {
        if (item) {
            this.setElementSelected(false, item.id, item.type);
        }
    }

    // Prompt value from user
    promptComponentValue(info) {
        const promptStr = `Please enter a ${info.prop} for a ${info.name} in ${info.unit}`;
        let value = null;
        let invalid = true;
        do {
            value = this.window.prompt(promptStr);
            invalid = value === "";
            if (invalid) {
                this.window.alert("Please enter a valid value");
            }
        } while (invalid);
        return value;
    }

    getNewComponentDirection() {
        return this.newCompDirection.value;
    }

    getNewComponentType() {
        return this.compList.value;
    }
}
