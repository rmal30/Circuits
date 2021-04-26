/**
 * Get impedance of component
 * @param {float} hertz - Frequency of voltage/current sources
 * @param {any} component - Component
 * @returns {[float, float] | float} - Impedance of component
 */
function getImpedance(hertz, component) {
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
