import {getCircuitGraph} from "./circuit_graph.js";
import MeshAnalysis from "./mesh_analysis.js";
import NodalAnalysis from "./nodal_analysis.js";

export default class Analyser {

    static analyse(circuit, Analysis) {
        const graph = getCircuitGraph(circuit);
        const analysis = new Analysis(circuit, graph);
        return analysis.getSolution();
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
