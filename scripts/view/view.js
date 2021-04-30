class View {
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
            this.compList.options[this.compList.options.length] = new Option(COMPONENTS_LIST.both[component], component);
        }
        for (const component of Object.keys(componentOptions)) {
            this.compList.options[this.compList.options.length] = new Option(componentOptions[component], component);
        }
    }

    showSolution(currentSets, voltageSets, impComponents, valid, validIndex) {
        let solutionOutput = null;
        if (valid) {
            solutionOutput = [
                [
                    "Nodal analysis:",
                    ...impComponents.
                        map((component, index) => {
                            const fullId = `${component.type}_${component.id}`;
                            return `${fullId}: ${Complex.print(voltageSets[validIndex][index][0])}V`;
                        })
                ],
                [
                    "Mesh analysis:",
                    ...impComponents.
                        map((component, index) => {
                            const fullId = `${component.type}_${component.id}`;
                            return `${fullId}: ${Complex.print(currentSets[validIndex][index][0])}A`;
                        })
                ],
                [
                    "Component list:",
                    ...impComponents.map((component) => {
                        return `${component.type}_${component.id}: ${JSON.stringify(component, (_, value) => {
                            return value instanceof Array ? JSON.stringify(value) : value;
                        }, 4)}`;
                    })
                ]
            ].map((section) => section.join("\r\n")).join("\r\n\r\n");

        } else {
            solutionOutput = "No solution found";
        }
        this.setInformation(solutionOutput);
    }

    setElementSelected(selected, id, type) {
        const elementId = getElementId(id, type);
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
