import {COMPONENTS_LIST} from "../components.js";

export default class HeaderController {

    constructor(controller, circuit, headerView, statusView) {
        this.controller = controller;
        this.circuit = circuit;
        this.headerView = headerView;
        this.statusView = statusView;

        this.headerView.events.bindFreqChange(this.changeFreq.bind(this));
        this.headerView.events.bindSimulate(this.onSimulate.bind(this));
        this.headerView.events.bindChooseMode(this.setMode.bind(this));
    }

    changeFreq(value) {
        this.circuit.setFreq(parseFloat(value));
    }

    // Simulate circuit and show results
    onSimulate() {
        const [currentSets, voltageSets] = this.circuit.simulate(this.circuit);
        this.statusView.showSolution(currentSets, voltageSets, this.circuit.components);
    }

    // Set AC/DC mode
    setMode(mode) {
        this.headerView.setFrequencyEnabled(mode === "ac");
        this.headerView.setComponentOptions(COMPONENTS_LIST[mode]);

        for (const possibleMode in COMPONENTS_LIST) {
            if (possibleMode !== mode && possibleMode !== "both") {
                for (const id of Object.keys(this.circuit.components)) {
                    if (this.circuit.components[id].type in COMPONENTS_LIST[possibleMode]) {
                        this.controller.deleteComponent(id);
                    }
                }
            }
        }
    }
}
