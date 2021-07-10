import Complex from "../math/complex.js";

export default class StatusView {
    constructor(_doc) {
        this.doc = _doc;
        this.info = this.doc.getElementById("info");
    }

    setInformation(info) {
        this.info.textContent = info;
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
}
