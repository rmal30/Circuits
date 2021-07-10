export default class HeaderEvents {

    constructor(doc) {
        this.doc = doc;
        this.simulate = this.doc.getElementById("simulate");
        this.chooseMode = this.doc.getElementById("mode");
        this.freq = this.doc.getElementById("frequency");
    }

    bindFreqChange(onFreqChange) {
        this.freq.addEventListener("input", () => {
            onFreqChange(this.freq.value);
        });
    }

    bindSimulate(onSimulate) {
        this.simulate.addEventListener("click", () => {
            onSimulate();
        });
    }

    bindChooseMode(onChooseMode) {
        this.chooseMode.addEventListener("click", () => {
            onChooseMode(this.chooseMode.value);
        });
    }
}
