import sinon from "sinon";
import assert from "assert";
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
        const graphicsMethods = ["removeElement",  "setElementStyle"];
        const labelMethods = ["add", "update"];
        const objectMethods = [...labelMethods, "getPosition"];
        const polylineMethods = [...labelMethods, "getPoints"];
        
        graphicsMethods.forEach((methodName) => {
            graphics[methodName] = sandbox.spy();
        });

        graphics.labels = {};
        labelMethods.forEach((methodName) => {
            graphics.labels[methodName] = sandbox.spy();
        });

        graphics.images = {};
        graphics.circles = {};
        objectMethods.forEach((methodName) => {
            graphics.images[methodName] = sandbox.spy();
            graphics.circles[methodName] = sandbox.spy();
        });

        graphics.polylines = {};
        polylineMethods.forEach((methodName) => {
            graphics.polylines[methodName] = sandbox.spy();
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
        it("Pin", () => {
            schematic.addPin({id: 4, pos: {x: 100, y: 200}});
            sandbox.assert.calledOnceWithExactly(graphics.circles.add, ELEMENT_PREFIXES.Pin + 4, 10, new Position(100, 200));
        });

        it("Line", () => {
            const pin1 = {id: 1, comp: 0, direction: {dx: 1, dy: 0}, lines: [3, 4], pos: {x: 575, y: 75}};
            const pin2 = {id: 2, comp: 0, direction: {dx: -1, dy: 0}, lines: [5], pos: {x: 525, y: 75}};
            schematic.addLine(1, pin1, pin2);
            sandbox.assert.calledOnceWithExactly(planPolylineSpy, pin1, pin2, 25);
            const lines = planPolyline(pin1, pin2, 25);
            sandbox.assert.calledOnceWithExactly(graphics.polylines.add, ELEMENT_PREFIXES.Line + 1, lines, styles.initial.Line);
        })

        it("Horizontal component", () => {
            const component = {id: 0, type: "res", value: 2, direction: {dx: 1, dy: 0}, pins: [1, 2], pos: {x: 550, y: 75}};
            const pins = {
                1: {id: 1, comp: 0, direction: {dx: 1, dy: 0}, lines: [3, 4], pos: {x: 575, y: 75}}, 
                2: {id: 2, comp: 0, direction: {dx: -1, dy: 0}, lines: [5], pos: {x: 525, y: 75}},  
            }
            schematic.addComponent(pins, component);
            sandbox.assert.calledOnceWithExactly(graphics.images.add, 
                ELEMENT_PREFIXES.Image + 0, 
                "images/res.png",
                50,
                new Position(550, 75),
                0
            );

            sandbox.assert.calledOnceWithExactly(graphics.labels.add, 
                ELEMENT_PREFIXES.Label + 0, 
                new Position(550, 112),
                `2 Ω`
            );
            
            sandbox.assert.calledWithExactly(graphics.circles.add, ELEMENT_PREFIXES.Pin + 1, 10, new Position(575, 75));
            sandbox.assert.calledWithExactly(graphics.circles.add, ELEMENT_PREFIXES.Pin + 2, 10, new Position(525, 75));
            sandbox.assert.callCount(graphics.circles.add, 2);
        });

        it("Vertical component", () => {
            const component = {id: 0, type: "res", value: 2, direction: {dx: 0, dy: 1}, pins: [1, 2], pos: {x: 550, y: 75}};
            const pins = {
                1: {id: 1, comp: 0, direction: {dx: 1, dy: 0}, lines: [3, 4], pos: {x: 550, y: 100}}, 
                2: {id: 2, comp: 0, direction: {dx: -1, dy: 0}, lines: [5], pos: {x: 550, y: 50}},  
            }
            schematic.addComponent(pins, component);
            sandbox.assert.calledOnceWithExactly(graphics.images.add, 
                ELEMENT_PREFIXES.Image + 0, 
                "images/res.png",
                50,
                new Position(550, 75),
                90
            );

            sandbox.assert.calledOnceWithExactly(graphics.labels.add, 
                ELEMENT_PREFIXES.Label + 0, 
                new Position(587, 80),
                `2 Ω`
            );
            
            sandbox.assert.calledWithExactly(graphics.circles.add, ELEMENT_PREFIXES.Pin + 1, 10, new Position(550, 100));
            sandbox.assert.calledWithExactly(graphics.circles.add, ELEMENT_PREFIXES.Pin + 2, 10, new Position(550, 50));
            sandbox.assert.callCount(graphics.circles.add, 2);
        });

        it("Vertical component, no value", () => {
            const component = {id: 0, type: "test", direction: {dx: 0, dy: 1}, pins: [1, 2], pos: {x: 550, y: 75}};
            const pins = {
                1: {id: 1, comp: 0, direction: {dx: 1, dy: 0}, lines: [3, 4], pos: {x: 550, y: 100}}, 
                2: {id: 2, comp: 0, direction: {dx: -1, dy: 0}, lines: [5], pos: {x: 550, y: 50}},  
            }
            schematic.addComponent(pins, component);
            sandbox.assert.calledOnceWithExactly(graphics.images.add, 
                ELEMENT_PREFIXES.Image + 0, 
                "images/test.png",
                50,
                new Position(550, 75),
                90
            );

            sandbox.assert.calledOnceWithExactly(graphics.labels.add, 
                ELEMENT_PREFIXES.Label + 0, 
                new Position(587, 80),
                ""
            );
            
            sandbox.assert.calledWithExactly(graphics.circles.add, ELEMENT_PREFIXES.Pin + 1, 10, new Position(550, 100));
            sandbox.assert.calledWithExactly(graphics.circles.add, ELEMENT_PREFIXES.Pin + 2, 10, new Position(550, 50));
            sandbox.assert.callCount(graphics.circles.add, 2);
        });
    });

    describe("Update circuit drawings", () => {
        it("Horizontal component", () => {
            const component = {id: 0, type: "res", value: 2, direction: {dx: 1, dy: 0}, pins: [1, 2], pos: {x: 550, y: 75}};
            schematic.updateComponent(component);
            sandbox.assert.calledOnceWithExactly(graphics.images.update, 
                ELEMENT_PREFIXES.Image + 0, 
                50,
                new Position(550, 75),
                0
            );

            sandbox.assert.calledOnceWithExactly(graphics.labels.update, 
                ELEMENT_PREFIXES.Label + 0, 
                new Position(550, 112),
                `2 Ω`
            );
            
            sandbox.assert.calledWithExactly(graphics.circles.update, ELEMENT_PREFIXES.Pin + 1, new Position(575, 75));
            sandbox.assert.calledWithExactly(graphics.circles.update, ELEMENT_PREFIXES.Pin + 2, new Position(525, 75));
            sandbox.assert.callCount(graphics.circles.update, 2);
        });

        it("Vertical component", () => {
            const component = {id: 0, type: "res", value: 2, direction: {dx: 0, dy: 1}, pins: [1, 2], pos: {x: 550, y: 75}};
            schematic.updateComponent(component);
            sandbox.assert.calledOnceWithExactly(graphics.images.update, 
                ELEMENT_PREFIXES.Image + 0, 
                50,
                new Position(550, 75),
                90
            );

            sandbox.assert.calledOnceWithExactly(graphics.labels.update, 
                ELEMENT_PREFIXES.Label + 0, 
                new Position(587, 80),
                `2 Ω`
            );
            
            sandbox.assert.calledWithExactly(graphics.circles.update, ELEMENT_PREFIXES.Pin + 1, new Position(550, 100));
            sandbox.assert.calledWithExactly(graphics.circles.update, ELEMENT_PREFIXES.Pin + 2, new Position(550, 50));
            sandbox.assert.callCount(graphics.circles.update, 2);
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
            sandbox.assert.calledOnceWithExactly(graphics.polylines.update, ELEMENT_PREFIXES.Line + 0, polyline);
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
            sandbox.assert.calledWithExactly(graphics.polylines.update, ELEMENT_PREFIXES.Line + 3, polyline1);

            sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[1], circuit.pins[4], 25);
            const polyline2 = planPolyline(circuit.pins[1], circuit.pins[4], 25);
            sandbox.assert.calledWithExactly(graphics.polylines.update, ELEMENT_PREFIXES.Line + 4, polyline2);

            sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[2], circuit.pins[5], 25);
            const polyline3 = planPolyline(circuit.pins[2], circuit.pins[5], 25);
            sandbox.assert.calledWithExactly(graphics.polylines.update, ELEMENT_PREFIXES.Line + 5, polyline3);

            sandbox.assert.callCount(planPolylineSpy, 3);
            sandbox.assert.callCount(graphics.polylines.update, 3);

            sandbox.assert.calledOnceWithExactly(graphics.images.update, 
                ELEMENT_PREFIXES.Image + 0, 
                50,
                new Position(550, 75),
                0
            );

            sandbox.assert.calledOnceWithExactly(graphics.labels.update, 
                ELEMENT_PREFIXES.Label + 0, 
                new Position(550, 112),
                `2 Ω`
            );
            
            sandbox.assert.calledWithExactly(graphics.circles.update, ELEMENT_PREFIXES.Pin + 1, new Position(575, 75));
            sandbox.assert.calledWithExactly(graphics.circles.update, ELEMENT_PREFIXES.Pin + 2, new Position(525, 75));
            sandbox.assert.callCount(graphics.circles.update, 2);

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

            sandbox.assert.calledOnceWithExactly(graphics.circles.update, ELEMENT_PREFIXES.Pin + 0, new Position(10, 20));

            sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[0], circuit.pins[1], 25);
            const polyline1 = planPolyline(circuit.pins[0], circuit.pins[1], 25);
            sandbox.assert.calledWithExactly(graphics.polylines.update, ELEMENT_PREFIXES.Line + 0, polyline1);

            sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[0], circuit.pins[2], 25);
            const polyline2 = planPolyline(circuit.pins[0], circuit.pins[2], 25);
            sandbox.assert.calledWithExactly(graphics.polylines.update, ELEMENT_PREFIXES.Line + 1, polyline2);

            sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[0], circuit.pins[3], 25);
            const polyline3 = planPolyline(circuit.pins[0], circuit.pins[3], 25);
            sandbox.assert.calledWithExactly(graphics.polylines.update, ELEMENT_PREFIXES.Line + 2, polyline3);

            sandbox.assert.callCount(planPolylineSpy, 3);
            sandbox.assert.callCount(graphics.polylines.update, 3);
        });
    });

    describe("Select/deselect drawings", () => {
        describe("Select", () => {
            it("No selection", () => {
                schematic.setSelection({selected: false, id: null, type: null});
                sandbox.assert.notCalled(graphics.setElementStyle);
            });

            it("Throw if unknown drawing type", () => {
                assert.throws(() => schematic.setSelection({selected: true, id: 0, type: "Unknown"}));
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

            it("Throw if unknown drawing type", () => {
                assert.throws(() => schematic.clearSelection({selected: true, id: 0, type: "Unknown"}));
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
        sandbox.assert.calledOnceWithExactly(graphics.circles.add, ELEMENT_PREFIXES.Pin + 3, 10, new Position(1, 1));

        sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[3], circuit.pins[0], 25);
        const polyline1 = planPolyline(circuit.pins[3], circuit.pins[0], 25);
        sandbox.assert.calledWithExactly(graphics.polylines.add, ELEMENT_PREFIXES.Line + 1, polyline1, styles.initial.Line);

        sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[3], circuit.pins[1], 25);
        const polyline2 = planPolyline(circuit.pins[3], circuit.pins[1], 25);
        sandbox.assert.calledWithExactly(graphics.polylines.add, ELEMENT_PREFIXES.Line + 2, polyline2, styles.initial.Line);

        sandbox.assert.calledWithExactly(planPolylineSpy, circuit.pins[3], circuit.pins[2], 25);
        const polyline3 = planPolyline(circuit.pins[3], circuit.pins[2], 25);
        sandbox.assert.calledWithExactly(graphics.polylines.add, ELEMENT_PREFIXES.Line + 3, polyline3, styles.initial.Line);

        sandbox.assert.callCount(planPolylineSpy, 3);
        sandbox.assert.callCount(graphics.polylines.add, 3);
    });

    describe("Is near drawing", () => {
        it("Pin", () => {
            graphics.circles.getPosition = sandbox.stub().returns(new Position(0, 100));
            assert.strictEqual(schematic.isNearPin(0, new Position(10, 110), 1), true);
            sandbox.assert.calledWithExactly(graphics.circles.getPosition, ELEMENT_PREFIXES.Pin + 0);

            assert.strictEqual(schematic.isNearPin(1, new Position(21, 100), 2), false);
            sandbox.assert.calledWithExactly(graphics.circles.getPosition, ELEMENT_PREFIXES.Pin + 1);
        });

        it("Image", () => {
            graphics.images.getPosition = sandbox.stub().returns(new Position(0, 100));
            assert.strictEqual(schematic.isNearImage(0, new Position(50, 150), 1), true);
            sandbox.assert.calledWithExactly(graphics.images.getPosition, ELEMENT_PREFIXES.Image + 0, 50);

            assert.strictEqual(schematic.isNearImage(1, new Position(51, 100), 1), false);
            sandbox.assert.calledWithExactly(graphics.images.getPosition, ELEMENT_PREFIXES.Image + 1, 50);

            sandbox.assert.calledTwice(graphics.images.getPosition);
        });
        
        it("Line", () => {
            graphics.polylines.getPoints = sandbox.stub().returns([
                [new Position(0, 0), new Position(0, 100)],
                [new Position(0, 100), new Position(100, 100)]
            ]);
            assert.strictEqual(schematic.isNearPolyLine(0, new Position(10, 50), 10), true);
            sandbox.assert.calledWithExactly(graphics.polylines.getPoints, ELEMENT_PREFIXES.Line + 0);

            assert.strictEqual(schematic.isNearPolyLine(1, new Position(11, 50), 10), false);
            sandbox.assert.calledWithExactly(graphics.polylines.getPoints, ELEMENT_PREFIXES.Line + 1);

            assert.strictEqual(schematic.isNearPolyLine(2, new Position(50, 90), 10), true);
            sandbox.assert.calledWithExactly(graphics.polylines.getPoints, ELEMENT_PREFIXES.Line + 2);

            assert.strictEqual(schematic.isNearPolyLine(3, new Position(50, 89), 10), false);
            sandbox.assert.calledWithExactly(graphics.polylines.getPoints, ELEMENT_PREFIXES.Line + 3);

            sandbox.assert.callCount(graphics.polylines.getPoints, 4);
        });

        it("Circuit", () => {
            graphics.circles.getPosition = sandbox.stub()
                .withArgs(ELEMENT_PREFIXES.Pin + 0).returns(new Position(25, 0))
                .withArgs(ELEMENT_PREFIXES.Pin + 1).returns(new Position(-25, 0))
                .withArgs(ELEMENT_PREFIXES.Pin + 2).returns(new Position(100, 100));

            graphics.images.getPosition = sandbox.stub().returns(new Position(0, 0));
            graphics.polylines.getPoints = sandbox.stub().returns([
                [new Position(25, 0), new Position(100, 0)],
                [new Position(100, 0), new Position(100, 100)]
            ]);

            const circuit = {
                pins: {
                    0: {id: 0, comp: 0, direction: {dx: 1, dy: 0}, lines: [0], pos: {x: 25, y: 0}},
                    1: {id: 1, comp: 0, direction: {dx: -1, dy: 0}, lines: [], pos: {x: -25, y: 0}},
                    2: {id: 2, lines: [0], pos: {x: 100, y: 100}}
                },
                lines: {
                    0: [0, 2]
                },
                components: {
                    0: {id: 0, type: "res", value: 2, direction: {dx: 1, dy: 0}, pins: [0, 1], pos: {x: 0, y: 0}}
                }
            };

            //Component tests
            assert.strictEqual(schematic.isNearby(circuit, new Position(35, 35)), true);
            assert.strictEqual(schematic.isNearby(circuit, new Position(36, 11)), false);

            //Line tests
            assert.strictEqual(schematic.isNearby(circuit, new Position(50, 10)), true);
            assert.strictEqual(schematic.isNearby(circuit, new Position(50, 11)), false);
            assert.strictEqual(schematic.isNearby(circuit, new Position(90, 50)), true);
            assert.strictEqual(schematic.isNearby(circuit, new Position(89, 50)), false);

            //Pin tests
            assert.strictEqual(schematic.isNearby(circuit, new Position(110, 110)), true);
            assert.strictEqual(schematic.isNearby(circuit, new Position(111, 100)), false);
        });
    });
});