export default class DialogEvents {
    constructor(doc) {
        this.doc = doc;
        this.dialogLoadButton = this.doc.getElementById("loadCircuit");
        this.dialogCancelButton = this.doc.getElementById("cancel");
    }

    bindLoadCircuit(onLoadCircuit) {
        this.dialogLoadButton.addEventListener("click", () => {
            onLoadCircuit();
        });
    }

    bindCancel(onCancel) {
        this.dialogCancelButton.addEventListener("click", () => {
            onCancel();
        });
    }
}