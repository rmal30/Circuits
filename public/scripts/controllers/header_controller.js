import {COMPONENTS_LIST} from "../components.js";

export default class HeaderController {

    constructor(controller, circuit, headerView, statusView, windowView, storageView) {
        this.controller = controller;
        this.circuit = circuit;
        this.headerView = headerView;
        this.statusView = statusView;
        this.windowView = windowView;
        this.storageView = storageView;

        this.headerView.events.bindFreqChange(this.changeFreq.bind(this));
        this.headerView.events.bindSimulate(this.onSimulate.bind(this));
        this.headerView.events.bindFilePicked(this.onFilePicked.bind(this));

        this.headerView.events.bindLoad(this.onLoad.bind(this));
        this.headerView.events.bindImport(this.onImport.bind(this));
        this.headerView.events.bindSave(this.onSave.bind(this));
        this.headerView.events.bindExport(this.onExport.bind(this));
        this.headerView.events.bindChooseMode(this.setMode.bind(this));
    }

    changeFreq(value) {
        this.circuit.setFreq(parseFloat(value));
    }

    // Simulate circuit and show results
    onSimulate() {
        try {
            const [currentSets, voltageSets] = this.circuit.simulate(this.circuit);
            this.statusView.showSolution(currentSets, voltageSets, this.circuit.components);
        } catch(e) {
            this.windowView.alertMessage(`Failed to simulate circuit: ${e.message}`);
        }
    }

    onImport() {
        this.storageView.pickFile();
    }

    onFilePicked() {
        this.storageView.importJSONFile((jsonData) => {
            const circuitObject = JSON.parse(jsonData);
            this.controller.loadCircuit(circuitObject);
        });
    }

    onLoad() {
        this.storageView.showLocalStorageDialog();
    }

    onSave() {
        const circuitJSONString = JSON.stringify(this.circuit);
        const key = this.windowView.promptCircuitName();
        if (key) {
            this.storageView.saveDataToLocalStorage(key, circuitJSONString);
        }
    }

    onExport() {
        const circuitJSONString = JSON.stringify(this.circuit);
        const filename = this.windowView.promptCircuitName();
        if (filename) {
            this.storageView.exportJSONFile(`${filename}.json`, circuitJSONString);
        }
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
