import {
    AMPLIFIER_TYPES, COMPONENT_TYPES, IMPEDANCE_COMPONENT_TYPES,
    INDEPENDENT_CURRENT_SOURCE_TYPES, INDEPENDENT_VOLTAGE_SOURCE_TYPES
} from "../config/components.js";
import {GraphAlgorithms} from "../graphs/graph_algorithms.js";
import Complex from "../math/complex.js";
import ComplexMatrix from "../math/complex_matrix.js";
import GaussianElimination from "../math/gaussian_elimination.js";
import CircuitAnalysis from "./circuit_analysis.js";
import {contractEdgesOfTypesFromGraph, getEdgesOfTypesFromGraph} from "./circuit_graph.js";
import AnalysisUtils from "./utils.js";

export default class NodalAnalysis extends CircuitAnalysis {

    getNodeVoltagesToNodeCurrentsMatrix(allNodes, noVoltageNodes) {
        const impedanceEdges = getEdgesOfTypesFromGraph(this.graph, IMPEDANCE_COMPONENT_TYPES);

        // Matrix mapping node voltages to impedance component voltages
        const nodeToBranchVoltagesMatrix = impedanceEdges.map((edgeId) => {
            return CircuitAnalysis.getComponentDirections(allNodes, edgeId);
        });

        // Matrix mapping impedance component voltages to node currents (with no voltage sources)
        const branchVoltagesToNodeCurrentsMatrix = noVoltageNodes.map((node) => {
            return super.getGroupImpedances(node, impedanceEdges, Complex.divide);
        });

        // Matrix mapping node voltages to node currents of impedances
        return ComplexMatrix.multiply(branchVoltagesToNodeCurrentsMatrix, nodeToBranchVoltagesMatrix);
    }

    getCurrentMetersToNodeCurrentsMatrix(noVoltageNodes) {
        const currentMeterEdges = getEdgesOfTypesFromGraph(this.graph, [COMPONENT_TYPES.CURRENT_METER]);

        // Meter currents -> Node currents with only current meters
        const currentMeterMatrix = noVoltageNodes.map((node) => {
            return CircuitAnalysis.getGroupDirections(node, currentMeterEdges);
        });

        const indexes = {};
        currentMeterEdges.forEach((edgeId, index) => {
            indexes[edgeId] = index;
        });

        // Meter currents -> Node currents with only current - current amplifiers
        const cccsEdges = getEdgesOfTypesFromGraph(this.graph, [COMPONENT_TYPES.CURRENT_CONTROLLED_CURRENT_SOURCE]);
        noVoltageNodes.forEach((node, nodeIndex) => {
            const meterCoeffs = super.getGroupMultipliers(node, cccsEdges);
            for (const edgeId of Object.keys(meterCoeffs)) {
                currentMeterMatrix[nodeIndex][indexes[edgeId]] += meterCoeffs[edgeId];
            }
        });

        return currentMeterMatrix;
    }

    getVoltageMetersToNodeCurrentsMatrix(noVoltageNodes) {
        const vcvsEdges = getEdgesOfTypesFromGraph(this.graph, [COMPONENT_TYPES.VOLTAGE_CONTROLLED_VOLTAGE_SOURCE]);
        const vccsEdges = getEdgesOfTypesFromGraph(this.graph, [COMPONENT_TYPES.VOLTAGE_CONTROLLED_CURRENT_SOURCE]);
        const voltageMeterEdges = getEdgesOfTypesFromGraph(this.graph, [COMPONENT_TYPES.VOLTAGE_METER]);

        return noVoltageNodes.map((node) => {
            // Meter voltages -> Node currents with only voltage - current amplifiers
            const meterCoeffs = super.getGroupMultipliers(node, vccsEdges);

            for (const edgeId of vcvsEdges) {
                meterCoeffs[this.graph.edges[edgeId].info.meter] = 0;
            }
            return voltageMeterEdges.map((edgeId) => meterCoeffs[edgeId]);
        });
    }

    getCurrentVector(nodes) {
        const currentEdges = getEdgesOfTypesFromGraph(this.graph, INDEPENDENT_CURRENT_SOURCE_TYPES);
        return nodes.map((node) => super.getGroupTotal(node, currentEdges));
    }

    getVoltageSourcesEquations(nodes, meterCount) {

        // Independent voltages sources
        const voltageEdges = getEdgesOfTypesFromGraph(this.graph, INDEPENDENT_VOLTAGE_SOURCE_TYPES);
        const voltageSourcesMatrix = voltageEdges.map((edgeId) => {
            return [
                ...CircuitAnalysis.getComponentDirections(nodes, edgeId),
                ...new Array(meterCount).fill(0)
            ];
        });

        // Constant branch voltages for independent voltage sources
        const targetVoltages = voltageEdges.map((edgeId) => -this.graph.edges[edgeId].info.value);
        return [voltageSourcesMatrix, targetVoltages];
    }

    getVoltageMetersMatrix(nodes, voltageMeterCount, currentMeterCount) {
        const voltageMeterEdges = getEdgesOfTypesFromGraph(this.graph, [COMPONENT_TYPES.VOLTAGE_METER]);

        // Node voltages + Branch voltage of meter = 0
        return voltageMeterEdges.map((edgeId, index) => {
            const identity = new Array(voltageMeterCount).fill(0);
            identity[index] = 1;
            return [
                ...CircuitAnalysis.getComponentDirections(nodes, edgeId),
                ...identity,
                ...new Array(currentMeterCount).fill(0)
            ];
        });
    }

    getCCVSMatrix(nodes, voltageMeterCount, currentMeterCount) {
        const currentMeterEdges = getEdgesOfTypesFromGraph(this.graph, [COMPONENT_TYPES.CURRENT_METER]);

        // Current - Voltage amplifier
        const ccvsEdges = getEdgesOfTypesFromGraph(this.graph, [COMPONENT_TYPES.CURRENT_CONTROLLED_VOLTAGE_SOURCE]);
        const ccvsMatrix = [];

        const currentMeterIndexes = {};
        currentMeterEdges.forEach((edgeId, index) => {
            currentMeterIndexes[edgeId] = index;
        });

        ccvsEdges.forEach((edgeId) => {
            const edge = this.graph.edges[edgeId];
            const identity = new Array(currentMeterCount).fill(0);
            identity[currentMeterIndexes[edge.info.meter]] = edge.info.value;
            ccvsMatrix.push([
                ...CircuitAnalysis.getComponentDirections(nodes, edgeId),
                ...new Array(voltageMeterCount).fill(0),
                ...identity
            ]);
            ccvsMatrix.push([
                ...CircuitAnalysis.getComponentDirections(nodes, edge.info.meter),
                ...new Array(voltageMeterCount + currentMeterCount).fill(0)
            ]);
        });
        return ccvsMatrix;
    }

    getVCVSMatrix(nodes, voltageMeterCount, currentMeterCount) {
        const voltageMeterEdges = getEdgesOfTypesFromGraph(this.graph, [COMPONENT_TYPES.VOLTAGE_METER]);

        const voltageMeterIndexes = {};
        voltageMeterEdges.forEach((edgeId, index) => {
            voltageMeterIndexes[edgeId] = index;
        });

        // Current - Current amplifier
        const vcvsEdges = getEdgesOfTypesFromGraph(this.graph, [COMPONENT_TYPES.VOLTAGE_CONTROLLED_VOLTAGE_SOURCE]);
        return vcvsEdges.map((edgeId) => {
            const edge = this.graph.edges[edgeId];
            const identity = new Array(voltageMeterCount).fill(0);
            identity[voltageMeterIndexes[edge.info.meter]] = edge.info.value;
            return [
                ...CircuitAnalysis.getComponentDirections(nodes, edgeId),
                ...identity,
                ...new Array(currentMeterCount).fill(0)
            ];
        });
    }

    getCCCSMatrix(nodes, meterCount) {
        // Current - Current amplifier
        const cccsEdges = getEdgesOfTypesFromGraph(this.graph, [COMPONENT_TYPES.CURRENT_CONTROLLED_CURRENT_SOURCE]);
        return cccsEdges.map((edgeId) => {
            return [
                ...CircuitAnalysis.getComponentDirections(nodes, this.graph.edges[edgeId].info.meter),
                ...new Array(meterCount).fill(0)
            ];
        });
    }

    getComponentVoltagesFromNodeVoltages(allNodes, nodeVoltagesArray) {
        const noVoltageEdges = getEdgesOfTypesFromGraph(this.graph, [
            ...IMPEDANCE_COMPONENT_TYPES,
            ...AMPLIFIER_TYPES,
            COMPONENT_TYPES.CURRENT_METER,
            COMPONENT_TYPES.INDEPENDENT_CURRENT_SOURCE_TYPES
        ]);

        // Matrix mapping node voltages to impedance component voltages
        const compMatrix = noVoltageEdges.map((edgeId) => {
            return CircuitAnalysis.getComponentDirections(allNodes, edgeId);
        });

        const nodeVoltagesColumn = ComplexMatrix.transpose([nodeVoltagesArray]);
        const componentVoltagesMatrix = ComplexMatrix.multiply(compMatrix, nodeVoltagesColumn);
        const [voltageList] = ComplexMatrix.transpose(componentVoltagesMatrix);

        const voltages = {};
        noVoltageEdges.forEach((edgeId, index) => {
            voltages[edgeId] = -voltageList[index];
        });

        return voltages;
    }

    getSolution() {

        // Find an independent set of loops
        const allNodes = GraphAlgorithms.findNodeFlows(this.graph);

        // Find an independent set of loops with no current sources
        const noVoltagesGraph = contractEdgesOfTypesFromGraph(this.graph, [
            ...INDEPENDENT_VOLTAGE_SOURCE_TYPES,
            COMPONENT_TYPES.CURRENT_CONTROLLED_VOLTAGE_SOURCE,
            COMPONENT_TYPES.VOLTAGE_CONTROLLED_VOLTAGE_SOURCE
        ]);
        const noVoltagesNodes = GraphAlgorithms.findNodeFlows(noVoltagesGraph).slice(1);

        // Matrix mapping loop currents and voltage/current meters to loop voltages
        const nodeCurrentsMatrix = ComplexMatrix.concatMultiple([
            this.getNodeVoltagesToNodeCurrentsMatrix(allNodes, noVoltagesNodes),
            this.getVoltageMetersToNodeCurrentsMatrix(noVoltagesNodes),
            this.getCurrentMetersToNodeCurrentsMatrix(noVoltagesNodes)
        ]);
        const targetCurrents = this.getCurrentVector(noVoltagesNodes);

        const voltageMeterEdges = getEdgesOfTypesFromGraph(this.graph, [COMPONENT_TYPES.VOLTAGE_METER]);
        const currentMeterEdges = getEdgesOfTypesFromGraph(this.graph, [COMPONENT_TYPES.CURRENT_METER]);

        const voltageMeterCount = voltageMeterEdges.length;
        const currentMeterCount = currentMeterEdges.length;
        const meterCount = voltageMeterCount + currentMeterCount;

        const [voltageSourcesMatrix, targetVoltages] = this.getVoltageSourcesEquations(allNodes, meterCount);
        const voltageMeterMatrix = this.getVoltageMetersMatrix(allNodes, voltageMeterCount, currentMeterCount);
        const ccvsMatrix = this.getCCVSMatrix(allNodes, voltageMeterCount, currentMeterCount);
        const vcvsMatrix = this.getVCVSMatrix(allNodes, voltageMeterCount, currentMeterCount);
        const cccsMatrix = this.getCCCSMatrix(allNodes, meterCount);
        const groundMatrix = [[1, ...new Array(allNodes.length - 1 + meterCount).fill(0)]];

        // Matrix equation
        const matrix = [
            nodeCurrentsMatrix, voltageSourcesMatrix,
            ccvsMatrix, voltageMeterMatrix, vcvsMatrix, cccsMatrix, groundMatrix
        ].flat();

        const target = [
            targetCurrents, targetVoltages,
            new Array(ccvsMatrix.length + voltageMeterMatrix.length + vcvsMatrix.length + cccsMatrix.length + 1).fill(0)
        ].flat();

        const solutionSet = GaussianElimination.solve(matrix, target);
        if (!solutionSet) {
            return null;
        }

        const {nodeVoltagesList, meterVoltagesList, meterCurrentsList} = AnalysisUtils.unpackArray({
            nodeVoltagesList: allNodes.length,
            meterVoltagesList: voltageMeterCount,
            meterCurrentsList: currentMeterCount
        }, solutionSet);

        const meterVoltages = {};
        voltageMeterEdges.forEach((edgeId, index) => {
            meterVoltages[edgeId] = meterVoltagesList[index];
        });

        const meterCurrents = {};
        currentMeterEdges.forEach((edgeId, index) => {
            meterCurrents[edgeId] = meterCurrentsList[index];
        });

        return {
            voltages: this.getComponentVoltagesFromNodeVoltages(allNodes, nodeVoltagesList),
            meterVoltages: meterVoltages,
            meterCurrents: meterCurrents
        };
    }
}
