export default class HeaderEvents {

    constructor(doc) {
        this.doc = doc;
        this.simulateButton = this.doc.getElementById("simulate");
        this.chooseModeSpinner = this.doc.getElementById("mode");
        this.freqInput = this.doc.getElementById("frequency");
        this.importedFileInput = this.doc.getElementById("importedFile");
        this.importButton = this.doc.getElementById("import");
        this.loadButton = this.doc.getElementById("load");
        this.exportButton = this.doc.getElementById("export");
        this.saveButton = this.doc.getElementById("save");
    }

    bindFreqChange(onFreqChange) {
        this.freqInput.addEventListener("input", () => {
            onFreqChange(this.freqInput.value);
        });
    }

    bindSimulate(onSimulate) {
        this.simulateButton.addEventListener("click", () => {
            onSimulate();
        });
    }

    bindImport(onImport) {
        this.importButton.addEventListener("click", () => {
            onImport();
        });
    }

    bindFilePicked(onFilePicked){
        this.importedFileInput.addEventListener("change", () => {
            onFilePicked();
        });
    }

    bindLoad(onLoad) {
        this.loadButton.addEventListener("click", () => {
            onLoad();
        });
    }

    bindExport(onExport) {
        this.exportButton.addEventListener("click", () => {
            onExport();
        });
    }

    bindSave(onSave) {
        this.saveButton.addEventListener("click", () => {
            onSave();
        });
    }

    bindChooseMode(onChooseMode) {
        this.chooseModeSpinner.addEventListener("click", () => {
            onChooseMode(this.chooseModeSpinner.value);
        });
    }
}
