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

function groupMatrix2(groups, impComponents, type) {
    const compMatrix = [];

    for (let j = 0; j < impComponents.length; j++) {
        compMatrix[j] = [];
        const componentPins = impComponents[j].pins;
        const dir = (type === EQUATION_TYPES.LOOP) ? -1 : 1;

        for (let k = 0; k < groups.length; k++) {
            compMatrix[j].push(
                impComponents[j].value * getDirection([componentPins[0], componentPins[2]], groups[k], type) -
                dir * getDirection([componentPins[1], componentPins[3]], groups[k], type)
            );
        }
    }

    return compMatrix;
}

function lawMatrix(hertz, groups2, impComponents, type) {
    const matrix = [];
    for (let i = 0; i < groups2.length; i++) {
        matrix[i] = [];
        for (let k = 0; k < impComponents.length; k++) {
            const compDirection = getDirection(impComponents[k].pins, groups2[i], type);
            const impedance = getImpedance(hertz, impComponents[k]);

            switch (type) {
                case EQUATION_TYPES.LOOP:
                    matrix[i][k] = Complex.multiply(compDirection, impedance);
                    break;
                case EQUATION_TYPES.NODE:
                    matrix[i][k] = Complex.divide(compDirection, impedance);
                    break;
            }
        }
    }
    return matrix;
}

function voltageVector(loops, components) {
    const init = [];
    const voltageComponents = getComponents(components, ["vdc", "vac"]);
    const currentComponents = getComponents(components, ["idc", "iac"]);

    for (const loop of loops) {
        let voltageSum = 0;
        for (const component of voltageComponents) {
            voltageSum -= getDirection(component.pins, loop, EQUATION_TYPES.LOOP) * component.value;
        }
        init.push(voltageSum);
    }
    return init.concat(currentComponents.map(component => -component.value));
}

function currentVector(nodes2, components) {
    let init = [];
    const voltageComponents = getComponents(components, ["vdc", "vac"]);
    const currentComponents = getComponents(components, ["idc", "iac"]);

    for (let i = 0; i < nodes2.length; i++) {
        let currentSum = 0;
        for (let j = 0; j < currentComponents.length; j++) {
            currentSum -= getDirection(currentComponents[j].pins, nodes2[i], EQUATION_TYPES.NODE) * currentComponents[j].value;
        }
        init.push(currentSum);
    }
    init = init.concat(voltageComponents.map(component => -component.value));
    init.push(0);
    return init;
}