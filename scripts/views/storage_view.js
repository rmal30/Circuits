import dialogPolyfill from "../dialog_polyfill.js";
import DialogEvents from "../events/dialog_events.js";
import Utils from "../math/utils.js";
export default class StorageView {
    constructor(_doc, _window) {
        this.doc = _doc;
        this._window = _window;
        this.importedFileInput = this.doc.getElementById("importedFile");
        this.localStorageDialog = this.doc.getElementById("localStorageDialog");
        this.localStorageKeyInput = this.doc.getElementById("localStorageKeyInput");
        dialogPolyfill.registerDialog(this.localStorageDialog);
        this.circuitNameInput = this.doc.getElementById("localStorageKeyInput");
        this.events = new DialogEvents(this.doc);
    }

    showLocalStorageDialog() {
        this.localStorageDialog.showModal();
        const storage = this._window.localStorage;
        const localStorageKeys = Utils.range(0, storage.length).map((index) => storage.key(index));
       
        this.localStorageKeyInput.options.length = 0;
        for (const key of localStorageKeys) {
            this.localStorageKeyInput.options[this.localStorageKeyInput.options.length] = new Option(key, key);
        }
    }

    closeLocalStorageDialog() {
        this.localStorageDialog.close();
    }

    getSelectedCircuitName() {
        return this.circuitNameInput.value;
    }

    pickFile() {
        this.importedFileInput.click();
    }

    importJSONFile(onReadCallback) {
        const file = this.importedFileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                if (evt.target) {
                    onReadCallback(evt.target.result);
                }
            }
            reader.onerror = function (evt) {
                throw new Error("Failed to read file");
            }
        }
    }

    saveDataToLocalStorage(key, text) {
        this._window.localStorage.setItem(key, text);
    }

    readDataFromLocalStorage(key) {
        return this._window.localStorage.getItem(key);
    }

    exportJSONFile(filename, text) {
        const downloadElement = this.doc.createElement('a');
        downloadElement.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(text)}`);
        downloadElement.setAttribute('download', filename);

        downloadElement.style.display = 'none';
        this.doc.body.appendChild(downloadElement);

        downloadElement.click();

        this.doc.body.removeChild(downloadElement);
    }
}