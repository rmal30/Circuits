
const COMPONENT_TYPES = {
    LINE: "lin",
    RESISTOR: "res",
    CAPACITOR: "cap",
    INDUCTOR: "ind",
    DIODE: "dio",
    DC_CURRENT_SOURCE: "idc",
    AC_CURRENT_SOURCE: "iac",
    DC_VOLTAGE_SOURCE: "vdc",
    AC_VOLTAGE_SOURCE: "vac",
    CURRENT_CONTROLLED_CURRENT_SOURCE: "cccs",
    VOLTAGE_CONTROLLED_VOLTAGE_SOURCE: "vcvs",
    DEPENDENT_CURRENT_SOURCE: "cs-",
    DEPENDENT_VOLTAGE_SOURCE: "vs-",
}

const IMPEDANCE_COMPONENT_TYPES = [COMPONENT_TYPES.RESISTOR, COMPONENT_TYPES.CAPACITOR, COMPONENT_TYPES.INDUCTOR, COMPONENT_TYPES.DIODE]

const COMPONENTS_LIST = {
    AC: {
        cap: "Capacitor", 
        ind: "Inductor", 
        vac: "AC Voltage", 
        iac: "AC Current"
    },
    DC: {
        vdc: "DC Voltage",
        idc: "DC Current",
        dio: "Diode",
        vccs: "Voltage controlled current source",
        cccs: "Current controlled current source",
        vcvs: "Voltage controlled voltage source",
        ccvs: "Current controlled voltage source"
    }
};

const EQUATION_TYPES = {
    LOOP: "loop",
    NODE: "node"
}

const res = {name: "Resistor", init: "res", prop: "Resistance", unit: "\u03A9", pinCount: 2};
const cap = {name: "Capacitor", init: "cap", prop: "Capacitance", unit: "\u00B5F", pinCount: 2};
const ind = {name: "Inductor", init: "ind", prop: "Inductance", unit: "mH", pinCount: 2};
const dio = {name: "Diode", init: "dio", pinCount: 2};
const vdc = {name: "DC Voltage source", init: "vdc", prop: "Voltage", unit: "V", pinCount: 2};
const vac = {name: "AC voltage source", init: "vac", prop: "Phasor voltage", unit: "V", pinCount: 2};
const idc = {name: "DC Current source", init: "idc", prop: "Current", unit: "A", pinCount: 2};
const iac = {name: "AC Current source", init: "iac", prop: "Phasor Current", unit: "A", pinCount: 2};
const vcvs = {name: "Voltage controlled voltage source", init: "vcvs", prop: "Gain", unit: "", pinCount: 4};
const ccvs = {name: "Current controlled voltage source", init: "ccvs", prop: "Gain", unit: "\u03A9", pinCount: 4};
const vccs = {name: "Voltage controlled current source", init: "vccs", prop: "Gain", unit: "S", pinCount: 4};
const cccs = {name: "Current controlled current source", init: "cccs", prop: "Gain", unit: "", pinCount: 4};

const COMPONENT_DEFINITIONS = {
    res: res, 
    cap: cap, 
    ind: ind, 
    vdc: vdc, 
    vac: vac, 
    idc: idc, 
    iac: iac, 
    dio: dio, 
    vcvs: vcvs, 
    ccvs: ccvs, 
    vccs: vccs, 
    cccs: cccs
};