"use strict";

/**
 * Perform mesh analysis
 * @param {Circuit} circuit The circuit to analyse
 * @returns {[[complex]]} currents The loop currents
 */
function meshAnalysis(circuit) {

    const
        constantCurrentSources = [
            COMPONENT_TYPES.DC_CURRENT_SOURCE,
            COMPONENT_TYPES.AC_CURRENT_SOURCE
        ],
        currentSources = [
            COMPONENT_TYPES.DC_CURRENT_SOURCE,
            COMPONENT_TYPES.AC_CURRENT_SOURCE,
            "cs-"
        ],
        graph = generateGraphFromCircuit(circuit),
        loops = CycleSpace.getBasis(graph);

    for (const edgeID in graph.edges) {
        if (currentSources.some((prefix) => edgeID.includes(prefix))) {
            graph.removeEdge(edgeID, graph.edges[edgeID]);
        }
    }

    const loops2 = CycleSpace.getBasis(graph);
    const currents = [];
    const diodes = getComponents(circuit.components, [COMPONENT_TYPES.DIODE]);

    for (let diodeConfig = 0; diodeConfig < (1 << diodes.length); diodeConfig++) {
        const states = [];

        for (let i = 0; i < diodes.length; i++) {
            const state = (diodeConfig & (1 << i)) !== 0;
            states.push(state);
            diodes[i].value = state;
        }

        const impComponents = getComponents(circuit.components, IMPEDANCE_COMPONENT_TYPES);
        const init = voltageVector(loops2, circuit.components);
        const curMatrix = groupMatrix(loops, impComponents, EQUATION_TYPES.LOOP);
        const voltMatrix = lawMatrix(circuit.hertz, loops2, impComponents, EQUATION_TYPES.LOOP);
        let kvlMatrix = ComplexMatrix.multiply(voltMatrix, curMatrix);
        const currentComponents = getComponents(circuit.components, constantCurrentSources);
        const curMatrix2 = groupMatrix(loops, currentComponents, EQUATION_TYPES.LOOP);
        kvlMatrix = kvlMatrix.concat(curMatrix2);
        const currentAmpComponents = getComponents(
            circuit.components,
            [COMPONENT_TYPES.CURRENT_CONTROLLED_CURRENT_SOURCE]
        );
        const currentAmpMatrix = groupMatrix2(loops, currentAmpComponents, EQUATION_TYPES.LOOP);

        for (const row of currentAmpMatrix) {
            kvlMatrix.push(row);
            init.push(0);
        }

        const loopCurrents = GaussianElimination.solve(kvlMatrix, init);
        currents.push(ComplexMatrix.multiply(curMatrix, ComplexMatrix.transpose([loopCurrents])));
    }

    return currents;
}
