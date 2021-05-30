
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
    VOLTAGE_CONTROLLED_CURRENT_SOURCE: "vccs",
    CURRENT_CONTROLLED_VOLTAGE_SOURCE: "ccvs",
    CURRENT_METER: "cm",
    VOLTAGE_METER: "vm"
};

const IMPEDANCE_COMPONENT_TYPES = [
    COMPONENT_TYPES.RESISTOR,
    COMPONENT_TYPES.CAPACITOR,
    COMPONENT_TYPES.INDUCTOR,
    COMPONENT_TYPES.DIODE
];

const AMPLIFIER_TYPES = [
    COMPONENT_TYPES.VOLTAGE_CONTROLLED_VOLTAGE_SOURCE,
    COMPONENT_TYPES.CURRENT_CONTROLLED_VOLTAGE_SOURCE,
    COMPONENT_TYPES.VOLTAGE_CONTROLLED_CURRENT_SOURCE,
    COMPONENT_TYPES.CURRENT_CONTROLLED_CURRENT_SOURCE
];

const INDEPENDENT_CURRENT_SOURCE_TYPES = [
    COMPONENT_TYPES.DC_CURRENT_SOURCE,
    COMPONENT_TYPES.AC_CURRENT_SOURCE
];

const INDEPENDENT_VOLTAGE_SOURCE_TYPES = [
    COMPONENT_TYPES.DC_VOLTAGE_SOURCE,
    COMPONENT_TYPES.AC_VOLTAGE_SOURCE
];

const COMPONENTS_LIST = {
    ac: {
        cap: "Capacitor",
        ind: "Inductor",
        vac: "AC Voltage",
        iac: "AC Current"
    },
    dc: {
        vdc: "DC Voltage",
        idc: "DC Current",
        dio: "Diode"
    },
    both: {
        res: "Resistor",
        vcvs: "Voltage controlled voltage source",
        ccvs: "Current controlled voltage source",
        vccs: "Voltage controlled current source",
        cccs: "Current controlled current source"
    }
};

const COMPONENT_DEFINITIONS = {
    res: {name: "Resistor", prefix: "res", prop: "Resistance", unit: "\u03A9", pinCount: 2},
    cap: {name: "Capacitor", prefix: "cap", prop: "Capacitance", unit: "\u00B5F", pinCount: 2},
    ind: {name: "Inductor", prefix: "ind", prop: "Inductance", unit: "mH", pinCount: 2},
    vdc: {name: "DC Voltage source", prefix: "vdc", prop: "Voltage", unit: "V", pinCount: 2},
    vac: {name: "AC voltage source", prefix: "vac", prop: "Phasor voltage", unit: "V", pinCount: 2},
    idc: {name: "DC Current source", prefix: "idc", prop: "Current", unit: "A", pinCount: 2},
    iac: {name: "AC Current source", prefix: "iac", prop: "Phasor Current", unit: "A", pinCount: 2},
    dio: {name: "Diode", prefix: "dio", pinCount: 2},
    vcvs: {name: "Voltage controlled voltage source", prefix: "vcvs", prop: "Gain", unit: "", pinCount: 4},
    ccvs: {name: "Current controlled voltage source", prefix: "ccvs", prop: "Gain", unit: "\u03A9", pinCount: 4},
    vccs: {name: "Voltage controlled current source", prefix: "vccs", prop: "Gain", unit: "S", pinCount: 4},
    cccs: {name: "Current controlled current source", prefix: "cccs", prop: "Gain", unit: "", pinCount: 4}
};
