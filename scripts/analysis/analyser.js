"use strict";

class Analyser {

    /**
     * Generate network graph from graphical circuit
     * @param {any} circuit - The graphical circuit
     * @returns {Graph} graph - Network graph representation of the circuit
     */
    static getGraph(circuit) {
        const graph = new Graph();
        Object.keys(circuit.pins).forEach((pinID) => graph.addNode(pinID));
        const maxLineId = Object.keys(circuit.lines).map((k) => parseInt(k)).reduce((a, b) => Math.max(a, b));

        for (const lineId of Object.keys(circuit.lines)) {
            const [node1, node2] = circuit.lines[lineId];
            graph.addEdge(`${COMPONENT_TYPES.LINE}-${lineId}`, [node1, node2]);
        }

        let count = 0;
        for (const id of Object.keys(circuit.components)) {
            const edgeID = `${circuit.components[id].type}-${id}`;
            if (circuit.components[id].pins.length === 2) {
                graph.addEdge(edgeID, circuit.components[id].pins);
            } else {
                const [portA, portB, portC, portD] = circuit.components[id].pins;
                graph.addEdge(edgeID, [portB, portD]);
                if (CURRENT_CONTROLLED_SOURCES.includes(circuit.components[id].type)) {
                    const lineID = `${COMPONENT_TYPES.LINE}-${maxLineId + 1 + count}`;
                    graph.addEdge(lineID, [portA, portC]);
                    count++;
                }
            }
        }

        return graph;
    }


    /**
     * Perform nodal analysis
     * @param {Circuit} circuit The circuit to analyse
     * @returns {[[complex]]} currents The node voltages
     */
    static nodalAnalysis(circuit) {
        const graph = Analyser.getGraph(circuit);
        const nodes = CutsetSpace.getBasis(graph);
        let edge;
        let count = 0;

        const maxLineId = Object.keys(graph.edges).map((k) => parseInt(k.split("-")[1])).reduce((a, b) => Math.max(a, b));

        for (const edgeID of Object.keys(graph.edges)) {
            if (VOLTAGE_SOURCE_TYPES.some((prefix) => edgeID.includes(prefix))) {
                edge = graph.edges[edgeID];
                graph.removeEdge(edgeID, edge);
                graph.addEdge(`${COMPONENT_TYPES.LINE}-${maxLineId + 1 + count}`, edge);
                count++;
            }
        }

        const nodes2 = CutsetSpace.getBasis(graph);
        nodes2.pop();

        const voltages = [];
        const components = Object.values(circuit.components);
        const diodes = AnalysisUtils.getComponents(components, [COMPONENT_TYPES.DIODE]);

        for (let c = 0; c < (1 << diodes.length); c++) {
            const states = [];

            diodes.forEach((_, index) => {
                const state = (c & (1 << index)) !== 0;
                states.push(state);
                diodes[index].value = state;
            });

            const impComponents = AnalysisUtils.getComponents(components, IMPEDANCE_COMPONENT_TYPES);
            const init = currentVector(nodes2, components);
            const voltMatrix = groupMatrix(nodes, impComponents, EQUATION_TYPES.NODE);
            const curMatrix = lawMatrix(circuit.hertz, nodes2, impComponents, EQUATION_TYPES.NODE);
            const kclMatrix = ComplexMatrix.multiply(curMatrix, voltMatrix);
            const voltageComponents = AnalysisUtils.getComponents(components, INDEPENDENT_VOLTAGE_SOURCE_TYPES);
            const voltMatrix2 = groupMatrix(nodes, voltageComponents, EQUATION_TYPES.NODE);

            for (const row of voltMatrix2) {
                kclMatrix.push(row);
            }

            const voltageAmpComponents = AnalysisUtils.getComponents(
                components,
                [COMPONENT_TYPES.VOLTAGE_CONTROLLED_VOLTAGE_SOURCE]
            );
            const voltageAmpMatrix = groupMatrix2(nodes, voltageAmpComponents, EQUATION_TYPES.NODE);

            for (const row of voltageAmpMatrix) {
                kclMatrix.push(row);
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

    /**
     * Perform mesh analysis
     * @param {Circuit} circuit The circuit to analyse
     * @returns {[[complex]]} currents The loop currents
     */
    static meshAnalysis(circuit) {

        const
            graph = Analyser.getGraph(circuit),
            loops = CycleSpace.getBasis(graph);

        for (const edgeID of Object.keys(graph.edges)) {
            if (CURRENT_SOURCE_TYPES.some((prefix) => edgeID.includes(prefix))) {
                graph.removeEdge(edgeID, graph.edges[edgeID]);
            }
        }

        const loops2 = CycleSpace.getBasis(graph);
        const currents = [];
        const components = Object.values(circuit.components);
        const diodes = AnalysisUtils.getComponents(components, [COMPONENT_TYPES.DIODE]);

        for (let diodeConfig = 0; diodeConfig < (1 << diodes.length); diodeConfig++) {
            const states = [];

            diodes.forEach((_, index) => {
                const state = (diodeConfig & (1 << index)) !== 0;
                states.push(state);
                diodes[index].value = state;
            });

            const impComponents = AnalysisUtils.getComponents(components, IMPEDANCE_COMPONENT_TYPES);
            const init = voltageVector(loops2, components);
            const curMatrix = groupMatrix(loops, impComponents, EQUATION_TYPES.LOOP);
            const voltMatrix = lawMatrix(circuit.hertz, loops2, impComponents, EQUATION_TYPES.LOOP);
            let kvlMatrix = ComplexMatrix.multiply(voltMatrix, curMatrix);
            const currentComponents = AnalysisUtils.getComponents(components, INDEPENDENT_CURRENT_SOURCE_TYPES);
            const curMatrix2 = groupMatrix(loops, currentComponents, EQUATION_TYPES.LOOP);
            kvlMatrix = kvlMatrix.concat(curMatrix2);
            const currentAmpComponents = AnalysisUtils.getComponents(
                components,
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

    /**
     * Analyse and simulate circuit with nodal and mesh analysis
     * @param {Circuit} circuit The circuit to analyse
     * @returns {any} Currents, voltages, valid diode configuration if used
     */
    static getCurrentsAndVoltages(circuit) {
        const currentSets = Analyser.meshAnalysis(circuit);
        const voltageSets = Analyser.nodalAnalysis(circuit);
        const components = Object.values(circuit.components);
        const impComponents = AnalysisUtils.getComponents(components, IMPEDANCE_COMPONENT_TYPES);
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

        const diodes = AnalysisUtils.getComponents(components, [COMPONENT_TYPES.DIODE]);
        for (let i = 0; i < diodes.length; i++) {
            diodes[i].value = (validIndex & (1 << i)) !== 0;
        }

        return [currentSets, voltageSets, impComponents, valid, validIndex];
    }
}
