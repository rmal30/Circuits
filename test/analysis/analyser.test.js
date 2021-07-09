import assert from "assert";
import Analyser from "../../public/scripts/analysis/analyser.js";
import rlcSerialCircuit from "../circuit_examples/RLC_serial_voltage.json";

describe("Get voltages and currents", () => {
    it("RLC with voltage source", () => {
        assert.deepStrictEqual(Analyser.getCurrentsAndVoltages(rlcSerialCircuit), [
            {
                currents: {
                    0: [0.00001798391393873992, 0.007933686114564223],
                    1: [0.00001798391393873992, 0.007933686114564223],
                    2: [0.00001798391393873992, 0.007933686114564223]
                },
                meterCurrents: {},
                meterVoltages: {}
            },
            {
                voltages: {
                    0: [0.000035967827960361855, 0.015867372229130018],
                    1: [7.014918678180557, -0.015901271108277628],
                    2: [-0.014954646008042083, 0.00003389887914764453]
                },
                meterCurrents: {},
                meterVoltages: {}
            }
        ]);
    });
})