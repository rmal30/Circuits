import assert from "assert";
import Analyser from "../../public/scripts/analysis/analyser.js";
import MeshAnalysis from "../../public/scripts/analysis/mesh_analysis.js";
import resistorCircuit from "../circuit_examples/single_res.json";
import rlcSerialCircuit from "../circuit_examples/RLC_serial_voltage.json";
import rlcParallelCircuit from "../circuit_examples/RLC_parallel_voltage.json";
import vcvsCircuit from "../circuit_examples/vcvs.json";
import bjtCircuit from "../circuit_examples/bjt.json";
import fetCircuit from "../circuit_examples/fet.json";

describe("Test mesh analysis", () => {

    it("No loop", () => {
        assert.throws(() => Analyser.analyse(resistorCircuit, MeshAnalysis));
    });

    describe("Single loop with RLC components, serial", () => {
        const circuit = rlcSerialCircuit;
        it("With voltage source", () => {
            circuit.components[3].type = "vac";
            assert.deepStrictEqual(Analyser.analyse(circuit, MeshAnalysis), {
                currents: {
                    0: [0.00001798391393873992, 0.007933686114564223],
                    1: [0.00001798391393873992, 0.007933686114564223],
                    2: [0.00001798391393873992, 0.007933686114564223]
                },
                meterCurrents: {},
                meterVoltages: {}
            });
        });
    
        
        it("With current source", () => {
            circuit.components[3].type = "iac";
            assert.deepStrictEqual(Analyser.analyse(circuit, MeshAnalysis), {
                currents: {0: 7, 1: 7, 2: 7},
                meterCurrents: {},
                meterVoltages: {}
            });
        });
    });

    describe("Parallel RLC", () => {
        const circuit = rlcParallelCircuit;
        it("With voltage source", () => {
            circuit.components[3].type = "vac";
            assert.deepStrictEqual(Analyser.analyse(circuit, MeshAnalysis), {
                currents: {
                    0: [3.5, 0],
                    1: [-3.362749004248979e-19, 0.007916813487046278],
                    2: [-4.714333751147767e-16, -3.713615338810892]
                },
                meterCurrents: {},
                meterVoltages: {}
            });
        });
    
        
        it("With current source", () => {
            circuit.components[3].type = "iac";
            assert.deepStrictEqual(Analyser.analyse(circuit, MeshAnalysis), {
                currents: {
                    0: [3.300336185909476, 3.494300267770763],
                    1: [-0.007903920996479139, 0.007465184579541431],
                    2: [3.7075677350870033, -3.501765452350304]
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
            assert.deepStrictEqual(Analyser.analyse(circuit, MeshAnalysis), {
                currents: {
                    '0': 11.666666666666666,
                    '1:1': 0,
                    '1:2': -11.666666666666666
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
            assert.deepStrictEqual(Analyser.analyse(circuit, MeshAnalysis), {
                currents: {
                    '0': 11.666666666666666,
                    '1:2': -11.666666666666666
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
            assert.deepStrictEqual(Analyser.analyse(circuit, MeshAnalysis), {
                currents: {
                    '0': 35,
                    '1:1': 0,
                    '1:2': -35
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
            assert.deepStrictEqual(Analyser.analyse(circuit, MeshAnalysis), {
                currents: {
                    '0': 35,
                    '1:2': -35
                },
                meterCurrents: {
                    '1:1': 7
                },
                meterVoltages: {}
            });
        });
    });

    it("BJT", () => {
        assert.deepStrictEqual(Analyser.analyse(bjtCircuit, MeshAnalysis),  {
            meterCurrents: {
                '14:1':  0.034561834561834565
            },
            meterVoltages: {},
            currents: {
                "3": 3.490745290745291,
                "8": 0.034561834561834565,
                "13": -3.4561834561834566,
                "14:2": 3.4561834561834566
            }
        });
    });

    it("FET", () => {
        assert.deepStrictEqual(Analyser.analyse(fetCircuit, MeshAnalysis),  {
            meterVoltages: {
                "3:1": 0.09988801791713325
            },
            meterCurrents: {},
            currents: {
                "0": 1.1198208286674132e-7,
                "2": 1.1198208286674132e-7,
                "4": -0.00003903715356272577,
                "5": -0.000002618345665792582,
                "6": -0.000008588173783799669,
                "3:1": 0,
                "3:2": 0.000050243673012318015
            }
        });
    });
});
