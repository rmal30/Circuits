"use strict";

function removeValueFromArray(arr, value) {
    if (arr.includes(value)) {
        arr.splice(arr.indexOf(value), 1);
    }
}

function getComponents(components, types) {
    return components.filter((component) => types.includes(component.type));
}