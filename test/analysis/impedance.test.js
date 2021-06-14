import {getImpedance} from "../../public/scripts/analysis/impedance.js";
import assert from "assert";
import { COMPONENT_TYPES } from "../../public/scripts/config/components.js";

describe("Impedance calculation", () => {
    it("Resistance", () => {
        assert.strictEqual(getImpedance(100, COMPONENT_TYPES.RESISTOR, 200), 200);
    });

    describe("Capacitance", () => {
        it("Zero freq", () => {
            assert.deepStrictEqual(getImpedance(0, COMPONENT_TYPES.CAPACITOR, 1), [0, -Infinity]);
        });

        it("50Hz", () => {
            assert.deepStrictEqual(getImpedance(50, COMPONENT_TYPES.CAPACITOR, 1), [0, -3183.0988618379065]);
        });

    });

    describe("Inductance", () => {
        it("Zero freq", () => {
            assert.deepStrictEqual(getImpedance(0, COMPONENT_TYPES.INDUCTOR, 1), [0, 0]);
        });

        it("50Hz", () => {
            assert.deepStrictEqual(getImpedance(50, COMPONENT_TYPES.INDUCTOR, 1), [0, 0.3141592653589793]);
        });
    });

    it("Throw error if unknown component", () => {
        assert.throws(() => getImpedance(100, COMPONENT_TYPES.DIODE, 0));
    })
});