import assert from "assert";
import sinon from "sinon";
import { ELEMENT_PREFIXES } from "../../public/scripts/schematic/elements.js";
import Schematic from "../../public/scripts/schematic/schematic.js";


describe("Schematic construction", () => {
    let schematic;
    let graphics = {};
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        const graphicsMethods = [
            "removeElement", "addCircle", "addImage", "addLabel", "addPolyline", "getCirclePosition", "getImagePosition",
            "getPolylinePoints", "setElementStyle", "updateCircle", "updateImage", "updateLabel", "updatePolyline"
        ];

        graphicsMethods.forEach((methodName) => {
            graphics[methodName] = sinon.spy();
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    before(() => {
        schematic = new Schematic(graphics);
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
    });
});