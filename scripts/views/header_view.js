import {COMPONENTS_LIST} from "../components.js";
import HeaderEvents from "../events/header_events.js";

export default class HeaderView {
    constructor(_doc) {
        this.doc = _doc;
        this.frequencyInput = this.doc.getElementById("frequency");
        this.freqComponent = this.doc.getElementById("freqComponent");
        this.componentList = this.doc.getElementById("newComp");
        this.newCompDirection = this.doc.getElementById("newCompDir");
        this.events = new HeaderEvents(_doc);
    }

    setFrequencyEnabled(enabled) {
        const disabledClassName = "is-disabled";

        if (enabled) {
            this.freqComponent.classList.remove(disabledClassName);
        } else {
            this.freqComponent.classList.add(disabledClassName);
        }

        this.frequencyInput.disabled = !enabled;
    }

    setComponentOptions(componentOptions) {
        this.componentList.options.length = 1;
        for (const component of Object.keys(COMPONENTS_LIST.both)) {
            this.componentList.options[this.componentList.options.length] = new Option(
                COMPONENTS_LIST.both[component],
                component
            );
        }
        for (const component of Object.keys(componentOptions)) {
            this.componentList.options[this.componentList.options.length] = new Option(componentOptions[component], component);
        }
    }

    getNewComponentDirection() {
        return this.newCompDirection.value;
    }

    getNewComponentType() {
        return this.componentList.value;
    }
}
