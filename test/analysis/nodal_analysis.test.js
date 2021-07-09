import assert from "assert";
import Analyser from "../../public/scripts/analysis/analyser.js";
import NodalAnalysis from "../../public/scripts/analysis/nodal_analysis.js";
import rlcSerialCircuit from "../circuit_examples/RLC_serial_voltage.json";
import rlcParallelCircuit from "../circuit_examples/RLC_parallel_voltage.json";
import vcvsCircuit from "../circuit_examples/vcvs.json";
import bjtCircuit from "../circuit_examples/bjt.json";
import fetCircuit from "../circuit_examples/fet.json";

describe("Test nodal analysis", () => {

    describe("Single loop with RLC components, serial", () => {
        const circuit = rlcSerialCircuit;
        it("With voltage source", () => {
            circuit.components[3].type = "vac";
            assert.deepStrictEqual(Analyser.analyse(circuit, NodalAnalysis), {
                voltages: {
                    0: [0.000035967827960361855, 0.015867372229130018],
                    1: [7.014918678180557, -0.015901271108277628],
                    2: [-0.014954646008042083, 0.00003389887914764453]
                },
                meterCurrents: {},
                meterVoltages: {}
            });
        });
    
        
        it("With current source", () => {
            circuit.components[3].type = "iac";
            assert.deepStrictEqual(Analyser.analyse(circuit, NodalAnalysis), {
                voltages: {0: [14, -0], 1: [-0, -6189.358898018153], 2: [-0, 13.194689145077064]},
                meterCurrents: {},
                meterVoltages: {}
            });
        });
    });

    describe("Parallel RLC", () => {
        const circuit = rlcParallelCircuit;
        it("With voltage source", () => {
            circuit.components[3].type = "vac";
            assert.deepStrictEqual(Analyser.analyse(circuit, NodalAnalysis), {
                voltages: {
                    0: 7,
                    1: 7,
                    2: 7
                },
                meterCurrents: {},
                meterVoltages: {}
            });
        });
    
        
        it("With current source", () => {
            circuit.components[3].type = "iac";
            assert.deepStrictEqual(Analyser.analyse(circuit, NodalAnalysis), {
                voltages: {
                    0: [6.600672371818954, 6.988600535541526],
                    1: [6.600672371818954, 6.988600535541526],
                    2: [6.600672371818954, 6.988600535541526]
                },
                meterCurrents: {},
                meterVoltages: {}
            });
        });
    });

    describe("4 pin components", () => {
        const circuit = vcvsCircuit;
        it("VCVS", () => {
            circuit.components[1].type = "vcvs";
            circuit.components[2].type = "vdc";
            assert.deepStrictEqual(Analyser.analyse(circuit, NodalAnalysis), {
                voltages: {
                    '0': 35,
                    '1:2': 35
                },
                meterCurrents: {},
                meterVoltages: {
                    '1:1': 7
                }
            });
        });

        it("CCVS", () => {
            circuit.components[1].type = "ccvs";
            circuit.components[2].type = "idc";
            assert.deepStrictEqual(Analyser.analyse(circuit, NodalAnalysis), {
                voltages: {
                    '0': 35,
                    '1:1': -0,
                    '1:2': 35
                },
                meterCurrents: {
                    '1:1': 7
                },
                meterVoltages: {}
            });
        });

        it("VCCS", () => {
            circuit.components[1].type = "vccs";
            circuit.components[2].type = "vdc";
            assert.deepStrictEqual(Analyser.analyse(circuit, NodalAnalysis), {
                voltages: {
                    '0': 105,
                    '1:2': 105
                },
                meterCurrents: {},
                meterVoltages: {
                    '1:1': 7
                }
            });
        });

        it("CCCS", () => {
            circuit.components[1].type = "cccs";
            circuit.components[2].type = "idc";
            assert.deepStrictEqual(Analyser.analyse(circuit, NodalAnalysis), {
                voltages: {
                    '0': 105,
                    "1:1": -0,
                    '1:2': 105
                },
                meterCurrents: {
                    '1:1': 7
                },
                meterVoltages: {}
            });
        });
    });

    it("BJT", () => {
        assert.deepStrictEqual(Analyser.analyse(bjtCircuit, NodalAnalysis),  {
            meterCurrents: {
                "14:1": 0.034561834561834565
            },
            meterVoltages: {},
            voltages: {
                "3": 10.472235872235872,
                "8": 0.07776412776412478,
                "13": -31.105651105651113,
                "14:1": 3.552713678800501e-15,
                "14:2": -26.577886977886983
            }
        });
    });

    it("FET", () => {
        assert.deepStrictEqual(Analyser.analyse(fetCircuit, NodalAnalysis),  {
            meterVoltages: {
                "3:1": 0.09988801791713327
            },
            meterCurrents: {},
            voltages: {
                "0": 0.00011198208286672395,
                "2": 0.09988801791713328,
                "4": -0.8588173783799671,
                "5": -0.8588173783799671,
                "6": -0.8588173783799671,
                "3:2": -0.8588173783799671
            }
        });
    });
});