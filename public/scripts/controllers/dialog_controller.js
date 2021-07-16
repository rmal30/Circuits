export default class DialogController {
    constructor(controller, storageView) {
        this.controller = controller;
        this.storageView = storageView;
        this.storageView.events.bindCancel(this.onCancel.bind(this));
        this.storageView.events.bindLoadCircuit(this.onLoadCircuit.bind(this));
    }

    onLoadCircuit() {
        const circuitName = this.storageView.getSelectedCircuitName();
        const circuitStr = this.storageView.readDataFromLocalStorage(circuitName);
        const circuitObject = JSON.parse(circuitStr);
        this.controller.loadCircuit(circuitObject);
        this.storageView.closeLocalStorageDialog();
    }

    onCancel() {
        this.storageView.closeLocalStorageDialog();
    }
}