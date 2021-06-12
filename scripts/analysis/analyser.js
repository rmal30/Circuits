import ComplexOperations from "../math/complex.js";
import GaussianElimination from "../math/gaussian_elimination.js";
import GraphAlgorithms from "../graph/graph_algorithms.js";
import MatrixUtils from "../math/matrix.js";
import CircuitGraph from "../graph/circuit_graph.js";

import MeshAnalysis from "./mesh_analysis.js";
import NodalAnalysis from "./nodal_analysis.js";

export default class Analyser {

    static analyse(circuit, Analysis) {
        const graph = new CircuitGraph(circuit);
        const analysis = new Analysis(circuit, graph, ComplexOperations, GaussianElimination, MatrixUtils);
        return analysis.getSolution(GraphAlgorithms);
    }

    /**
     * Analyse and simulate circuit with nodal and mesh analysis
     * @param {any} circuit The circuit to analyse
     * @returns {any} Currents, voltages, valid diode configuration if used
     */
    static getCurrentsAndVoltages(circuit) {
        const currentSets = Analyser.analyse(circuit, MeshAnalysis);
        const voltageSets = Analyser.analyse(circuit, NodalAnalysis);
        return [currentSets, voltageSets];
    }
}
