/**
 * Direction matrix
 * @param {[[pinId]]} groups List of component lists
 * @param {[component]} impComponents Components
 * @param {type} type Topology - Loop/Node
 * @returns {[[int]]} compMatrix Directionality matrix with (-1, 0, +1) elements
 */
function groupMatrix(groups, impComponents, type) {
    const compMatrix = [];

    for (const component of impComponents) {
        const line = [];

        for (const group of groups) {
            line.push(getDirection(component.pins, group, type));
        }
        compMatrix.push(line);
    }

    return compMatrix;
}

/**
 * Direction matrix 2 for two port elements
 * @param {[[pinId]]} groups List of component lists
 * @param {[component]} twoPortComponents Components with 2 ports
 * @param {type} type Topology - Loop/Node
 * @returns {[[int]]} compMatrix Directionality matrix with (-1, 0, +1) elements
 */
function groupMatrix2(groups, twoPortComponents, type) {
    const compMatrix = [];

    for (const component of twoPortComponents) {
        const line = [];
        const [pinA, pinB, pinC, pinD] = component.pins;
        const dir = (type === EQUATION_TYPES.LOOP) ? -1 : 1;

        for (const group of groups) {
            const d1 = component.value * getDirection([pinA, pinC], group, type);
            const d2 = dir * getDirection([pinB, pinD], group, type);
            line.push(d1 - d2);
        }
        compMatrix.push(line);
    }

    return compMatrix;
}

/**
 * Impedance/admittance matrix
 * @param {[float]} hertz Operating frequency in Hertz if AC
 * @param {[[pinId]]} groups List of component lists
 * @param {[component]} impComponents Components
 * @param {type} type Topology - Loop/Node
 * @returns {[[int]]} lawMatrix - Matrix with impedances/admittances
 */
function lawMatrix(hertz, groups, impComponents, type) {
    const matrix = [];
    for (const group of groups) {
        const line = [];
        for (const component of impComponents) {
            const compDirection = getDirection(component.pins, group, type);
            const impedance = getImpedance(hertz, component);
            let coeff;

            switch (type) {
                case EQUATION_TYPES.LOOP:
                    coeff = Complex.multiply(compDirection, impedance);
                    break;
                case EQUATION_TYPES.NODE:
                    coeff = Complex.divide(compDirection, impedance);
                    break;
                default:
                    throw new Error("Unexpected equation type");
            }
            line.push(coeff);
        }
        matrix.push(line);
    }

    return matrix;
}

function voltageVector(loops, components) {
    const init = [];
    const voltageComponents = getComponents(components, INDEPENDENT_VOLTAGE_SOURCE_TYPES);
    const currentComponents = getComponents(components, INDEPENDENT_CURRENT_SOURCE_TYPES);

    for (const loop of loops) {
        let voltageSum = 0;
        for (const component of voltageComponents) {
            voltageSum -= getDirection(component.pins, loop, EQUATION_TYPES.LOOP) * component.value;
        }
        init.push(voltageSum);
    }

    return init.concat(currentComponents.map(component => -component.value));
}

function currentVector(nodes, components) {
    let init = [];
    const voltageComponents = getComponents(components, INDEPENDENT_VOLTAGE_SOURCE_TYPES);
    const currentComponents = getComponents(components, INDEPENDENT_CURRENT_SOURCE_TYPES);

    for (const node of nodes) {
        let currentSum = 0;
        for (const component of currentComponents) {
            currentSum -= getDirection(component.pins, node, EQUATION_TYPES.NODE) * component.value;
        }
        init.push(currentSum);
    }

    init = init.concat(voltageComponents.map((component) => -component.value));
    init.push(0);

    return init;
}
