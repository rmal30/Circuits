/**
 * Perform nodal analysis
 * @param {Circuit} circuit The circuit to analyse
 * @returns {[[complex]]} currents The node voltages
 */
function nodalAnalysis(circuit) {
    const graph = generateGraphFromCircuit(circuit);
    const nodes = CutsetSpace.getBasis(graph);
    let edge;
    let count = 0;

    for (const edgeID in graph.edges) {
        if (VOLTAGE_SOURCE_TYPES.some((prefix) => edgeID.includes(prefix))) {
            edge = graph.edges[edgeID];
            graph.removeEdge(edgeID, edge);
            graph.addEdge(`${COMPONENT_TYPES.LINE}-${(circuit.lines.length + count)}`, edge);
            count++;
        }
    }

    const nodes2 = CutsetSpace.getBasis(graph);
    nodes2.pop();

    const voltages = [];
    const diodes = getComponents(circuit.components, [COMPONENT_TYPES.DIODE]);

    for (let c = 0; c < (1 << diodes.length); c++) {
        const states = [];

        for (const i in diodes) {
            const state = (c & (1 << i)) !== 0;
            states.push(state);
            diodes[i].value = state;
        }

        const impComponents = getComponents(circuit.components, IMPEDANCE_COMPONENT_TYPES);
        const init = currentVector(nodes2, circuit.components);
        const voltMatrix = groupMatrix(nodes, impComponents, EQUATION_TYPES.NODE);
        const curMatrix = lawMatrix(circuit.hertz, nodes2, impComponents, EQUATION_TYPES.NODE);
        const kclMatrix = ComplexMatrix.multiply(curMatrix, voltMatrix);
        const voltageComponents = getComponents(circuit.components, INDEPENDENT_VOLTAGE_SOURCE_TYPES);
        const voltMatrix2 = groupMatrix(nodes, voltageComponents, EQUATION_TYPES.NODE);

        for (let i = 0; i < voltMatrix2.length; i++) {
            kclMatrix.push(voltMatrix2[i]);
        }

        const voltageAmpComponents = getComponents(circuit.components, [COMPONENT_TYPES.VOLTAGE_CONTROLLED_VOLTAGE_SOURCE]);
        const voltageAmpMatrix = groupMatrix2(nodes, voltageAmpComponents, EQUATION_TYPES.NODE);

        for (let i = 0; i < voltageAmpMatrix.length; i++) {
            kclMatrix.push(voltageAmpMatrix[i]);
            init.push(0);
        }

        const groundNodes = new Array(nodes.length).fill(0);
        groundNodes[0] = 1;
        kclMatrix.push(groundNodes);
        const nodeVoltages = GaussianElimination.solve(kclMatrix, init);
        const componentVoltages = ComplexMatrix.scalarMultiply(ComplexMatrix.multiply(voltMatrix, ComplexMatrix.transpose([nodeVoltages])), -1);
        voltages.push(componentVoltages);
    }

    return voltages;
}
