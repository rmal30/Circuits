import assert from "assert";

import CircuitGraph from "../../public/scripts/analysis/circuit_graph.js"


describe("Construct graphs from circuits", () => {
    it("Should create graph from resistor and voltage source circuit", () => {
        const circuit = {
            hertz: 60, 
            pins: {
                0: {
                    id: 0,
                    comp: 0,
                    direction: {dx: 1, dy: 0},
                    lines: new Set([1]),
                    pos: {x: 594, y: 96}
                },
                1: {
                    id: 1,
                    comp: 0,
                    direction: {dx: -1, dy: 0},
                    lines: new Set([0]),
                    pos: {x: 546, y: 96}
                },
                2: {
                    id: 2,
                    comp: 1,
                    direction: {dx: 1, dy: 0},
                    lines: new Set([1]),
                    pos: {x: 600, y: 180}
                },
                3: {
                    id: 3,
                    comp: 1,
                    direction: {dx: -1, dy: 0},
                    lines: new Set([0]),
                    pos: {x: 552, y: 180}
                }
            },
            lines: {
                0: [3, 1], 
                1: [0, 2]
            },
            components: {
                0: {
                    id: 0,
                    type: "res",
                    value: 2,
                    direction: {dx: 1, dy: 0},
                    pins: [0, 1],
                    pos: {x: 570, y: 96}
                },
                1: {
                    id: 1,
                    type: "vdc",
                    value: 3,
                    direction: {dx: 1, dy: 0},
                    pins: [2, 3],
                    pos: {x: 576, y: 180}
                }
            },
            newPinId: 4,
            newLineId: 2,
            newComponentId: 2
        }
        const graph = new CircuitGraph(circuit);
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
        const circuit = {
            hertz: 60,
            pins: {
                0: {
                    id: 0,
                    comp: 0,
                    direction: {dx: 1, dy: 0},
                    lines: new Set([6]),
                    pos: {x: 648, y: 162}
                },
                1: {
                    id: 1,
                    comp: 0,
                    direction: {dx: -1, dy: 0},
                    lines: new Set([3]),
                    pos: {x: 600, y: 162}
                },
                2: {
                    id: 2,
                    comp: 1,
                    direction: {dx: 1, dy: 0},
                    lines: new Set([8]),
                    pos: {x: 648, y: 246}
                },
                3: {
                    id: 3,
                    comp: 1,
                    direction: {dx: 1, dy: 0},
                    lines: new Set([9]),
                    pos: {x: 648, y: 222}
                },
                4: {
                    id: 4,
                    comp: 1,
                    direction: {dx: -1, dy: 0},
                    lines: new Set([4]),
                    pos: {x: 600, y: 246}
                },
                5: {
                    id: 5,
                    comp: 1,
                    direction: {dx: -1, dy: 0},
                    lines: new Set([3]),
                    pos: {x: 600, y: 222}
                },
                6: {
                    id: 6,
                    comp: 2,
                    direction: {dx: 1, dy: 0},
                    lines: new Set([7]),
                    pos: {x: 648, y: 300}
                },
                7: {
                    id: 7,
                    comp: 2,
                    direction: {dx: -1, dy: 0},
                    lines: new Set([4]),
                    pos: {x: 600, y: 300}
                },
                8: {
                    id: 8,
                    pos: {x: 672, y: 234},
                    lines: new Set([6, 7, 8, 9])
                }
            },
            lines: {
                3: [1, 5],
                4: [4, 7],
                6: [8, 0],
                7: [8, 6],
                8: [8, 2],
                9: [8, 3]
            },
            components: {
                0: {
                    id: 0,
                    type: "res",
                    value: 3,
                    direction: {dx: 1, dy: 0},
                    pins: [0, 1],
                    pos: {x: 624, y: 162}
                },
                1: {
                    id: 1,
                    type: "",
                    value: 5,
                    direction: {dx: 1, dy: 0},
                    pins: [2, 3, 4, 5],
                    pos: {x: 624, y: 234}
                },
                2: {
                    id: 2,
                    type: "",
                    value: 7,
                    direction: {dx: 1, dy: 0},
                    pins: [6, 7],
                    pos: {x: 624, y: 300}
                }
            },
            newPinId: 9,
            newLineId: 10,
            newComponentId: 3
        };
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
        const circuit = {
            hertz: 60,
            pins: {
                9: {
                    id: 9,
                    comp: 3,
                    direction: {dx: 1, dy: 0},
                    lines: new Set([12]),
                    pos: {x: 558, y: 168}
                },
                10: {
                    id: 10,
                    comp: 3,
                    direction: {dx: -1, dy: 0},
                    lines: new Set([10, 11]),
                    pos: {x: 510, y: 168}
                },
                11: {
                    id: 11,
                    comp: 4,
                    direction: {dx: 1, dy: 0},
                    lines: new Set([12, 13]),
                    pos: {x: 558, y: 228}
                },
                12: {
                    id: 12,
                    comp: 4,
                    direction: {dx: -1, dy: 0},
                    lines: new Set([11]),
                    pos: {x: 510, y: 228}
                },
                13: {
                    id: 13,
                    comp: 5,
                    direction: {dx: 1, dy: 0},
                    lines: new Set([13]),
                    pos: {x: 558, y: 294}
                },
                14: {
                    id: 14,
                    comp: 5,
                    direction: {dx: -1, dy: 0},
                    lines: new Set([10]),
                    pos: {x: 510, y: 294}
                }
            },
            lines: {
                10: [14, 10],
                11: [12, 10],
                12: [9, 11],
                13: [11, 13]
            },
            components: {
                3: {
                    id: 3,
                    type: "res",
                    value: 3,
                    direction: {dx: 1, dy: 0},
                    pins: [9, 10],
                    pos: {x: 534, y: 168}
                },
                4: {
                    id: 4,
                    type: "res",
                    value: 5,
                    direction: {dx: 1, dy: 0},
                    pins: [11, 12],
                    pos: {x: 534, y: 228}
                },
                5: {
                    id: 5,
                    type: "vdc",
                    value: 7,
                    direction: {dx: 1, dy: 0},
                    pins: [13, 14],
                    pos: {x: 534, y: 294}
                }
            },
            newPinId: 15,
            newLineId: 14,
            newComponentId: 6
        };

        let graph;

        before(() => {
            graph = new CircuitGraph(circuit);
        });
        
        it("Get node groups from circuit", () => {      
            assert.deepStrictEqual(CircuitGraph.getNodeGroups(circuit), new Set([
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

