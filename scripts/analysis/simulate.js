"use strict";

/**
 * Analyse and simulate circuit with nodal and mesh analysis
 * @param {Circuit} circuit The circuit to analyse
 * @returns {any} currents Currents, voltages, valid diode configuration if used
 */
function simulate(circuit) {
    const currentSets = meshAnalysis(circuit);
    const voltageSets = nodalAnalysis(circuit);
    const impComponents = getComponents(circuit.components, IMPEDANCE_COMPONENT_TYPES);
    let diodeCount;
    let validIndex;
    let valid;
    for (let i = 0; i < currentSets.length; i++) {
        diodeCount = 0;
        valid = true;
        for (let j = 0; j < currentSets[i].length; j++) {
            if (impComponents[j].type === COMPONENT_TYPES.DIODE) {
                const state = (i & (1 << diodeCount)) !== 0;
                const invalidOffState = !state && (currentSets[i][j][0] !== 0 || voltageSets[i][j][0] > 0);
                const invalidOnState = state && (currentSets[i][j][0] < 0 || voltageSets[i][j][0] < 0);
                if (invalidOffState || invalidOnState) {
                    valid = false;
                } else if (isNaN(currentSets[i][j]) || isNaN(voltageSets[i][j])) {
                    valid = false;
                }
                diodeCount++;
            }
        }
        if (valid) {
            validIndex = i;
            break;
        }
    }

    const diodes = getComponents(circuit.components, [COMPONENT_TYPES.DIODE]);
    for (let i = 0; i < diodes.length; i++) {
        diodes[i].value = (validIndex & (1 << i)) !== 0;
    }

    return [currentSets, voltageSets, impComponents, valid, validIndex];
}
