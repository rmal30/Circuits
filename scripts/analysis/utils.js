class AnalysisUtils {

    static getDirection(group, element) {
        return element in group ? group[element] : 0;
    }

    static getComponents(components, types) {
        return components.filter((component) => types.includes(component.type));
    }

    /**
     * Get impedance of component
     * @param {number} hertz - Frequency of voltage/current sources
     * @param {string} componentType - Component type
     * @param {number} componentValue - Component value
     * @returns {[number, number] | number} - Impedance of component
     */
    static getImpedance(hertz, componentType, componentValue) {
        const freq = hertz * Math.PI * 2;
        const capacitorScale = 10e6;
        const inductorScale = 10e-3;
        const diodeMinImpedance = 1e-100;
        switch (componentType) {
            case COMPONENT_TYPES.RESISTOR: return componentValue;
            case COMPONENT_TYPES.CAPACITOR: return [0, -capacitorScale / (componentValue * freq)];
            case COMPONENT_TYPES.INDUCTOR: return [0, inductorScale * componentValue * freq];
            case COMPONENT_TYPES.DIODE: return componentValue ? diodeMinImpedance : Infinity;
            default: return 0;
        }
    }

    static unpackArray(spec, arr) {
        const results = {};
        for (const prop of Object.keys(spec)) {
            results[prop] = arr.splice(0, spec[prop]);
        }
        return results;
    }
}
