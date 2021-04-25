"use strict";

const IMAGE_SIZE = 48;
const dotSize = 4;
const gridSize = 6;

function removeValueFromArray(arr, value){
    if(arr.includes(value)){
        arr.splice(arr.indexOf(value), 1);
    }
}

function getComponents(components, types) {
    return components.filter((component) => types.includes(component.type));
}

function getSolutionOutput(currentSets, voltageSets, impComponents, valid, validIndex){
    if (valid) {
        const displayVoltage = (component, index) => `${component.type}_${component.id}: ${Complex.print(voltageSets[validIndex][index][0])}V`;
        const displayCurrent = (component, index) => `${component.type}_${component.id}: ${Complex.print(currentSets[validIndex][index][0])}A`;
        return [
            "Nodal analysis:<br/>" + impComponents.map(displayVoltage).join("<br/>"),
            "Mesh analysis:<br/>" + impComponents.map(displayCurrent).join("<br/>"),
            "Component list:<br/>" + impComponents.map((value, i) => `${value.type}_${value.id}: ${JSON.stringify(impComponents[i])}`).join("<br/>")
        ].join("<br/><br/>");

    } else {
        return "No solution found";        
    }
}

// Prompt value from user
function promptComponentValue(info) {
    const promptStr = `Please enter a ${info.prop} for a ${info.name} in ${info.unit}`;
    let value = prompt(promptStr);
    while(value === ""){
        alert("Please enter a valid value");
        value = prompt(promptStr);
    }
    return value;
}