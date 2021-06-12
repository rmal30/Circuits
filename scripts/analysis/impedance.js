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
