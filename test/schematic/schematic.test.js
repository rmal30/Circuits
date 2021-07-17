import sinon from "sinon";
import Position from "../../public/scripts/rendering/position.js";
import { ELEMENT_PREFIXES, ELEMENT_TYPES } from "../../public/scripts/schematic/elements.js";
import Schematic from "../../public/scripts/schematic/schematic.js";


describe("Schematic construction", () => {
    let schematic;
    let graphics = {};
    const planPolyline = (pin1, pin2, padding) => {
        return JSON.stringify(pin1) + JSON.stringify(pin2) + padding;
    }
    let planPolylineSpy;
    const sandbox = sinon.createSandbox();

    const styles = {
        initial: {
            Line: Symbol(),
        },
        select: {
            Line: Symbol(),
            Image: Symbol(),
            Pin: Symbol(),
        },
        deselect: {
            Line: Symbol(),
            Image: Symbol(),
            Pin: Symbol(),
        }
    };

    const labelPositions = {
        V: [50 / 2 + 12, 5],
        H: [0, 50 / 2 + 12]
    }

    const posTemplates = {
        1: [0, 0],
        2: [[0.5, 0], [-0.5, 0]],
        4: [[0.5, 0.25], [0.5, -0.25], [-0.5, 0.25], [-0.5, -0.25]]
    }

    beforeEach(() => {
        const graphicsMethods = [
            "removeElement", "addCircle", "addImage", "addLabel", "addPolyline", "getCirclePosition", "getImagePosition",
            "getPolylinePoints", "setElementStyle", "updateCircle", "updateImage", "updateLabel", "updatePolyline"
        ];

        graphicsMethods.forEach((methodName) => {
            graphics[methodName] = sandbox.spy();
        });
        planPolylineSpy = sandbox.spy(planPolyline);
        schematic = new Schematic(graphics, planPolylineSpy, styles, 10, 50, labelPositions, posTemplates);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("Delete circuit drawings", () => {
        it("Line", () => {
            schematic.deleteLine(5);
            sandbox.assert.calledOnceWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Line + 5);
        });
    
        it("Pin", () => {
            schematic.deletePin(8);
            sandbox.assert.calledOnceWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Pin + 8);
        });

        it("Image", () => {
            schematic.deleteImage(3);
            sandbox.assert.calledOnceWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Image + 3);
        });
    
        it("Label", () => {
            schematic.deleteLabel(2);
            sandbox.assert.calledOnceWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Label + 2);
        });

        it("Node and lines connected", () => {
            const pin = {id: 4, lines: [0, 1, 2]};
            schematic.deleteNode(pin);
            sandbox.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Line + 0);
            sandbox.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Line + 1);
            sandbox.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Line + 2);
            sandbox.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Pin + 4);
            sandbox.assert.callCount(graphics.removeElement, 4);
        });

        it("Component, pins connected and lines connected", () => {
            const component = {id: 0, type: "res", value: 2, direction: {dx: 1, dy: 0}, pins: [1, 2], pos: {x: 552, y: 78}};
            const pins = {
                1: {id: 1, comp: 0, direction: {dx: 1, dy: 0}, lines: [3, 4], pos: {x: 576, y: 78}}, 
                2: {id: 2, comp: 0, direction: {dx: -1, dy: 0}, lines: [5], pos: {x: 528, y: 78}},  
            }
            schematic.deleteComponent(component, pins);
            sandbox.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Line + 5);
            sandbox.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Line + 3);
            sandbox.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Line + 4);
            sandbox.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Pin + 1);
            sandbox.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Pin + 2);
            sandbox.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Image + 0);
            sandbox.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Label + 0);
            sandbox.assert.callCount(graphics.removeElement, 7);
        });
    });

    describe("Add circuit drawings", () => {
        it("Add pin", () => {
            schematic.addPin({id: 4, pos: {x: 100, y: 200}});
            sandbox.assert.calledOnceWithExactly(graphics.addCircle, ELEMENT_PREFIXES.Pin + 4, 10, new Position(100, 200));
        });

        it("Add line", () => {
            const pin1 = {id: 1, comp: 0, direction: {dx: 1, dy: 0}, lines: [3, 4], pos: {x: 575, y: 75}};
            const pin2 = {id: 2, comp: 0, direction: {dx: -1, dy: 0}, lines: [5], pos: {x: 525, y: 75}};
            schematic.addLine(1, pin1, pin2);
            sandbox.assert.calledOnceWithExactly(planPolylineSpy, pin1, pin2, 25);
            const lines = planPolyline(pin1, pin2, 25);
            sandbox.assert.calledOnceWithExactly(graphics.addPolyline, ELEMENT_PREFIXES.Line + 1, lines, styles.initial.Line);
        })

        it("Add component", () => {
            const component = {id: 0, type: "res", value: 2, direction: {dx: 1, dy: 0}, pins: [1, 2], pos: {x: 550, y: 75}};
            const pins = {
                1: {id: 1, comp: 0, direction: {dx: 1, dy: 0}, lines: [3, 4], pos: {x: 575, y: 75}}, 
                2: {id: 2, comp: 0, direction: {dx: -1, dy: 0}, lines: [5], pos: {x: 525, y: 75}},  
            }
            schematic.addComponent(pins, component);
            sandbox.assert.calledOnceWithExactly(graphics.addImage, 
                ELEMENT_PREFIXES.Image + 0, 
                "images/res.png",
                50,
                new Position(550, 75),
                0
            );

            sandbox.assert.calledOnceWithExactly(graphics.addLabel, 
                ELEMENT_PREFIXES.Label + 0, 
                new Position(550, 112),
                `2 Ω`
            );
            
            sandbox.assert.calledWithExactly(graphics.addCircle, ELEMENT_PREFIXES.Pin + 1, 10, new Position(575, 75));
            sandbox.assert.calledWithExactly(graphics.addCircle, ELEMENT_PREFIXES.Pin + 2, 10, new Position(525, 75));
            sandbox.assert.callCount(graphics.addCircle, 2);
        });
    });

    describe("Update circuit drawings", () => {
        it("Component", () => {
            const component = {id: 0, type: "res", value: 2, direction: {dx: 1, dy: 0}, pins: [1, 2], pos: {x: 550, y: 75}};
            schematic.updateComponent(component);
            sandbox.assert.calledOnceWithExactly(graphics.updateImage, 
                ELEMENT_PREFIXES.Image + 0, 
                50,
                new Position(550, 75),
                0
            );

            sandbox.assert.calledOnceWithExactly(graphics.updateLabel, 
                ELEMENT_PREFIXES.Label + 0, 
                new Position(550, 112),
                `2 Ω`
            );
            
            sandbox.assert.calledWithExactly(graphics.updateCircle, ELEMENT_PREFIXES.Pin + 1, new Position(575, 75));
            sandbox.assert.calledWithExactly(graphics.updateCircle, ELEMENT_PREFIXES.Pin + 2, new Position(525, 75));
            sandbox.assert.callCount(graphics.updateCircle, 2);
        });

        it("Line", () => {
            const pins = {
                1: {id: 1, comp: 0, direction: {dx: 1, dy: 0}, lines: [3, 4], pos: {x: 575, y: 70}},
                2: {id: 2, comp: 0, direction: {dx: -1, dy: 0}, lines: [5], pos: {x: 525, y: 70}}
            }

            const lines = {
                0: [1, 2]
            }
            schematic.updateLine(pins, lines, 0);
            sandbox.assert.calledOnceWithExactly(planPolylineSpy, pins[1], pins[2], 25);
            const polyline = planPolyline(pins[1], pins[2], 25);
            sandbox.assert.calledOnceWithExactly(graphics.updatePolyline, ELEMENT_PREFIXES.Line + 0, polyline);
        });

        it("Component and lines", () => {
            const circuit = {
                pins: {
                    1: {id: 1, comp: 0, direction: {dx: 1, dy: 0}, lines: [3, 4], pos: {x: 575, y: 75}}, 
                    2: {id: 2, comp: 0, direction: {dx: -1, dy: 0}, lines: [5], pos: {x: 525, y: 75}},
                    3: {id: 3, lines: [3], pos: {x: 0, y: 70}},
                    4: {id: 4, lines: [4], pos: {x: 100, y: 70}},
                    5: {id: 5, lines: [5], pos: {x: 200, y: 70}}
                },
                lines: {
                    3: [1, 3],
                    4: [1, 4],
                    5: [2, 5]
                },
                components: {
                    0: {id: 0, type: "res", value: 2, direction: {dx: 1, dy: 0}, pins: [1, 2], pos: {x: 550, y: 75}}
                },

            }
            schematic.updateComponentAndLines(circuit, 0);

            sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[1], circuit.pins[3], 25);
            const polyline1 = planPolyline(circuit.pins[1], circuit.pins[3], 25);
            sandbox.assert.calledWithExactly(graphics.updatePolyline, ELEMENT_PREFIXES.Line + 3, polyline1);

            sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[1], circuit.pins[4], 25);
            const polyline2 = planPolyline(circuit.pins[1], circuit.pins[4], 25);
            sandbox.assert.calledWithExactly(graphics.updatePolyline, ELEMENT_PREFIXES.Line + 4, polyline2);

            sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[2], circuit.pins[5], 25);
            const polyline3 = planPolyline(circuit.pins[2], circuit.pins[5], 25);
            sandbox.assert.calledWithExactly(graphics.updatePolyline, ELEMENT_PREFIXES.Line + 5, polyline3);

            sandbox.assert.callCount(planPolylineSpy, 3);
            sandbox.assert.callCount(graphics.updatePolyline, 3);

            sandbox.assert.calledOnceWithExactly(graphics.updateImage, 
                ELEMENT_PREFIXES.Image + 0, 
                50,
                new Position(550, 75),
                0
            );

            sandbox.assert.calledOnceWithExactly(graphics.updateLabel, 
                ELEMENT_PREFIXES.Label + 0, 
                new Position(550, 112),
                `2 Ω`
            );
            
            sandbox.assert.calledWithExactly(graphics.updateCircle, ELEMENT_PREFIXES.Pin + 1, new Position(575, 75));
            sandbox.assert.calledWithExactly(graphics.updateCircle, ELEMENT_PREFIXES.Pin + 2, new Position(525, 75));
            sandbox.assert.callCount(graphics.updateCircle, 2);

        });

        it("Node and lines", () => {
            const circuit = {
                pins: {
                    0: {id: 1, lines: [0, 1, 2], pos: {x: 10, y: 20}},
                    1: {id: 2, comp: 0, direction: {dx: 1, dy: 0}, lines: [0], pos: {x: 575, y: 70}},
                    2: {id: 3, comp: 0, direction: {dx: -1, dy: 0}, lines: [1], pos: {x: 525, y: 70}},
                    3: {id: 4, lines: [2], pos: {x: 200, y: 70}},

                },
                lines: {
                    0: [0, 1],
                    1: [0, 2],
                    2: [0, 3]
                },
                components: {
                    0: {id: 0, type: "res", value: 2, direction: {dx: 1, dy: 0}, pins: [1, 2], pos: {x: 550, y: 75}}
                }
            }
            schematic.updateNodeAndLines(circuit, 0);

            sandbox.assert.calledOnceWithExactly(graphics.updateCircle, ELEMENT_PREFIXES.Pin + 0, new Position(10, 20));

            sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[0], circuit.pins[1], 25);
            const polyline1 = planPolyline(circuit.pins[0], circuit.pins[1], 25);
            sandbox.assert.calledWithExactly(graphics.updatePolyline, ELEMENT_PREFIXES.Line + 0, polyline1);

            sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[0], circuit.pins[2], 25);
            const polyline2 = planPolyline(circuit.pins[0], circuit.pins[2], 25);
            sandbox.assert.calledWithExactly(graphics.updatePolyline, ELEMENT_PREFIXES.Line + 1, polyline2);

            sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[0], circuit.pins[3], 25);
            const polyline3 = planPolyline(circuit.pins[0], circuit.pins[3], 25);
            sandbox.assert.calledWithExactly(graphics.updatePolyline, ELEMENT_PREFIXES.Line + 2, polyline3);

            sandbox.assert.callCount(planPolylineSpy, 3);
            sandbox.assert.callCount(graphics.updatePolyline, 3);
        });
    });

    describe("Select/deselect drawings", () => {
        describe("Select", () => {
            it("No selection", () => {
                schematic.setSelection({selected: false, id: null, type: null});
                sandbox.assert.notCalled(graphics.setElementStyle);
            });

            it("Pin", () => {
                schematic.setSelection({selected: true, id: 0, type: ELEMENT_TYPES.PIN});
                sandbox.assert.calledOnceWithExactly(graphics.setElementStyle, ELEMENT_PREFIXES.Pin + 0, styles.select.Pin);
            });

            it("Line", () => {
                schematic.setSelection({selected: true, id: 1, type: ELEMENT_TYPES.LINE});
                sandbox.assert.calledOnceWithExactly(graphics.setElementStyle, ELEMENT_PREFIXES.Line + 1, styles.select.Line);
            });

            it("Component", () => {
                schematic.setSelection({selected: true, id: 2, type: ELEMENT_TYPES.IMAGE});
                sandbox.assert.calledOnceWithExactly(graphics.setElementStyle, ELEMENT_PREFIXES.Image + 2, styles.select.Image);
            });
        });

        describe("Clear selection", () => {
            it("None", () => {
                schematic.clearSelection({selected: false, id: null, type: null});
                sandbox.assert.notCalled(graphics.setElementStyle);
            });

            it("Pin", () => {
                schematic.clearSelection({selected: true, id: 0, type: ELEMENT_TYPES.PIN});
                sandbox.assert.calledOnceWithExactly(graphics.setElementStyle, ELEMENT_PREFIXES.Pin + 0, styles.deselect.Pin);
            });

            it("Line", () => {
                schematic.clearSelection({selected: true, id: 1, type: ELEMENT_TYPES.LINE});
                sandbox.assert.calledOnceWithExactly(graphics.setElementStyle, ELEMENT_PREFIXES.Line + 1, styles.deselect.Line);
            });

            it("Component", () => {
                schematic.clearSelection({selected: true, id: 2, type: ELEMENT_TYPES.IMAGE});
                sandbox.assert.calledOnceWithExactly(graphics.setElementStyle, ELEMENT_PREFIXES.Image + 2, styles.deselect.Image);
            });
        });
    });

    it("Split line with node", () => {
        const circuit = {
            pins: {
                0: {id: 0, lines: [1], pos: {x: 0, y: 0}},
                1: {id: 1, lines: [2], pos: {x: 1, y: 0}},
                2: {id: 2, lines: [3], pos: {x: 0, y: 1}},
                3: {id: 3, lines: [1, 2, 3], pos: {x: 1, y: 1}}
            },

            lines: {
                1: [3, 0],
                2: [3, 1],
                3: [3, 2]
            }
        }
        schematic.splitLineWithNode(circuit, 0, 3);

        sandbox.assert.calledOnceWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Line + 0);
        sandbox.assert.calledOnceWithExactly(graphics.addCircle, ELEMENT_PREFIXES.Pin + 3, 10, new Position(1, 1));

        sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[3], circuit.pins[0], 25);
        const polyline1 = planPolyline(circuit.pins[3], circuit.pins[0], 25);
        sandbox.assert.calledWithExactly(graphics.addPolyline, ELEMENT_PREFIXES.Line + 1, polyline1, styles.initial.Line);

        sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[3], circuit.pins[1], 25);
        const polyline2 = planPolyline(circuit.pins[3], circuit.pins[1], 25);
        sandbox.assert.calledWithExactly(graphics.addPolyline, ELEMENT_PREFIXES.Line + 2, polyline2, styles.initial.Line);

        sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[3], circuit.pins[2], 25);
        const polyline3 = planPolyline(circuit.pins[3], circuit.pins[2], 25);
        sandbox.assert.calledWithExactly(graphics.addPolyline, ELEMENT_PREFIXES.Line + 3, polyline3, styles.initial.Line);

        sandbox.assert.callCount(planPolylineSpy, 3);
        sandbox.assert.callCount(graphics.addPolyline, 3);
    });
});