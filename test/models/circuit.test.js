import assert from 'assert';
import Circuit from "../../public/scripts/models/circuit.js"
import { DIRECTION_DELTAS } from '../../public/scripts/rendering/geometry.js';
import Position from '../../public/scripts/rendering/position.js';

describe("Circuit model", () => {
    let circuit;

    const pinPositionTemplate = {
        1: [0, 0],
        2: [[0.5, 0], [-0.5, 0]],
        4: [[0.5, 0.25], [0.5, -0.25], [-0.5, 0.25], [-0.5, -0.25]]
    };
    const pinDirectionTemplate = {
        2: [DIRECTION_DELTAS.RIGHT, DIRECTION_DELTAS.LEFT],
        4: [DIRECTION_DELTAS.RIGHT, DIRECTION_DELTAS.RIGHT, DIRECTION_DELTAS.LEFT, DIRECTION_DELTAS.LEFT]
    }
    
    const mockAnalyser = {
        getCurrentsAndVoltages: (circuit2) => {
            assert.deepStrictEqual(circuit2, circuit);
            return "Mock analyser called and returned";
        }
    }

    before(() => {
        circuit = new Circuit({hertz: 60, pins: {}, lines: {}, components: {}}, pinPositionTemplate, pinDirectionTemplate, 50, mockAnalyser);
    });

    beforeEach(() => {
        circuit.newPinId = 0;
        circuit.newComponentId = 0;
        circuit.newLineId = 0;
    });

    it("Constructor", () => {
        assert.deepStrictEqual(circuit.hertz, 60);
        assert.deepStrictEqual(circuit.pins, {});
        assert.deepStrictEqual(circuit.lines, {});
        assert.deepStrictEqual(circuit.components, {});
        assert.deepStrictEqual(circuit.config.posTemplates, pinPositionTemplate);
        assert.deepStrictEqual(circuit.config.dirTemplates, pinDirectionTemplate);
        assert.deepStrictEqual(circuit.config.imageSize, 50);
        assert.deepStrictEqual(circuit.analyser, mockAnalyser);
    });

    it("Set frequency", () => {
        circuit.setFreq(100);
        assert.deepStrictEqual(circuit.hertz, 100);
    });

    it("Delete line", () => {
        circuit.pins = {
            0: {id: 0, lines: [0, 1], pos: {x: 0, y: 0}},
            1: {id: 1, lines: [1, 2], pos: {x: 1, y: 0}},
            2: {id: 2, lines: [0, 2], pos: {x: 0, y: 1}}
        };
        circuit.lines = {
            0: [0, 2],
            1: [0, 1],
            2: [1, 2]
        };

        circuit.deleteLine(1);

        assert.deepStrictEqual(circuit.pins, {
            0: {id: 0, lines: [0], pos: {x: 0, y: 0}},
            1: {id: 1, lines: [2], pos: {x: 1, y: 0}},
            2: {id: 2, lines: [0, 2], pos: {x: 0, y: 1}}
        })
        assert.deepStrictEqual(circuit.lines, {
            0: [0, 2],
            2: [1, 2]
        })
    });

    it("Delete node", () => {
        circuit.pins = {
            0: {id: 0, lines: [0, 1], pos: {x: 0, y: 0}},
            1: {id: 1, lines: [1, 2], pos: {x: 1, y: 0}},
            2: {id: 2, lines: [2, 0], pos: {x: 0, y: 1}}
        };
        circuit.lines = {
            0: [0, 2],
            1: [0, 1],
            2: [1, 2]
        };
        circuit.deleteNode(0);
        assert.deepStrictEqual(circuit.pins, {
            1: {id: 1, lines: [2], pos: {x: 1, y: 0}},
            2: {id: 2, lines: [2], pos: {x: 0, y: 1}}
        });
        assert.deepStrictEqual(circuit.lines, {
            2: [1, 2]
        })
    });

    it("Delete component", () => {

        circuit.pins = {
            0: {id: 0, comp: 0, direction: {dx: 1, dy: 0}, lines: [0, 1], pos: {x: 100, y: 100}}, 
            1: {id: 1, comp: 0, direction: {dx: -1, dy: 0}, lines: [2, 3], pos: {x: 150, y: 100}}, 
            2: {id: 2, lines: [0], pos: {x: 0, y: 78}}, 
            3: {id: 3, lines: [1], pos: {x: 0, y: 150}}, 
            4: {id: 4, lines: [2], pos: {x: 200, y: 78}}, 
            5: {id: 5, lines: [3], pos: {x: 200, y: 150}},
        };

        circuit.lines = {
            0: [0, 2],
            1: [0, 3],
            2: [1, 4],
            3: [1, 5]
        };

        circuit.components = {
            0: {id: 0, type: "res", value: 2, direction: {dx: 1, dy: 0}, pins: [0, 1], pos: {x: 125, y: 100}}
        };

        circuit.deleteComponent(0);
        assert.deepStrictEqual(circuit.pins, {
            2: {id: 2, lines: [], pos: {x: 0, y: 78}}, 
            3: {id: 3, lines: [], pos: {x: 0, y: 150}}, 
            4: {id: 4, lines: [], pos: {x: 200, y: 78}}, 
            5: {id: 5, lines: [], pos: {x: 200, y: 150}},
        });

        assert.deepStrictEqual(circuit.lines, {});
        assert.deepStrictEqual(circuit.components, {});
    });

    it("Add component", () => {
        circuit.components = {};
        circuit.pins = {};
        circuit.lines = {};


        const compId = circuit.addComponent("res", "5", new Position(100, 200), "H");

        assert.strictEqual(compId, 0);

        assert.deepStrictEqual(circuit.components, {
            0: {id: 0, type: "res", value: 5, direction: {dx: 1, dy: 0}, pins: [0, 1], pos: {x: 100, y: 200}}
        });

        assert.deepStrictEqual(circuit.pins, {
            0: {id: 0, comp: 0, direction: {dx: 1, dy: 0}, lines: [], pos: {x: 125, y: 200}}, 
            1: {id: 1, comp: 0, direction: {dx: -1, dy: 0}, lines: [], pos: {x: 75, y: 200}}, 
        });
    });

    it("Get new key for existing object", () => {
        assert.deepStrictEqual(Circuit.getNewID({0: "a", 1: "b"}), 2);
    })

    it("Add line", () => {
        circuit.pins = {
            0: {id: 0, lines: [], pos: {x: 0, y: 0}},
            1: {id: 1, lines: [], pos: {x: 1, y: 0}}
        };
       
        circuit.lines =  {};

        const lineId = circuit.addLine(0, 1);

        assert.deepStrictEqual(lineId, 0);
        assert.deepStrictEqual(circuit.pins, {
            0: {id: 0, lines: [0], pos: {x: 0, y: 0}},
            1: {id: 1, lines: [0], pos: {x: 1, y: 0}}
        })
        assert.deepStrictEqual(circuit.lines, {
            0: [0, 1],
        })
    })

    it("Split line with node", () => {
        circuit.pins = {
            0: {id: 0, lines: [0], pos: {x: 0, y: 0}},
            1: {id: 1, lines: [0], pos: {x: 1, y: 0}},
            2: {id: 2, lines: [], pos: {x: 0, y: 1}},
        };
        circuit.newPinId = 3;

        circuit.lines = {
            0: [0, 1]
        };

        circuit.newLineId = 1;

        circuit.splitLineWithNode(2, 0, {x: 1, y: 1})

        assert.deepStrictEqual(circuit.pins, {
            0: {id: 0, lines: [1], pos: {x: 0, y: 0}},
            1: {id: 1, lines: [2], pos: {x: 1, y: 0}},
            2: {id: 2, lines: [3], pos: {x: 0, y: 1}},
            3: {id: 3, lines: [1, 2, 3], pos: {x: 1, y: 1}}
        });

        assert.deepStrictEqual(circuit.lines, {
            1: [3, 0],
            2: [3, 1],
            3: [3, 2]
        });
    });

    it("Add component pin", () => {
        circuit.pins = {};
        const nodeId = circuit.addComponentPin(0, {x: 10, y: 20}, {dx: 0, dy: -1});
        assert.deepStrictEqual(nodeId, 0);
        assert.deepStrictEqual(circuit.pins, {
            0: {id: 0, comp: 0, lines: [], pos: {x: 10, y: 20}, direction: {dx: 0, dy: -1}}
        });
        assert.deepStrictEqual(circuit.newPinId, 1);

        const nodeId2 = circuit.addComponentPin(0, {x: 10, y: 70}, {dx: 0, dy: 1});
        assert.deepStrictEqual(nodeId2, 1);
        assert.deepStrictEqual(circuit.pins, {
            0: {id: 0, comp: 0, lines: [], pos: {x: 10, y: 20}, direction: {dx: 0, dy: -1}},
            1: {id: 1, comp: 0, lines: [], pos: {x: 10, y: 70}, direction: {dx: 0, dy: 1}}
        });
        assert.deepStrictEqual(circuit.newPinId, 2);
    });

    it("Add node", () => {
        circuit.pins = {};
        const nodeId = circuit.addNode({x: 10, y: 20});
        assert.deepStrictEqual(nodeId, 0);
        assert.deepStrictEqual(circuit.pins, {
            0: {id: 0, lines: [], pos: {x: 10, y: 20}}
        });
        assert.deepStrictEqual(circuit.newPinId, 1);

        const nodeId2 = circuit.addNode({x: 30, y: 50});
        assert.deepStrictEqual(nodeId2, 1);
        assert.deepStrictEqual(circuit.pins, {
            0: {id: 0, lines: [], pos: {x: 10, y: 20}},
            1: {id: 1, lines: [], pos: {x: 30, y: 50}}
        });
        assert.deepStrictEqual(circuit.newPinId, 2);

    })

    it("Rotate component", () => {
        circuit.components = {
            0: {id: 0, type: "res", value: 2, direction: {dx: 1, dy: 0}, pins: [0, 1], pos: {x: 550, y: 75}}
        };
        circuit.pins = {
            0: {id: 0, comp: 0, direction: {dx: 1, dy: 0}, lines: [2], pos: {x: 525, y: 75}}, 
            1: {id: 1, comp: 0, direction: {dx: -1, dy: 0}, lines: [3], pos: {x: 575, y: 75}}, 
        };

        circuit.rotateComponent(0);

        assert.deepStrictEqual(circuit.components, {
            0: {id: 0, type: "res", value: 2, direction: {dx: -0, dy: 1}, pins: [0, 1], pos: {x: 550, y: 75}}
        });

        assert.deepStrictEqual(circuit.pins, {
            0: {id: 0, comp: 0, direction: {dx: -0, dy: 1}, lines: [2], pos: {x: 550, y: 100}}, 
            1: {id: 1, comp: 0, direction: {dx: 0, dy: -1}, lines: [3], pos: {x: 550, y: 50}}, 
        });

    });

    it("Move component", () => {
        circuit.components = {
            0: {id: 0, type: "res", value: 2, direction: {dx: 1, dy: 0}, pins: [0, 1], pos: {x: 550, y: 78}}
        };
        circuit.pins = {
            0: {id: 0, comp: 0, direction: {dx: 1, dy: 0}, lines: [2], pos: {x: 575, y: 78}}, 
            1: {id: 1, comp: 0, direction: {dx: -1, dy: 0}, lines: [3], pos: {x: 525, y: 78}}, 
        }
        circuit.moveComponent(0, new Position(100, 200));

        assert.deepStrictEqual(circuit.components[0].pos, {x: 100, y: 200});
        assert.deepStrictEqual(circuit.pins[0].pos, {x: 125, y: 200});
        assert.deepStrictEqual(circuit.pins[1].pos, {x: 75, y: 200});
    });

    it("Move node", () => {
        circuit.pins = {
            0: {id: 0, lines: [0, 1], pos: {x: 0, y: 0}},
        }
        circuit.moveNode(0, new Position(6, 7));
        assert.deepStrictEqual(circuit.pins[0].pos, {x: 6, y: 7})
    });

    it("Set component value", () => {
        circuit.components = {
            0: {id: 0, type: "res", value: 2, direction: {dx: 1, dy: 0}, pins: [0, 1], pos: {x: 552, y: 78}}
        };
        circuit.setComponentValue(0, "6.2");
        assert.strictEqual(circuit.components[0].value, 6.2);
    });

    it("Simulate", () => {
        assert.deepStrictEqual(circuit.simulate(), "Mock analyser called and returned");
    });
});