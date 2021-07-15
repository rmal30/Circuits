import sinon from "sinon";
import Position from "../../public/scripts/rendering/position.js";
import { ELEMENT_PREFIXES } from "../../public/scripts/schematic/elements.js";
import Schematic from "../../public/scripts/schematic/schematic.js";


describe("Schematic construction", () => {
    let schematic;
    let graphics = {};
    let planPolyline;
    let planPolylineSpy;

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

    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        const graphicsMethods = [
            "removeElement", "addCircle", "addImage", "addLabel", "addPolyline", "getCirclePosition", "getImagePosition",
            "getPolylinePoints", "setElementStyle", "updateCircle", "updateImage", "updateLabel", "updatePolyline"
        ];

        graphicsMethods.forEach((methodName) => {
            graphics[methodName] = sandbox.spy();
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    before(() => {
        planPolyline = (pin1, pin2, padding) => {
            return JSON.stringify(pin1) + JSON.stringify(pin2) + padding;
        }
        planPolylineSpy = sandbox.spy(planPolyline);
        schematic = new Schematic(graphics, planPolylineSpy, styles, 10, 50, labelPositions);
    });

    describe("Delete circuit drawings", () => {
        it("Delete line", () => {
            schematic.deleteLine(5);
            sinon.assert.calledOnceWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Line + 5);
        });
    
        it("Delete pin", () => {
            schematic.deletePin(8);
            sinon.assert.calledOnceWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Pin + 8);
        });

        it("Delete image", () => {
            schematic.deleteImage(3);
            sinon.assert.calledOnceWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Image + 3);
        });
    
        it("Delete label", () => {
            schematic.deleteLabel(2);
            sinon.assert.calledOnceWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Label + 2);
        });

        it("Delete node and lines connected", () => {
            const pin = {id: 4, lines: [0, 1, 2]};
            schematic.deleteNode(pin);
            sinon.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Line + 0);
            sinon.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Line + 1);
            sinon.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Line + 2);
            sinon.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Pin + 4);
            sinon.assert.callCount(graphics.removeElement, 4);
        });

        it("Delete component and pins and lines connected to pins", () => {
            const component = {id: 0, type: "res", value: 2, direction: {dx: 1, dy: 0}, pins: [1, 2], pos: {x: 552, y: 78}};
            const pins = {
                1: {id: 1, comp: 0, direction: {dx: 1, dy: 0}, lines: [3, 4], pos: {x: 576, y: 78}}, 
                2: {id: 2, comp: 0, direction: {dx: -1, dy: 0}, lines: [5], pos: {x: 528, y: 78}},  
            }
            schematic.deleteComponent(component, pins);
            sinon.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Line + 5);
            sinon.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Line + 3);
            sinon.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Line + 4);
            sinon.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Pin + 1);
            sinon.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Pin + 2);
            sinon.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Image + 0);
            sinon.assert.calledWithExactly(graphics.removeElement, ELEMENT_PREFIXES.Label + 0);
            sinon.assert.callCount(graphics.removeElement, 7);
        });
    });

    describe("Add circuit drawings", () => {
        it("Add pin", () => {
            schematic.addPin({id: 4, pos: {x: 100, y: 200}});
            sinon.assert.calledOnceWithExactly(graphics.addCircle, ELEMENT_PREFIXES.Pin + 4, 10, new Position(100, 200));
        });

        it("Add line", () => {
            const pin1 = {id: 1, comp: 0, direction: {dx: 1, dy: 0}, lines: [3, 4], pos: {x: 575, y: 75}};
            const pin2 = {id: 2, comp: 0, direction: {dx: -1, dy: 0}, lines: [5], pos: {x: 525, y: 75}};
            schematic.addLine(1, pin1, pin2);
            sinon.assert.calledOnceWithExactly(planPolylineSpy, pin1, pin2, 25);
            const lines = planPolyline(pin1, pin2, 25);
            sinon.assert.calledOnceWithExactly(graphics.addPolyline, ELEMENT_PREFIXES.Line + 1, lines, styles.initial.Line);
        })

        it("Add component", () => {
            const component = {id: 0, type: "res", value: 2, direction: {dx: 1, dy: 0}, pins: [1, 2], pos: {x: 550, y: 75}};
            const pins = {
                1: {id: 1, comp: 0, direction: {dx: 1, dy: 0}, lines: [3, 4], pos: {x: 575, y: 75}}, 
                2: {id: 2, comp: 0, direction: {dx: -1, dy: 0}, lines: [5], pos: {x: 525, y: 75}},  
            }
            schematic.addComponent(pins, component);
            sinon.assert.calledOnceWithExactly(graphics.addImage, 
                ELEMENT_PREFIXES.Image + 0, 
                "images/res.png",
                50,
                new Position(550, 75),
                0
            );

            sinon.assert.calledOnceWithExactly(graphics.addLabel, 
                ELEMENT_PREFIXES.Label + 0, 
                new Position(550, 112),
                `2 Ω`
            );
            
            sinon.assert.calledWithExactly(graphics.addCircle, ELEMENT_PREFIXES.Pin + 1, 10, new Position(575, 75));
            sinon.assert.calledWithExactly(graphics.addCircle, ELEMENT_PREFIXES.Pin + 2, 10, new Position(525, 75));
            sinon.assert.callCount(graphics.addCircle, 2);
        });
    });
});