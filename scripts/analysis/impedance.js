import {COMPONENT_TYPES} from "../config/components.js";

/**
 * Get impedance of component
 * @param {number} hertz - Frequency of voltage/current sources
 * @param {string} componentType - Component type
 * @param {number} componentValue - Component value
 * @returns {[number, number] | number} - Impedance of component
 */
export function getImpedance(hertz, componentType, componentValue) {
    const freq = hertz * Math.PI * 2;
    const capacitorScale = 1e6;
    const inductorScale = 1e-3;
    switch (componentType) {
        case COMPONENT_TYPES.RESISTOR: return componentValue;
        case COMPONENT_TYPES.CAPACITOR: return [0, -capacitorScale / (componentValue * freq)];
        case COMPONENT_TYPES.INDUCTOR: return [0, inductorScale * componentValue * freq];
        default: throw new Error("Unknown component");
    }
}
