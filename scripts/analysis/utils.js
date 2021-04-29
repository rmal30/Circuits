class AnalysisUtils {
    static getComponents(components, types) {
        return components.filter((component) => types.includes(component.type));
    }

    /**
     * Get impedance of component
     * @param {float} hertz - Frequency of voltage/current sources
     * @param {any} component - Component
     * @returns {[float, float] | float} - Impedance of component
     */
    static getImpedance(hertz, component) {
        const value = component.value;
        const freq = hertz * Math.PI * 2;
        const capacitorScale = 10e6;
        const inductorScale = 10e-3;
        const diodeMinImpedance = 1e-100;
        switch (component.type) {
            case COMPONENT_TYPES.RESISTOR: return parseFloat(value);
            case COMPONENT_TYPES.CAPACITOR: return [0, -capacitorScale / (value * freq)];
            case COMPONENT_TYPES.INDUCTOR: return [0, inductorScale * value * freq];
            case COMPONENT_TYPES.DIODE: return value ? diodeMinImpedance : Infinity;
            default: return 0;
        }
    }

    static getDirection(pins, group, type) {
        switch (type) {
            case EQUATION_TYPES.LOOP:
                return AnalysisUtils.getLoopDirection(pins, group);
            case EQUATION_TYPES.NODE:
                return AnalysisUtils.getNodeDirection(pins, group);
            default:
                throw new Error("Invalid type");
        }
    }

    static getLoopDirection(pins, loop) {
        const pin1 = loop.indexOf(pins[0]);
        const pin2 = loop.indexOf(pins[1]);

        if (pin2 === -1 || pin1 === -1) {
            return 0;
        } else if (modulo(pin2 - pin1, loop.length) === 1) {
            return 1;
        } else if (modulo(pin1 - pin2, loop.length) === 1) {
            return -1;
        } else {
            return 0;
        }
    }

    static getNodeDirection(pins, node) {
        const pin1Exists = node.includes(pins[0]);
        const pin2Exists = node.includes(pins[1]);

        if (pin1Exists && !pin2Exists) {
            return -1;
        } else if (pin2Exists && !pin1Exists) {
            return 1;
        } else {
            return 0;
        }
    }
}
