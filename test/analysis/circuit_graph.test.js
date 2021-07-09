import assert from "assert";

import CircuitGraph from "../../public/scripts/analysis/circuit_graph.js";
import resistorVoltCircuit from '../circuit_examples/resistor_volt.json';
import vcvsCircuit from "../circuit_examples/vcvs.json";
import doubleResistorCircuit from "../circuit_examples/double_resistor_volt.json";


describe("Construct graphs from circuits", () => {
    it("Should create graph from resistor and voltage source circuit", () => {
        const graph = new CircuitGraph(resistorVoltCircuit);
        assert.deepStrictEqual(graph.edges, {
            0: {info: {type: 'res', value: 2}, node1: '0', node2: '1'},
            1: {info: {type: 'vdc', value: 3}, node1: '0', node2: '1'}
        });

        assert.deepStrictEqual(graph.nodes, {
            0: {edges: new Set(['0', '1'])},
            1: {edges: new Set(['0', '1'])}
        });
    });

    describe("Should create graph from circuits with 4 pin components", () => {
        const circuit = vcvsCircuit;
        it("Convert circuit with voltage controlled voltage source", () => { 
            circuit.components[1].type = "vcvs";
            circuit.components[2].type = "vdc";
            const graph = new CircuitGraph(circuit);
            assert.deepStrictEqual(graph.edges, {
                0: {
                    info: {type: 'res', value: 3},
                    node1: '0',
                    node2: '1'
                },
                '1:1': {
                    info: {type: 'vm'},
                    node1: '0',
                    node2: '4'
                },
                '1:2': {
                    info: {meter: '1:1', type: 'vcvs', value: 5},
                    node1: '0',
                    node2: '1'
                },
                2: {
                    info: {type: 'vdc', value: 7},
                    node1: '0',
                    node2: '4'
                }
            });
    
            assert.deepStrictEqual(graph.nodes, {
                0: {
                    edges: new Set(['0', '1:1', '1:2', '2'])
                },
                1: {
                    edges: new Set(['0', '1:2'])
                },
                4: {
                    edges: new Set(['1:1', '2'])
                }
            });
        });

        it("Convert circuit with voltage controlled current source", () => { 
            circuit.components[1].type = "vccs";
            circuit.components[2].type = "vdc";
            const graph = new CircuitGraph(circuit);
            assert.deepStrictEqual(graph.edges, {
                0: {
                    info: {type: 'res', value: 3},
                    node1: '0',
                    node2: '1'
                },
                '1:1': {
                    info: {type: 'vm'},
                    node1: '0',
                    node2: '4'
                },
                '1:2': {
                    info: {meter: '1:1', type: 'vccs', value: 5},
                    node1: '0',
                    node2: '1'
                },
                2: {
                    info: {type: 'vdc', value: 7},
                    node1: '0',
                    node2: '4'
                }
            });
    
            assert.deepStrictEqual(graph.nodes, {
                0: {
                    edges: new Set(['0', '1:1', '1:2', '2'])
                },
                1: {
                    edges: new Set(['0', '1:2'])
                },
                4: {
                    edges: new Set(['1:1', '2'])
                }
            });
        });

        it("Convert circuit with current controlled voltage source", () => { 
            circuit.components[1].type = "ccvs";
            circuit.components[2].type = "idc";
            const graph = new CircuitGraph(circuit);
            assert.deepStrictEqual(graph.edges, {
                0: {
                    info: {type: 'res', value: 3},
                    node1: '0',
                    node2: '1'
                },
                '1:1': {
                    info: {type: 'cm'},
                    node1: '0',
                    node2: '4'
                },
                '1:2': {
                    info: {meter: '1:1', type: 'ccvs', value: 5},
                    node1: '0',
                    node2: '1'
                },
                2: {
                    info: {type: 'idc', value: 7},
                    node1: '0',
                    node2: '4'
                }
            });
    
            assert.deepStrictEqual(graph.nodes, {
                0: {
                    edges: new Set(['0', '1:1', '1:2', '2'])
                },
                1: {
                    edges: new Set(['0', '1:2'])
                },
                4: {
                    edges: new Set(['1:1', '2'])
                }
            });
        });

        it("Convert circuit with current controlled current source", () => { 
            circuit.components[1].type = "cccs";
            circuit.components[2].type = "idc";
            const graph = new CircuitGraph(circuit);
            assert.deepStrictEqual(graph.edges, {
                0: {
                    info: {type: 'res', value: 3},
                    node1: '0',
                    node2: '1'
                },
                '1:1': {
                    info: {type: 'cm'},
                    node1: '0',
                    node2: '4'
                },
                '1:2': {
                    info: {meter: '1:1', type: 'cccs', value: 5},
                    node1: '0',
                    node2: '1'
                },
                2: {
                    info: {type: 'idc', value: 7},
                    node1: '0',
                    node2: '4'
                }
            });
    
            assert.deepStrictEqual(graph.nodes, {
                0: {
                    edges: new Set(['0', '1:1', '1:2', '2'])
                },
                1: {
                    edges: new Set(['0', '1:2'])
                },
                4: {
                    edges: new Set(['1:1', '2'])
                }
            });
        });

        it("Throw error if unknown component", () => {
            circuit.components[1].type = "";
            circuit.components[2].type = "idc";
            assert.throws(() => new CircuitGraph(circuit));
        });
    });

    

    describe("Circuit graph functions and methods", () => {
        let graph;

        before(() => {
            graph = new CircuitGraph(doubleResistorCircuit);
        });
        
        it("Get node groups from circuit", () => {      
            assert.deepStrictEqual(CircuitGraph.getNodeGroups(doubleResistorCircuit), new Set([
                new Set([10, 12, 14]),
                new Set([11, 13, 9])
            ]));
        });

        it("Get edges of types", () => {
            assert.deepStrictEqual(graph.getEdgesOfTypes(["res"]), ['3', '4']);
        });

       
        it("Contract edges of types", () => {
            const newGraph = graph.contractEdgesOfTypes(["res"]);
            assert.notDeepStrictEqual(graph, newGraph);
            assert.deepStrictEqual(newGraph.edges, {
                5: {info: {type: 'vdc', value: 7}, node1: '9:10', node2: '9:10'}
            });
            assert.deepStrictEqual(newGraph.nodes, {
                "9:10": {edges: new Set(['5'])}
            });
        });

        it("Exclude edges of types", () => {
            const newGraph = graph.excludeEdgesOfTypes(["res"]);
            assert.notDeepStrictEqual(graph, newGraph);
            assert.deepStrictEqual(newGraph.edges, {
                5: {info: {type: 'vdc', value: 7}, node1: '9', node2: '10'}
            });
            assert.deepStrictEqual(newGraph.nodes, {
                10: {edges: new Set(['5'])},
                9: {edges: new Set(['5'])}
            });
        });
    });
});

